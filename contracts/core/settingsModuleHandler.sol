// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./springAvatar.sol";
import "./springModule.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract settingsModuleHandler {
    mapping(address => bool) public settingsModules;

    modifier authorizedSettingsModule() virtual {
        _;
    }
}
