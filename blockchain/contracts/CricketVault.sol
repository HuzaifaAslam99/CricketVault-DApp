// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ICC Champions Trophy - Anti-Scalping Ticket System
 * @author Digital Product Engineer
 * @notice This contract mints NFT tickets and enforces a price ceiling on resales.
 */
contract CricketVault is ERC721, AccessControl {
    
    // 1. Role Definitions
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    // 2. State Variables
    uint256 public nextTicketId;
    
    // Maps each Ticket ID to its original purchase price in Wei
    mapping(uint256 => uint256) public originalPrices;

    // 3. Events (Crucial for your Hardhat Tests and Frontend)
    event Deposit(address indexed user, uint256 amount);
    event TicketMinted(uint256 indexed tokenId, address indexed buyer, uint256 price);

    constructor() ERC721("ICC Champions Trophy", "ICC") {
        // Grant the deployer both Admin and Organizer roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORGANIZER_ROLE, msg.sender);
    }

    /**
     * @notice Mints a new ticket NFT.
     * @dev Stores the price in the mapping and emits a Deposit event for testing.
     */
    function buyTicket() public payable {
        require(msg.value > 0, "Ticket price must be greater than 0");

        uint256 tokenId = nextTicketId;
        nextTicketId++;

        // Store the original price to prevent black market scalping later
        originalPrices[tokenId] = msg.value;

        // Mint the NFT to the buyer
        _safeMint(msg.sender, tokenId);

        // Emit events for your Hardhat tests and React frontend
        emit Deposit(msg.sender, msg.value);
        emit TicketMinted(tokenId, msg.sender, msg.value);
    }

    /**
     * @notice Returns the original price of a specific ticket.
     * @param _tokenId The ID of the NFT ticket.
     */
    function getOriginalPrice(uint256 _tokenId) public view returns (uint256) {
        return originalPrices[_tokenId];
    }

    // Standard override required by Solidity for multiple inheritance (ERC721 & AccessControl)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Allows the Organizer to withdraw the funds collected from ticket sales.
     */
    function withdraw() public onlyRole(ORGANIZER_ROLE) {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}