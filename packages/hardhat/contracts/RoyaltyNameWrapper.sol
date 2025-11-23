// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INameWrapper {
    function setSubnodeOwner(bytes32 parentNode, string memory label, address owner, uint32 fuses, uint64 expiry) external returns (bytes32);
}

interface IRoyaltyManager {
    function mintRoyalty(bytes32 node, address to, uint256 amount) external;
}

contract RoyaltyNameWrapper {
    INameWrapper public nameWrapper;
    IRoyaltyManager public royaltyManager;
    
    mapping(bytes32 => bool) public hasRoyalty;
    
    event SubdomainCreatedWithRoyalty(bytes32 indexed parentNode, bytes32 indexed childNode, address owner);

    constructor(address _nameWrapper, address _royaltyManager) {
        nameWrapper = INameWrapper(_nameWrapper);
        royaltyManager = IRoyaltyManager(_royaltyManager);
    }

    function wrapWithRoyalty(
        bytes32 parentNode,
        string memory label,
        address owner,
        uint256 royaltyAmount
    ) external returns (bytes32) {
        bytes32 childNode = nameWrapper.setSubnodeOwner(parentNode, label, owner, 0, 0);
        
        royaltyManager.mintRoyalty(childNode, owner, royaltyAmount);
        hasRoyalty[childNode] = true;
        
        emit SubdomainCreatedWithRoyalty(parentNode, childNode, owner);
        return childNode;
    }
}
