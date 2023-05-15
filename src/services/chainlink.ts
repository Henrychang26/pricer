import { IAggregator } from "../../typechain-types";
import { BaseService } from "./common";

export class ChainlinkPricerService extends BaseService<IAggregator> {
  public readonly tokensService: TokenService;
}
