// frontend/__mocks__/react-copy-to-clipboard.js
import React from 'react'

export const CopyToClipboard = ({ children, onCopy }) => {
  const onClick = (e) => {
    e.preventDefault()
    onCopy()
  }
  return React.cloneElement(children, { onClick })
}
