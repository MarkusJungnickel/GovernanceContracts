// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./wrapperFactoryBase.sol";

contract wrapperFactory is wrapperFactoryBase {
    constructor(
        address _wrapperLogic,
        address _safeFactory,
        address _safeLogic,
        address _initialModule
    ) {
        bytes memory initializeParams = abi.encode(
            _wrapperLogic,
            _safeFactory,
            _safeLogic,
            _initialModule
        );
        initialize(initializeParams);
    }
}
