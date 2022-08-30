// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title Logic Base Contract
/// @author Markus Jungnickel
/// @notice All contracts that inherit from this can be logic contracts for UPPS proxy pattern
abstract contract logicBase is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    /// @dev Function that will revert when `msg.sender` is not authorized to upgrade the contract. Called by
    /// {upgradeTo} and {upgradeToAndCall}.
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
