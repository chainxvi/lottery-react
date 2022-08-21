import React from 'react';
import { useMoralis } from 'react-moralis';
import styles from '../styles/WalletConnector.module.scss';

export function WalletConnector() {
  const { isWeb3Enabled, enableWeb3, account, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis();
  
  React.useEffect(() => {
    if(!isWeb3Enabled && (window.localStorage.getItem('connected') === 'true')) {
      enable();
    }
    async function enable() {
      await enableWeb3();
    }
  }, [isWeb3Enabled])

  React.useEffect(
    function() {
      Moralis.onAccountChanged(
        function(account) {
          console.log(`Account has changed to: ${account}`);
          if(!account) {
            window.localStorage.removeItem('connected');
            deactivate();
          }
        }
      )
      async function deactivate() {
        await deactivateWeb3();
      }
    }, []
  )

  return (
    <div
      className={styles.connect}
      onClick={
        isWeb3EnableLoading ? undefined : async function() {
          await enableWeb3();
          window.localStorage.setItem('connected', 'true');
        }
      }
    >
      <span>
        {account ? (account.substring(0, 7) + '...' + account.substring(account.length - 5, account.length)) : 'Connect wallet '}
      </span>
    </div>
  )
}