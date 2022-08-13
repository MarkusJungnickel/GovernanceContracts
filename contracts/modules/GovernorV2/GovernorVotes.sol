// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (governance/extensions/GovernorVotes.sol)

pragma solidity ^0.8.0;

import "./GovernorUpgradeable.sol";
import "./GovToken.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Extension of {Governor} for voting weight extraction from an {ERC20Votes} token, or since v4.5 an {ERC721Votes} token.
 *
 * _Available since v4.3._
 *
 * @custom:storage-size 51
 */
abstract contract GovernorVotes is Initializable, GovernorUpgradeable {
    GovToken public token;

    function __GovernorVotes_init(GovToken tokenAddress)
        internal
        onlyInitializing
    {
        __GovernorVotes_init_unchained(tokenAddress);
    }

    function __GovernorVotes_init_unchained(GovToken tokenAddress)
        internal
        onlyInitializing
    {
        token = tokenAddress;
    }

    /**
     * Read the voting weight from the token's built in snapshot mechanism (see {Governor-_getVotes}).
     */
    function _getVotes(
        address account,
        uint256 blockNumber,
        bytes memory /*params*/
    ) internal view virtual override returns (uint256) {
        return token.getPastVotes(account, blockNumber);
    }

    function _lockVotes(
        address account,
        uint256 amount,
        uint256 proposalId
    ) internal override {
        token.lockVotes(account, amount, proposalId);
    }

    function _burnVotes(address account, uint256 amount) internal override {
        token.burn(account, amount);
    }

    function _freeVotes(
        address account,
        uint256 amount,
        uint256 proposalId
    ) internal override {
        token.freeVotes(account, amount, proposalId);
    }

    function _transferVotes(
        address from,
        address to,
        uint256 amount
    ) internal override {
        token.transferFrom(from, to, amount);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
