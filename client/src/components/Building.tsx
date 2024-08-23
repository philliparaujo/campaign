import React, { useEffect, useState } from 'react';
import { useGameState } from '../GameState';
import { Floor, PlayerColor } from 'shared/types';
import { useGlobalState } from '../GlobalState';
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

  const [gameId, setGameId] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState(false);

  // Get player and game IDs based on color
  useEffect(() => {
    const playerId = playerIdFromColor(playerColor);
    if (playerId) {
      fetchPlayer(playerId)
        .then(player => {
          setGameId(player.gameId);
        })
        .catch(error => {
          console.error('Error fetching player:', error);
        });
    }
  }, [fetchPlayer, playerColor, playerIdFromColor]);

  // After the game state is updated, update the game state on the server
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
    if (gameState.players[playerColor].phaseAction === 'done') return;

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
        height: `${height} * var(--floor-height)}px`,
      }}
      className="building-ui"
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
