// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./permissionRegistryBase.sol";

contract permissionRegistry is permissionRegistryBase {
    constructor() {
        bytes memory initializeParams = abi.encode(
            "Governance Roles",
            "GOVRLS"
        );
        initialize(initializeParams);
    }
}
