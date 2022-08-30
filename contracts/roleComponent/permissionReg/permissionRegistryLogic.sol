// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./permissionRegistryBase.sol";
import "../../UUPSProxyComponent/logic/logicBase.sol";

/// @title Permission Registry Logic
/// @author Markus Jungnickel
/// @notice Implements Permission Registry Base as a logic contract for proxy pattern
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
