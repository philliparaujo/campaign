import Modal from './Modal';

interface RulesModalProps {
  show: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ show, onClose }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>How to Play</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left column */}
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>
            <u>Objective</u>
          </h2>
          <div
            style={{
              border: '1px solid #000',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '1.2rem',
            }}
          >
            <p style={{}}>
              Win a city election by{' '}
              <strong>
                accumulating more public opinion than your opponent
              </strong>{' '}
              after 3 turns of advertising.
            </p>
            <p>
              To improve public opinion, have good poll results and be
              "trustworthy".
            </p>
          </div>

          <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>
            <u>Resources</u>
          </h2>
          <div style={{ fontSize: '1.2rem' }}>
            <p>
              <strong>Coins</strong>: used to buy advertisements. earn more
              coins by having a favorable public opinion.
            </p>
            <p>
              <strong>Public Opinion</strong>: determines the winner of the
              election. win public opinion with good poll results, or lose it
              with unfair polling.
            </p>
            <p>
              <strong>Poll Results</strong>: improves public opinion. win polls
              with strategically-placed advertisements.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, paddingLeft: '20px' }}>
          <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>
            <u>Turn phases</u>
          </h2>
          <div style={{ fontSize: '1.2rem', textAlign: 'center' }}>
            <p>
              <strong>1. Advertising</strong>
              <br />
              Spend coins to rent out floors for advertisements. An
              advertisement improves your polling, but only for roads that can
              see it.
            </p>
            <p>
              <strong>2. Polling</strong>
              <br />
              Select a region of the city to poll. Polls that favor you boost
              public opinion, but non-representative polls may be called out for
              being unfair, losing public opinion.
            </p>
            <p>
              <strong>3. Fact-Checking</strong>
              <br />
              Evaluate how accurately your opponent’s poll reflects the whole
              city. Win or lose public opinion with accusations, or play it safe
              by trusting their poll.
            </p>
            <p>
              <strong>4. Funding</strong>
              <br />
              Advertisements are reset, and campaigns receive coins based on
              public opinion. True poll results are released.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RulesModal;
