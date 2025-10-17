// src/components/features/connections/modals/GroupDetailsModal.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './GroupDetailsModal.module.css';

const GroupDetailsModal = ({
  isOpen,
  matchGroup,
  roommates = [],
  currentUserId,
  connectionStatus,
  onClose,
  onViewProfile,
  onApprove,
  onDecline,
  showActions = false,
  isAwaitingApproval = false
}) => {
  if (!isOpen || !matchGroup) return null;

  /**
   * Format name to show only first name and last initial
   * CRITICAL PRIVACY FUNCTION
   */
  const formatName = (firstName, lastName) => {
    if (!firstName) return 'Unknown';
    if (!lastName) return firstName;
    return `${firstName} ${lastName.charAt(0)}.`;
  };

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Format recovery stage display
   */
  const formatRecoveryStage = (stage) => {
    if (!stage) return 'Not specified';
    const stageMap = {
      'early': 'Early Recovery',
      'stabilizing': 'Stabilizing',
      'stable': 'Stable Recovery',
      'long_term': 'Long-term',
      'maintenance': 'Maintenance'
    };
    return stageMap[stage] || stage.replace(/_/g, ' ');
  };

  /**
   * Format work schedule
   */
  const formatWorkSchedule = (schedule) => {
    if (!schedule) return 'Not specified';
    const scheduleMap = {
      'traditional_9_5': '9-5',
      'work_from_home': 'WFH',
      'night_shift': 'Nights',
      'early_morning': 'Early AM',
      'part_time': 'Part-time',
      'flexible': 'Flexible'
    };
    return scheduleMap[schedule] || schedule.replace(/_/g, ' ');
  };

  /**
   * Get group status info
   */
  const getStatusInfo = () => {
    const status = matchGroup.status;
    const statusMap = {
      'requested': {
        label: 'Pending Approval',
        color: 'warning',
        icon: '⏳',
        description: 'Waiting for all members to approve'
      },
      'forming': {
        label: 'Forming Group',
        color: 'info',
        icon: '🔄',
        description: 'Group is being assembled'
      },
      'confirmed': {
        label: 'Confirmed',
        color: 'success',
        icon: '✅',
        description: 'All members have confirmed'
      },
      'active': {
        label: 'Active',
        color: 'success',
        icon: '✅',
        description: 'Group is active'
      }
    };
    return statusMap[status] || statusMap['forming'];
  };

  /**
   * Check if contact info should be shown
   */
  const showContactInfo = connectionStatus === 'confirmed' || connectionStatus === 'active';

  /**
   * Render group overview section
   */
  const renderGroupOverview = () => {
    const statusInfo = getStatusInfo();

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>Group Overview</h4>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>{statusInfo.icon}</span>
            <div>
              <div className={styles.infoLabel}>Status</div>
              <div className={styles.infoValue}>{statusInfo.label}</div>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>👥</span>
            <div>
              <div className={styles.infoLabel}>Total Members</div>
              <div className={styles.infoValue}>{roommates.length}</div>
            </div>
          </div>

          {matchGroup.move_in_date && (
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>📅</span>
              <div>
                <div className={styles.infoLabel}>Target Move-in</div>
                <div className={styles.infoValue}>
                  {new Date(matchGroup.move_in_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {matchGroup.group_name && (
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>🏷️</span>
              <div>
                <div className={styles.infoLabel}>Group Name</div>
                <div className={styles.infoValue}>{matchGroup.group_name}</div>
              </div>
            </div>
          )}
        </div>

        {matchGroup.message && (
          <div className={styles.groupMessage}>
            <div className={styles.messageLabel}>Group Message:</div>
            <p className={styles.messageText}>{matchGroup.message}</p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render roommate cards section
   */
  const renderRoommateCards = () => {
    if (!roommates || roommates.length === 0) {
      return (
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>👥 Group Members</h4>
          <p className={styles.emptyMessage}>No members found</p>
        </div>
      );
    }

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>👥 Group Members ({roommates.length})</h4>
        <div className={styles.roommatesGrid}>
          {roommates.map((roommate, index) => {
            const profile = roommate.registrant_profiles || {};
            const age = calculateAge(roommate.date_of_birth);
            const isCurrentUser = roommate.user_id === currentUserId;

            return (
              <div key={roommate.id || index} className={styles.roommateCard}>
                {/* Card Header */}
                <div className={styles.roommateHeader}>
                  <div className={styles.roommateAvatar}>👤</div>
                  <div className={styles.roommateHeaderInfo}>
                    <div className={styles.roommateName}>
                      {formatName(profile.first_name, profile.last_name)}
                      {isCurrentUser && <span className={styles.youBadge}>You</span>}
                    </div>
                    {age && (
                      <div className={styles.roommateAge}>{age} years old</div>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className={styles.roommateQuickInfo}>
                  {roommate.recovery_stage && (
                    <div className={styles.quickInfoItem}>
                      <span className={styles.quickInfoIcon}>🌱</span>
                      <span>{formatRecoveryStage(roommate.recovery_stage)}</span>
                    </div>
                  )}
                  
                  {roommate.work_schedule && (
                    <div className={styles.quickInfoItem}>
                      <span className={styles.quickInfoIcon}>⏰</span>
                      <span>{formatWorkSchedule(roommate.work_schedule)}</span>
                    </div>
                  )}

                  {roommate.budget_min && roommate.budget_max && (
                    <div className={styles.quickInfoItem}>
                      <span className={styles.quickInfoIcon}>💵</span>
                      <span>${roommate.budget_min}-${roommate.budget_max}</span>
                    </div>
                  )}

                  {roommate.primary_location && (
                    <div className={styles.quickInfoItem}>
                      <span className={styles.quickInfoIcon}>📍</span>
                      <span>{roommate.primary_location}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info (if available) */}
                {showContactInfo && !isCurrentUser && (
                  <div className={styles.roommateContact}>
                    {roommate.primary_phone && (
                      <a 
                        href={`tel:${roommate.primary_phone}`}
                        className={styles.contactIconButton}
                        title="Call"
                      >
                        📱
                      </a>
                    )}
                    {profile.email && (
                      <a 
                        href={`mailto:${profile.email}`}
                        className={styles.contactIconButton}
                        title="Email"
                      >
                        📧
                      </a>
                    )}
                  </div>
                )}

                {/* View Profile Button */}
                {!isCurrentUser && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => onViewProfile && onViewProfile(roommate)}
                    style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                  >
                    👁️ View Full Profile
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render contact availability message
   */
  const renderContactMessage = () => {
    if (showContactInfo) {
      return (
        <div className={styles.contactAvailable}>
          <div className={styles.contactAvailableIcon}>✅</div>
          <div>
            <strong>Contact Information Available</strong>
            <p>You can now exchange contact details with your potential roommates using the phone and email buttons on each member's card.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.contactLocked}>
        <div className={styles.lockIcon}>🔒</div>
        <div>
          <strong>
            {isAwaitingApproval 
              ? 'Review the group to make your decision' 
              : 'Contact information available after group is confirmed'}
          </strong>
          <p>
            {isAwaitingApproval
              ? 'Contact details will be available after all members approve joining the group.'
              : 'Once all members confirm, you\'ll be able to exchange contact information.'}
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => {
    if (!showActions) return null;

    // Awaiting approval view
    if (isAwaitingApproval && onApprove && onDecline) {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <div className={styles.approvalActions}>
            <button 
              className="btn btn-primary" 
              onClick={() => onApprove && onApprove(matchGroup)}
            >
              ✅ Approve & Join Group
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => onDecline && onDecline(matchGroup)}
              style={{ color: 'var(--error-text)', borderColor: 'var(--error-border)' }}
            >
              ❌ Decline
            </button>
          </div>
        </div>
      );
    }

    // Default (just close)
    return (
      <div className={styles.modalActions}>
        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalBody}>
          {/* Header with Purple Gradient */}
          <div className={styles.groupHeader}>
            <div className={styles.groupHeaderContent}>
              <div className={styles.groupIcon}>👥</div>
              <div className={styles.groupHeaderInfo}>
                <h2 className={styles.groupTitle}>
                  {matchGroup.group_name || `Roommate Group`}
                </h2>
                <div className={styles.groupSubtitle}>
                  {roommates.length} member{roommates.length !== 1 ? 's' : ''}
                  {matchGroup.move_in_date && (
                    <> • Moving {new Date(matchGroup.move_in_date).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={styles.badgeSection}>
            <span className={`badge badge-${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>

          {/* Group Overview */}
          {renderGroupOverview()}

          {/* Roommate Cards */}
          {renderRoommateCards()}

          {/* Contact Availability Message */}
          {renderContactMessage()}

          {/* Action Buttons */}
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

GroupDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  matchGroup: PropTypes.object.isRequired,
  roommates: PropTypes.array,
  currentUserId: PropTypes.string,
  connectionStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onViewProfile: PropTypes.func,
  onApprove: PropTypes.func,
  onDecline: PropTypes.func,
  showActions: PropTypes.bool,
  isAwaitingApproval: PropTypes.bool
};

GroupDetailsModal.defaultProps = {
  roommates: [],
  showActions: false,
  isAwaitingApproval: false
};

export default GroupDetailsModal;