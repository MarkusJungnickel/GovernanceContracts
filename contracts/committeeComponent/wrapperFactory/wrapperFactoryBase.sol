// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import "../../UUPSProxyComponent/factory/springFactory.sol";
import "../../UUPSProxyComponent/proxy/springProxy.sol";
import "../budgetModifier/budgetModifier.sol";
import "../../UUPSProxyComponent/factory/IGnosisSafeProxy.sol";
import "..//safeWrapper/safeWrapperLogic.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "../../core/springAvatar.sol";


/// @title Wrapper Factory Base
/// @author Markus Jungnickel
/// @notice This contract is used to create new committees
contract wrapperFactoryBase is springFactory, springAvatar {
    address ZERO_ADDRESS;
    bytes EMPTY_DATA = "0x";
    address wrapperLogic;
    address safeFactory;
    address safeLogic;
    event createdSafeWrapper(address safeWrapper, address safe);

    function initialize(bytes memory initializeParams) public initializer {
        (
            address _wrapperLogic,
            address _safeFactory,
            address _safeLogic,
            address _initialModule
        ) = abi.decode(initializeParams, (address, address, address, address));
        __Avatar_init();
        _enableModule(_initialModule);
        wrapperLogic = _wrapperLogic;
        safeFactory = _safeFactory;
        safeLogic = _safeLogic;
    }

    function createSafeWrapperWithBudget(
        address module,
        address avatar,
        uint256 budget,
        uint256 interval,
        address mod,
        uint256 saltNonce,
        address[] calldata owners,
        uint8 threshold,
        string memory name,
        string memory sector
    ) public authorizedToCallAvatar {
        _createSafeWrapperWithBudget(
            module,
            avatar,
            budget,
            interval,
            mod,
            saltNonce,
            owners,
            threshold,
            name,
            sector
        );
    }

    function _createSafeWrapperWithBudget(
        address module,
        address avatar,
        uint256 budget,
        uint256 interval,
        address mod,
        uint256 saltNonce,
        address[] calldata owners,
        uint8 threshold,
        string memory name,
        string memory sector
    ) internal {
        GnosisSafeProxy safe = createSafe(saltNonce, owners, threshold);
        springProxy proxy;
        {
            bytes memory data = abi.encode(address(safe), module, name, sector);
            bytes memory initProxy = abi.encodeWithSelector(
                bytes4(keccak256("initialize(bytes)")),
                data
            );
            proxy = createProxy(wrapperLogic, initProxy);
        }

        configureModifier(mod, address(proxy), avatar, budget, interval);
        configureWrapper(address(proxy), mod, avatar);
        configureSafe(address(proxy), address(safe));
        emit createdSafeWrapper(address(proxy), address(safe));
    }

    function delegateSetup(address _context) external {
        this.enableModule(_context);
    }

    function configureWrapper(
        address proxy,
        address mod,
        address avatar
    ) internal {
        safeWrapperLogic(proxy).enableAvatar(avatar);
        safeWrapperLogic(proxy).setTarget(mod, avatar);
    }

    function configureModifier(
        address mod,
        address proxy,
        address avatar,
        uint256 budget,
        uint256 interval
    ) internal {
        budgetModifier(mod).enableModification(address(proxy), avatar);
        budgetModifier(mod).setBudget(address(proxy), budget, interval);
    }

    function configureSafe(address module, address safe) internal {
        {
            bytes memory enableData = abi.encodeWithSignature(
                "enableModule(address)",
                module
            );

            bool enableSuccess = IGnosisSafeProxy(safe)
                .execTransactionFromModule(
                    safe,
                    0,
                    enableData,
                    IGnosisSafeProxy.Operation.Call
                );
            require(enableSuccess, "Module could not be successfully enabled");
        }
        {
            bytes memory disableData = abi.encodeWithSignature(
                "disableModule(address)",
                address(this)
            );

            bool disableSuccess = IGnosisSafeProxy(safe)
                .execTransactionFromModule(
                    safe,
                    0,
                    disableData,
                    IGnosisSafeProxy.Operation.Call
                );
            require(
                disableSuccess,
                "Factory could not be successfully disabled as module"
            );
        }
    }

    function createSafe(
        uint256 saltNonce,
        address[] calldata owners,
        uint256 threshold
    ) internal returns (GnosisSafeProxy safe) {
        bytes memory moduleData = abi.encodeWithSelector(
            bytes4(keccak256("delegateSetup(address)")),
            address(this)
        );
        bytes memory initSafe;
        {
            initSafe = abi.encodeWithSelector(
                bytes4(
                    keccak256(
                        "setup(address[],uint256,address,bytes,address,address,uint256,address)"
                    )
                ),
                owners,
                threshold,
                address(this),
                moduleData,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                0,
                ZERO_ADDRESS
            );
        }
        safe = GnosisSafeProxyFactory(safeFactory).createProxyWithNonce(
            safeLogic,
            initSafe,
            saltNonce
        );
    }
}
