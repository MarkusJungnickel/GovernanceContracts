// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./GovernorUpgradeable.sol";
import "./GovernorSettingsUpgradeable.sol";
import "./GovernorCountingSimpleUpgradeable.sol";
import "./GovernorVotes.sol";
import "./GovernorVotesQuorumFractionUpgradeable.sol";
import "./GovernorTimelockControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./IVotes.sol";

/// @title Governor Core
/// @author Markus Jungnickel
/// @notice The main governance contract
contract GovernorCoreV2 is
    Initializable,
    GovernorUpgradeable,
    GovernorSettingsUpgradeable,
    GovernorCountingSimpleUpgradeable,
    GovernorVotes,
    GovernorVotesQuorumFractionUpgradeable,
    GovernorTimelockControlUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // _disableInitializers();
    }

    function initialize(
        GovToken token,
        TimelockControllerUpgradeable _timelock,
        uint256 minStake,
        uint256 maxStake
    ) public initializer {
        __Governor_init("GovenorCore");
        __GovernorSettings_init(
            1, /* 1 block */
            15, /*  458181 week */
            0
        );
        __GovernorCountingSimple_init(minStake, maxStake);
        __GovernorVotes_init(token);
        __GovernorVotesQuorumFraction_init(1);
        __GovernorTimelockControl_init(_timelock);
        __UUPSUpgradeable_init();
        // _setVotingContract(_votingContract);
    }

    // function _setVotingContract(IVotes _votingContract) internal {
    //     votingContract = _votingContract;
    // }

    // function setVotingContract(IVotes _votingContract) public {
    //     _setVotingContract(_votingContract);
    // }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyGovernance
    {}

    // The following functions are overrides required by Solidity.
    // super refers to next highest contract with that function
    // highest from right to left
    function votingDelay()
        public
        view
        override(IGovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernorUpgradeable, GovernorVotesQuorumFractionUpgradeable)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        uint256 stake
    )
        public
        override(GovernorUpgradeable, IGovernorUpgradeable)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description, stake);
    }

    function proposalThreshold()
        public
        view
        override(
            GovernorUpgradeable,
            GovernorSettingsUpgradeable,
            GovernorCountingSimpleUpgradeable
        )
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
