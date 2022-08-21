import React from 'react';
import { useWeb3Contract } from 'react-moralis';
import { lotteryAbi, lotteryAddresses } from '../chain-data/constants';
import { useChainId } from './useChainId';

export function useWeb3Function(
  name: string,
  params?: Record<string, unknown> | undefined,
  msgValue?: string | number | undefined
) {
  const chainId = useChainId();
  const { runContractFunction } = useWeb3Contract({
    abi: lotteryAbi,
    contractAddress: lotteryAddresses[chainId!]?.address,
    functionName: name,
    params,
    msgValue,
  });

  return runContractFunction;
}