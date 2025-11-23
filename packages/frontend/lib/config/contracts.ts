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
    address: '0x87B327e78Ced3F0B12D7FD0D09999Ee9d2899b2D' as `0x${string}`,
    chainId: sepolia.id,
  },
  SubdomainFactory: {
    address: '0xF34EE6572A9E9D3eBa2e3936339ED7A8e7B9914F' as `0x${string}`,
    chainId: sepolia.id,
  },
} as const;

export const SUPPORTED_CHAINS = [sepolia];
