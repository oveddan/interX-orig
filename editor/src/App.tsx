import { client, chains } from './web3/client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import EditorAndScene from './EditorAndScene';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import OnChainWorldWrapper from './onChainWorld/OnChainWorld';

const Web3Wrapper = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <WagmiConfig client={client}>
    <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
  </WagmiConfig>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Web3Wrapper>
        <EditorAndScene web3Enabled />
      </Web3Wrapper>
    ),
  },
  {
    path: '/pure',
    element: <EditorAndScene />,
  },
  {
    path: 'worlds/:tokenId',
    element: (
      <Web3Wrapper>
        <OnChainWorldWrapper />
      </Web3Wrapper>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
