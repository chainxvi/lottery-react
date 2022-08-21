import { NextPage } from 'next'
import Head from 'next/head'
import { Nav, RightColumn, Table } from '../components';
import styles from '../styles/Home.module.scss'
import ExportedImage from "next-image-export-optimizer";
import { ethers } from 'ethers';
import React, { Fragment } from 'react';
import { lotteryAbi, lotteryAddresses } from '../chain-data/constants';
import { useMoralis, useWeb3Contract, useMoralisSubscription } from 'react-moralis';
import { useChainId, useWeb3Function } from '../helpers';

const Home: NextPage = () => {
  const { isWeb3Enabled } = useMoralis();
  const [refresh, setRefresh] = React.useState(0);
  const [requestedLotteryWinner, setRequestedLotteryWinner] = React.useState<boolean>(false);
  const [lotteryPlayable, setLotteryPlayable] = React.useState<boolean>(false);

  const getLotteryPlayable = useWeb3Function('getLotteryPlayable');

  useMoralisSubscription('RequestedLotteryWinner', q => q, [], {
    onCreate: function() {
      console.log('hello');
      setRequestedLotteryWinner(true);
      setLotteryPlayable(false);
    }
  });

  useMoralisSubscription('LotteryEntered', q => q, [], {
    onCreate: function() {
      setRequestedLotteryWinner(false);
      setLotteryPlayable(true);
    }
  });

  // at first check the playable state of the lottery
  React.useEffect(
    function() {
      if(isWeb3Enabled) {
        getData();
      }
      async function getData() {
        const playable = (await getLotteryPlayable()) as boolean;
        setLotteryPlayable(playable)
      }
    }, [isWeb3Enabled]
  );

  // if it's playable then start 1 min interval
  React.useEffect(
    function() {
      let interval;
      if(lotteryPlayable){
        interval = setInterval(
          function() {
            setRefresh(Math.random());
          }, 60000
        );
      } else {
        clearInterval(interval);
      }
    }, [lotteryPlayable]
  )

  return (
    <div className={styles.container}>
      <Head>
        <title>web3 funding</title>
        <meta name="description" content="A DApp to allow people to play a fair and transparent lottery" />
        <link rel="icon" href="/lottery.svg" />
      </Head>
      <Nav />
      <main className={styles.main}>
        <h1 className={styles.title}>
          Decentralized & Fair Web3 Lottery
        </h1>
        <p className={styles.description}>
          Completely decentralized, autonomous, tamperproof, and fair lottery running on the Ethereum blockchain. We take no commission.
        </p>
        <CtaButton key={refresh} setRefresh={setRefresh} />
      </main>
      <section key={refresh} className={styles.lotteryDataSection}>
        <Table />
        <RightColumn requestedLotteryWinner={requestedLotteryWinner}/>
      </section>
    </div>
  )
}

// Enter lottery button
function CtaButton(props: { setRefresh: (refresh: number) => void }) {

  const [minEntranceFee, setMinEntranceFee] = React.useState<string>('');
  const [isParticipant, setIsParticipant] = React.useState<boolean>(false);
  const { isWeb3Enabled, account } = useMoralis();

  const chainId = useChainId();

  const { runContractFunction: enterLottery, isFetching, isLoading, error } = useWeb3Contract({
    abi: lotteryAbi,
    contractAddress: lotteryAddresses[chainId!]?.address,
    functionName: "enterLottery",
    params: {},
    msgValue: minEntranceFee,
  });

  const getMinEntranceFee = useWeb3Function('getMinEntranceFee');
  const getParticipants = useWeb3Function('getParticipants');

  React.useEffect(
    function() {
      if(isWeb3Enabled) {
        getData();
      }
      async function getData() {
        const fee = await getMinEntranceFee();
        setMinEntranceFee((fee as ethers.BigNumber).toString());

        const participants: string[] = (await getParticipants()) as string[];
        setIsParticipant(participants.some(p => p.toLowerCase() === account));
      }
    }, [isWeb3Enabled]
  )

  return (
    <Fragment>
      <button
        className={`${styles.lotteryButton} ${isParticipant ? styles.isParticipant : ''}`}
        disabled={isFetching}
        onClick={
          async function () {
            await enterLottery({
              onSuccess: async (tx: any) => {
                await tx.wait(1);
                props.setRefresh(Math.random());
                const participants: string[] = (await getParticipants()) as string[];
                setIsParticipant(participants.some(p => p.toLowerCase() === account));
              },
              onError: (err) => {
                console.log(err);
              }
            });
          }
        }
      >
        <ExportedImage width={31} height={34}  src="/enter.svg" alt="enter lottery" />
        <span className={styles.text}>
          { (isFetching || isLoading) ? 'Joining...' : (isParticipant ? <span>You already joined</span> : 'Join the lottery') }
        </span>
        <ExportedImage width={30} height={33}  src="/arrow-right.svg" alt="right arrow" />
      </button>
      <div className={styles.minEntranceFee}>
        fee: { minEntranceFee !== '' ? ethers.utils.formatEther(ethers.BigNumber.from(minEntranceFee)) : 0 } ETH
      </div>
    </Fragment>
  )
}

export default Home;