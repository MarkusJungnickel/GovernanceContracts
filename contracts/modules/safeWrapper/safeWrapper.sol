// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./safeWrapperBase.sol";

contract safeWrapper is safeWrapperBase {
    constructor(
        address newSafe,
        address initialModule,
        string memory _name,
        string memory _sector
    ) {
        bytes memory initializeParams = abi.encode(
            newSafe,
            initialModule,
            _name,
            _sector
        );
        initialize(initializeParams);
    }
}
