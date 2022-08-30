// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import "./DAppHub/DSRoles.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "../../core/springAvatar.sol";
import "hardhat/console.sol";


/// @title Permission Registry Base
/// @author Markus Jungnickel
/// @notice Implements the permission registry, relying heavily on DSRoles. 
contract permissionRegistryBase is
    DSRoles,
    ERC721BurnableUpgradeable,
    springAvatar
{
    uint256 idTicker = 1000;
    mapping(uint8 => string) links;
    mapping(bytes32 => uint256) tokenIDs;

    modifier auth() override {
        bool isAuthorized = isAuthorized(msg.sender, msg.sig);
        bool isModule = false;
        if (!isAuthorized) {
            isModule = (msg.sender != SENTINEL_MODULES &&
                modules[msg.sender] != address(0));
        }
        require(isAuthorized || isModule, "ds-auth-unauthorized");
        _;
    }

    function initialize(bytes memory initializeParams) public initializer {
        (string memory name, string memory symbol) = abi.decode(
            initializeParams,
            (string, string)
        );
        __ERC721_init(name, symbol);
        __Avatar_init();
        _enableModule(msg.sender);
    }

    function setLink(uint8 role, string memory url) public auth {
        links[role] = url;
    }

    function getNFT(address owner, uint8 role)
        public
        view
        returns (string memory)
    {
        bytes32 roleHash = keccak256((abi.encodePacked(owner, role)));
        uint256 tokenId = tokenIDs[roleHash];
        if (tokenId != 0) {
            return links[role];
        }
        return "";
    }

    function getTokenID(address owner, uint8 role)
        public
        view
        returns (uint256 tokenId)
    {
        bytes32 roleHash = keccak256((abi.encodePacked(owner, role)));
        tokenId = tokenIDs[roleHash];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireMinted(tokenId);
        uint8 role = uint8(tokenId % 1000);
        return links[role];
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function mint(address to, uint8 role) internal {
        bytes32 roleHash = keccak256((abi.encodePacked(to, role)));
        require(tokenIDs[roleHash] == 0, "Already has a role NFT");
        uint256 tokenId = role + idTicker;
        tokenIDs[roleHash] = tokenId;
        idTicker += 1000;
        _mint(to, tokenId);
    }

    function burn(address to, uint8 role) internal {
        bytes32 roleHash = keccak256((abi.encodePacked(to, role)));
        uint256 tokenId = tokenIDs[roleHash];
        _burn(tokenId);
        tokenIDs[roleHash] = 0;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal view override {
        require(isModuleEnabled(_msgSender()), "No permission to transfer");
    }

    function beforeRoleChange(
        address who,
        uint8 role,
        bool enabled
    ) internal override {
        if (enabled) {
            mint(who, role);
        } else {
            burn(who, role);
        }
    }
}
