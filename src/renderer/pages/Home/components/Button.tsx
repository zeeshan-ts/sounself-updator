/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/button-has-type */
import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  type = 'button',
  className = '',
  variant = 'primary',
  ...rest
}: ButtonProps) {
  const buttonType: 'button' | 'submit' | 'reset' = type;

  return (
    <button
      type={buttonType}
      className={classNames(
        'button button-lg',
        {
          'button-primary': variant === 'primary',
          'button-secondary': variant === 'secondary',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
