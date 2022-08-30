// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "@gnosis.pm/zodiac/contracts/interfaces/IAvatar.sol";
import "@gnosis.pm/zodiac/contracts/factory/FactoryFriendly.sol";
import "@gnosis.pm/zodiac/contracts/guard/Guardable.sol";
import "@gnosis.pm/safe-contracts/contracts/common/SelfAuthorized.sol";
import "hardhat/console.sol";

/// @title Dummy Module
/// @author Markus Jungnickel
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
