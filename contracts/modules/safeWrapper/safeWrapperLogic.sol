// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "./safeWrapperBase.sol";
import "../../proxyContracts/logic/logicBase.sol";
import "hardhat/console.sol";

contract safeWrapperLogic is safeWrapperBase, logicBase {
    constructor() {
        _disableInitializers();
    }
}
