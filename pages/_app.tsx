import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { MoralisProvider } from 'react-moralis';
import { NextUIProvider, createTheme } from '@nextui-org/react';
const darkTheme = createTheme({
  type: 'dark',
});

function Web3Funding({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NextUIProvider theme={darkTheme}>
        <Component {...pageProps} />
      </NextUIProvider>
    </MoralisProvider>
  )
}

export default Web3Funding
