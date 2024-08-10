import React from 'react';
import { Influence } from '../App';

interface FloorUIProps {
  influence: Influence;
  onClick: () => void;
}

const FloorUI: React.FC<FloorUIProps> = ({ influence, onClick }) => {
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
    ></div>
  );
};

export default FloorUI;
