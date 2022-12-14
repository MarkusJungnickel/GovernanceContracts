// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title Permission Registry Handler
/// @author Markus Jungnickel
/// @notice Implements store of Permission Registry Address
abstract contract permissionRegHandler is Initializable {
    address public permissionRegistry;

    function __Permission_Handler_init(address _permissionRegistry)
        internal
        virtual
        onlyInitializing
    {
        _setPermissionReg(_permissionRegistry);
    }

    function _setPermissionReg(address _permissionRegistry) internal {
        permissionRegistry = _permissionRegistry;
    }
}
