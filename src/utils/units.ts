import { BigNumberish, utils } from "ethers";

export const formatUnits = (value: BigNumberish, unit?: number) => {
  return utils.formatUnits(value, unit);
};

export const parseUnits = (value: BigNumberish, unit?: number) => {
  return utils.parseUnits(value.toString(), unit);
};
