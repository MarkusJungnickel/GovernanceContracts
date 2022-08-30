// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20VotesUpgradeable.sol";
import "hardhat/console.sol";
import "./IVotes.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../../core/springAvatar.sol";



/// @title Governor Token
/// @author Open Zeppelin, amended by Markus Jungnickel
/// @notice Amended version of the Open Zeppelin ERC20 Token to implement quadratic voting and non-transferable token
contract GovToken is
    springAvatar,
    ERC20Upgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    mapping(address => mapping(uint256 => uint256)) lockedVotes;

    function initialize(string calldata name_, string calldata symbol_)
        public
        initializer
    {
        // (string memory name_, string memory symbol_) = abi.decode(
        //     initializeParams,
        //     (string, string)
        // );
        __ERC20_init(name_, symbol_);
        __ERC20Permit_init(name_);
        __ERC20Votes_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Avatar_init();
    }

    event VotesLockedChanged(address, uint256, uint256);

    //     constructor() {
    //     _disableInitializers();
    // }

    function _authorizeUpgrade(address newImplementation) internal override {}

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._burn(account, amount);
    }

    /// NEED TO STILL MAKE ONLY MODULES
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(from, to, amount);
        return true;
    }

    /// NEED TO STILL MAKE ONLY MODULES
    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }

    /// NEED TO STILL MAKE ONLY MODULES
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /// NEED TO STILL MAKE ONLY MODULES
    function lockVotes(
        address voter,
        uint256 amount,
        uint256 proposalId
    ) public {
        require(amount <= getVotes(voter), "Insufficient balance");
        lockedVotes[voter][proposalId] += amount;
        (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
            _checkpoints[voter],
            ERC20VotesUpgradeable._subtract,
            amount
        );
        emit VotesLockedChanged(voter, oldWeight, newWeight);
    }

    /// NEED TO STILL MAKE ONLY MODULES
    function freeVotes(
        address voter,
        uint256 amount,
        uint256 proposalId
    ) public {
        require(
            lockedVotes[voter][proposalId] >= amount,
            "Insufficient locked votes"
        );
        lockedVotes[voter][proposalId] -= amount;
        (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
            _checkpoints[voter],
            ERC20VotesUpgradeable._add,
            amount
        );
        emit VotesLockedChanged(voter, oldWeight, newWeight);
    }

    function getLockedVotes(address voter, uint256 proposalId)
        public
        view
        returns (uint256)
    {
        return lockedVotes[voter][proposalId];
    }

    function transfer(
        address, /*to*/
        uint256 /*amount*/
    ) public pure override returns (bool) {
        require(false, "Function disabled");
        return false;
    }
}
