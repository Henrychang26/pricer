import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

import { buildNetworksConfig, ChainId } from "./src";
// import { loadTasks } from "./tasks";

// loadTasks();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          viaIR: true,
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 1_000_000,
          },
          metadata: {
            bytecodeHash: "none",
          },
        },
      },
    ],
  },
  networks: buildNetworksConfig(ChainId.MAINNET, true),
  mocha: {
    timeout: 60000,
  },
};

export default config;
