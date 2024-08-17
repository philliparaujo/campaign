import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Switch from 'react-switch';
import Button from '../components/Button';
import RulesModal from '../components/RulesModal';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerColor, PlayerId } from '../types';
import { newGameId, newPlayerId } from '../utils';
import SettingsModal from '../components/SettingsModal';

function HomeScreen() {
  const {
    activeGames,
    playerGames,
    createGame,
    joinGame,
    deleteAllGames,
    gameExists,
  } = useGlobalState();

  const [playerId, setPlayerId] = useState<PlayerId>('');
  const [inputGameId, setInputGameId] = useState<GameId>('');
  const [inputPlayerColor, setInputPlayerColor] = useState<PlayerColor>('red');
  const [inputDisplayName, setInputDisplayName] = useState<string>('');
  const [openModal, setOpenModal] = useState<'rules' | 'settings' | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // On page load/URL change, set playerId or use URL player ID if it exists
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let playerId = queryParams.get('playerId');

    if (!playerId) {
      playerId = newPlayerId();
      queryParams.set('playerId', playerId);
      navigate({ search: queryParams.toString() }, { replace: true });
    }

    setPlayerId(playerId);
    setInputDisplayName(playerId);
  }, [location.search, navigate]);

  // On page load/refresh, print global states to console
  useEffect(() => {
    console.log('Active games:', activeGames);
    console.log('Player games:', playerGames);
  }, [activeGames, playerGames]);

  const handleCreateGame = async () => {
    if (!playerId) {
      console.error('No player ID found.');
      return;
    }
    const gameId = await newGameId(gameExists);

    createGame(gameId, playerId, inputPlayerColor, inputDisplayName)
      .then(() => {
        navigate(`/game?gameId=${gameId}&playerId=${playerId}`);
      })
      .catch(error => {
        console.error('Error creating game:', error);
      });
  };

  const handleJoinGame = async (gameId: GameId) => {
    if (!playerId) {
      console.error('No player ID found.');
      return;
    }

    joinGame(gameId, playerId, inputPlayerColor, inputDisplayName)
      .then(() => {
        navigate(`/game?gameId=${gameId}&playerId=${playerId}`);
      })
      .catch(error => {
        console.error('Error joining game:', error);
      });
  };

  const handleDeleteAllGames = async () => {
    deleteAllGames();
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputDisplayName}
            onChange={e => setInputDisplayName(e.target.value)}
            style={{
              color: inputPlayerColor,
              marginBottom: '10px',
              padding: '8px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <div style={{ color: 'red' }}>Join as red</div>
            <Switch
              checked={inputPlayerColor === 'blue'}
              onChange={() =>
                setInputPlayerColor(inputPlayerColor === 'red' ? 'blue' : 'red')
              }
              offColor="#CC0000"
              onColor="#0059b3"
              uncheckedIcon={false}
              checkedIcon={false}
            />
            <div style={{ color: 'blue' }}>Join as blue</div>
          </div>
        </div>
        <div>
          <Button onClick={() => setOpenModal('settings')}>Settings</Button>
        </div>
      </div>

      <h1 style={{ marginBottom: '40px', fontSize: '96px' }}>CAMPAIGN</h1>

      {/* Modal will be shown when isModalOpen is true */}
      <RulesModal show={openModal === 'rules'} onClose={handleCloseModal} />
      <SettingsModal
        show={openModal === 'settings'}
        onClose={handleCloseModal}
        buttons={
          <>
            <Button
              onClick={handleDeleteAllGames}
            >{`Delete All Games (${activeGames.length ?? 0})`}</Button>
          </>
        }
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '20px',
        }}
      >
        <div style={{ marginRight: '10px' }}>
          <Button size={'large'} onClick={handleCreateGame}>
            Create Game
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '10px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <Button
              size={'large'}
              disabled={inputGameId.length !== 4}
              onClick={() => handleJoinGame(inputGameId)}
            >
              Join Game
            </Button>
          </div>
          <input
            type="text"
            value={inputGameId}
            size={4}
            maxLength={4}
            onChange={e => setInputGameId(e.target.value.toUpperCase())}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '2px solid #888',
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Button size={'large'} onClick={() => setOpenModal('rules')}>
          Rules
        </Button>
      </div>
    </div>
  );
}

export default HomeScreen;
