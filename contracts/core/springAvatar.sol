// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@gnosis.pm/safe-contracts/contracts/base/Executor.sol";
import "@gnosis.pm/zodiac/contracts/interfaces/IAvatar.sol";
import "@gnosis.pm/safe-contracts/contracts/common/SelfAuthorized.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../roleComponent/permissionReg/IPermissionRegistry.sol";
import "../roleComponent/permissionReg/permissionRegHandler.sol";

/// @title Spring Avatar
/// @author Markus Jungnickel
/// @notice Avatar contract implementing Zodiac standard. Based on the module manager used in Gnosis Safe
abstract contract springAvatar is
    IAvatar,
    Enum,
    Executor,
    permissionRegHandler
{
    event EnabledModule(address module);
    event DisabledModule(address module);
    event ExecutionFromModuleSuccess(address indexed module);
    event ExecutionFromModuleFailure(address indexed module);

    address internal constant SENTINEL_MODULES = address(0x1);
    mapping(address => address) internal modules;

    function __Avatar_init() internal virtual onlyInitializing {
        _setupModules();
    }

    /// @dev Checks whether msg.sender is module or has role-permission
    modifier authorizedToCallAvatar() virtual {
        bool isModule = (msg.sender != SENTINEL_MODULES &&
            modules[msg.sender] != address(0));
        bool isRole = false;
        if (!isModule) {
            isRole = IPermissionRegistry(permissionRegistry).canCall(
                msg.sender,
                address(this),
                msg.sig
            );
        }
        require(isModule || isRole, "Not authorized to call this function");
        _;
    }

    function setPermissionReg(address _permissionReg)
        public
        virtual
        authorizedToCallAvatar
    {
        _setPermissionReg(_permissionReg);
    }

    /// @dev Initializes the module whitelist as a linked list.
    function _setupModules() internal {
        require(
            modules[SENTINEL_MODULES] == address(0),
            "Modules already initialized"
        );
        modules[SENTINEL_MODULES] = SENTINEL_MODULES;
    }

    /// @dev Allows to add a module to the whitelist.
    /// @param module Module to be whitelisted.
    function enableModule(address module)
        public
        virtual
        authorizedToCallAvatar
    {
        _enableModule(module);
    }

    /// @dev Allows to add a module to the whitelist.
    /// @param module Module to be whitelisted.
    function _enableModule(address module) internal {
        require(module != address(0) && module != SENTINEL_MODULES, "GS101");
        require(modules[module] == address(0), "GS102");
        modules[module] = modules[SENTINEL_MODULES];
        modules[SENTINEL_MODULES] = module;
        emit EnabledModule(module);
    }

    /// @dev Allows to remove a module from the whitelist.
    /// @param prevModule Module that pointed to the module to be removed in the linked list
    /// @param module Module to be removed.
    function disableModule(address prevModule, address module)
        public
        authorizedToCallAvatar
    {
        _disableModule(prevModule, module);
    }

    /// @dev Allows to remove a module from the whitelist.
    /// @param prevModule Module that pointed to the module to be removed in the linked list
    /// @param module Module to be removed.
    function _disableModule(address prevModule, address module) internal {
        require(module != address(0) && module != SENTINEL_MODULES, "GS101");
        require(modules[prevModule] == module, "GS103");
        modules[prevModule] = modules[module];
        modules[module] = address(0);
        emit DisabledModule(module);
    }

    /// @dev Allows a Module to execute an Avatar transaction
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction (call vs delegatecall)
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public virtual authorizedToCallAvatar returns (bool success) {
        // require(
        //     msg.sender != SENTINEL_MODULES && modules[msg.sender] != address(0),
        //     "GS104"
        // );
        success = execute(to, value, data, operation, gasleft());
        if (success) emit ExecutionFromModuleSuccess(msg.sender);
        else emit ExecutionFromModuleFailure(msg.sender);
    }

    /// @dev Allows a Module to execute a Safe transaction without any further confirmations and return data
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModuleReturnData(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public virtual returns (bool success, bytes memory returnData) {
        success = execTransactionFromModule(to, value, data, operation);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Load free memory location
            let ptr := mload(0x40)
            // We allocate memory for the return data by setting the free memory location to
            // current free memory location + data size + 32 bytes for data size value
            mstore(0x40, add(ptr, add(returndatasize(), 0x20)))
            // Store the size
            mstore(ptr, returndatasize())
            // Store the data
            returndatacopy(add(ptr, 0x20), 0, returndatasize())
            // Point the return data to the correct memory location
            returnData := ptr
        }
    }

    /// @dev Returns whether module is enabled
    /// @param module The module to check
    /// @return True if the module is enabled
    function isModuleEnabled(address module) public view returns (bool) {
        return SENTINEL_MODULES != module && modules[module] != address(0);
    }

    /// @dev Returns array of modules.
    /// @param start Start of the page.
    /// @param pageSize Maximum number of modules that should be returned.
    /// @return array Array of modules.
    /// @return next Start of the next page.
    function getModulesPaginated(address start, uint256 pageSize)
        external
        view
        returns (address[] memory array, address next)
    {
        // Init array with max page size
        array = new address[](pageSize);

        // Populate return array
        uint256 moduleCount = 0;
        address currentModule = modules[start];
        while (
            currentModule != address(0x0) &&
            currentModule != SENTINEL_MODULES &&
            moduleCount < pageSize
        ) {
            array[moduleCount] = currentModule;
            currentModule = modules[currentModule];
            moduleCount++;
        }
        next = currentModule;
        // Set correct size of returned array
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(array, moduleCount)
        }
    }
}
