import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { BrowseEvents } from './pages/BrowseEvents';
import { EventDetail } from './pages/EventDetail';
import { ParticipantDashboard } from './pages/ParticipantDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: false,
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/browse" element={<BrowseEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/dashboard" element={<ParticipantDashboard />} />
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
