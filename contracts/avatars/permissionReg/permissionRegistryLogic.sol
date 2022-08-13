// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./permissionRegistryBase.sol";
import "../../proxyContracts/logic/logicBase.sol";

contract permissionRegistryLogic is logicBase, permissionRegistryBase {
    function owner()
        public
        view
        override(OwnableUpgradeable, DSAuth)
        returns (address)
    {
        return super.owner();
    }

    constructor() {
        _disableInitializers();
    }
}
