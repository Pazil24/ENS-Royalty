// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRoyaltyManager {
    function royaltyRate(bytes32 node) external view returns (uint256);
}

contract RoyaltyPaymentSplitter {
    IRoyaltyManager public royaltyManager;
    
    mapping(bytes32 => address[]) public beneficiaries;
    mapping(bytes32 => uint256[]) public shares;
    mapping(bytes32 => mapping(address => uint256)) public pending;
    mapping(bytes32 => address) public parentRecipient;
    mapping(bytes32 => bytes32) public parentNode;

    event PaymentReceived(bytes32 indexed node, address from, uint256 amount);
    event PaymentReleased(bytes32 indexed node, address to, uint256 amount);
    event RoyaltySplit(bytes32 indexed node, address indexed parent, uint256 parentAmount, address indexed owner, uint256 ownerAmount);
    event SplitConfigured(bytes32 indexed node, address[] beneficiaries, uint256[] shares, uint256 totalShares);
    event PaymentDistributed(bytes32 indexed node, uint256 totalAmount, uint256 beneficiaryCount);
    event FallbackPayment(bytes32 indexed node, address recipient, uint256 amount);

    constructor(address _royaltyManager) {
        royaltyManager = IRoyaltyManager(_royaltyManager);
    }

    function setupSplit(bytes32 node, address[] memory _beneficiaries, uint256[] memory _shares) external {
        require(_beneficiaries.length == _shares.length, "Length mismatch");
        require(_beneficiaries.length > 0, "No beneficiaries");
        
        uint256 total = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            require(_beneficiaries[i] != address(0), "Invalid beneficiary");
            require(_shares[i] > 0, "Share must be > 0");
            total += _shares[i];
        }
        require(total == 10000, "Shares must total 10000 BPS");
        
        beneficiaries[node] = _beneficiaries;
        shares[node] = _shares;
        
        emit SplitConfigured(node, _beneficiaries, _shares, total);
    }

    function setupParentRoyalty(bytes32 node, bytes32 _parentNode, address _parentRecipient) external {
        parentNode[node] = _parentNode;
        parentRecipient[node] = _parentRecipient;
    }

    function deposit(bytes32 node) external payable {
        uint256 amount = msg.value;
        
        // If parent royalty is configured, split with parent first
        bytes32 parent = parentNode[node];
        address parentAddr = parentRecipient[node];
        
        if (parent != bytes32(0) && parentAddr != address(0)) {
            uint256 rate = royaltyManager.royaltyRate(parent);
            if (rate > 0) {
                uint256 parentAmount = (amount * rate) / 10000;
                uint256 ownerAmount = amount - parentAmount;
                
                pending[node][parentAddr] += parentAmount;
                amount = ownerAmount;
                
                emit RoyaltySplit(node, parentAddr, parentAmount, msg.sender, ownerAmount);
            }
        }
        
        // Then split remaining amount among beneficiaries
        uint256 total = _totalShares(node);
        if (total > 0) {
            address[] memory recipients = beneficiaries[node];
            uint256[] memory amounts = shares[node];
            
            for (uint256 i = 0; i < recipients.length; i++) {
                pending[node][recipients[i]] += (amount * amounts[i]) / total;
            }
            
            emit PaymentDistributed(node, amount, recipients.length);
        } else {
            // If no split configured, give everything to sender (fallback)
            pending[node][msg.sender] += amount;
            emit FallbackPayment(node, msg.sender, amount);
        }
        
        emit PaymentReceived(node, msg.sender, msg.value);
    }

    function release(bytes32 node, address payable account) external {
        uint256 amount = pending[node][account];
        require(amount > 0, "No payment due");
        
        pending[node][account] = 0;
        account.transfer(amount);
        
        emit PaymentReleased(node, account, amount);
    }

    function _totalShares(bytes32 node) internal view returns (uint256) {
        uint256 total = 0;
        uint256[] memory nodeShares = shares[node];
        for (uint256 i = 0; i < nodeShares.length; i++) {
            total += nodeShares[i];
        }
        return total;
    }
    
    // View functions for debugging and verification
    function getBeneficiaryCount(bytes32 node) external view returns (uint256) {
        return beneficiaries[node].length;
    }
    
    function getAllBeneficiaries(bytes32 node) external view returns (address[] memory) {
        return beneficiaries[node];
    }
    
    function getAllShares(bytes32 node) external view returns (uint256[] memory) {
        return shares[node];
    }
    
    function getSplitConfiguration(bytes32 node) external view returns (
        address[] memory _beneficiaries,
        uint256[] memory _shares,
        uint256 totalShares
    ) {
        _beneficiaries = beneficiaries[node];
        _shares = shares[node];
        totalShares = _totalShares(node);
    }
    
    function getPendingBalance(bytes32 node, address account) external view returns (uint256) {
        return pending[node][account];
    }
}
