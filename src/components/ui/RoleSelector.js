// src/components/ui/RoleSelector.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getRoleLabel, 
  getRoleIcon, 
  getStatusIcon,
  getStatusColor,
  saveSelectedRole,
  getStatusLabel
} from '../../utils/roleUtils';

/**
 * RoleSelector Component
 * 
 * Visual role switcher with completion status indicators.
 * Shows role chips with status badges and dropdown to switch active role.
 * 
 * @param {Object} props
 * @param {string} props.userId - User ID for localStorage scoping
 * @param {Array} props.userRoles - Array of role strings
 * @param {Object} props.completionStatus - Status object for each role
 * @param {string} props.selectedRole - Currently selected role
 * @param {Function} props.onRoleChange - Callback when role changes
 */
const RoleSelector = ({ 
  userId,
  userRoles = [], 
  completionStatus = {}, 
  selectedRole, 
  onRoleChange 
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.role-selector-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Handle role selection
  const handleRoleSelect = useCallback((role) => {
    if (role === selectedRole) {
      setDropdownOpen(false);
      return;
    }

    // Update parent component
    onRoleChange(role);

    // Save to localStorage
    if (userId) {
      saveSelectedRole(userId, role);
    }

    // Close dropdown
    setDropdownOpen(false);
  }, [selectedRole, onRoleChange, userId]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  if (!userRoles || userRoles.length === 0) {
    return null;
  }

  // Single role - simplified display
  if (userRoles.length === 1) {
    const role = userRoles[0];
    const status = completionStatus[role] || 'not-started';
    const statusIcon = getStatusIcon(status);
    const roleIcon = getRoleIcon(role);
    const roleLabel = getRoleLabel(role);
    const statusColor = getStatusColor(status);

    return (
      <div className="role-selector-single">
        <div className="role-badge">
          <span className="role-badge-icon">{roleIcon}</span>
          <span className="role-badge-label">{roleLabel}</span>
          <span 
            className="role-badge-status" 
            style={{ color: statusColor }}
            title={getStatusLabel(status)}
          >
            {statusIcon}
          </span>
        </div>

        <style jsx>{`
          .role-selector-single {
            padding: 16px 24px;
            background: linear-gradient(135deg, rgba(160, 32, 240, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%);
            border-radius: 12px;
            margin-bottom: 16px;
          }

          .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            font-size: 0.95rem;
            font-weight: 500;
          }

          .role-badge-icon {
            font-size: 1.2rem;
          }

          .role-badge-label {
            color: #374151;
          }

          .role-badge-status {
            font-size: 1.1rem;
            margin-left: 4px;
          }
        `}</style>
      </div>
    );
  }

  // Multi-role display with switcher
  return (
    <div className="role-selector-container">
      {/* Role Chips Display */}
      <div className="role-chips-section">
        <div className="section-label">Your Roles:</div>
        <div className="role-chips">
          {userRoles.map(role => {
            const status = completionStatus[role] || 'not-started';
            const statusIcon = getStatusIcon(status);
            const roleIcon = getRoleIcon(role);
            const roleLabel = getRoleLabel(role);
            const statusColor = getStatusColor(status);
            const isSelected = role === selectedRole;

            return (
              <div
                key={role}
                className={`role-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => handleRoleSelect(role)}
                title={`${roleLabel} - ${getStatusLabel(status)}`}
              >
                <span className="chip-icon">{roleIcon}</span>
                <span className="chip-label">{roleLabel}</span>
                <span 
                  className="chip-status" 
                  style={{ color: statusColor }}
                >
                  {statusIcon}
                </span>
                {isSelected && <span className="chip-selected-indicator">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Switcher Dropdown */}
      <div className="role-switcher-section">
        <div className="section-label">Currently viewing:</div>
        <div className="dropdown-container">
          <button 
            className="dropdown-button"
            onClick={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <span className="dropdown-icon">{getRoleIcon(selectedRole)}</span>
            <span className="dropdown-label">{getRoleLabel(selectedRole)}</span>
            <span className="dropdown-status">
              {getStatusIcon(completionStatus[selectedRole] || 'not-started')}
            </span>
            <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              {userRoles.map(role => {
                const status = completionStatus[role] || 'not-started';
                const isSelected = role === selectedRole;
                const statusColor = getStatusColor(status);

                return (
                  <button
                    key={role}
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <span className="item-icon">{getRoleIcon(role)}</span>
                    <span className="item-label">{getRoleLabel(role)}</span>
                    <span 
                      className="item-status" 
                      style={{ color: statusColor }}
                      title={getStatusLabel(status)}
                    >
                      {getStatusIcon(status)}
                    </span>
                    {isSelected && <span className="item-check">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .role-selector-container {
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(160, 32, 240, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%);
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid rgba(160, 32, 240, 0.1);
        }

        /* Section Labels */
        .section-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        /* Role Chips Section */
        .role-chips-section {
          margin-bottom: 16px;
        }

        .role-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .role-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: relative;
        }

        .role-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-color: #a020f0;
        }

        .role-chip.selected {
          border-color: #a020f0;
          background: linear-gradient(135deg, rgba(160, 32, 240, 0.1) 0%, rgba(32, 178, 170, 0.1) 100%);
          font-weight: 600;
        }

        .chip-icon {
          font-size: 1.2rem;
        }

        .chip-label {
          white-space: nowrap;
        }

        .chip-status {
          font-size: 1.1rem;
        }

        .chip-selected-indicator {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #a020f0;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(160, 32, 240, 0.4);
        }

        /* Role Switcher Section */
        .role-switcher-section {
          padding-top: 16px;
          border-top: 1px solid rgba(160, 32, 240, 0.1);
        }

        .dropdown-container {
          position: relative;
          width: 100%;
          max-width: 300px;
        }

        .dropdown-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #a020f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          font-weight: 500;
          color: #374151;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .dropdown-button:hover {
          box-shadow: 0 4px 12px rgba(160, 32, 240, 0.2);
          transform: translateY(-1px);
        }

        .dropdown-button:active {
          transform: translateY(0);
        }

        .dropdown-icon {
          font-size: 1.3rem;
        }

        .dropdown-label {
          flex: 1;
          text-align: left;
        }

        .dropdown-status {
          font-size: 1.2rem;
        }

        .dropdown-arrow {
          font-size: 0.8rem;
          color: #6b7280;
          transition: transform 0.2s ease;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #a020f0;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 0.95rem;
          font-weight: 500;
          color: #374151;
          text-align: left;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: rgba(160, 32, 240, 0.05);
        }

        .dropdown-item.selected {
          background: linear-gradient(135deg, rgba(160, 32, 240, 0.1) 0%, rgba(32, 178, 170, 0.1) 100%);
          font-weight: 600;
        }

        .item-icon {
          font-size: 1.3rem;
        }

        .item-label {
          flex: 1;
        }

        .item-status {
          font-size: 1.2rem;
        }

        .item-check {
          color: #a020f0;
          font-weight: bold;
          font-size: 1.1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .role-selector-container {
            padding: 16px 20px;
          }

          .role-chips {
            gap: 6px;
          }

          .role-chip {
            padding: 6px 10px;
            font-size: 0.85rem;
          }

          .chip-icon {
            font-size: 1.1rem;
          }

          .dropdown-container {
            max-width: 100%;
          }

          .dropdown-button {
            padding: 10px 14px;
            font-size: 0.9rem;
          }

          .dropdown-item {
            padding: 10px 14px;
            font-size: 0.9rem;
          }

          .section-label {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .role-chips {
            flex-direction: column;
          }

          .role-chip {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default RoleSelector;