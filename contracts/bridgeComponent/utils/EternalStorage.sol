// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/// @title Eternal Storage
/// @author Token Bridge
/// @notice Implements an eternal storage solution for proxy pattern
contract EternalStorage {
    mapping(bytes32 => uint256) internal uintStorage;
    mapping(bytes32 => string) internal stringStorage;
    mapping(bytes32 => address) internal addressStorage;
    mapping(bytes32 => bytes) internal bytesStorage;
    mapping(bytes32 => bool) internal boolStorage;
    mapping(bytes32 => int256) internal intStorage;
}
