// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "../proxy/springProxy.sol";

/// @title Proxy Callback
/// @author Markus Jungnickel
/// @notice Based on orca protocol
interface IProxyCallback {
    function proxyCreated(
        springProxy proxy,
        address _singleton,
        bytes calldata initializer,
        uint256 saltNonce
    ) external;
}
