import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ENS Royalty System", function () {
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  let nameWrapper: any;
  let royaltyManager: any;
  let royaltyWrapper: any;
  let splitter: any;
  let factory: any;

  const parentNode = ethers.ZeroHash;
  const label = "test";

  beforeEach(async function () {
    [, user1, user2] = await ethers.getSigners();

    // Deploy mocks
    const MockNameWrapper = await ethers.getContractFactory("MockNameWrapper");
    nameWrapper = await MockNameWrapper.deploy();

    // Deploy core contracts
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
  });

  describe("SubdomainFactory", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("should create subdomain with royalty", async function () {
      const royaltyAmount = 1000;

      const tx = await factory.createSubdomain(
        parentNode,
        label,
        user1.address,
        royaltyAmount,
        [],
        []
      );

      await expect(tx).to.emit(factory, "SubdomainCreated");
    });

    it("should create subdomain with payment split", async function () {
      const beneficiaries = [user1.address, user2.address];
      const shares = [7000, 3000];

      await factory.createSubdomain(
        parentNode,
        label,
        user1.address,
        1000,
        beneficiaries,
        shares
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      expect(await splitter.beneficiaries(childNode, 0)).to.equal(user1.address);
      expect(await splitter.beneficiaries(childNode, 1)).to.equal(user2.address);
    });
  });

  describe("ENSRoyaltyManager", function () {
    it("should mint royalty tokens", async function () {
      const node = ethers.id("test.eth");
      const amount = 1000;

      await royaltyManager.mintRoyalty(node, user1.address, amount);

      const tokenId = BigInt(node);
      expect(await royaltyManager.balanceOf(user1.address, tokenId)).to.equal(amount);
      expect(await royaltyManager.totalSupply(node)).to.equal(amount);
    });

    it("should calculate royalty share", async function () {
      const node = ethers.id("test.eth");
      
      await royaltyManager.mintRoyalty(node, user1.address, 7000);
      await royaltyManager.mintRoyalty(node, user2.address, 3000);

      const share1 = await royaltyManager.getRoyaltyShare(node, user1.address);
      const share2 = await royaltyManager.getRoyaltyShare(node, user2.address);

      expect(share1).to.equal(7000);
      expect(share2).to.equal(3000);
    });
  });

  describe("RoyaltyPaymentSplitter", function () {
    it("should split payment correctly", async function () {
      const node = ethers.id("test.eth");
      const beneficiaries = [user1.address, user2.address];
      const shares = [7000, 3000];

      await splitter.setupSplit(node, beneficiaries, shares);
      await splitter.deposit(node, { value: ethers.parseEther("1") });

      const pending1 = await splitter.pending(node, user1.address);
      const pending2 = await splitter.pending(node, user2.address);

      expect(pending1).to.equal(ethers.parseEther("0.7"));
      expect(pending2).to.equal(ethers.parseEther("0.3"));
    });

    it("should release payment", async function () {
      const node = ethers.id("test.eth");
      const beneficiaries = [user1.address];
      const shares = [10000];

      await splitter.setupSplit(node, beneficiaries, shares);
      await splitter.deposit(node, { value: ethers.parseEther("1") });

      const balanceBefore = await ethers.provider.getBalance(user1.address);
      await splitter.release(node, user1.address);
      const balanceAfter = await ethers.provider.getBalance(user1.address);

      const receivedAmount = balanceAfter - balanceBefore;
      expect(receivedAmount).to.equal(ethers.parseEther("1"));
      expect(await splitter.pending(node, user1.address)).to.equal(0);
    });
  });

  describe("RoyaltyNameWrapper", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("should wrap subdomain with royalty", async function () {
      const tx = await royaltyWrapper.wrapWithRoyalty(
        parentNode,
        label,
        user1.address,
        1000
      );

      await expect(tx).to.emit(royaltyWrapper, "SubdomainCreatedWithRoyalty");

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      const data = await royaltyWrapper.getRoyaltyData(childNode);
      expect(data.hasRoyalty).to.be.true;
    });
  });

  describe("Integration Test", function () {
    beforeEach(async function () {
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());
    });

    it("should create subdomain, mint royalty, and split payment", async function () {
      const beneficiaries = [user1.address, user2.address];
      const shares = [6000, 4000];
      const royaltyAmount = 1000;

      // Create subdomain
      await factory.createSubdomain(
        parentNode,
        label,
        user1.address,
        royaltyAmount,
        beneficiaries,
        shares
      );

      const childNode = ethers.keccak256(
        ethers.concat([parentNode, ethers.keccak256(ethers.toUtf8Bytes(label))])
      );

      // Check royalty minted
      const tokenId = BigInt(childNode);
      expect(await royaltyManager.balanceOf(user1.address, tokenId)).to.equal(royaltyAmount);

      // Send payment
      await splitter.deposit(childNode, { value: ethers.parseEther("10") });

      // Check splits
      expect(await splitter.pending(childNode, user1.address)).to.equal(ethers.parseEther("6"));
      expect(await splitter.pending(childNode, user2.address)).to.equal(ethers.parseEther("4"));

      // Release to user1
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      await splitter.release(childNode, user1.address);
      const balanceAfter = await ethers.provider.getBalance(user1.address);

      const receivedAmount = balanceAfter - balanceBefore;
      expect(receivedAmount).to.equal(ethers.parseEther("6"));
    });
  });

  describe("Royalty Rate Integration", function () {
    it("should split payment using royalty rate to parent", async function () {
      // Use a proper parent node (not zero hash)
      const actualParentNode = ethers.keccak256(ethers.toUtf8Bytes("parent.eth"));
      
      // Set 20% royalty rate on parent node BEFORE transferring ownership
      await royaltyManager.setRoyaltyRate(actualParentNode, 2000); // 20%
      
      await royaltyManager.transferOwnership(await royaltyWrapper.getAddress());

      const royaltyAmount = 1000;
      const beneficiaries = [user1.address, user2.address];
      const shares = [6000, 4000]; // 60/40 split of remaining 80%

      // Create subdomain
      await factory.createSubdomain(
        actualParentNode,
        "child",
        user1.address,
        royaltyAmount,
        beneficiaries,
        shares
      );

      const childNode = ethers.keccak256(
        ethers.concat([actualParentNode, ethers.keccak256(ethers.toUtf8Bytes("child"))])
      );

      // Setup parent royalty recipient
      await splitter.setupParentRoyalty(childNode, actualParentNode, user2.address);

      // Send 10 ETH payment
      await splitter.deposit(childNode, { value: ethers.parseEther("10") });

      // Expected: 2 ETH to parent (user2), remaining 8 ETH split 60/40
      // user1: 60% of 8 = 4.8 ETH
      // user2: 40% of 8 = 3.2 ETH + 2 ETH parent = 5.2 ETH total
      expect(await splitter.pending(childNode, user1.address)).to.equal(ethers.parseEther("4.8"));
      expect(await splitter.pending(childNode, user2.address)).to.equal(ethers.parseEther("5.2"));
    });
  });
});
