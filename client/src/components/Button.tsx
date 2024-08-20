import React, { useState } from 'react';
import './Button.css';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'blue' | 'red' | 'orange' | 'green';
  size?: 'small' | 'large';
  disabled?: boolean;
  clicked?: boolean;
  width?: string;
}

// Color mappings for different button states
const colorMap: Record<
  string,
  { base: string; hover: string; disabled: string }
> = {
  blue: { base: '#0059b3', hover: '#0066cc', disabled: '#324150' },
  red: { base: '#990000', hover: '#b30000', disabled: '#4c3232' },
  orange: { base: '#e66300', hover: '#ff6f00', disabled: '#584332' },
  green: { base: '#239023', hover: '#28a428', disabled: '#384a38' },
  default: { base: '#595959', hover: '#666666', disabled: '#414141' },
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  color,
  size,
  disabled,
  clicked,
  width,
}) => {
  // Lightens the button on hover
  const [isHovered, setIsHovered] = useState(false);

  // Slightly shrink the button when clicking
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

  const colors = color ? colorMap[color] : colorMap['default'];
  const backgroundColor =
    disabled || clicked
      ? colors.disabled
      : isHovered
        ? colors.hover
        : colors.base;
  const borderColor = clicked ? 'black' : 'transparent';
  const padding =
    size === 'small'
      ? '5px 10px'
      : size === 'large'
        ? '20px 25px'
        : '10px 20px';

  const buttonStyle: React.CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    color: disabled || clicked ? '#aaa' : '#fff',
    border: `2px solid ${borderColor}`,
    borderRadius: '5px',
    cursor: disabled || clicked ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    transform: isActive ? 'scale(0.98)' : 'scale(1)',
    fontSize: size === 'large' ? '24px' : '16px',
  };

  return (
    <button
      className={size === 'large' ? 'large-button' : 'button'}
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled || clicked}
    >
      {children}
    </button>
  );
};

export default Button;
