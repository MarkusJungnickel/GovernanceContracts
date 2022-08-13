// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./budgetModifierBase.sol";

contract budgetModifier is budgetModifierBase {
    constructor(address module) {
        bytes memory initializeParams = abi.encode(module);
        initialize(initializeParams);
    }
}
