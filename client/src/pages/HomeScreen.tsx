import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Switch from 'react-switch';
import Button from '../components/Button';
import RulesModal from '../components/RulesModal';
import SettingsModal from '../components/SettingsModal';
import { socket, useGlobalState } from '../GlobalState';
import { GameId, PlayerColor, PlayerId } from '../types';
import { newGameId, newPlayerId } from '../utils';

import './HomeScreen.css'; // Import the CSS file

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

  const [clientBuildTime, setClientBuildTime] = useState<string>(
    process.env.BUILD_TIME ?? ''
  );
  const [serverBuildTime, setServerBuildTime] = useState<string>('foo');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the server build time via Socket.IO
    socket.emit('get-server-build-time');
    socket.on('server-build-time', (time: string) => {
      setServerBuildTime(time);
    });

    return () => {
      socket.off('serverBuildTime');
    };
  }, []);

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
    setInputDisplayName('Guest'.concat(playerId.substring(0, 8)));
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
    <div className="home-container">
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${require('../assets/cover.jpg')})`,
        }}
      />
      <div className="overlay" />
      <div className="gradient-overlay" />

      <div className="top-bar">
        <div className="user-info">
          <input
            type="text"
            value={inputDisplayName}
            size={15}
            maxLength={15}
            onChange={e => setInputDisplayName(e.target.value)}
            className="input-field"
          />
          <div className="switch-container">
            <div>Join as red</div>
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
            <div>Join as blue</div>
          </div>
        </div>
        <div>
          <Button onClick={() => setOpenModal('settings')}>Settings</Button>
        </div>
      </div>

      <h1 className="title">CAMPAIGN</h1>

      <RulesModal show={openModal === 'rules'} onClose={handleCloseModal} />
      <SettingsModal
        show={openModal === 'settings'}
        onClose={handleCloseModal}
        buttons={
          <>
            <Button onClick={handleDeleteAllGames}>
              {`Delete All Games (${activeGames.length ?? 0})`}
            </Button>
          </>
        }
      />

      <div className="buttons">
        <div className="button-group">
          <div>
            <Button size={'large'} onClick={handleCreateGame} color={'green'}>
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
                color={'blue'}
              >
                Join Game
              </Button>
            </div>
            <input
              type="text"
              value={inputGameId}
              size={4}
              maxLength={4}
              placeholder={'Enter Game ID'}
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

        <div>
          <Button size={'large'} onClick={() => setOpenModal('rules')}>
            Rules
          </Button>
        </div>
      </div>

      <div className="footer">
        <p>Client built: {clientBuildTime}</p>
        <p>Server built: {serverBuildTime}</p>
      </div>
    </div>
  );
}

export default HomeScreen;
