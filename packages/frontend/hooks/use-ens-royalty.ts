import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, namehash } from 'viem';
import { useState } from 'react';
import { CONTRACTS } from '@/lib/config/contracts';
import ENSRoyaltyManagerABI from '@/lib/abis/ENSRoyaltyManager.json';
import RoyaltyNameWrapperABI from '@/lib/abis/RoyaltyNameWrapper.json';
import SubdomainFactoryABI from '@/lib/abis/SubdomainFactory.json';
import RoyaltyPaymentSplitterABI from '@/lib/abis/RoyaltyPaymentSplitter.json';

// Hook for subdomain creation and management
export function useSubdomainFactory() {
  const { address } = useAccount();
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createSubdomain = async (
    parentDomain: string,
    label: string,
    owner: string,
    royaltyPercent: number,
    beneficiaries: string[],
    shares: number[]
  ) => {
    const parentNode = namehash(parentDomain);
    const royaltyBps = royaltyPercent * 100; // Convert % to basis points
    
    const hash = await writeContractAsync({
      address: CONTRACTS.SubdomainFactory.address,
      abi: SubdomainFactoryABI,
      functionName: 'createSubdomain',
      args: [parentNode, label, owner, BigInt(royaltyBps), beneficiaries, shares.map(BigInt)],
      gas: BigInt(3000000), // Set reasonable gas limit
    });
    
    return hash;
  };

  const createLockedSubdomain = async (
    parentDomain: string,
    label: string,
    owner: string,
    royaltyPercent: number,
    beneficiaries: string[],
    shares: number[]
  ) => {
    const parentNode = namehash(parentDomain);
    const royaltyBps = royaltyPercent * 100;
    
    const hash = await writeContractAsync({
      address: CONTRACTS.SubdomainFactory.address,
      abi: SubdomainFactoryABI,
      functionName: 'createLockedSubdomain',
      args: [parentNode, label, owner, BigInt(royaltyBps), beneficiaries, shares.map(BigInt)],
      gas: BigInt(3000000), // Set reasonable gas limit
    });
    
    return hash;
  };

  return {
    createSubdomain,
    createLockedSubdomain,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for royalty configuration reading
export function useRoyaltyConfig(domain: string | undefined) {
  const node = domain ? namehash(domain) : undefined;
  
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.ENSRoyaltyManager.address,
    abi: ENSRoyaltyManagerABI,
    functionName: 'getRoyaltyConfig',
    args: node ? [node] : undefined,
    query: {
      enabled: !!node,
    },
  });

  return {
    config: data as any,
    isError,
    isLoading,
    refetch,
  };
}

// Hook for payment operations
export function usePaymentSplitter() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sendRevenue = async (domain: string, amount: string) => {
    const node = namehash(domain);
    
    const hash = await writeContractAsync({
      address: CONTRACTS.RoyaltyPaymentSplitter.address,
      abi: RoyaltyPaymentSplitterABI,
      functionName: 'deposit',
      args: [node],
      value: parseEther(amount),
    });
    
    return hash;
  };

  return {
    sendRevenue,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for reading beneficiaries configuration (no longer tracks pending balances)
export function useBeneficiariesConfig(domain: string | undefined) {
  const node = domain ? namehash(domain) : undefined;
  
  // We need to call the contract multiple times to get all beneficiaries
  // This is a simplified version - you might need to implement a better approach
  const { data: beneficiary0 } = useReadContract({
    address: CONTRACTS.RoyaltyPaymentSplitter.address,
    abi: RoyaltyPaymentSplitterABI,
    functionName: 'beneficiaries',
    args: node ? [node, BigInt(0)] : undefined,
    query: {
      enabled: !!node,
    },
  });

  const { data: share0 } = useReadContract({
    address: CONTRACTS.RoyaltyPaymentSplitter.address,
    abi: RoyaltyPaymentSplitterABI,
    functionName: 'shares',
    args: node ? [node, BigInt(0)] : undefined,
    query: {
      enabled: !!node,
    },
  });

  return {
    beneficiary: beneficiary0 as string | undefined,
    share: share0 as bigint | undefined,
    node,
  };
}



// Hook for reading royalty token balance (ERC1155)
export function useRoyaltyTokenBalance(domain: string | undefined, address: string | undefined) {
  const node = domain ? namehash(domain) : undefined;
  const tokenId = node;
  
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.ENSRoyaltyManager.address,
    abi: ENSRoyaltyManagerABI,
    functionName: 'balanceOf',
    args: address && tokenId ? [address, tokenId] : undefined,
    query: {
      enabled: !!address && !!tokenId,
    },
  });

  return {
    balance: data ? (data as bigint).toString() : '0',
    balanceRaw: data as bigint | undefined,
    isError,
    isLoading,
    refetch,
  };
}
