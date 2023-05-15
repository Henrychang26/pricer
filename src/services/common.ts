import { Signer, utils, Contract } from "ethers";
import { ChainId, getNetwork } from "../constants";
import { NetworkConfig, Provider } from "../types";
import { getRpcUrl } from "../config";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getAddress } from "../utils";

export interface ContractFactory {
  connect: (address: string, signerOrProvider: Provider | Signer) => Contract;
  createInterface: () => utils.Interface;
}

export abstract class BaseService<T extends Contract> {
  public readonly chainId: ChainId;
  public readonly network: NetworkConfig;
  public readonly provider: Provider;
  public readonly contractFactory: ContractFactory;
  public readonly contracts: { [address: string]: T };

  constructor(
    chainId: ChainId,
    contractFactory: ContractFactory,
    provider?: Provider
  ) {
    this.chainId = chainId;
    this.network = getNetwork(chainId);
    this.provider = !!provider
      ? provider
      : new JsonRpcProvider(getRpcUrl(chainId));
    this.contractFactory = contractFactory;
    this.contracts = {};
  }

  public getContract(address: string) {
    const contractAddress = getAddress(address);

    if (!this.contracts[contractAddress]) {
      this.contracts[contractAddress] = this.contractFactory.connect(
        contractAddress,
        this.provider
      ) as T;
    }
    return this.contracts[contractAddress];
  }
  public getInterface() {
    return this.contractFactory.createInterface();
  }
}
