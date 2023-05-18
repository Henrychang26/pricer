import invariant from "tiny-invariant";
import {
  IUniswapV3Factory,
  IUniswapV3Factory__factory,
  IUniswapV3Pool,
  IUniswapV3Pool__factory,
} from "../../typechain-types";
import { ChainId } from "../constants";
import { Mapping, Provider, TokenModel } from "../types";
import { BaseService } from "./common";
import { TokenService } from "./tokens";
import { FACTORY_ADDRESS, FeeAmount, TickMath } from "@uniswap/v3-sdk";
import { Price, Token } from "@uniswap/sdk-core";
import { constants, mul } from "../utils";

const SUPPORTED_CHAINS: ChainId[] = [
  ChainId.MAINNET,
  ChainId.OPTIMISM,
  ChainId.BSC,
  ChainId.POLYGON,
  ChainId.ARBITRUM,
];

interface PoolState {
  pool: string;
  token0: TokenModel;
  token1: TokenModel;
  fee: FeeAmount;
  liquidity: string;
  sqrtRatioX96: string;
  tick: number;
}

export class V3PricePoolService extends BaseService<IUniswapV3Pool> {
  public readonly tokensService: TokenService;
  public readonly poolAddresses: Mapping<string> = {};
  public readonly poolKey: Set<string> = new Set();
  public readonly factory: IUniswapV3Factory;

  constructor(chainId: ChainId, provider?: Provider) {
    super(chainId, IUniswapV3Pool__factory, provider);

    invariant(
      !!SUPPORTED_CHAINS.includes(chainId),
      `UniswapV3 is not supported on ${chainId}`
    );

    this.tokensService = new TokenService(chainId, provider);

    this.factory = IUniswapV3Factory__factory.connect(
      FACTORY_ADDRESS,
      this.provider
    );
  }

  public async getLatestAnswer(
    base: string,
    quote: string,
    fee: FeeAmount,
    period?: number
  ) {
    const baseToken = await this.tokensService.getToken(base);
    const quoteToken = await this.tokensService.getToken(quote);

    let tick: number;

    if (!!period) {
      tick = await this._twapTick(baseToken, quoteToken, fee, period);
    } else {
      //** */
      ({ tick } = await this.getPoolState(
        baseToken.address,
        quoteToken.address,
        fee
      ));
    }

    const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
    const ratioX192 = mul(sqrtRatioX96, sqrtRatioX96).toString();
    const Q192 = constants.Q192.toString();

    const price = baseToken.sortsBefore(quoteToken)
      ? new Price(baseToken, quoteToken, Q192, ratioX192)
      : new Price(quoteToken, baseToken, ratioX192, Q192);

    return price.toFixed(quoteToken.decimals);
  }

  public async getPoolState(tokenA: string, tokenB: string, fee: FeeAmount) {
    const { pool, token0, token1 } = await this.getPool(tokenA, tokenB, fee);

    const [slot0, liquidity] = await Promise.all([
      pool.slot0(),
      pool.liquidity(),
    ]);

    return {
      pool: pool.address,
      token0: {
        chainId: this.chainId,
        address: token0.address,
        name: token0.name!,
        symbol: token0.symbol!,
        decimals: token0.decimals,
      },
      token1: {
        chainId: this.chainId,
        address: token1.address,
        name: token1.name!,
        symbol: token1.symbol!,
        decimals: token1.decimals,
      },
      fee: fee,
      liquidity: liquidity.toString(),
      sqrtRatioX96: slot0.sqrtPriceX96.toString(),
      tick: slot0.tick,
    } as PoolState;
  }

  private async _twapTick(
    tokenA: string | Token,
    tokenB: string | Token,
    fee: FeeAmount,
    period: number
  ) {
    invariant(period > 0, `Period must be greater than 0`);

    const { pool } = await this.getPool(tokenA, tokenB, fee);

    //Call the observe function with 2 different point of time
    const { tickCumulatives } = await pool.observe([period, 0]);

    //Calculate the difference by plugging in each point of time
    // const test: BigNumber = tickCumulatives[period];
    const tickCumulativesDetla = +tickCumulatives[1].sub(tickCumulatives[0]);

    //Change in ticks / change in time
    let twapTick = tickCumulativesDetla / period;

    //If negative, round down by 1
    //To align with tickCumlativeDelta
    if (tickCumulativesDetla < 0 && tickCumulativesDetla % period != 0) {
      twapTick--;
    }
    //delta = -10  period = 6   => -10/6=> -16/6    modulus = 4
    return Math.round(twapTick);
  }

  private async getPool(
    tokenA: string | Token,
    tokenB: string | Token,
    fee: FeeAmount
  ) {
    //Token0/Token1 are NOT proper types, convert using token service
    let token0 =
      typeof tokenA == "string"
        ? await this.tokensService.getToken(tokenA)
        : tokenA;
    let token1 =
      typeof tokenB == "string"
        ? await this.tokensService.getToken(tokenB)
        : tokenB;

    //Create poolKey using input params
    const poolKey = `${token0}-${token1}-${fee}`;

    //If it does not exist in [], add to it
    //poolAddress can be retreived from factory
    if (!this.poolKey.has(poolKey)) {
      this.poolKey.add(poolKey);

      const poolAddress = await this.factory.getPool(
        token0.address,
        token1.address,
        fee
      );
      //Update poolAddresses: key(poolKey) value(poolAddress) pair
      this.poolAddresses[poolKey] = poolAddress;
    }
    //Using address from key value pair, initial pool instance from base service
    const pool = this.getContract(this.poolAddresses[poolKey]);

    return { pool, token0, token1 };
  }

  public poolFee() {
    return Object.values(FeeAmount).filter((fee) => {
      typeof fee === "number";
    }) as FeeAmount[];
  }

  public supportedChains() {
    return SUPPORTED_CHAINS.map((chainId) => ({
      id: chainId,
      network: ChainId[chainId],
    })) as { id: number; network: string }[];
  }
}

/**
 * 
 * TypeChain and ethers.js serve different purposes in the context of smart contract development.

TypeChain is a code generation tool that generates TypeScript typings for your smart contracts based on their ABIs. 
It provides type-safe contract factories, allowing you to interact with your contracts in a type-safe manner. 
This means that you can write code with autocompletion, type checking, and IDE support,
 which helps prevent common mistakes and improves developer productivity. TypeChain also provides 
 TypeScript typings for events emitted by the contracts, making it easier to work with event data.

Ethers.js, on the other hand, is a JavaScript/TypeScript library that provides a powerful and flexible API for interacting with 
Ethereum. It allows you to connect to Ethereum networks, send transactions, interact with smart contracts, listen to events, 
and perform various other operations. Ethers.js is widely used and has extensive community support.

So, to summarize:

TypeChain is primarily focused on generating type-safe contract factories and typings for your contracts, 
improving developer experience and reducing the likelihood of errors during contract interactions.

Ethers.js is a versatile library that provides a broad range of Ethereum-related functionality,
 including contract interaction, transaction management, event handling, and more. It offers flexibility 
 and control over Ethereum interactions and is widely used in the ecosystem.

Both TypeChain and ethers.js have their strengths and can be used together in a smart contract project. 
TypeChain enhances type safety and developer experience, while ethers.js provides a comprehensive set of 
tools and utilities for Ethereum development. Whether to use one or the other, or both, depends on your specific
 requirements, preferences, and the complexity of your project.
 */
