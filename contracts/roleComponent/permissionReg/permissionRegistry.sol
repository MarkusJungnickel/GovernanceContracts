// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./permissionRegistryBase.sol";


/// @title Permission Registry
/// @author Markus Jungnickel
/// @notice Implements Permission Registry Base without the proxy pattern
contract permissionRegistry is permissionRegistryBase {
    constructor() {
        bytes memory initializeParams = abi.encode(
            "Governance Roles",
            "GOVRLS"
        );
        initialize(initializeParams);
    }
}
