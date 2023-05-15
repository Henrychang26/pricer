import "dotenv/config";
import { HttpNetworkUserConfig, NetworksUserConfig } from "hardhat/types";

import { ChainId, getNetwork } from "../constants";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const INFURA_API_KEY = process.env.INFURA_API_KEY;

export const getRpcUrl = (chainId: ChainId) => {
  const network = getNetwork(chainId);
  const { alchemy, infura } = network.rpcUrl;

  if (!!ALCHEMY_API_KEY && !!alchemy) {
    return alchemy.concat(ALCHEMY_API_KEY);
  }

  if (!!INFURA_API_KEY && !!infura) {
    return infura.concat(INFURA_API_KEY);
  }

  return "http://localhost:8545";
};

export const buildNetworksConfig = (forkId: ChainId, enableFork: boolean) => {
  const config: NetworksUserConfig = {
    hardhat: {
      chainId: forkId,
      forking: {
        enabled: (!!INFURA_API_KEY || !!ALCHEMY_API_KEY) && enableFork === true,
        url: getRpcUrl(forkId),
      },
    },
  };

  return Object.entries(ChainId).reduce<NetworksUserConfig>(
    (acc, [key, value]) => {
      if (!!isNaN(+key) && !isNaN(+value)) {
        const networkName = key.toLowerCase();
        const networkId = +value as ChainId;

        const networkConfig: HttpNetworkUserConfig = {
          chainId: networkId,
          url: getRpcUrl(networkId),
        };

        acc[networkName] = networkConfig;
      }

      return acc;
    },
    config
  );
};
