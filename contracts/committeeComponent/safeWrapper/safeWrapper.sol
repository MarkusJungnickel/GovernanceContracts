// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./safeWrapperBase.sol";

/// @title Safe Wrapper
/// @author Markus Jungnickel
/// @notice Implements Safe Wrapper Base without proxy pattern
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
