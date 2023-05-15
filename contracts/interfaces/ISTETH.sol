// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20Metadata.sol";

interface ISTETH is IERC20Metadata {
    function submit(address referral) external payable returns (uint256);

    function receiveELRewards() external payable;

    function transferShares(address recipient, uint256 shares)
        external
        returns (uint256);

    function sharesOf(address account) external view returns (uint256);

    function getTotalPooledEther() external view returns (uint256);

    function getTotalShares() external view returns (uint256);

    function getSharesByPooledEth(uint256 ethAmount)
        external
        view
        returns (uint256);

    function getPooledEthByShares(uint256 shares)
        external
        view
        returns (uint256);

    function getCurrentStakeLimit() external view returns (uint256);

    function getStakeLimitFullInfo()
        external
        view
        returns (
            bool isStakingPaused,
            bool isStakingLimitSet,
            uint256 currentStakeLimit,
            uint256 maxStakeLimit,
            uint256 maxStakeLimitGrowthBlocks,
            uint256 prevStakeLimit,
            uint256 prevStakeBlockNumber
        );

    function isStakingPaused() external view returns (bool);

    function pauseStaking() external;

    function resumeStaking() external;

    function setStakingLimit(
        uint256 maxStakeLimit,
        uint256 stakeLimitIncreasePerBlock
    ) external;

    function removeStakingLimit() external;

    function depositBufferedEther() external;

    function depositBufferedEther(uint256 maxDeposits) external;

    function burnShares(address account, uint256 sharesAmount)
        external
        returns (uint256 newTotalShares);

    function stop() external;

    function resume() external;

    function setFee(uint16 feeBasisPoints) external;

    function setFeeDistribution(
        uint16 treasuryFeeBasisPoints,
        uint16 insuranceFeeBasisPoints,
        uint16 operatorsFeeBasisPoints
    ) external;

    function getFee() external view returns (uint16 feeBasisPoints);

    function getFeeDistribution()
        external
        view
        returns (
            uint16 treasuryFeeBasisPoints,
            uint16 insuranceFeeBasisPoints,
            uint16 operatorsFeeBasisPoints
        );

    function setWithdrawalCredentials(bytes32 withdrawalCredentials) external;

    function getWithdrawalCredentials() external view returns (bytes32);

    function setELRewardsVault(address executionLayerRewardsVault) external;

    function setELRewardsWithdrawalLimit(uint16 limitPoints) external;

    function getELRewardsWithdrawalLimit() external view returns (uint256);

    function getTotalELRewardsCollected() external view returns (uint256);

    function handleOracleReport(
        uint256 beaconValidators,
        uint256 beaconBalance
    ) external;

    function transferToVault(address token) external;

    function setProtocolContracts(
        address oracle,
        address treasury,
        address insuranceFund
    ) external;

    function getDepositContract() external view returns (address);

    function getOracle() external view returns (address);

    function getOperators() external view returns (address);

    function getTreasury() external view returns (address);

    function getInsuranceFund() external view returns (address);

    function getELRewardsVault() external view returns (address);

    function getBeaconStat()
        external
        view
        returns (
            uint256 depositedValidators,
            uint256 beaconValidators,
            uint256 beaconBalance
        );
}