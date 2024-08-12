import React from 'react';
import { Influence } from '../types';

interface FloorUIProps {
  influence: Influence;
  cost: number;
  onClick: () => void;
}

const FloorUI: React.FC<FloorUIProps> = ({ influence, cost, onClick }) => {
  return (
    <div
      style={{
        width: `60px`,
        height: `20px`,
        backgroundColor: influence === '' ? '#aaa' : influence,
        border: '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClick}
    >
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          textAlign: 'right',
          color: 'black',
        }}
      >
        {cost}
      </p>
    </div>
  );
};

export default FloorUI;
