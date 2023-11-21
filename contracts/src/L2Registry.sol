// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TeamNick is ERC721, ERC721Enumerable, ERC721Pausable, Ownable {
    event Registered(uint256 indexed node, string name, address indexed owner, address indexed addr, string avatar);
    event AddressChanged(uint256 indexed node, address indexed addr);
    event AvatarChanged(uint256 indexed node, string avatar);

    error InvalidName();
    error Unauthorized();

    struct Record {
        address addr; // A better implementation would be a coinType <> address mapping
        string avatar; // A better implementation would be a key <> value mapping
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

    ////////////////////////////////////////////////
    //              WRITE FUNCTIONS               //
    ////////////////////////////////////////////////

    function register(string calldata name, address owner, address addr, string calldata avatar) public {
        if (!_isValidName(name)) {
            revert InvalidName();
        }
        
        uint256 node = hashName(name);
        _safeMint(owner, node); // This will fail if the node is already registered
        records[node].addr = addr;
        records[node].avatar = avatar;

        emit Registered(node, name, owner, addr, avatar);
    }

    function setAddr(uint256 node, address addr) public authorised(node) {
        records[node].addr = addr;

        emit AddressChanged(node, addr);
    }

    function updateAvatar(uint256 node, string calldata avatar) public authorised(node) {
        records[node].avatar = avatar;

        emit AvatarChanged(node, avatar);
    }

    function updateRecords(uint256 node, address addr, string calldata avatar) public authorised(node) {
        this.setAddr(node, addr);
        this.updateAvatar(node, avatar);
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

    ////////////////////////////////////////////////
    //               READ FUNCTIONS               //
    ////////////////////////////////////////////////

    function available(string calldata name) public view returns (bool) {
        if (!_isValidName(name)) {
            return false;
        }

        return !recordExists(hashName(name));
    }

    function hashName(string calldata name) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(name)));
    }

    function addr(uint256 node) public view returns (address) {
        return records[node].addr;
    }

    function avatar(uint256 node) public view returns (string memory) {
        return records[node].avatar;
    }

    function addrByName(string calldata name) public view returns (address) {
        uint256 node = hashName(name);
        return records[node].addr;
    }

    function avatarByName(string calldata name) public view returns (string memory) {
        uint256 node = hashName(name);
        return records[node].avatar;
    }

    // Prevent the registration of < 2 byte names
    function _isValidName(string calldata name) internal pure returns (bool) {
        return bytes(name).length >= 2;
    }

    function recordExists(uint256 node) public view returns (bool) {
        // ownerOf(node) will throw if the node does not exist
        // In that case, we catch the error and return false
        try this.ownerOf(node) {
            return true;
        } catch {
            return false;
        }
    }

    ////////////////////////////////////////////////
    //             REQUIRED OVERRIDES             //
    ////////////////////////////////////////////////

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

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
