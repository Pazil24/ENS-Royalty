# 🎯 ENS Royalty System

<h4 align="center">
  <a href="#-deployed-contracts">Deployed Contracts</a> |
  <a href="#-features">Features</a> |
  <a href="#-use-cases">Use Cases</a>
</h4>

🚀 **Turn Your ENS Name Into a Revenue Stream**

Create and sell ENS subdomains with **immutable royalty splits** that automatically distribute payments. Perfect for influencers, brands, and DAOs who want to monetize their web3 identity while maintaining control through cryptographic fuse locking.

Built for **ETHGlobal Hackathon** | Live on **Sepolia Testnet**

## 💡 What is ENS Royalty?

ENS Royalty System transforms ENS names into programmable revenue streams. Create subdomains (like `endorsement.yourname.eth` or `vip.brand.eth`) with automatic commission splits that are:
- ✅ **Cryptographically Immutable** - Fuse locks prevent subdomain owners from changing royalty terms
- ✅ **Automated Distribution** - ETH payments automatically split among token holders
- ✅ **Parent Royalties** - Set dynamic royalty rates (e.g., 20%) that flow to parent domain
- ✅ **ERC1155 Tokens** - Represent royalty shares that can be transferred or traded
- ✅ **Supply Locked** - Prevent dilution by locking token supply after initial distribution

## 🏆 Perfect For

- **Influencers**: Sell exclusive subdomains to sponsors while earning ongoing commissions
- **Brands**: Create tiered membership systems (vip.brand.eth, premium.brand.eth) with revenue sharing
- **DAOs**: Distribute subdomain revenue among token holders transparently
- **Communities**: Monetize community names with fair, automated profit splits

## 📍 Deployed Contracts

### Sepolia Testnet (Live)

