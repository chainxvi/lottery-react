import { useMoralis } from 'react-moralis';
import React from 'react';

export function useChainId() {
  const { chainId: hexChainId } = useMoralis();
  const chainId: number = React.useMemo(() => parseInt(hexChainId as unknown as string), [hexChainId]);

  return chainId;
}