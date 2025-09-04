// src/components/common/LoadingSpinner.js
import React from 'react'
import '../../styles/global.css';

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "medium",
  containerStyle = {}
}) => {
  const sizeClass = size === "large" ? "loading-spinner large" : 
                   size === "small" ? "loading-spinner small" : 
                   "loading-spinner"

  return (
    <div className="loading-container" style={containerStyle}>
      <div className={sizeClass}></div>
      <p className="loading-text">{message}</p>
    </div>
  )
}

// Alternative simple loading component for inline use
export const SimpleLoader = ({ message = "Loading..." }) => (
  <div className="flex-center" style={{ padding: '20px', color: 'var(--gray-600)' }}>
    <div className="loading-spinner small" style={{ marginRight: '10px' }}></div>
    {message}
  </div>
)

// Page-level loading component
export const PageLoader = ({ message = "Loading your dashboard..." }) => (
  <div style={{
    minHeight: '60vh',
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    margin: '20px',
    border: '2px solid var(--border-beige)'
  }}>
    <LoadingSpinner message={message} size="large" />
  </div>
)

// Button loading state
export const ButtonLoader = ({ size = 16 }) => (
  <div 
    className="loading-spinner" 
    style={{
      width: `${size}px`,
      height: `${size}px`,
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      display: 'inline-block',
      marginRight: '8px'
    }}
  ></div>
)

export default LoadingSpinner