import invariant from "tiny-invariant";
import {
  IAggregator,
  IAggregator__factory,
  IFeedRegistry,
  IFeedRegistry__factory,
} from "../../typechain-types";
import { ChainId } from "../constants";
import { getFeeds } from "../schema/feeds";
import { AggregatorModel, Mapping, Provider } from "../types";
import { BaseService } from "./common";
import { TokenService } from "./tokens";
import {
  constants,
  div,
  formatUnits,
  isAddress,
  lte,
  mul,
  parseUnits,
  square,
  toBN,
} from "../utils";

interface AggregatorParams {
  feed: AggregatorModel;
  invert: boolean;
}

const FEED_REGISTRY = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

export class ChainlinkPricerService extends BaseService<IAggregator> {
  public readonly tokensService: TokenService;
  public readonly feedRegistry: IFeedRegistry | undefined;
  public readonly feeds: Mapping<AggregatorModel> = {};
  public readonly feedKeys: Map<string, string[]> = new Map();
  public readonly tokens: Set<string> = new Set();
  public readonly quotes: string[] = [];
  public readonly cryptoPairQuoteTicker: string;
  public readonly usdPairQuoteTicker: string;

  constructor(chainId: ChainId, provider?: Provider) {
    super(chainId, IAggregator__factory, provider);
    this.tokensService = new TokenService(chainId, provider);

    //FeedRegistry only available on mainnet as of right now
    if (chainId === ChainId.MAINNET) {
      this.feedRegistry = IFeedRegistry__factory.connect(
        FEED_REGISTRY,
        this.provider
      );
    }
    this.cryptoPairQuoteTicker = chainId !== ChainId.BSC ? "ETH" : "BNB";

    this.usdPairQuoteTicker = "USD";

    getFeeds(chainId).map((feed) => {
      const baseTicker = feed.base.toUpperCase();
      const quoteTicker = feed.quote.toUpperCase();

      const key = this.getFeedKey(baseTicker, quoteTicker);

      this.feeds[key] = feed;

      if (!this.tokens.has(baseTicker)) {
        this.tokens.add(baseTicker);
      }

      if (!this.feedKeys.has(baseTicker)) {
        this.feedKeys.set(baseTicker, [key]);
      }
      if (!this.getFeedKeys(baseTicker).includes(key)) {
        this.feedKeys.set(baseTicker, [...this.getFeedKeys(baseTicker), key]);
      }

      if (!this.tokens.has(quoteTicker)) {
        this.tokens.add(quoteTicker);
      }

      if (!this.feedKeys.has(quoteTicker)) {
        this.feedKeys.set(quoteTicker, [key]);
      }

      if (!this.getFeedKeys(quoteTicker).includes(key)) {
        this.feedKeys.set(quoteTicker, [...this.getFeedKeys(quoteTicker), key]);
      }

      if (!this.quotes.includes(quoteTicker)) {
        this.quotes.push(quoteTicker);
      }
    });
  }
  //This function has 4 major cases
  //1.Base/Quote have direct feed available
  //2.Base/Quote have intersceted feed that (2 total feed) ex: AAVE/ETH 1INCH/ETH
  //3.Base/Quote are only intersected by ETH/USD (Minimum 3 feeds) LDO-MATIC: LDO-ETH -> ETH-USD -> MATIC-USD
  //4.There are no available intersection/bridge                   LDO-MATIC: LDO-USD -> ETH-USD -> MATIC-ETH
  public async getLatestAnswer(base: string, quote: string) {
    invariant(base !== "USD", `USD cannot be set as base ticker`);

    const baseTicker = !!isAddress(base)
      ? (await this.tokensService.getToken(base)).symbol?.toUpperCase()
      : base.toUpperCase();

    const quoteTicker = quote.toUpperCase();

    invariant(
      !!baseTicker && !!this.tokens.has(baseTicker),
      "Base asset not supported"
    );
    invariant(
      !!quoteTicker && !!this.tokens.has(quoteTicker),
      "Quote asset not supported"
    );

    //Case 1:
    // e.g.) UNI-ETH
    // we wouldn't need to hop over between the price feeds
    // and compute the result if the price feed exists for the pair
    const feed = this.getFeed(baseTicker, quoteTicker);

    if (!!feed) {
      const answer = await this._getLatestAnswer(feed, false);
      return formatUnits(answer, feed.decimals);
    }

    //Case 2
    const aggregators: AggregatorParams[] = [];

    let baseFeed: AggregatorModel,
      quoteFeed: AggregatorModel,
      intersectionFeed: AggregatorModel,
      intersectedTicker: string | undefined;

    const baseFeedKeys = new Set([...this.getFeedKeys(baseTicker)]);
    const quoteFeedKeys = new Set([...this.getFeedKeys(quoteTicker)]);

    for (const baseFeedKey of baseFeedKeys) {
      const baseFeedTickers = baseFeedKey.split("-");
      const [baseFeedBaseTicker, baseFeedQuoteTicker] = baseFeedTickers;

      const baseFeedTicker =
        baseFeedBaseTicker === baseTicker
          ? baseFeedQuoteTicker
          : baseFeedBaseTicker;

      for (const quoteFeedKey of quoteFeedKeys) {
        const quoteFeedTickers = quoteFeedKey.split("-");
        const [quoteFeedBaseTicker, quoteFeedQuoteTicker] = quoteFeedTickers;

        // e.g.) CRV-CVX: CRV-ETH -> CVX-ETH
        // we continued to iterate over the feed keys
        // even though we found the intersected asset
        // in order to check whether if there's an associated feed
        // that does not required to invert the price on computation or not

        if (!intersectedTicker && baseFeedTicker === quoteFeedQuoteTicker) {
          intersectedTicker = quoteFeedQuoteTicker;
        }

        // e.g.) WBTC-ETH: WBTC-BTC -> BTC-ETH instead of ETH-BTC

        if (baseFeedTicker === quoteFeedBaseTicker) {
          intersectedTicker = quoteFeedBaseTicker;

          baseFeed = this.getFeed(baseTicker, intersectedTicker);
          aggregators.push({ feed: baseFeed, invert: false });

          quoteFeed = this.getFeed(intersectedTicker, quoteTicker);
          aggregators.push({ feed: quoteFeed, invert: false });

          break;
        }
      }
    }
    //Case 3
    if (aggregators.length === 0) {
      // e.g.) CRV-CVX: CRV-ETH -> CVX-ETH
      // fetch the prices of the assets on both feeds and compute the result
      // required to invert the price

      if (!!intersectedTicker) {
        baseFeed = this.getFeed(baseTicker, intersectedTicker);
        aggregators.push({ feed: baseFeed, invert: false });

        quoteFeed = this.getFeed(intersectedTicker, quoteTicker);
        aggregators.push({ feed: quoteFeed, invert: true });
      } else {
        // e.g.) LDO-MATIC: LDO-ETH -> ETH-USD -> MATIC-USD
        // fetch the prices of the assets from three feeds associated with the bridge assets
        // then compute the result required to invert the price depends on the direction

        const baseFeedAssociatedTickers = new Set([
          ...this.getAssociatedTickers(baseTicker),
        ]);
        const quoteFeedAssociatedTickers = new Set([
          ...this.getAssociatedTickers(quoteTicker),
        ]);

        if (
          !!baseFeedAssociatedTickers.has(this.cryptoPairQuoteTicker) &&
          !!quoteFeedAssociatedTickers.has(this.usdPairQuoteTicker)
        ) {
          baseFeed = this.getFeed(baseTicker, this.cryptoPairQuoteTicker);
          aggregators.push({ feed: baseFeed, invert: false });

          intersectionFeed = this.getFeed(
            this.cryptoPairQuoteTicker,
            this.usdPairQuoteTicker
          );
          aggregators.push({ feed: intersectionFeed, invert: false });

          quoteFeed = this.getFeed(quoteTicker, this.usdPairQuoteTicker);
          aggregators.push({ feed: quoteFeed, invert: true });
        } else if (
          !!baseFeedAssociatedTickers.has(this.usdPairQuoteTicker) &&
          !!quoteFeedAssociatedTickers.has(this.cryptoPairQuoteTicker)
        ) {
          baseFeed = this.getFeed(baseTicker, this.usdPairQuoteTicker);
          aggregators.push({ feed: baseFeed, invert: false });

          intersectionFeed = this.getFeed(
            this.cryptoPairQuoteTicker,
            this.usdPairQuoteTicker
          );
          aggregators.push({ feed: intersectionFeed, invert: true });

          quoteFeed = this.getFeed(quoteTicker, this.cryptoPairQuoteTicker);
          aggregators.push({ feed: quoteFeed, invert: true });
        } else {
          //Case 4
          throw new Error("Intersection feed not found");
        }
      }
    }

    let result: string | undefined;

    for (const { feed, invert } of aggregators) {
      const answer = await this._getLatestAnswer(feed, invert);
      invariant(+answer > 0, "Failed to fetch the price data");

      if (!result) {
        result = answer;
      } else {
        const denominator = toBN(parseUnits(1, feed.decimals));
        const numerator = mul(result, answer);

        result = div(numerator, denominator).toString();
      }
    }

    const formatted = formatUnits(result!, aggregators[0].feed.decimals);
    const fraction = formatted.split(".");

    if (quoteTicker === "USD" && fraction[0].length > 8) {
      return [fraction[0], fraction[1].slice(0, 8)].join(".");
    }

    return formatted;
  }

