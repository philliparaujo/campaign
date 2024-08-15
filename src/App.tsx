import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen';
import Game from './pages/Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
