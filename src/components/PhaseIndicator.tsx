import { useGameState } from '../GameState';

interface PhaseIndicatorProps {}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = () => {
  const { gameState } = useGameState();
  const { phaseNumber } = gameState;

  const phaseDescriptions: { [key: number]: string } = {
    1: 'Advertising',
    2: 'Polling',
    3: 'Fact-Checking',
    4: 'Funding',
  };

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '10px',
        fontSize: '18px',
        color: '#fff',
        padding: '10px',
        backgroundColor: '#282c34',
        borderRadius: '8px',
        marginBottom: '10px',
      }}
    >
      <b>Phase {phaseNumber}:</b> {phaseDescriptions[phaseNumber]}
    </div>
  );
};

export default PhaseIndicator;
