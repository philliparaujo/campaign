import React from 'react';

interface BuildingProps {
  height: number;
  width: number;
}

const Building: React.FC<BuildingProps> = ({ height, width }) => {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height * 20}px`,
        backgroundColor: '#a0e0a0',
        border: '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {Array.from({ length: height }).map((_, index) => (
        <div
          key={index}
          style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#5a9c5a',
            borderBottom: index < height - 1 ? '1px solid #000' : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default Building;
