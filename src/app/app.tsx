import type { AppProps } from 'next/app';
import { WalletProvider } from './contexts/WalletProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp; 