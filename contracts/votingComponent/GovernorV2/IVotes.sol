// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IVotes {
    function getPastVotes(address account, uint256 blockNumber)
        external
        view
        returns (uint256);

    function getPastTotalSupply(uint256 blockNumber)
        external
        view
        returns (uint256);

    function useVotes(address account, uint256 blockNumber)
        external
        returns (bool);
}
