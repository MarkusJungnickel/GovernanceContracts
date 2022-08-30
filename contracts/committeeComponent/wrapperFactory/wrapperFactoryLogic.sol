// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./wrapperFactoryBase.sol";
import "../../UUPSProxyComponent/logic/logicBase.sol";

/// @title Wrapper Factory Logic
/// @author Markus Jungnickel
/// @notice Implements Wrapper Factory Base as logic contract for proxy pattern
contract wrapperFactoryLogic is logicBase, wrapperFactoryBase {
    constructor() {
        _disableInitializers();
    }
}
