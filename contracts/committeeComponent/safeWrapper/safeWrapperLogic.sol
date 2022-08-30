// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "./safeWrapperBase.sol";
import "../../UUPSProxyComponent/logic/logicBase.sol";
import "hardhat/console.sol";

/// @title Safe Wrapper Logic
/// @author Markus Jungnickel
/// @notice Implements the Safe Wrapper Base as proxy pattern
contract safeWrapperLogic is safeWrapperBase, logicBase {
    constructor() {
        _disableInitializers();
    }
}
