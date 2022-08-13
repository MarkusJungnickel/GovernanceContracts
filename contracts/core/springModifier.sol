// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./springAvatar.sol";
import "./springModule.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./settingsModuleHandler.sol";

abstract contract springModifier is
    springModule,
    springAvatar,
    settingsModuleHandler
{
    mapping(address => address) public moduleToAvatar;

    modifier authorizedSettingsModule() override {
        bool isSettingsModule = settingsModules[msg.sender] == true;
        bool isRole = false;
        if (!isSettingsModule) {
            isRole = IPermissionRegistry(permissionRegistry).canCall(
                msg.sender,
                address(this),
                msg.sig
            );
        }
        require(isSettingsModule || isRole, "Not authorised to set modifier");
        _;
    }

    function setPermissionReg(address _permissionReg)
        public
        override(springModule, springAvatar)
        authorizedSettingsModule
    {
        _setPermissionReg(_permissionReg);
    }

    function enableModification(address module, address avatar)
        public
        authorizedSettingsModule
    {
        if (!isAvatarEnabled(avatar)) {
            _enableAvatar(avatar);
        }
        _enableModule(module);
        moduleToAvatar[module] = avatar;
    }

    function enableSettingsModule(address module)
        public
        authorizedSettingsModule
    {
        _enableSettingsModule(module);
    }

    function _enableSettingsModule(address module) internal {
        settingsModules[module] = true;
    }

    function disableSettingsModule(address module)
        public
        authorizedSettingsModule
    {
        _disableSettingsModule(module);
    }

    function _disableSettingsModule(address module) internal {
        delete settingsModules[module];
    }

    /// @dev Hook called prior to execution of module transaction
    /// @notice Use this to implement the modifier rules
    function modifierRule(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) internal virtual;

    /// @dev Hook called after execution of module transaction
    function postModifier(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        bool success
    ) internal virtual;

    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public virtual override authorizedToCallAvatar returns (bool success) {
        // require(
        //     msg.sender != SENTINEL_MODULES && modules[msg.sender] != address(0),
        //     "GS104"
        // );
        modifierRule(to, value, data, operation);
        success = exec(to, value, data, moduleToAvatar[msg.sender], operation);
        if (success) emit ExecutionFromModuleSuccess(msg.sender);
        else emit ExecutionFromModuleFailure(msg.sender);
        postModifier(to, value, data, operation, success);
    }

    function execTransactionFromModuleReturnData(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    )
        public
        virtual
        override
        authorizedToCallAvatar
        returns (bool success, bytes memory returnData)
    {
        modifierRule(to, value, data, operation);
        (success, returnData) = execAndReturnData(
            to,
            value,
            data,
            moduleToAvatar[msg.sender],
            operation
        );
        postModifier(to, value, data, operation, success);
        return (success, returnData);
    }
}
