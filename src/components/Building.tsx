import React, { useEffect, useState } from 'react';
import { useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { Floor, PlayerColor } from '../types';
import FloorUI from './Floor';

interface BuildingUIProps {
  rowIndex: number;
  colIndex: number;
  floors: Floor[];
  baseCost: number;
  playerColor: PlayerColor;
}

const BuildingUI: React.FC<BuildingUIProps> = ({
  rowIndex,
  colIndex,
  floors,
  baseCost,
  playerColor,
}) => {
  const { updateGame, fetchPlayer } = useGlobalState();
  const { gameState, playerIdFromColor, setFloorInfluence, setCoins } =
    useGameState();
  const { board, players } = gameState;
  const height = floors.length;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState(false);

  useEffect(() => {
    const playerId = playerIdFromColor(playerColor);
    setPlayerId(playerId);

    fetchPlayer(playerId)
      .then(player => {
        setGameId(player.gameId);
      })
      .catch(error => {
        console.error('Error fetching player:', error);
      });
  }, [fetchPlayer, playerColor, playerIdFromColor]);

  useEffect(() => {
    if (pendingUpdate && gameId) {
      updateGame(gameId, { ...gameState })
        .then(() => {
          console.log('Game state updated successfully');
        })
        .catch(error => {
          console.error('Error updating the game state:', error);
        })
        .finally(() => {
          setPendingUpdate(false);
        });
    }
  }, [pendingUpdate, gameId, gameState, updateGame]);

  // Calculates the cost of a floor given its index in a building's Floor[]
  const floorCost = (floorIndex: number) => {
    return baseCost + height - floorIndex - 1;
  };

  // Update game state when toggling ownership of a floor
  const updateFloorInfluence = async (
    rowIndex: number,
    colIndex: number,
    floorIndex: number,
    playerColor: PlayerColor
  ) => {
    const cell = board[rowIndex][colIndex];
    if (cell.type !== 'building' || !gameId) return;

    const influenceCost = floorCost(floorIndex);
    const currentInfluence = cell.floors[floorIndex].influence;
    if (currentInfluence !== '' && currentInfluence !== playerColor) {
      return;
    }

    // Determine the new influence
    const newInfluence = currentInfluence === '' ? playerColor : '';

    // Calculate new coin counts
    const newCoins =
      players[playerColor].coins +
      (currentInfluence === '' ? -influenceCost : influenceCost);

    // Update local state
    setFloorInfluence(rowIndex, colIndex, floorIndex, newInfluence);
    setCoins(playerColor, newCoins);

    // Set flag to trigger global state update
    setPendingUpdate(true);
  };

  return (
    <div
      style={{
        width: `60px`,
        height: `${height * 20}px`,
        border: '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {floors.map((floor, floorIndex) => (
        <FloorUI
          key={floorIndex}
          influence={floor.influence}
          cost={floorCost(floorIndex)}
          onClick={() =>
            updateFloorInfluence(rowIndex, colIndex, floorIndex, playerColor)
          }
        />
      ))}
    </div>
  );
};

export default BuildingUI;
