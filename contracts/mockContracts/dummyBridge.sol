// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "hardhat/console.sol";
import "../bridgeComponent/bridgeProxyLogic.sol";

/// @title Dummy Bridge
/// @author Markus Jungnickel
/// @notice Based on Token Bridge Mediator Contract
contract dummyBridge {
    function requireToPassMessage(
        address payable _contract,
        bytes calldata _data,
        uint256 _gas
    ) external returns (bytes32) {
        console.log("here");
        // bytes4 ret = data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3];
        (
            address to,
            uint256 value,
            bytes memory params,
            address avatar,
            uint8 operation
        ) = abi.decode(_data[4:], (address, uint256, bytes, address, uint8));
        console.log(to, value, avatar, operation);
        bridgeProxyLogic(_contract).executeTransactionFromAMB(
            to,
            value,
            params,
            avatar,
            Enum.Operation(operation)
        );
    }

    function messageSender() external view returns (address) {
        return msg.sender;
    }
}
