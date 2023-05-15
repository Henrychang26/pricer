// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20Metadata.sol";

interface IWSTETH is IERC20Metadata {
    function stETH() external view returns (address);

    function wrap(uint256 stETHAmount) external returns (uint256);

    function unwrap(uint256 wstETHAmount) external returns (uint256);

    function getWstETHByStETH(
        uint256 stETHAmount
    ) external view returns (uint256);

    function getStETHByWstETH(
        uint256 wstETHAmount
    ) external view returns (uint256);

    function stEthPerToken() external view returns (uint256);

    function tokensPerStEth() external view returns (uint256);
}