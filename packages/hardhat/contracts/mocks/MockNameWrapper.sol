// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockNameWrapper {
    mapping(bytes32 => address) public ownerOf;
    mapping(bytes32 => uint32) public fuses;

    function setSubnodeOwner(
        bytes32 parentNode,
        string memory label,
        address owner,
        uint32 fuse,
        uint64 expiry
    ) external returns (bytes32) {
        bytes32 node = keccak256(abi.encodePacked(parentNode, keccak256(bytes(label))));
        ownerOf[node] = owner;
        fuses[node] = fuse;
        return node;
    }

    function setFuses(bytes32 node, uint16 fuse) external returns (uint32) {
        fuses[node] = fuse;
        return fuses[node];
    }

    function getData(uint256 tokenId) external view returns (address owner, uint32 fuse, uint64 expiry) {
        bytes32 node = bytes32(tokenId);
        return (ownerOf[node], fuses[node], 0);
    }
}
