import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GlobalStateProvider } from 'GlobalState';
import GameWrapper from './pages/GameWrapper';
import HomeScreen from './pages/HomeScreen';

function App() {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game" element={<GameWrapper />} />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
}

export default App;
