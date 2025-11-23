// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ENSRoyaltyManager is ERC1155, Ownable {
    uint256 public constant ROYALTY_TOKEN = 0;
    
    mapping(bytes32 => uint256) public totalSupply;
    mapping(bytes32 => uint256) public royaltyRate;
    
    event RoyaltyMinted(bytes32 indexed node, address indexed to, uint256 amount);
    event RoyaltyRateSet(bytes32 indexed node, uint256 rate);

    constructor() ERC1155("https://api.ensroyalty.eth/metadata/{id}") Ownable(msg.sender) {}

    function mintRoyalty(bytes32 node, address to, uint256 amount) external onlyOwner {
        uint256 tokenId = uint256(node);
        _mint(to, tokenId, amount, "");
        totalSupply[node] += amount;
        emit RoyaltyMinted(node, to, amount);
    }

    function setRoyaltyRate(bytes32 node, uint256 rate) external onlyOwner {
        require(rate <= 10000, "Rate too high");
        royaltyRate[node] = rate;
        emit RoyaltyRateSet(node, rate);
    }

    function getRoyaltyShare(bytes32 node, address holder) external view returns (uint256) {
        uint256 tokenId = uint256(node);
        uint256 balance = balanceOf(holder, tokenId);
        uint256 total = totalSupply[node];
        
        if (total == 0) return 0;
        return (balance * 10000) / total;
    }
}
