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
    address: '0x36868e731B54E9a6DeedD990072B5ec166e0689a' as `0x${string}`,
    chainId: sepolia.id,
  },
  SubdomainFactory: {
    address: '0x841F6E6AD2B435d2d724AD3F280Ac90Ae02c12a4' as `0x${string}`,
    chainId: sepolia.id,
  },
} as const;

export const SUPPORTED_CHAINS = [sepolia];
