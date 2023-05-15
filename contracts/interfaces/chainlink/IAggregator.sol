// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAggregator {
    // V3

    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    // V2

    function latestAnswer() external view returns (int256 answer);

    function latestTimestamp() external view returns (uint256 timestamp);

    function latestRound() external view returns (uint256 roundId);

    function getAnswer(
        address base,
        address quote,
        uint256 roundId
    ) external view returns (int256 answer);

    function getTimestamp(
        address base,
        address quote,
        uint256 roundId
    ) external view returns (uint256 timestamp);
}