// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IGnosisSafeProxy {
    enum Operation {
        Call,
        DelegateCall
    }

    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes memory data,
        Operation operation
    ) external returns (bool success);
}
