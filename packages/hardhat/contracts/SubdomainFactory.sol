// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRoyaltyNameWrapper {
    function wrapWithRoyalty(bytes32 parentNode, string memory label, address owner, uint256 royaltyAmount) external returns (bytes32);
    function wrapWithRoyaltyAndLock(bytes32 parentNode, string memory label, address owner, uint256 royaltyAmount) external returns (bytes32);
}

interface IPaymentSplitter {
    function setupSplit(bytes32 node, address[] memory beneficiaries, uint256[] memory shares) external;
}

contract SubdomainFactory {
    IRoyaltyNameWrapper public wrapper;
    IPaymentSplitter public splitter;
    
    event SubdomainCreated(bytes32 indexed parentNode, string label, address indexed owner, bytes32 childNode, bool locked);

    constructor(address _wrapper, address _splitter) {
        wrapper = IRoyaltyNameWrapper(_wrapper);
        splitter = IPaymentSplitter(_splitter);
    }

    function createSubdomain(
        bytes32 parentNode,
        string memory label,
        address owner,
        uint256 royaltyAmount,
        address[] memory beneficiaries,
        uint256[] memory shares
    ) external returns (bytes32) {
        bytes32 childNode = wrapper.wrapWithRoyalty(parentNode, label, owner, royaltyAmount);
        
        if (beneficiaries.length > 0) {
            splitter.setupSplit(childNode, beneficiaries, shares);
        }
        
        emit SubdomainCreated(parentNode, label, owner, childNode, false);
        return childNode;
    }

    function createLockedSubdomain(
        bytes32 parentNode,
        string memory label,
        address owner,
        uint256 royaltyAmount,
        address[] memory beneficiaries,
        uint256[] memory shares
    ) external returns (bytes32) {
        bytes32 childNode = wrapper.wrapWithRoyaltyAndLock(parentNode, label, owner, royaltyAmount);
        
        if (beneficiaries.length > 0) {
            splitter.setupSplit(childNode, beneficiaries, shares);
        }
        
        emit SubdomainCreated(parentNode, label, owner, childNode, true);
        return childNode;
    }
}

