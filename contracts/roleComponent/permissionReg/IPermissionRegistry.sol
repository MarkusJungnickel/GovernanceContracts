// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0;

interface IPermissionRegistry {
    function canCall(
        address caller,
        address code,
        bytes4 sig
    ) external view returns (bool);
}
