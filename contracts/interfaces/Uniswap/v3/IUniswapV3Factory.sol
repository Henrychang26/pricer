// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV3Factory {
    function owner() external view returns (address);

    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool);

    function feeAmountTickSpacing(uint24 fee)
        external
        view
        returns (int24 tickSpacing);

    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool);

    // Admin Methods

    function enableFeeAmount(uint24 fee, int24 tickSpacing) external;

    function setOwner(address owner) external;
}