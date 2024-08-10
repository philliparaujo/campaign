import React, { useState } from 'react';

import BoardUI, { Cell } from './components/Board';
import { initializeBoard } from './utils';

export type Influence = '' | 'red' | 'blue';

function App() {
  const [board, setBoard] = useState<Cell[][]>(initializeBoard(5));

  return (
    <div>
      <h1>Hello, world!</h1>
      <BoardUI size={5} board={board} setBoard={setBoard} />
      <button onClick={() => setBoard(initializeBoard(5))}>
        Regenerate board
      </button>
    </div>
  );
}

export default App;
