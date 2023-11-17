// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TeamNick is ERC721, ERC721Enumerable, ERC721Pausable, Ownable {
    error InvalidName();
    error Unauthorized();

    struct Record {
        address ethAddress;
        string avatar;
    }

    // uint256 is the NFT token ID and a hash of the name
    mapping (uint256 => Record) records;
    string public baseUri;


    constructor(address _initialOwner, string memory _baseUri)
        ERC721("TeamNick", "NICK")
        Ownable(_initialOwner)
    {
        baseUri = _baseUri;
    }

    // Permits modifications only by the owner of the specified node.
    modifier authorised(uint256 node) {
        if (ownerOf(node) != msg.sender) {
            revert Unauthorized();
        }

        _;
    }

    function recordExists(uint256 node) public view returns (bool) {
        return ownerOf(node) != address(0x0);
    }

    function hashName(string calldata name) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(name)));
    }

    function register(string calldata name, address owner, address ethAddress, string calldata avatar) public {
        // Prevent the registration of empty names
        if (bytes(name).length == 0) {
            revert InvalidName();
        }
        
        uint256 node = hashName(name);
        _safeMint(owner, node); // This will fail if the node is already registered
        records[node].ethAddress = ethAddress;
        records[node].avatar = avatar;
    }

    function updateEthAddress(uint256 node, address ethAddress) public authorised(node) {
        records[node].ethAddress = ethAddress;
    }

    function updateAvatar(uint256 node, string calldata avatar) public authorised(node) {
        records[node].avatar = avatar;
    }

    function updateRecords(uint256 node, address ethAddress, string calldata avatar) public authorised(node) {
        this.updateEthAddress(node, ethAddress);
        this.updateAvatar(node, avatar);
    }

    function getEthAddress(uint256 node) public view returns (address) {
        return records[node].ethAddress;
    }

    function getAvatar(uint256 node) public view returns (string memory) {
        return records[node].avatar;
    }

    function getEthAddressByName(string calldata name) public view returns (address) {
        uint256 node = hashName(name);
        return records[node].ethAddress;
    }

    function getAvatarByName(string calldata name) public view returns (string memory) {
        uint256 node = hashName(name);
        return records[node].avatar;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    function setBaseURI(string memory _baseUri) public onlyOwner {
        baseUri = _baseUri;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
