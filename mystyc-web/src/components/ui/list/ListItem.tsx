import React from 'react';

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

export default function ListItem({ children, className = '' }: ListItemProps) {
  const classes = `flex items-center rounded hover:bg-gray-100 focus:bg-gray-100 ${className}`;
  return <li className={classes}>{children}</li>;
}