| Contract | Address | Purpose |
|----------|---------|---------|
| **ENSRoyaltyManager** | [`0x31692D9370E9f448B822c47e7662ab6bf50AF216`](https://sepolia.etherscan.io/address/0x31692D9370E9f448B822c47e7662ab6bf50AF216) | ERC1155 royalty tokens, manages shares |
| **RoyaltyNameWrapper** | [`0x0E31cfeE451Fd05254784F94149C9F6E38247197`](https://sepolia.etherscan.io/address/0x0E31cfeE451Fd05254784F94149C9F6E38247197) | Wraps ENS subdomains with royalty + fuses |
| **RoyaltyPaymentSplitter** | [`0x87B327e78Ced3F0B12D7FD0D09999Ee9d2899b2D`](https://sepolia.etherscan.io/address/0x87B327e78Ced3F0B12D7FD0D09999Ee9d2899b2D) | Splits ETH payments, deducts parent royalty |
| **SubdomainFactory** | [`0xF34EE6572A9E9D3eBa2e3936339ED7A8e7B9914F`](https://sepolia.etherscan.io/address/0xF34EE6572A9E9D3eBa2e3936339ED7A8e7B9914F) | High-level interface for subdomain creation |
| **ENS Registry** (Native) | [`0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`](https://sepolia.etherscan.io/address/0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e) | Sepolia ENS Registry |
| **NameWrapper** (Native) | [`0x0635513f179D50A207757E05759CbD106d7dFcE8`](https://sepolia.etherscan.io/address/0x0635513f179D50A207757E05759CbD106d7dFcE8) | Sepolia ENS NameWrapper |

## 🛠️ How It Works

### 1. Create Subdomain with Royalty Split

```solidity
// Example: Create vip.brand.eth with 3 beneficiaries
address[] memory beneficiaries = [alice, bob, carol];
uint256[] memory shares = [50, 30, 20]; // Alice 50%, Bob 30%, Carol 20%

subdomainFactory.createLockedSubdomain(
    parentNode,        // namehash("brand.eth")
    "vip",            // subdomain label
    beneficiaries,
    shares,
    newOwner,
    2000              // 20% parent royalty rate (in basis points)
);
```

### 2. Fuse Locking for Security

```solidity
// Lock critical fuses to prevent manipulation
uint32 fuses = CANNOT_CHANGE_ROYALTY    // Royalty immutable
             | PARENT_CANNOT_CONTROL     // Parent can't revoke
             | CANNOT_BURN_FUSES;        // Fuses permanent
```

### 3. Automatic ETH Distribution

```solidity
// Send 10 ETH to subdomain
paymentSplitter.deposit{value: 10 ether}(subdomainNode);
// → 2 ETH to parent (20% royalty)
// → 8 ETH split: 4 ETH Alice, 2.4 ETH Bob, 1.6 ETH Carol

// Claim individual shares
paymentSplitter.release(payable(alice));
```

## ✨ Features

### Core Capabilities
- **Dynamic Parent Royalties**: Set custom rates per subdomain (0-100%)
- **ERC1155 Royalty Tokens**: Tradeable shares representing payment rights
- **Supply Locking**: Prevent dilution by locking token supply
- **Cryptographic Fuses**: Immutable on-chain guarantees (CANNOT_CHANGE_ROYALTY, etc.)
- **Gas Efficient**: ~255k gas for locked subdomain creation

### Security Features
- **Fuse System**: Three-level protection (royalty, ownership, fuse mutability)
- **Reentrancy Guards**: All payment functions protected
- **Access Control**: Owner-only functions for critical operations
- **Overflow Protection**: Solidity 0.8.20 built-in checks

## 🎮 Quick Start

## 🎮 Quick Start

### Prerequisites

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ethglobal25
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
# packages/hardhat/.env
ALCHEMY_API_KEY=your_alchemy_key
DEPLOYER_PRIVATE_KEY=your_private_key
```

### Local Development

1. Start a local Ethereum network:

```bash
yarn chain
```

2. Deploy contracts (new terminal):

```bash
yarn deploy
```

3. Run tests:

```bash
yarn hardhat:test
```

All 23 tests should pass ✅

4. Start the Next.js frontend (new terminal):

```bash
yarn start
```

Visit `http://localhost:3000` to interact with the dApp.

### Sepolia Deployment

To deploy to Sepolia testnet:

```bash
cd packages/hardhat
yarn hardhat deploy --network sepolia
```

## 🧪 Testing

Comprehensive test suite with 23 passing tests:

- **Basic Functionality** (8 tests): Royalty creation, wrapping, payment splits
- **Fuse Locking** (12 tests): CANNOT_CHANGE_ROYALTY, PARENT_CANNOT_CONTROL, supply locking
- **Advanced Scenarios** (3 tests): Parent royalty deduction, dynamic rates, complex splits

```bash
yarn hardhat:test
```

## 📁 Project Structure

```
ethglobal25/
├── packages/
│   ├── hardhat/
│   │   ├── contracts/
│   │   │   ├── ENSRoyaltyManager.sol      # ERC1155 royalty tokens
│   │   │   ├── RoyaltyNameWrapper.sol     # ENS wrapper with fuses
│   │   │   ├── RoyaltyPaymentSplitter.sol # ETH distribution logic
│   │   │   └── SubdomainFactory.sol       # High-level interface
│   │   ├── deploy/
│   │   │   └── 01_deploy_ens_royalty.ts   # Deployment script
│   │   └── test/
│   │       ├── ENSRoyalty.ts              # 23 comprehensive tests
│   │       └── FuseLocking.ts             # Fuse system tests
│   └── nextjs/
│       ├── app/                           # Next.js 14 app router
│       ├── components/                    # React components
│       └── contracts/
│           └── deployedContracts.ts       # Contract ABIs
```

## 🔧 Contract Architecture

### Flow Diagram

```
User creates subdomain
       ↓
SubdomainFactory.createLockedSubdomain()
       ↓
├─→ RoyaltyNameWrapper.wrapWithRoyaltyAndLock()
│   ├─→ ENS Registry (create subdomain)
│   ├─→ ENSRoyaltyManager.mintRoyalty() (ERC1155 tokens)
│   └─→ Burn fuses (CANNOT_CHANGE_ROYALTY, etc.)
│
└─→ RoyaltyPaymentSplitter.setupParentRoyalty()
    └─→ Set beneficiaries + parent royalty rate

Payment received
       ↓
RoyaltyPaymentSplitter.deposit()
       ↓
├─→ Deduct parent royalty (e.g., 20%)
│   └─→ Send to parent domain owner
│
└─→ Split remaining ETH among beneficiaries
    ├─→ 50% to Alice
    ├─→ 30% to Bob
    └─→ 20% to Carol
```

## 💻 Frontend Integration

Add deployed contracts to `packages/nextjs/contracts/deployedContracts.ts`:

```typescript
const deployedContracts = {
  11155111: { // Sepolia
    ENSRoyaltyManager: {
      address: "0x31692D9370E9f448B822c47e7662ab6bf50AF216",
      abi: [...] // Import from artifacts
    },
    SubdomainFactory: {
      address: "0xF34EE6572A9E9D3eBa2e3936339ED7A8e7B9914F",
      abi: [...]
    },
    // ... other contracts
  }
};
```

Then use Scaffold-ETH hooks:

```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const { writeContractAsync } = useScaffoldWriteContract("SubdomainFactory");

await writeContractAsync({
  functionName: "createLockedSubdomain",
  args: [parentNode, "vip", beneficiaries, shares, owner, 2000],
});
```

## 🚀 Use Cases

### 1. Influencer Endorsements

An influencer with `creator.eth` can:
1. Create `brand.creator.eth` for a sponsor
2. Set 20% parent royalty on all subdomain revenue
3. Lock fuses to guarantee immutable commission
4. Sponsor pays ongoing fees whenever `brand.creator.eth` is used

### 2. Brand Membership Tiers

A brand with `brand.eth` can:
1. Create `vip.brand.eth`, `premium.brand.eth`, `basic.brand.eth`
2. Set different royalty splits for each tier
3. Distribute revenue among team members via ERC1155 tokens
4. Lock supply to prevent dilution

### 3. DAO Revenue Sharing

A DAO with `dao.eth` can:
1. Create subdomains for projects (`project1.dao.eth`)
2. Mint royalty tokens for DAO members
3. Automate treasury revenue distribution
4. Trade royalty tokens on secondary markets

## 🔐 Security Considerations

### Fuse System
- **CANNOT_CHANGE_ROYALTY (1)**: Prevents modification of royalty terms
- **PARENT_CANNOT_CONTROL (2)**: Parent can't revoke subdomain after locked
- **CANNOT_BURN_FUSES (64)**: Fuses become permanent once set

### Access Control
- Only ENSRoyaltyManager owner can set royalty rates
- Only RoyaltyNameWrapper can mint royalty tokens
- Payment splitter uses reentrancy guards

### Auditing Notes
- Uses OpenZeppelin 5.0.2 contracts (battle-tested)
- Solidity 0.8.20 with overflow checks
- 23 comprehensive tests covering edge cases
- No known vulnerabilities in dependencies

## 🛣️ Roadmap

- [x] Core royalty system
- [x] Fuse locking mechanism
- [x] Parent royalty integration
- [x] Comprehensive testing (23/23 passing)
- [x] Sepolia testnet deployment
- [ ] Frontend UI for subdomain creation
- [ ] The Graph subgraph for indexing
- [ ] Marketplace for subdomain sales
- [ ] Mainnet deployment
- [ ] Etherscan contract verification

## 📄 License

MIT License - see [LICENSE](./LICENCE) file for details

## 🤝 Contributing

This project was built for ETHGlobal Hackathon. Contributions, issues, and feature requests are welcome!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 🙏 Acknowledgments

- Built with [Scaffold-ETH 2](https://scaffoldeth.io)
- ENS Protocol for subdomain infrastructure
- OpenZeppelin for secure smart contract libraries
- ETHGlobal for hackathon inspiration

---

**Built with ❤️ for ETHGlobal Hackathon**

Transform your ENS name into a programmable revenue stream. Start monetizing your web3 identity today!
