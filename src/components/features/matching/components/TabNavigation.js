// src/components/features/matching/components/TabNavigation.js
import React from 'react';

/**
 * TabNavigation Component
 * Renders the navigation tabs for different connection categories
 */
const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  tabCounts, 
  tabLabels 
}) => {
  const tabs = [
    {
      key: 'active-connections',
      icon: '⚡',
      label: tabLabels.active || 'Active Connections',
      count: tabCounts.activeConnections || 0
    },
    {
      key: 'awaiting-response',
      icon: '📥',
      label: tabLabels.received || 'Awaiting Response',
      count: tabCounts.awaitingResponse || 0
    },
    {
      key: 'sent-requests',
      icon: '📤',
      label: tabLabels.sent || 'Sent Requests',
      count: tabCounts.sentRequests || 0
    },
    {
      key: 'connection-history',
      icon: '📋',
      label: tabLabels.history || 'History',
      count: tabCounts.connectionHistory || 0
    }
  ];

  return (
    <div className="navigation mb-5">
      <ul className="nav-list">
        {tabs.map(tab => (
          <li key={tab.key} className="nav-item">
            <button
              className={`nav-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label} ({tab.count})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabNavigation;