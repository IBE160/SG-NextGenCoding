// frontend/__mocks__/react-copy-to-clipboard.js
import React from 'react';

export const CopyToClipboard = ({ children, onCopy }: { children: React.ReactElement, onCopy: () => void }) => {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCopy();
  };
  return React.cloneElement(children, { onClick });
};
