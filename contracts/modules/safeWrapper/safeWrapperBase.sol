// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "hardhat/console.sol";
import "../../core/springModule.sol";
import "../../core/springAvatar.sol";
import "../../avatars/gnosisSafe/IGnosisSafe.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract safeWrapperBase is springModule, springAvatar {
    event SafeSucessfullyRegistered(address newSafe);

    address internal safe;
    address internal constant SENTINEL = address(0x1);
    string public name;
    string public sector;

    /// @dev Throws if called by any account other than the safe.
    modifier onlySafe() {
        require(
            msg.sender == safe,
            "Only the registered safe can call this method"
        );
        _;
    }

    /// @dev Throws if called by any account that is the safe.
    modifier notSafe() {
        require(
            msg.sender != safe,
            "The registered safe cannot call this method"
        );
        _;
    }

    function initialize(bytes memory initializeParams) public initializer {
        (
            address newSafe,
            address initialModule,
            string memory _name,
            string memory _sector
        ) = abi.decode(initializeParams, (address, address, string, string));
        __Ownable_init();
        __Avatar_init();
        __Module_init();
        _setupSafe(newSafe);
        _enableAvatar(newSafe);
        _enableModule(initialModule);
        name = _name;
        sector = _sector;
    }

    function setPermissionReg(address _permissionReg)
        public
        override(springModule, springAvatar)
        authorizedToCallAvatar
    {
        super._setPermissionReg(_permissionReg);
    }

    function sendEth(
        address to,
        uint256 amount,
        address avatar
    ) public onlySafe {
        bytes memory data;
        execAndReturnData(to, amount, data, avatar, Operation.Call);
    }

    function _setupSafe(address _safe) internal {
        require(_safe != address(0), "Invalid address");
        require(safe == address(0), "Module already has safe");
        safe = _safe;
        emit SafeSucessfullyRegistered(_safe);
    }

    function removeOwner(address owner, uint256 threshold)
        public
        authorizedToCallAvatar
        notSafe
    {
        address[] memory owners = IGnosisSafe(safe).getOwners();

        // find the address pointing to address to be removed
        address prevOwner;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                if (i == 0) {
                    prevOwner = SENTINEL;
                } else {
                    prevOwner = owners[i - 1];
                }
            }
        }

        bytes memory data = abi.encodeWithSignature(
            "removeOwner(address,address,uint256)",
            prevOwner,
            owner,
            threshold
        );

        bool success = IGnosisSafe(safe).execTransactionFromModule(
            safe,
            0,
            data,
            IGnosisSafe.Operation.Call
        );
        require(success, "Safe Transaction Failed");
    }

    function addOwner(address owner, uint256 threshold)
        public
        authorizedToCallAvatar
        notSafe
    {
        bytes memory data = abi.encodeWithSignature(
            "addOwnerWithThreshold(address,uint256)",
            owner,
            threshold
        );

        bool success = IGnosisSafe(safe).execTransactionFromModule(
            safe,
            0,
            data,
            IGnosisSafe.Operation.Call
        );
        require(success, "Safe Transaction Failed");
    }
}
