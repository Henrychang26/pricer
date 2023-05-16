import { JsonRpcProvider } from "@ethersproject/providers";
// import { FeeAmount } from "@uniswap/v3-sdk";

import { ChainId } from "../constants";

export type Mapping<T> = Record<string, T>;

export interface NetworkConfig {
  readonly chainId: ChainId;
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly logo: string;
  readonly platformId: string;
  readonly nativeId: string;
  readonly wrappedNativeId: string;
  readonly networkStatusUrl: string;
  readonly rpcUrl: { infura: string; alchemy?: string };
  readonly explorerUrl: string;
  readonly explorerApiUrl: string;
  readonly rddUrl: string;
  readonly blocksPerDay: number;
  readonly native: TokenModel;
  readonly wrappedNative: TokenModel;
}

export interface TokenModel {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export interface AggregatorModel {
  name: string;
  category: string;
  path: string;
  base: string;
  quote: string;
  decimals: number;
  contractAddress: string;
  proxyAddress: string | null;
}

export type Provider = JsonRpcProvider;
