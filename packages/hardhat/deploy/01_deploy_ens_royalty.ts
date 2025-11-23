import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployENSRoyalty: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("📦 Deploying ENS Royalty System...");

  // 1. Deploy Mock ENS (only for localhost)
  let registryAddress, wrapperAddress;

  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    const registry = await deploy("MockENSRegistry", {
      from: deployer,
      log: true,
      autoMine: true,
    });
    registryAddress = registry.address;

    const wrapper = await deploy("MockNameWrapper", {
      from: deployer,
      log: true,
      autoMine: true,
    });
    wrapperAddress = wrapper.address;

    console.log("✅ Mock ENS deployed");
  } else {
    // Use real Sepolia addresses
    registryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
    wrapperAddress = "0x0635513f179D50A207757E05759CbD106d7dFcE8";
    console.log("✅ Using Sepolia ENS addresses");
  }

  // 2. Deploy Payment Splitter
  const splitter = await deploy("RoyaltyPaymentSplitter", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  // 3. Deploy Royalty Manager (ERC1155)
  const manager = await deploy("ENSRoyaltyManager", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  // 4. Deploy Royalty Name Wrapper
  const royaltyWrapper = await deploy("RoyaltyNameWrapper", {
    from: deployer,
    args: [wrapperAddress, manager.address],
    log: true,
    autoMine: true,
  });

  // 5. Deploy Subdomain Factory
  const factory = await deploy("SubdomainFactory", {
    from: deployer,
    args: [royaltyWrapper.address, splitter.address],
    log: true,
    autoMine: true,
  });

  console.log("🎉 ENS Royalty System deployed!");
  console.log("📋 Addresses:");
  console.log("  Registry:", registryAddress);
  console.log("  NameWrapper:", wrapperAddress);
  console.log("  PaymentSplitter:", splitter.address);
  console.log("  RoyaltyManager:", manager.address);
  console.log("  RoyaltyWrapper:", royaltyWrapper.address);
  console.log("  SubdomainFactory:", factory.address);
};

export default deployENSRoyalty;
deployENSRoyalty.tags = ["ENSRoyalty"];
