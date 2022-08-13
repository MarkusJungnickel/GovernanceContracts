// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./wrapperFactoryBase.sol";
import "../../proxyContracts/logic/logicBase.sol";

contract wrapperFactoryLogic is logicBase, wrapperFactoryBase {
    constructor() {
        _disableInitializers();
    }
}
