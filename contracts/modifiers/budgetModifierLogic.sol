// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./budgetModifierBase.sol";
import "../proxyContracts/logic/logicBase.sol";

contract budgetModifierLogic is budgetModifierBase, logicBase {
    constructor() {
        _disableInitializers();
    }
}
