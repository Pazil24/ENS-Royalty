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
      functionName: 'createSubdomainWithRoyalty',
      args: [parentNode, label, owner, BigInt(royaltyBps), beneficiaries, shares.map(BigInt)],
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
      functionName: 'receiveRevenue',
      args: [node],
      value: parseEther(amount),
    });
    
    return hash;
  };

  const distributeRoyalties = async (domain: string) => {
    const node = namehash(domain);
    
    const hash = await writeContractAsync({
      address: CONTRACTS.RoyaltyPaymentSplitter.address,
      abi: RoyaltyPaymentSplitterABI,
      functionName: 'distributeRoyalties',
      args: [node],
    });
    
    return hash;
  };

  const claimBalance = async (domain: string) => {
    const node = namehash(domain);
    
    const hash = await writeContractAsync({
      address: CONTRACTS.RoyaltyPaymentSplitter.address,
      abi: RoyaltyPaymentSplitterABI,
      functionName: 'claimBalance',
      args: [node],
    });
    
    return hash;
  };

  return {
    sendRevenue,
    distributeRoyalties,
    claimBalance,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for reading available balance
export function useAvailableBalance(domain: string | undefined, beneficiary: string | undefined) {
  const node = domain ? namehash(domain) : undefined;
  
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.RoyaltyPaymentSplitter.address,
    abi: RoyaltyPaymentSplitterABI,
    functionName: 'getAvailableBalance',
    args: node && beneficiary ? [node, beneficiary] : undefined,
    query: {
      enabled: !!node && !!beneficiary,
    },
  });

  return {
    balance: data ? formatEther(data as bigint) : '0',
    balanceRaw: data as bigint | undefined,
    isError,
    isLoading,
    refetch,
  };
}

// Hook for reading total distributed amount
export function useTotalDistributed(domain: string | undefined) {
  const node = domain ? namehash(domain) : undefined;
  
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.RoyaltyPaymentSplitter.address,
    abi: RoyaltyPaymentSplitterABI,
    functionName: 'getTotalDistributed',
    args: node ? [node] : undefined,
    query: {
      enabled: !!node,
    },
  });

  return {
    total: data ? formatEther(data as bigint) : '0',
    totalRaw: data as bigint | undefined,
    isError,
    isLoading,
    refetch,
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