  private async _getLatestAnswer(feed: AggregatorModel, invert: boolean) {
    const aggregator = this.getAggregator(feed.base, feed.quote);
    const reponse = await aggregator.latestAnswer();

    let answer = toBN(reponse);

    if (!!lte(answer, constants.ZERO)) return "0";

    if (!!invert) {
      //Numerator is constant derived from feed.decimals
      const unit = toBN(parseUnits(1, feed.decimals));
      const numerator = square(unit);
      const denominator = answer;

      answer = div(numerator, denominator);
    }

    return answer.toString();
  }

  //ticker = ETH-USDC
  private getAssociatedTickers(ticker: string) {
    const tickers = this.getFeedKeys(ticker);
    //tickers => USD = [ '1INCH-USD', 'AAVE-USD', 'ADA-USD', 'ADX-USD', 'ALCX-USD' ]
    const associatedTickers = tickers.reduce<string[]>((acc, feedKey) => {
      const [baseTicker, quoteTicker] = feedKey.split("-");
      const feedTicker = baseTicker === ticker ? quoteTicker : baseTicker;

      if (!acc.includes(feedTicker)) {
        acc.push(feedTicker);
      }
      return acc;
    }, []);
    return associatedTickers;
  }

  //Creates an instance of feed contract/interface
  //Chainlink primarily uses proxy address, if not available try contractAddress
  public getAggregator(base: string, quote: string) {
    const feed = this.getFeed(base, quote);

    invariant(!!feed, "Feed not found");

    const aggregatorAddress = !!feed.proxyAddress
      ? feed.proxyAddress
      : feed.contractAddress;

    return this.getContract(aggregatorAddress);
  }

  //Pass in base/quote => sorts into key and search in feeds array
  public getFeed(base: string, quote: string) {
    const key = this.getFeedKey(base, quote);
    return this.feeds[key];
  }

  //Returns an array of keys specific to ticker
  private getFeedKeys(ticker: string) {
    return this.feedKeys.get(ticker)!;
  }

  //Provides feed key with base/quote (order if needed) => USD is always the "quote" on Chainlink
  private getFeedKey(base: string, quote: string) {
    invariant(base !== quote, `Ticker must be identical`);

    if (base === "USD") {
      [base, quote] = [quote, base];
    }

    return `${base}-${quote}`;
  }

  public supportedChains() {
    return Object.values(ChainId).reduce<{ id: number; network: string }[]>(
      (acc, chainId) =>
        typeof chainId === "number"
          ? acc.concat({ id: chainId, network: ChainId[chainId] })
          : acc,
      []
    );
  }
}
