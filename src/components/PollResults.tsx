import { calculatePollResult } from '../utils';

interface PollResultsProps {
  redPercent: number;
  title?: string;
  truePoll?: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({
  redPercent,
  title = 'Poll Results',
  truePoll = false,
}) => {
  const bluePercent = 1 - redPercent;
  const widthMultiplier = 1.15;

  const redWidth = Math.min(redPercent * 100 * widthMultiplier, 100);
  const blueWidth = Math.min(bluePercent * 100 * widthMultiplier, 100);

  return (
    <div
      style={{
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        border: '1px solid #888',
        padding: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div style={{ width: '35%', textAlign: 'center', marginRight: '6%' }}>
          <h3 style={{ margin: 0, marginBottom: 5 }}>{`${title}:`}</h3>
          <p style={{ margin: 0, color: redPercent >= 0.5 ? 'red' : 'blue' }}>
            {calculatePollResult(redPercent)}
          </p>
        </div>
        <div
          style={{
            width: '100%',
          }}
        >
          <div
            style={{
              height: '20px',
              backgroundColor: 'red',
              borderRadius: '0px',
              transition: 'width 0.5s',
              width: `${redWidth}%`,
            }}
          ></div>
          <div
            style={{
              height: '20px',
              backgroundColor: 'blue',
              borderRadius: '0px',
              transition: 'width 0.5s',
              width: `${blueWidth}%`,
            }}
          ></div>
        </div>
      </div>

      {truePoll && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: '20px 60px',
            marginBottom: 0,
          }}
        >
          <div style={{ color: 'red', textAlign: 'center' }}>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0 }}>Vote Percent:</p>
              <p style={{ margin: 0 }}>{(redPercent * 100).toFixed(2)}%</p>
            </div>
          </div>
          <div style={{ color: 'blue', textAlign: 'center' }}>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0 }}>Vote Percent:</p>
              <p style={{ margin: 0 }}>{(bluePercent * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollResults;
