// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "../proxy/springProxy.sol";

interface IProxyCallback {
    function proxyCreated(
        springProxy proxy,
        address _singleton,
        bytes calldata initializer,
        uint256 saltNonce
    ) external;
}
