import { ethers } from 'ethers';
import React from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { lotteryAbi, lotteryAddresses } from '../chain-data/constants';
import styles from '../styles/Table.module.scss';
import jazzicon from '@metamask/jazzicon';
import { useChainId, useWeb3Function } from '../helpers';

export type TableData = {
  name: string;
  dateEntered: string;
  amount: string;
}

export function Table() {
  const [participantsTableData, setParticipantsTableData] = React.useState<TableData[]>([]);
  const { isWeb3Enabled } = useMoralis();

  const getParticipants = useWeb3Function('getParticipants');

  React.useEffect(
    function() {
      if(isWeb3Enabled) {
        getParticips();
      }
      async function getParticips() {
        const participants: string[] = (await getParticipants()) as string[];

        setParticipantsTableData(
          participants.map(
            function(p: string) {
              return {
                name: p,
                dateEntered: '',
                amount: '',
              }
            }
          ) as TableData[]
        );
      }
    }, [isWeb3Enabled]
  );

  return (
    <div className={styles.tableContainer}>
      <div className={styles.topSection}>
        <div>
          Current Lottery Participants { participantsTableData.length }
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              Address
            </th>
            <th>
              {/* Date entered */}
            </th>
            <th>
              {/* Amount in ETH */}
            </th>
          </tr>
        </thead>
        <tbody>
          {
            participantsTableData.map((p, i) => {
              return (
                <tr key={i}>
                  <td>
                    <ParticipantName name={p.name} />
                  </td>
                  <td>
                    {/* 3 mins ago */}
                  </td>
                  <td>
                    {/* 0.01 ETH */}
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

function ParticipantName(props: { name: string }) {
  const image = React.useRef<HTMLDivElement>(null);
  const name = props.name;

  React.useEffect(
    function() {
      if(name) {
        const addr = name?.slice(2, 10) as string;
        const seed = parseInt(addr, 16);
        const icon = jazzicon(48, seed);
        if(image.current) {
          image.current.innerHTML = '';
          image.current.appendChild(icon);
        }
      }
    }, [name]
  );

  return (
    <div className={styles.participantContainer}>
      <div className={styles.image} ref={image} />
      <div className={styles.participantName}>{name}</div>
    </div>
  )
}