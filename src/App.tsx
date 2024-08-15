import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen';
import Game from './pages/Game';
import { GlobalStateProvider } from './GlobalState';

function App() {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
}

export default App;
