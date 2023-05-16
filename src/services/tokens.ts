import { IERC20Metadata, IERC20Metadata__factory } from "../../typechain-types";
import { BTC_QUOTE, ChainId, getNetwork } from "../constants";
import { getTokens } from "../schema/tokens";
import { Mapping, Provider, TokenModel } from "../types";
import { getAddress, isAddress } from "../utils";
import { BaseService } from "./common";
import { MulticallService } from "./multicall";
import { Token } from "@uniswap/sdk-core";

export class TokenService extends BaseService<IERC20Metadata> {
  public readonly multicallService: MulticallService;
  //** */
  public readonly tokens: Mapping<Token> = {};

  constructor(chainId: ChainId, provider?: Provider) {
    //Calling from common.ts
    super(chainId, IERC20Metadata__factory, provider);

    //Creates multicall from service
    this.multicallService = new MulticallService(chainId, provider);

    //Get the native token based on chainId
    const native = getNetwork(chainId).native;

    const btc: TokenModel = {
      chainId: chainId,
      address: BTC_QUOTE,
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 8,
    };
    //combine native token, BTC and all supported tokens pointed at chainId(schema)
    const tokens = [native, btc].concat(getTokens(chainId));
    //Load all tokens into Token[]
    this.addTokens(tokens);
  }

  public async fetchTokens(tokenAddresses: string[]) {
    const response = await this.multicallService.call(
      tokenAddresses,
      this.getInterface(),
      ["name", "symbol", "decimals"]
    );

    const tokens = tokenAddresses.reduce<Token[]>((acc, tokenAddress) => {
      const [name, symbol, decimals] = response.splice(0, 3) as [
        string,
        string,
        number
      ];

      if (!!name && !!symbol && !!decimals) {
        const token = new Token(
          this.chainId,
          getAddress(tokenAddress),
          decimals,
          symbol,
          name
        );
        this.tokens[token.address] = token;
        acc.push(token);
      }
      return acc;
    }, []);
    return tokens;
  }

  //ethers.utils.isAddress() checks whether or not an address is valid
  //ethers.utils.getAddress() returns address as Checksum address
  //Search specific token with symbol: string from Token[]
  public async getToken(target: string) {
    //zzz
    //If token address is not valid
    if (!isAddress(target)) {
      const token = Object.values(this.tokens).find((token) => {
        token.symbol!.toUpperCase() === target.toUpperCase();
      });
      if (!token) {
        throw new Error(`Token not found`);
      }
      return token;
    } else {
      const tokenAddress = getAddress(target);
      if (!this.tokens[tokenAddress]) {
        await this.fetchTokens([tokenAddress]);
      }
      return this.tokens[tokenAddress];
    }
  }

  //Load all tokens into Token[]
  public addTokens(tokens: TokenModel[]) {
    tokens.map((token) => {
      if (!this.tokens[token.address]) {
        this.tokens[token.address] = this._parseToken(token);
      }
    });
  }
  //Only when not found in array, add by hardcoding each element
  private _parseToken = (token: TokenModel) => {
    return new Token(
      token.chainId,
      token.address,
      token.decimals,
      token.symbol,
      token.name
    );
  };
}
