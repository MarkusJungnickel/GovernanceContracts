// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (governance/extensions/GovernorCountingSimple.sol)

pragma solidity ^0.8.0;

import "./GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Extension of {Governor} for simple, 3 options, vote counting.
 *
 * _Available since v4.3._
 */
abstract contract GovernorCountingSimpleUpgradeable is
    Initializable,
    GovernorUpgradeable
{
    uint256 public minStake;
    uint256 public maxStake;

    function __GovernorCountingSimple_init(uint256 _minStake, uint256 _maxStake)
        internal
        onlyInitializing
    {
        __GovernorCountingSimple_init_unchained(_minStake, _maxStake);
    }

    function __GovernorCountingSimple_init_unchained(
        uint256 _minStake,
        uint256 _maxStake
    ) internal onlyInitializing {
        minStake = _minStake;
        maxStake = _maxStake;
    }

    /**
     * @dev Supported vote types. Matches Governor Bravo ordering.
     */
    enum VoteType {
        Against,
        For,
        Abstain
    }

    struct Stake {
        address staker;
        uint256 amount;
    }

    struct ProposalVote {
        uint256 againstVotes;
        uint256 forVotes;
        uint256 abstainVotes;
        Stake proposerStake;
        Stake objectorStake;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => ProposalVote) private _proposalVotes;

    /**
     * @dev See {IGovernor-COUNTING_MODE}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function COUNTING_MODE()
        public
        pure
        virtual
        override
        returns (string memory)
    {
        return "support=bravo&quorum=for,abstain";
    }

    /**
     * @dev See {IGovernor-hasVoted}.
     */
    function hasVoted(uint256 proposalId, address account)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _proposalVotes[proposalId].hasVoted[account];
    }

    /**
     * @dev Accessor to the internal vote counts.
     */
    function proposalVotes(uint256 proposalId)
        public
        view
        virtual
        returns (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        )
    {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];
        return (
            proposalvote.againstVotes,
            proposalvote.forVotes,
            proposalvote.abstainVotes
        );
    }

    /**
     * @dev See {Governor-_quorumReached}.
     */
    function _quorumReached(uint256 proposalId)
        internal
        view
        virtual
        override
        returns (bool)
    {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];

        return
            quorum(proposalSnapshot(proposalId)) <=
            (proposalvote.forVotes + proposalvote.abstainVotes)**2;
    }

    /**
     * @dev See {Governor-_voteSucceeded}. In this module, the forVotes must be strictly over the againstVotes.
     */
    function _voteSucceeded(uint256 proposalId)
        internal
        view
        virtual
        override
        returns (bool)
    {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];

        return proposalvote.forVotes > proposalvote.againstVotes;
    }

    /**
     * @dev See {Governor-_countVote}. In this module, the support follows the `VoteType` enum (from Governor Bravo).
     */
    function _countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight,
        bytes memory // params
    ) internal virtual override {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];

        require(
            !proposalvote.hasVoted[account],
            "GovernorVotingSimple: vote already cast"
        );
        proposalvote.hasVoted[account] = true;

        if (support == uint8(VoteType.Against)) {
            proposalvote.againstVotes += weight;
        } else if (support == uint8(VoteType.For)) {
            proposalvote.forVotes += weight;
        } else if (support == uint8(VoteType.Abstain)) {
            proposalvote.abstainVotes += weight;
        } else {
            revert("GovernorVotingSimple: invalid value for enum VoteType");
        }
    }

    function _countObjection(
        address account,
        uint256 proposalId,
        uint256 amount
    ) internal override {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];
        proposalvote.objectorStake.staker = account;
        proposalvote.objectorStake.amount = amount;
    }

    function _countProposer(
        address account,
        uint256 proposalId,
        uint256 amount
    ) internal override {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];
        proposalvote.proposerStake.staker = account;
        proposalvote.proposerStake.amount = amount;
    }

    function noObjections(uint256 proposalId)
        public
        view
        override
        returns (bool)
    {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];
        return proposalvote.objectorStake.amount == 0;
    }

    function getProposer(uint256 proposalId)
        public
        view
        override
        returns (address, uint256)
    {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];
        return (
            proposalvote.proposerStake.staker,
            proposalvote.proposerStake.amount
        );
    }

    function getObjector(uint256 proposalId)
        public
        view
        override
        returns (address, uint256)
    {
        ProposalVote storage proposalvote = _proposalVotes[proposalId];
        return (
            proposalvote.objectorStake.staker,
            proposalvote.objectorStake.amount
        );
    }

    function proposalThreshold()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return minStake;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
