import { WalletConnector } from "./WalletConnector";
import ExportedImage from "next-image-export-optimizer";
import styles from '../styles/Nav.module.scss';
import { lotteryAddresses } from "../chain-data/constants";
import { useChainId } from "../helpers";
import React from "react";

export function Nav() {
  const chainId = useChainId();

  return (
    <nav className={styles.nav}>
      <Logo />
      <div className={styles.links}>
        <a
          href={`https://rinkeby.etherscan.io/address/${lotteryAddresses[chainId!]?.address}`}
          target="_blank"
          rel="noreferrer"
        >
          Smart contract
        </a>
        <WalletConnector />
      </div>
    </nav>
  )
}

function Logo () {
  return (
    <ExportedImage src="/lottery.svg" alt="chain lottery Logo" width={48} height={48} />
  )
}