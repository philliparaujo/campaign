import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';

function HomeScreen() {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const newGameId = uuidv4();
    navigate(`/game?gameId=${newGameId}`);
  };

  return (
    <div>
      <h1>CAMPAIGN</h1>
      <Button onClick={handleCreateGame}>Create Game</Button>
    </div>
  );
}

export default HomeScreen;
