import React, { useState } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'blue' | 'red' | 'orange' | 'green';
  size?: 'small';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, color, size }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  // Define color mappings for normal and hover states
  const colorMap: Record<string, { base: string; hover: string }> = {
    blue: { base: '#0059b3', hover: '#0066cc' },
    red: { base: '#990000', hover: '#b30000' },
    orange: { base: '#e66300', hover: '#ff6f00' },
    green: { base: '#239023', hover: '#28a428' },
    default: { base: '#595959', hover: '#666666' },
  };

  const colors = color ? colorMap[color] : colorMap['default'];

  const backgroundColor = isHovered ? colors.hover : colors.base;

  const padding = size === 'small' ? '5px 10px' : '10px 20px';

  const buttonStyle: React.CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    transform: isActive ? 'scale(0.98)' : 'scale(1)',
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
};

export default Button;
