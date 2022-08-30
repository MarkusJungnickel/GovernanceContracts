// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./budgetModifierBase.sol";
import "../../UUPSProxyComponent/logic/logicBase.sol";

/// @title Budget Modifier Logic
/// @author Markus Jungnickel
/// @notice Implements the Budget Modifier Base as proxy pattern logic contract
contract budgetModifierLogic is budgetModifierBase, logicBase {
    constructor() {
        _disableInitializers();
    }
}
