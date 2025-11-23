import { sepolia } from 'wagmi/chains';

export const CONTRACTS = {
  ENSRoyaltyManager: {
    address: '0x31692D9370E9f448B822c47e7662ab6bf50AF216' as `0x${string}`,
    chainId: sepolia.id,
  },
  RoyaltyNameWrapper: {
    address: '0x0E31cfeE451Fd05254784F94149C9F6E38247197' as `0x${string}`,
    chainId: sepolia.id,
  },
  RoyaltyPaymentSplitter: {
    address: '0x0191ef763e9c8a031Fc21E06a7449C9768a74921' as `0x${string}`,
    chainId: sepolia.id,
  },
  SubdomainFactory: {
    address: '0xd9A6f65f9c00f483e06DDa300bC2c9acccDA10e8' as `0x${string}`,
    chainId: sepolia.id,
  },
} as const;

export const SUPPORTED_CHAINS = [sepolia];
