import { utils } from "ethers";

import { NATIVE_ADDRESS, WETH_ADDRESS, ZERO_ADDRESS } from "../constants";

export const { getAddress, isAddress } = utils;

export const isSameAddress = (x: string, y: string) => {
  return getAddress(x) === getAddress(y);
};

export const isNative = (tokenAddress: string) => {
  return isSameAddress(tokenAddress, NATIVE_ADDRESS);
};

export const isWrappedNative = (tokenAddress: string) => {
  return !!Object.values(WETH_ADDRESS).includes(getAddress(tokenAddress));
};

export const isZeroAddress = (tokenAddress: string) => {
  return isSameAddress(tokenAddress, ZERO_ADDRESS);
};
