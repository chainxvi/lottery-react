import React from 'react';
import { ethers } from 'ethers';
import { useMoralis } from 'react-moralis';
import styles from '../styles/RightColumn.module.scss';
import moment from 'moment';
import jazzicon from '@metamask/jazzicon';
import { useWeb3Function } from '../helpers';

type StateType = {
  winner: string,
  lotteryAmount: string,
  totalPlayedAmount: string,
  lastTimeStamp: number,
  interval: number,
  isStarted: boolean
}

export function RightColumn(props: {requestedLotteryWinner: boolean}) {
  const image = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<StateType>({
    winner: '',
    lotteryAmount: '',
    totalPlayedAmount: '',
    lastTimeStamp: 0,
    interval: 0,
    isStarted: false,
  });

  const { isWeb3Enabled } = useMoralis();

  const getWinner = useWeb3Function('getWinner');
  const getLotteryAmount = useWeb3Function('getLotteryAmount');
  const getTotalPlayedAmount = useWeb3Function('getTotalPlayedAmount');
  const getLastTimeStamp = useWeb3Function('getLastTimeStamp');
  const getInterval = useWeb3Function('getInterval');
  const getParticipants = useWeb3Function('getParticipants');

  React.useEffect(
    function() {
      if(isWeb3Enabled) {
        getData();
      }
      async function getData() {
        const winner: string = (await getWinner()) as string;
        const lotteryAmount = ethers.utils.formatEther((await getLotteryAmount() as ethers.BigNumber));
        const totalPlayedAmount = ethers.utils.formatEther((await getTotalPlayedAmount() as ethers.BigNumber));
        const lastTimeStamp = (await getLastTimeStamp() as ethers.BigNumber).toNumber();
        const interval = (await getInterval() as ethers.BigNumber).toNumber();
        const participants = (await getParticipants()) as string[];

        setState({
          winner,
          lotteryAmount,
          totalPlayedAmount,
          lastTimeStamp,
          interval,
          isStarted: participants.length !== 0,
        })
      }
    }, [isWeb3Enabled]
  )

  React.useEffect(
    function() {
      if(state.winner) {
        const addr = state.winner?.slice(2, 10) as string;
        const seed = parseInt(addr, 16);
        const icon = jazzicon(56, seed);
  
        image.current?.appendChild(icon);
      }
    }, [state.winner]
  );

  const timeLeft = React.useMemo(
    function() {
      return (state.interval * 1000) - (moment().toDate().getTime() - moment.unix(state.lastTimeStamp).toDate().getTime())
    }, [state.interval, state.lastTimeStamp]
  )

  return (
    <div className={styles.rightColumn}>
      {
        state.isStarted && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              Time Remaining <small>(d:hh:mm)</small>
            </div>
            <div className={styles.cardData}>
              <div className={styles.etherText}>
                {
                  (props.requestedLotteryWinner || timeLeft < 0) ?
                  'Please wait' :
                  dhm((
                    moment(
                      timeLeft
                    )
                    .toDate()
                    .getTime()
                  ))
                }
              </div>
            </div>
          </div>
        )
      }

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Last Winner
        </div>
        <div className={styles.cardData}>
          <div className={styles.accountContainer}>
            <div className={styles.image} ref={image} />
            <div className={styles.accountText}>
              { state.winner.substring(0, 7) + '...' + state.winner.substring(state.winner.length - 5, state.winner.length) }
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Current Lottery Jackpot
        </div>
        <div className={styles.cardData}>
          <div className={styles.etherText}>
            { state.lotteryAmount } ETH
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          All-Time Played Amount
        </div>
        <div className={styles.cardData}>
          <div className={styles.etherText}>
            { state.totalPlayedAmount } ETH
          </div>
        </div>
      </div>
    </div>
  )
}

function dhm(t: number){
  var cd = 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.round( (t - d * cd - h * ch) / 60000),
      pad = function(n: number){ return n < 10 ? '0' + n : n; };
  if( m === 60 ){
    h++;
    m = 0;
  }
  if( h === 24 ){
    d++;
    h = 0;
  }
  return [d, pad(h), pad(m)].join(':');
}