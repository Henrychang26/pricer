import { ChainId } from "../../constants";
import { AggregatorModel } from "../../types";

import mainnet from "./mainnet.json";
import optimism from "./optimism.json";
import bsc from "./bsc.json";
import polygon from "./polygon.json";
import arbitrum from "./arbitrum.json";
import avalanche from "./avalanche.json";

const FEED_LIST: { [chainId in ChainId]: AggregatorModel[] } = {
  [ChainId.MAINNET]: JSON.parse(JSON.stringify(mainnet, null, 4)),
  [ChainId.OPTIMISM]: JSON.parse(JSON.stringify(optimism, null, 4)),
  [ChainId.BSC]: JSON.parse(JSON.stringify(bsc, null, 4)),
  [ChainId.POLYGON]: JSON.parse(JSON.stringify(polygon, null, 4)),
  [ChainId.ARBITRUM]: JSON.parse(JSON.stringify(arbitrum, null, 4)),
  [ChainId.AVALANCHE]: JSON.parse(JSON.stringify(avalanche, null, 4)),
};

//Takes chainId and input [base, quote], initialized as empty[]
export const getFeeds = (chainId: ChainId, keys: [string, string][] = []) => {
  const feeds = FEED_LIST[chainId];

  if (feeds.length === 0) {
    return feeds;
  }

  return keys
    .reduce<AggregatorModel[]>((acc, [base, quote]) => {
      //destructue out base and quote from AggregatorModel
      //combine both to create key
      const key = `${base.toUpperCase()} / ${quote.toUpperCase()}`;

      const feed = feeds.find(
        (feed) => !!feed.name.toUpperCase().includes(key)
      );

      if (!!feed) {
        acc.push(feed);
      }
      return acc;
    }, [])
    .sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1));
};

export const getFeed = (chainId: ChainId, base: string, quote: string) => {
  const [feed] = getFeeds(chainId, [[base, quote]]);

  if (!feed) {
    throw new Error(`Feed does not exist`);
  }

  return feed;
};
