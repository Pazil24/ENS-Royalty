// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INameWrapper {
    function setSubnodeOwner(bytes32 parentNode, string memory label, address owner, uint32 fuses, uint64 expiry) external returns (bytes32);
}

interface IRoyaltyManager {
    function mintRoyalty(bytes32 node, address to, uint256 amount) external;
    function lockRoyaltySupply(bytes32 node) external;
}

contract RoyaltyNameWrapper {
    INameWrapper public nameWrapper;
    IRoyaltyManager public royaltyManager;
    
    // Fuse constants (aligned with ENS NameWrapper design)
    uint32 public constant CANNOT_CHANGE_ROYALTY = 1;
    uint32 public constant PARENT_CANNOT_CONTROL = 2;
    uint32 public constant CANNOT_BURN_FUSES = 64;
    
    struct RoyaltyData {
        bool hasRoyalty;
        uint32 fuses;
        uint256 lockedAmount;
        bool isLocked;
    }
    
    mapping(bytes32 => RoyaltyData) public royaltyData;
    
    event SubdomainCreatedWithRoyalty(bytes32 indexed parentNode, bytes32 indexed childNode, address owner, uint256 royaltyAmount);
    event FusesBurned(bytes32 indexed node, uint32 fuses);
    event RoyaltyLocked(bytes32 indexed node, uint256 amount);

    error AlreadyLocked(bytes32 node);
    error FuseAlreadyBurned(bytes32 node, uint32 fuse);
    error Unauthorised(bytes32 node);

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
        
        royaltyData[childNode] = RoyaltyData({
            hasRoyalty: true,
            fuses: 0,
            lockedAmount: royaltyAmount,
            isLocked: false
        });
        
        emit SubdomainCreatedWithRoyalty(parentNode, childNode, owner, royaltyAmount);
        return childNode;
    }

    function wrapWithRoyaltyAndLock(
        bytes32 parentNode,
        string memory label,
        address owner,
        uint256 royaltyAmount
    ) external returns (bytes32) {
        bytes32 childNode = nameWrapper.setSubnodeOwner(parentNode, label, owner, 0, 0);
        
        royaltyManager.mintRoyalty(childNode, owner, royaltyAmount);
        
        royaltyData[childNode] = RoyaltyData({
            hasRoyalty: true,
            fuses: CANNOT_CHANGE_ROYALTY | PARENT_CANNOT_CONTROL,
            lockedAmount: royaltyAmount,
            isLocked: true
        });
        
        royaltyManager.lockRoyaltySupply(childNode);
        
        emit SubdomainCreatedWithRoyalty(parentNode, childNode, owner, royaltyAmount);
        emit FusesBurned(childNode, CANNOT_CHANGE_ROYALTY | PARENT_CANNOT_CONTROL);
        emit RoyaltyLocked(childNode, royaltyAmount);
        
        return childNode;
    }

    function burnFuses(bytes32 node, uint32 fuses) external {
        RoyaltyData storage data = royaltyData[node];
        
        if (!data.hasRoyalty) revert Unauthorised(node);
        if (data.fuses & fuses != 0) revert FuseAlreadyBurned(node, fuses);
        
        data.fuses |= fuses;
        
        if (fuses & CANNOT_CHANGE_ROYALTY != 0 && !data.isLocked) {
            data.isLocked = true;
            royaltyManager.lockRoyaltySupply(node);
            emit RoyaltyLocked(node, data.lockedAmount);
        }
        
        emit FusesBurned(node, fuses);
    }

    function isFuseBurned(bytes32 node, uint32 fuse) external view returns (bool) {
        return royaltyData[node].fuses & fuse != 0;
    }

    function isRoyaltyLocked(bytes32 node) external view returns (bool) {
        return royaltyData[node].isLocked;
    }
}

