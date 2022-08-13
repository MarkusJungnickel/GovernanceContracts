// SPDX-License-Identifier: MIT

/// @title Multi Avatar Module Interface - A contract that can pass messages to a Module Manager contract if enabled by that contract.
/// @notice The interface is based on the module interface build by Zodiac
pragma solidity >=0.7.0 <0.9.0;

import "@gnosis.pm/zodiac/contracts/interfaces/IAvatar.sol";
import "@gnosis.pm/zodiac/contracts/factory/FactoryFriendly.sol";
import "@gnosis.pm/zodiac/contracts/guard/Guardable.sol";
import "@gnosis.pm/safe-contracts/contracts/common/SelfAuthorized.sol";
import "hardhat/console.sol";

// 0xEd059a2b6D93326484b0047d73F6F23FDD50e784
contract dummyModule {
    function exec(
        address to,
        uint256 value,
        bytes memory data,
        address avatar,
        uint8 operation
    ) public returns (bool success) {
        success = IAvatar(avatar).execTransactionFromModule(
            to,
            value,
            data,
            Enum.Operation(operation)
        );

        return success;
    }
}
