// SPDX-License-Identifier: MIT

/// @title Multi Avatar Module Interface - A contract that can pass messages to a Module Manager contract if enabled by that contract.
/// @notice The interface is based on the module interface build by Zodiac
pragma solidity >=0.7.0 <0.9.0;

import "@gnosis.pm/zodiac/contracts/interfaces/IAvatar.sol";
import "@gnosis.pm/zodiac/contracts/guard/Guardable.sol";
import "@gnosis.pm/safe-contracts/contracts/common/SelfAuthorized.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";
import "./permissionRegHandler.sol";

// SHOULD IMPLEMENT THIS AS A LINKED LIST - LIKE THE AVATAR DOES FOR avatars

abstract contract springModule is
    OwnableUpgradeable,
    Guardable,
    permissionRegHandler
{
    /// @dev Avatars are stored as linked list, this is the end
    address internal constant SENTINEL_AVATARS = address(0x1);

    /// @dev Emitted each time an avatar is set.
    event EnabledAvatar(address avatar);
    /// @dev Emitted each time a Target is set.
    event TargetSet(address indexed previousTarget, address indexed newTarget);
    /// @dev Emitted each time an avatar is removed.
    event DisabledAvatar(address avatar);

    /// @dev Address that will ultimately execute function calls.
    mapping(address => address) internal avatars;
    /// @dev Targets are addresses that this module will pass transactions to.
    mapping(address => address) internal avatarToTargets;

    /// @dev Checks whether msg.sender is module or has role-permission
    modifier authorizedToCallModule() virtual {
        _;
    }

    function __Module_init() internal virtual onlyInitializing {
        _setupAvatars();
    }

    function setPermissionReg(address _permissionReg)
        public
        virtual
        authorizedToCallModule
    {
        _setPermissionReg(_permissionReg);
    }

    function _setupAvatars() internal {
        require(
            avatars[SENTINEL_AVATARS] == address(0),
            "avatars already initialized"
        );
        avatars[SENTINEL_AVATARS] = SENTINEL_AVATARS;
    }

    /// @dev Allows to add a module to the whitelist.
    ///      This can only be done via a Safe transaction.
    /// @notice Enables the module `module` for the Safe.
    /// @param avatar Module to be whitelisted.
    function enableAvatar(address avatar) public authorizedToCallModule {
        _enableAvatar(avatar);
    }

    /// @dev Allows to add a module to the whitelist.
    ///      This can only be done via a Safe transaction.
    /// @notice Enables the module `module` for the Safe.
    /// @param avatar Module to be whitelisted.
    function _enableAvatar(address avatar) internal {
        // Avatar address cannot be null or sentinel.
        require(avatar != address(0) && avatar != SENTINEL_AVATARS, "GS101");
        // Avatar cannot be added twice.
        require(avatars[avatar] == address(0), "GS102");
        avatars[avatar] = avatars[SENTINEL_AVATARS];
        avatars[SENTINEL_AVATARS] = avatar;
        setTarget(avatar, avatar);
        emit EnabledAvatar(avatar);
    }

    function disableAvatar(address preAvatar, address avatar)
        public
        authorizedToCallModule
    {
        _disableAvatar(preAvatar, avatar);
    }

    function _disableAvatar(address preAvatar, address avatar) internal {
        // Validate avatar address and check that it corresponds to avatar index.
        require(avatar != address(0) && avatar != SENTINEL_AVATARS, "GS101");
        require(avatars[preAvatar] == avatar, "GS103");
        avatars[preAvatar] = avatars[avatar];
        avatars[avatar] = address(0);
        emit DisabledAvatar(avatar);
    }

    /// @dev Returns if an avatar is enabled
    /// @return True if the avatar is enabled
    function isAvatarEnabled(address avatar) public view returns (bool) {
        return SENTINEL_AVATARS != avatar && avatars[avatar] != address(0);
    }

    /// @dev Returns array of avatars.
    /// @param start Start of the page.
    /// @param pageSize Maximum number of avatars that should be returned.
    /// @return array Array of avatars.
    /// @return next Start of the next page.
    function getAvatarsPaginated(address start, uint256 pageSize)
        external
        view
        returns (address[] memory array, address next)
    {
        // Init array with max page size
        array = new address[](pageSize);

        // Populate return array
        uint256 avatarCount = 0;
        address currentAvatar = avatars[start];
        while (
            currentAvatar != address(0x0) &&
            currentAvatar != SENTINEL_AVATARS &&
            avatarCount < pageSize
        ) {
            array[avatarCount] = currentAvatar;
            currentAvatar = avatars[currentAvatar];
            avatarCount++;
        }
        next = currentAvatar;
        // Set correct size of returned array
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(array, avatarCount)
        }
    }

    /// @dev Sets the target to a new target (`newTarget`).
    /// @notice Can only be called by the current owner.
    function setTarget(address target, address avatar) public {
        address previousTarget = avatarToTargets[avatar];
        avatarToTargets[avatar] = target;
        emit TargetSet(previousTarget, target);
    }

    /// @dev Passes a transaction to be executed by the avatar.
    /// @notice Can only be called by this contract.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction: 0 == call, 1 == delegate call.
    function exec(
        address to,
        uint256 value,
        bytes memory data,
        address avatar,
        Enum.Operation operation
    ) internal returns (bool success) {
        /// Check avatar is enabled
        require(
            isAvatarEnabled(avatar),
            "Transaction destination is unregistered Avatar"
        );

        /// Check if a transactioon guard is enabled.
        if (guard != address(0)) {
            IGuard(guard).checkTransaction(
                /// Transaction info used by module transactions.
                to,
                value,
                data,
                operation,
                /// Zero out the redundant transaction information only used for Safe multisig transctions.
                0,
                0,
                0,
                address(0),
                payable(0),
                bytes("0x"),
                msg.sender
            );
        }
        success = IAvatar(avatarToTargets[avatar]).execTransactionFromModule(
            to,
            value,
            data,
            operation
        );
        if (guard != address(0)) {
            IGuard(guard).checkAfterExecution(bytes32("0x"), success);
        }
        return success;
    }

    /// @dev Passes a transaction to be executed by the target and returns data.
    /// @notice Can only be called by this contract.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction: 0 == call, 1 == delegate call.
    function execAndReturnData(
        address to,
        uint256 value,
        bytes memory data,
        address avatar,
        Enum.Operation operation
    ) internal returns (bool success, bytes memory returnData) {
        /// Check avatar is enabled
        require(
            isAvatarEnabled(avatar),
            "Transaction destination is unregistered Avatar"
        );

        /// Check if a transactioon guard is enabled.
        if (guard != address(0)) {
            IGuard(guard).checkTransaction(
                /// Transaction info used by module transactions.
                to,
                value,
                data,
                operation,
                /// Zero out the redundant transaction information only used for Safe multisig transctions.
                0,
                0,
                0,
                address(0),
                payable(0),
                bytes("0x"),
                msg.sender
            );
        }
        (success, returnData) = IAvatar(avatarToTargets[avatar])
            .execTransactionFromModuleReturnData(to, value, data, operation);
        if (guard != address(0)) {
            IGuard(guard).checkAfterExecution(bytes32("0x"), success);
        }
        return (success, returnData);
    }
}
