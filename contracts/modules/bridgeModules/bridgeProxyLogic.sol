// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./interfaces/IAMB.sol";
import "../../core/springModule.sol";
import "../../core/springAvatar.sol";
import "../../core/settingsModuleHandler.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./utils/EternalStorage.sol";

// THE PROBLEM IS THAT WRAPPER FACTORY NO AVATAR FUNCTION BUT THE BRIDGE LOGIC ASSUMES ONE

/**
 * @title bridgeProxyLogic
 * @dev Basic storage and methods needed by mediators to interact with AMB bridge.
 */
contract bridgeProxyLogic is
    springModule,
    springAvatar,
    settingsModuleHandler,
    EternalStorage,
    UUPSUpgradeable
{
    bytes32 internal constant BRIDGE_CONTRACT =
        0x811bbb11e8899da471f0e69a3ed55090fc90215227fc5fb1cb0d6e962ea7b74f; // keccak256(abi.encodePacked("bridgeContract"))
    bytes32 internal constant MEDIATOR_CONTRACT =
        0x98aa806e31e94a687a31c65769cb99670064dd7f5a87526da075c5fb4eab9880; // keccak256(abi.encodePacked("mediatorContract"))
    bytes32 internal constant REQUEST_GAS_LIMIT =
        0x2dfd6c9f781bb6bbb5369c114e949b69ebb440ef3d4dd6b2836225eb1dc3a2be; // keccak256(abi.encodePacked("requestGasLimit"))

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

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external payable virtual {
        bytes memory AMBdata = abi.encodeCall(
            this.executeGenericTransactionFromAMB,
            (avatars[SENTINEL_AVATARS], msg.data)
        );
        passMessage(AMBdata);
    }

    function initialize(bytes memory initializeParams) public initializer {
        (
            address bridge,
            address otherMediator,
            address avatar,
            address firstModule
        ) = abi.decode(initializeParams, (address, address, address, address));
        __Ownable_init();
        __Avatar_init();
        __Module_init();
        _enableAvatar(avatar);
        _enableModule(firstModule);
        _setBridgeContract(bridge);
        _setMediatorContractOnOtherSide(otherMediator);
    }

    function setPermissionReg(address _permissionReg)
        public
        override(springModule, springAvatar)
        authorizedToCallAvatar
    {
        super._setPermissionReg(_permissionReg);
    }

    /// @dev Function that will revert when `msg.sender` is not authorized to upgrade the contract. Called by
    /// {upgradeTo} and {upgradeToAndCall}.
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /**
     * @dev Throws if caller on the other side is not an associated mediator.
     */
    modifier onlyMediator() {
        require(msg.sender == address(bridgeContract()), "only mediator");
        require(
            messageSender() == mediatorContractOnOtherSide(),
            "only mediator"
        );
        _;
    }

    /**
     * @dev Sets the AMB bridge contract address. Only the owner can call this method.
     * @param _bridgeContract the address of the bridge contract.
     */
    function setBridgeContract(address _bridgeContract) external {
        _setBridgeContract(_bridgeContract);
    }

    /**
     * @dev Sets the mediator contract address from the other network. Only the owner can call this method.
     * @param _mediatorContract the address of the mediator contract.
     */
    function setMediatorContractOnOtherSide(address _mediatorContract)
        external
    {
        _setMediatorContractOnOtherSide(_mediatorContract);
    }

    /**
     * @dev Sets the gas limit to be used in the message execution by the AMB bridge on the other network.
     * This value can't exceed the parameter maxGasPerTx defined on the AMB bridge.
     * Only the owner can call this method.
     * @param _requestGasLimit the gas limit for the message execution.
     */
    function setRequestGasLimit(uint256 _requestGasLimit) external {
        _setRequestGasLimit(_requestGasLimit);
    }

    /**
     * @dev Get the AMB interface for the bridge contract address
     * @return AMB interface for the bridge contract address
     */
    function bridgeContract() public view returns (IAMB) {
        return IAMB(addressStorage[BRIDGE_CONTRACT]);
    }

    /**
     * @dev Tells the mediator contract address from the other network.
     * @return the address of the mediator contract.
     */
    function mediatorContractOnOtherSide() public view returns (address) {
        return addressStorage[MEDIATOR_CONTRACT];
    }

    /**
     * @dev Tells the gas limit to be used in the message execution by the AMB bridge on the other network.
     * @return the gas limit for the message execution.
     */
    function requestGasLimit() public view returns (uint256) {
        return uintStorage[REQUEST_GAS_LIMIT];
    }

    /**
     * @dev Stores a valid AMB bridge contract address.
     * @param _bridgeContract the address of the bridge contract.
     */
    function _setBridgeContract(address _bridgeContract) internal {
        require(AddressUpgradeable.isContract(_bridgeContract));
        addressStorage[BRIDGE_CONTRACT] = _bridgeContract;
    }

    /**
     * @dev Stores the mediator contract address from the other network.
     * @param _mediatorContract the address of the mediator contract.
     */
    function _setMediatorContractOnOtherSide(address _mediatorContract)
        internal
    {
        addressStorage[MEDIATOR_CONTRACT] = _mediatorContract;
    }

    /**
     * @dev Stores the gas limit to be used in the message execution by the AMB bridge on the other network.
     * @param _requestGasLimit the gas limit for the message execution.
     */
    function _setRequestGasLimit(uint256 _requestGasLimit) internal {
        require(_requestGasLimit <= maxGasPerTx());
        uintStorage[REQUEST_GAS_LIMIT] = _requestGasLimit;
    }

    /**
     * @dev Tells the address that generated the message on the other network that is currently being executed by
     * the AMB bridge.
     * @return the address of the message sender.
     */
    function messageSender() internal view returns (address) {
        return bridgeContract().messageSender();
    }

    /**
     * @dev Tells the id of the message originated on the other network.
     * @return the id of the message originated on the other network.
     */
    function messageId() internal view returns (bytes32) {
        return bridgeContract().messageId();
    }

    /**
     * @dev Tells the maximum gas limit that a message can use on its execution by the AMB bridge on the other network.
     * @return the maximum gas limit value.
     */
    function maxGasPerTx() internal view returns (uint256) {
        return bridgeContract().maxGasPerTx();
    }

    /// @dev Executes a transaction initated by the AMB
    /// @param to Target of the transaction that should be executed
    /// @param value Wei value of the transaction that should be executed
    /// @param data Data of the transaction that should be executed
    /// @param operation Operation (Call or Delegatecall) of the transaction that should be executed
    function executeTransactionFromAMB(
        address to,
        uint256 value,
        bytes memory data,
        address avatar,
        Enum.Operation operation
    ) public {
        require(
            exec(to, value, data, avatar, operation),
            "Module transaction failed"
        );
    }

    /// @dev Executes a transaction initated by the AMB
    /// @param to Target of the transaction that should be executed

    function executeGenericTransactionFromAMB(address to, bytes memory data)
        public
    {
        require(
            execute(to, 0, data, Enum.Operation.Call, gasleft()),
            "Module transaction failed"
        );
    }

    /**
     * @dev Call AMB bridge to require the invocation of handleBridgedTokens method of the mediator on the other network.
     * Store information related to the bridged tokens in case the message execution fails on the other network
     * and the action needs to be fixed/rolled back.
     * @param data data for function call on other side.
     */
    function passMessage(bytes memory data) internal {
        require(data.length > 0, "data cannot be null");
        bytes32 _messageId = bridgeContract().requireToPassMessage(
            mediatorContractOnOtherSide(),
            data,
            requestGasLimit()
        );
    }

    /// IF DO PROXY, THEN HOW CHECK PARAMETERS FOR FUNCTION CALL TO SELF???

    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public override returns (bool success) {
        // Only whitelisted modules are allowed.
        require(
            msg.sender != SENTINEL_MODULES && modules[msg.sender] != address(0),
            "GS104"
        );
        // Execute transaction without further confirmations.
        // bytes memory AMBdata = abi.encodeWithSelector(
        //     receiveMethodSelector,
        //     to,
        //     value,
        //     data,
        //     avatars[SENTINEL_AVATARS],
        //     operation
        // );
        address avatar = avatars[SENTINEL_AVATARS];
        bytes memory AMBdata = abi.encodeCall(
            this.executeTransactionFromAMB,
            (to, value, data, avatar, operation)
        );
        passMessage(AMBdata);
        return true;
    }
}
