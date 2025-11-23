// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoyaltyPaymentSplitter {
    mapping(bytes32 => address[]) public beneficiaries;
    mapping(bytes32 => uint256[]) public shares;
    mapping(bytes32 => mapping(address => uint256)) public pending;

    event PaymentReceived(bytes32 indexed node, address from, uint256 amount);
    event PaymentReleased(bytes32 indexed node, address to, uint256 amount);

    function setupSplit(bytes32 node, address[] memory _beneficiaries, uint256[] memory _shares) external {
        require(_beneficiaries.length == _shares.length, "Length mismatch");
        beneficiaries[node] = _beneficiaries;
        shares[node] = _shares;
    }

    function deposit(bytes32 node) external payable {
        uint256 total = _totalShares(node);
        require(total > 0, "No split configured");
        
        address[] memory recipients = beneficiaries[node];
        uint256[] memory amounts = shares[node];
        
        for (uint256 i = 0; i < recipients.length; i++) {
            pending[node][recipients[i]] += (msg.value * amounts[i]) / total;
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
}
