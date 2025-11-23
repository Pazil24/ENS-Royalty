import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Fuse Locking & Immutability", function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  let nameWrapper: any;
  let royaltyManager: any;
  let royaltyWrapper: any;
  let splitter: any;
  let factory: any;

  const parentNode = ethers.ZeroHash;
  const label = "locked";
  
  const CANNOT_CHANGE_ROYALTY = 1;
  const PARENT_CANNOT_CONTROL = 2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockNameWrapper = await ethers.getContractFactory("MockNameWrapper");
    nameWrapper = await MockNameWrapper.deploy();

    const RoyaltyManager = await ethers.getContractFactory("ENSRoyaltyManager");
    royaltyManager = await RoyaltyManager.deploy();

    const PaymentSplitter = await ethers.getContractFactory("RoyaltyPaymentSplitter");
    splitter = await PaymentSplitter.deploy(await royaltyManager.getAddress());

    const RoyaltyWrapper = await ethers.getContractFactory("RoyaltyNameWrapper");
    royaltyWrapper = await RoyaltyWrapper.deploy(
      await nameWrapper.getAddress(),
      await royaltyManager.getAddress()
    );

    const Factory = await ethers.getContractFactory("SubdomainFactory");
    factory = await Factory.deploy(
      await royaltyWrapper.getAddress(),
      await splitter.getAddress()
    );

    // Don't transfer ownership yet - tests will do it as needed
  });

  describe("Supply Locking in RoyaltyManager", function () {
    it("should prevent minting after supply is locked", async function () {
      const node = ethers.id("test.eth");
      
      await royaltyManager.connect(owner).mintRoyalty(node, user1.address, 1000);
      await royaltyManager.connect(owner).lockRoyaltySupply(node);
      
      expect(await royaltyManager.isSupplyLocked(node)).to.be.true;
      
      await expect(
        royaltyManager.connect(owner).mintRoyalty(node, user2.address, 500)
      ).to.be.revertedWithCustomError(royaltyManager, "CannotMintLockedSupply");
    });

    it("should emit SupplyLocked event with final supply", async function () {
      const node = ethers.id("test.eth");
      
      await royaltyManager.connect(owner).mintRoyalty(node, user1.address, 1000);
      
      await expect(royaltyManager.connect(owner).lockRoyaltySupply(node))
        .to.emit(royaltyManager, "SupplyLocked")
        .withArgs(node, 1000);
    });

    it("should reject duplicate supply lock", async function () {
      const node = ethers.id("test.eth");
      
      await royaltyManager.connect(owner).mintRoyalty(node, user1.address, 1000);
      await royaltyManager.connect(owner).lockRoyaltySupply(node);
      
      const expectResult1 = await expect(
        royaltyManager.connect(owner).lockRoyaltySupply(node)
      ).to.be.revertedWithCustomError(royaltyManager, "SupplyAlreadyLocked");
    });
  });

  describe("Fuse System in RoyaltyNameWrapper", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("should create subdomain without fuses burned", async function () {
      await factory.createSubdomain(
        parentNode,
        "unlocked",
        user1.address,
        1000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes("unlocked"))])
      );

      const data = await royaltyWrapper.royaltyData(childNode);
      const expectResult2 = expect(data.hasRoyalty).to.be.true;
      const expectResult3 = expect(data.fuses).to.equal(0);
      const expectResult4 = expect(data.isLocked).to.be.false;
      
      const expectResult5 = expect(await royaltyManager.isSupplyLocked(childNode)).to.be.false;
      void expectResult2;
      void expectResult3;
      void expectResult4;
      void expectResult5;
    });

    it("should create subdomain with fuses burned and locked", async function () {
      const tx = await factory.createLockedSubdomain(
        parentNode,
        label,
        user1.address,
        1000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      const expectResult6 = await expect(tx).to.emit(royaltyWrapper, "FusesBurned");
      const expectResult7 = await expect(tx).to.emit(royaltyWrapper, "RoyaltyLocked");

      const data = await royaltyWrapper.royaltyData(childNode);
      expect(data.hasRoyalty).to.be.true;
      expect(data.fuses).to.equal(CANNOT_CHANGE_ROYALTY | PARENT_CANNOT_CONTROL);
      expect(data.isLocked).to.be.true;
      expect(data.lockedAmount).to.equal(1000);
      
      expect(await royaltyManager.isSupplyLocked(childNode)).to.be.true;
      void expectResult6;
      void expectResult7;
    });

    it("should check individual fuse status", async function () {
      await factory.createLockedSubdomain(
        parentNode,
        label,
        user1.address,
        1000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      const expectResult13 = expect(await royaltyWrapper.isFuseBurned(childNode, CANNOT_CHANGE_ROYALTY)).to.be.true;
      const expectResult14 = expect(await royaltyWrapper.isFuseBurned(childNode, PARENT_CANNOT_CONTROL)).to.be.true;
      const expectResult15 = expect(await royaltyWrapper.isFuseBurned(childNode, 16)).to.be.false;
      void expectResult13;
      void expectResult14;
      void expectResult15;
    });

    it("should allow manual fuse burning", async function () {
      await factory.createSubdomain(
        parentNode,
        label,
        user1.address,
        1000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      const expectResult16 = expect(await royaltyWrapper.isRoyaltyLocked(childNode)).to.be.false;
      void expectResult16;

      await expect(royaltyWrapper.burnFuses(childNode, CANNOT_CHANGE_ROYALTY))
        .to.emit(royaltyWrapper, "FusesBurned")
        .withArgs(childNode, CANNOT_CHANGE_ROYALTY);

      expect(await royaltyWrapper.isFuseBurned(childNode, CANNOT_CHANGE_ROYALTY)).to.be.true;
      expect(await royaltyWrapper.isRoyaltyLocked(childNode)).to.be.true;
      expect(await royaltyManager.isSupplyLocked(childNode)).to.be.true;
    });

    it("should reject burning already burned fuse", async function () {
      await factory.createLockedSubdomain(
        parentNode,
        label,
        user1.address,
        1000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      await expect(
        royaltyWrapper.burnFuses(childNode, CANNOT_CHANGE_ROYALTY)
      ).to.be.revertedWithCustomError(royaltyWrapper, "FuseAlreadyBurned");
    });
  });

  describe("Immutability Guarantees", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("locked subdomain cannot have additional royalty tokens minted", async function () {
      await factory.createLockedSubdomain(
        parentNode,
        label,
        user1.address,
        1000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      const tokenId = BigInt(childNode);
      expect(await royaltyManager.balanceOf(user1.address, tokenId)).to.equal(1000);
      expect(await royaltyManager.totalSupply(childNode)).to.equal(1000);

      // Verify node is actually locked
      const data = await royaltyWrapper.royaltyData(childNode);
      expect(data.isLocked).to.be.true;
      expect(await royaltyWrapper.isRoyaltyLocked(childNode)).to.be.true;

      // Try creating subdomain under locked parent should fail
      await expect(
        factory.createSubdomain(childNode, "sub", user2.address, 500, [], [])
      ).to.be.revertedWithCustomError(royaltyWrapper, "AlreadyLocked");
      
      // Supply remains locked and unchanged
      expect(await royaltyManager.totalSupply(childNode)).to.equal(1000);
      expect(await royaltyManager.isSupplyLocked(childNode)).to.be.true;
    });

    it("royalty share percentages remain fixed after locking", async function () {
      await factory.createLockedSubdomain(
        parentNode,
        label,
        user1.address,
        7000,
        [],
        []
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      // User1 owns 100% of 7000 tokens
      expect(await royaltyManager.getRoyaltyShare(childNode, user1.address)).to.equal(10000);

      // Try to dilute by minting more (should fail because parent is locked)
      await expect(
        factory.createSubdomain(childNode, "dilute", user2.address, 3000, [], [])
      ).to.be.revertedWithCustomError(royaltyWrapper, "AlreadyLocked");

      // Percentage unchanged
      expect(await royaltyManager.getRoyaltyShare(childNode, user1.address)).to.equal(10000);
      expect(await royaltyManager.totalSupply(childNode)).to.equal(7000);
    });
  });

  describe("Integration: Locked Subdomain with Payment Split", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("should create locked subdomain with immutable payment split", async function () {
      const beneficiaries = [user1.address, user2.address];
      const shares = [6000, 4000];

      await factory.createLockedSubdomain(
        parentNode,
        label,
        user1.address,
        10000,
        beneficiaries,
        shares
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      // Verify locked
      expect(await royaltyWrapper.isRoyaltyLocked(childNode)).to.be.true;
      expect(await royaltyManager.isSupplyLocked(childNode)).to.be.true;

      // Verify royalty ownership
      const tokenId = BigInt(childNode);
      expect(await royaltyManager.balanceOf(user1.address, tokenId)).to.equal(10000);

      // Send payment and verify split
      await splitter.deposit(childNode, { value: ethers.parseEther("10") });

      expect(await splitter.pending(childNode, user1.address)).to.equal(ethers.parseEther("6"));
      expect(await splitter.pending(childNode, user2.address)).to.equal(ethers.parseEther("4"));

      // Cannot mint more tokens to change distribution
      await expect(
        factory.createSubdomain(childNode, "attack", owner.address, 5000, [], [])
      ).to.be.revertedWithCustomError(royaltyWrapper, "AlreadyLocked");
      
      // Distribution remains 60/40
      expect(await splitter.pending(childNode, user1.address)).to.equal(ethers.parseEther("6"));
      expect(await splitter.pending(childNode, user2.address)).to.equal(ethers.parseEther("4"));
    });
  });

  describe("Gas Optimization Check", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("locked creation should be gas efficient", async function () {
      const tx = await factory.createLockedSubdomain(
        parentNode,
        "gas-test",
        user1.address,
        1000,
        [user1.address],
        [10000]
      );

      const receipt = await tx.wait();
      expect(receipt?.gasUsed).to.be.lessThan(400000); // Reasonable gas limit
    });
  });
});
