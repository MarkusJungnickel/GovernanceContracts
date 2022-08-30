// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@gnosis.pm/zodiac/contracts/core/Modifier.sol";
import "@gnosis.pm/safe-contracts/contracts/base/Executor.sol";
import "../../core/springModifier.sol";
import "hardhat/console.sol";

/// @title Budget Modifier Base
/// @author Markus Jungnickel
/// @notice Implements the Budget Modifier Base using the Spring Modifier
contract budgetModifierBase is springModifier {
    struct budget {
        uint256 totalAmount;
        uint256 amountUsed;
        uint256 lastReset;
        uint256 interval;
        bool frozen;
    }
    mapping(address => budget) internal budgets;

    function initialize(bytes memory initializeParams) public initializer {
        address module = abi.decode(initializeParams, (address));
        __Ownable_init();
        __Avatar_init();
        __Module_init();
        _enableModule(module);
        _enableSettingsModule(module);
    }

    function setBudget(
        address module,
        uint256 _totalAmount,
        uint256 _interval
    ) public authorizedSettingsModule {
        budgets[module].totalAmount = _totalAmount;
        budgets[module].amountUsed = 0;
        budgets[module].interval = _interval;
        budgets[module].lastReset = block.number;
        budgets[module].frozen = false;
    }

    function getBudget(address module) public view returns (budget memory) {
        return budgets[module];
    }

    function setFreeze(address module) public authorizedSettingsModule {
        budgets[module].frozen = !budgets[module].frozen;
    }

    function checkBudget(
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) internal {
        require(operation == Operation.Call, "Invalid operation");
        bool correctSignature = false;
        assembly {
            correctSignature := eq(eq(sload(data), 0), 1)
        }
        require(correctSignature, "Invalid function signature");
        require(!budgets[msg.sender].frozen, "Budget is frozen");
        uint256 currentBlock = block.number;
        if (
            budgets[msg.sender].lastReset + budgets[msg.sender].interval <=
            currentBlock &&
            budgets[msg.sender].interval != 0
        ) {
            budgets[msg.sender].amountUsed = 0;
            budgets[msg.sender].lastReset = currentBlock;
        }
        require(
            value <=
                (budgets[msg.sender].totalAmount -
                    budgets[msg.sender].amountUsed),
            "Request exceeds budget"
        );
        budgets[msg.sender].amountUsed += value;
    }

    function modifierRule(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) internal override {
        checkBudget(value, data, operation);
    }

    function postModifier(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        bool success
    ) internal override {}
}
