import { NetworkConfig } from "../types";

export enum ChainId {
  MAINNET = 1,
  OPTIMISM = 10,
  BSC = 56,
  POLYGON = 137,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
}

const NETWORKS: NetworkConfig[] = [
  {
    chainId: ChainId.MAINNET,
    id: "ethereum",
    name: "mainnet",
    label: "Ethereum",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/ea6c16dd0db5ac83ab10f489b8e7747c9d6100bc/blockchains/ethereum/info/logo.png",
    platformId: "ethereum",
    nativeId: "ethereum",
    wrappedNativeId: "weth",
    rpcUrl: {
      infura: "https://mainnet.infura.io/v3/",
      alchemy: "https://eth-mainnet.alchemyapi.io/v2/",
    },
    explorerUrl: "https://etherscan.io/",
    explorerApiUrl: "https://api.etherscan.io/",
    networkStatusUrl: "https://ethstats.dev/",
    rddUrl: "https://reference-data-directory.vercel.app/feeds-mainnet.json",
    blocksPerDay: 5760,
    native: {
      chainId: ChainId.MAINNET,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    wrappedNative: {
      chainId: ChainId.MAINNET,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    chainId: ChainId.OPTIMISM,
    id: "optimism",
    name: "optimism",
    label: "Optimistic Ethereum",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/ea6c16dd0db5ac83ab10f489b8e7747c9d6100bc/blockchains/optimism/info/logo.png",
    platformId: "optimistic-ethereum",
    nativeId: "ethereum",
    wrappedNativeId: "weth",
    rpcUrl: {
      infura: "https://optimism-mainnet.infura.io/v3/",
      alchemy: "https://opt-mainnet.g.alchemy.com/v2/",
    },
    explorerUrl: "https://optimistic.etherscan.io/",
    explorerApiUrl: "https://api-optimistic.etherscan.io/",
    networkStatusUrl: "https://status.optimism.io/",
    rddUrl:
      "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-optimism-1.json",
    blocksPerDay: 6646,
    native: {
      chainId: ChainId.OPTIMISM,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    wrappedNative: {
      chainId: ChainId.OPTIMISM,
      address: "0x4200000000000000000000000000000000000006",
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    chainId: ChainId.BSC,
    id: "bsc",
    name: "bsc",
    label: "Binance Smart Chain",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/ea6c16dd0db5ac83ab10f489b8e7747c9d6100bc/blockchains/binance/info/logo.png",
    platformId: "binance-smart-chain",
    nativeId: "binancecoin",
    wrappedNativeId: "wbnb",
    rpcUrl: {
      infura: "https://bnbsmartchain-mainnet.infura.io/v3/",
    },
    explorerUrl: "https://bscscan.com/",
    explorerApiUrl: "https://api.bscscan.com/",
    networkStatusUrl: "https://bscscan.freshstatus.io/",
    rddUrl:
      "https://reference-data-directory.vercel.app/feeds-bsc-mainnet.json",
    blocksPerDay: 28800,
    native: {
      chainId: ChainId.BSC,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "BNB",
      symbol: "BNB Beacon Chain",
      decimals: 18,
    },
    wrappedNative: {
      chainId: ChainId.BSC,
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      name: "Wrapped BNB",
      symbol: "WBNB",
      decimals: 18,
    },
  },
  {
    chainId: ChainId.POLYGON,
    id: "matic",
    name: "polygon",
    label: "Polygon POS",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/ea6c16dd0db5ac83ab10f489b8e7747c9d6100bc/blockchains/polygon/info/logo.png",
    platformId: "polygon-pos",
    nativeId: "matic-network",
    wrappedNativeId: "wmatic",
    rpcUrl: {
      infura: "https://polygon-mainnet.infura.io/v3/",
      alchemy: "https://polygon-mainnet.g.alchemyapi.io/v2/",
    },
    explorerUrl: "https://polygonscan.com/",
    explorerApiUrl: "https://api.polygonscan.com/",
    networkStatusUrl: "https://polygon.io/system",
    rddUrl:
      "https://reference-data-directory.vercel.app/feeds-matic-mainnet.json",
    blocksPerDay: 43200,
    native: {
      chainId: ChainId.POLYGON,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
    wrappedNative: {
      chainId: ChainId.POLYGON,
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      name: "Wrapped Matic",
      symbol: "WMATIC",
      decimals: 18,
    },
  },
  {
    chainId: ChainId.ARBITRUM,
    id: "arbitrum",
    name: "arbitrum",
    label: "Arbitrum One",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/ea6c16dd0db5ac83ab10f489b8e7747c9d6100bc/blockchains/arbitrum/info/logo.png",
    platformId: "arbitrum-one",
    nativeId: "ethereum",
    wrappedNativeId: "weth",
    rpcUrl: {
      infura: "https://arbitrum-mainnet.infura.io/v3/",
      alchemy: "https://arb-mainnet.g.alchemy.com/v2/",
    },
    explorerUrl: "https://arbiscan.io/",
    explorerApiUrl: "https://api.arbiscan.io/",
    networkStatusUrl: "https://arbiscan.freshstatus.io/",
    rddUrl:
      "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-arbitrum-1.json",
    blocksPerDay: 5760,
    native: {
      chainId: ChainId.ARBITRUM,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    wrappedNative: {
      chainId: ChainId.ARBITRUM,
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    chainId: ChainId.AVALANCHE,
    id: "avalanche",
    name: "avalanche",
    label: "Avalanche",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/ea6c16dd0db5ac83ab10f489b8e7747c9d6100bc/blockchains/avalanchec/info/logo.png",
    platformId: "avalanche",
    nativeId: "avalanche-2",
    wrappedNativeId: "wrapped-avax",
    rpcUrl: {
      infura: "https://avalanche-mainnet.infura.io/v3/",
    },
    explorerUrl: "https://snowtrace.io/",
    explorerApiUrl: "https://api.snowtrace.io/",
    networkStatusUrl: "https://status.avax.network/",
    rddUrl:
      "https://reference-data-directory.vercel.app/feeds-avalanche-mainnet.json",
    blocksPerDay: 86400,
    native: {
      chainId: ChainId.AVALANCHE,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    wrappedNative: {
      chainId: ChainId.AVALANCHE,
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      name: "Wrapped AVAX",
      symbol: "WAVAX",
      decimals: 18,
    },
  },
];

export const getNetwork = (chainId: ChainId) => {
  const network = NETWORKS.find((network) => network.chainId === chainId);

  if (!network) {
    throw new Error(`Chain ID: ${chainId} is not supported`);
  }

  return network;
};

export const getNetworks = () => NETWORKS;
