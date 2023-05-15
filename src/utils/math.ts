import { BigNumber } from "ethers";
import JSBI from "jsbi";

const NEGATIVE_ONE = JSBI.BigInt(-1);
const ZERO = JSBI.BigInt(0);
const ONE = JSBI.BigInt(1);
const TWO = JSBI.BigInt(2);
const GWEI = JSBI.BigInt("1000000000");
const ETHER = JSBI.BigInt("1000000000000000000");
const MAX_UINT256 = JSBI.BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  //  FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
);
const MAX_INT256 = JSBI.BigInt(
  "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
const Q128 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128));
const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

const BASE_TICK = 1.0001;
const MIN_TICK = -887272;
const MAX_TICK = -MIN_TICK;

export const constants = {
  NEGATIVE_ONE,
  ZERO,
  ONE,
  TWO,
  GWEI,
  ETHER,
  MAX_UINT256,
  MAX_INT256,
  Q96,
  Q128,
  Q192,
  BASE_TICK,
  MIN_TICK,
  MAX_TICK,
};

export type BigNumberish = BigNumber | JSBI | number | string;

export const toBN = (x: BigNumberish) => {
  if (x instanceof JSBI) return x;

  if (BigNumber.isBigNumber(x)) x = x.toString();

  return JSBI.BigInt(x);
};

export const add = (x: BigNumberish, y: BigNumberish) =>
  JSBI.add(toBN(x), toBN(y));

export const sub = (x: BigNumberish, y: BigNumberish) =>
  JSBI.subtract(toBN(x), toBN(y));

export const mul = (x: BigNumberish, y: BigNumberish) =>
  JSBI.multiply(toBN(x), toBN(y));

export const mulDiv = (x: BigNumberish, y: BigNumberish, z: BigNumberish) =>
  div(mul(x, y), z);

export const div = (x: BigNumberish, y: BigNumberish) =>
  JSBI.divide(toBN(x), toBN(y));

export const exp = (x: BigNumberish) => JSBI.exponentiate(toBN(x), toBN(x));

export const square = (x: BigNumberish) => mul(toBN(x), toBN(x));

export const gte = (x: BigNumberish, y: BigNumberish) =>
  JSBI.greaterThanOrEqual(toBN(x), toBN(y));

export const gt = (x: BigNumberish, y: BigNumberish) =>
  JSBI.greaterThan(toBN(x), toBN(y));

export const lte = (x: BigNumberish, y: BigNumberish) =>
  JSBI.lessThanOrEqual(toBN(x), toBN(y));

export const lt = (x: BigNumberish, y: BigNumberish) =>
  JSBI.lessThan(toBN(x), toBN(y));
