// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import "../../core/springModule.sol";

contract TimeLockModuleV2 is TimelockControllerUpgradeable, springModule {
    function initialize(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    ) public initializer {
        __Ownable_init();
        __TimelockController_init(minDelay, proposers, executors);
        __Module_init();
    }
}
