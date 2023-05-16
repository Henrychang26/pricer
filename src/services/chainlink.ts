import { IAggregator } from "../../typechain-types";
import { BaseService } from "./common";
import { TokenService } from "./tokens";

export class ChainlinkPricerService extends BaseService<IAggregator> {
  public readonly tokensService: TokenService;
}
