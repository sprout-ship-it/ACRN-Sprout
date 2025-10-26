// src/components/features/peer-support/ClientSelfViewModal.js
import React, { useState } from 'react';
import styles from './ClientSelfViewModal.module.css';

const ClientSelfViewModal = ({ clientData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!clientData) {
    return null;
  }

  /**
   * Format mood badge class
   */
  const getMoodBadgeClass = (mood) => {
    const moodClasses = {
      excellent: styles.moodExcellent,
      good: styles.moodGood,
      stable: styles.moodStable,
      struggling: styles.moodStruggling,
      crisis: styles.moodCrisis
    };
    return moodClasses[mood] || styles.moodStable;
  };

  /**
   * Render Overview Tab
   */
  const renderOverview = () => {
    return (
      <div className={styles.tabContent}>
        {/* 2x2 Grid Layout */}
        <div className={styles.overviewGrid}>
          {/* Top-left: Contact Info */}
          <div className={styles.overviewCard}>
            <h4 className={styles.cardTitle}>📞 Contact Information</h4>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone:</span>
                <span className={styles.infoValue}>{clientData.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{clientData.email || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Top-right: Recovery Info */}
          <div className={styles.overviewCard}>
            <h4 className={styles.cardTitle}>🌱 Recovery Information</h4>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Stage:</span>
                <span className={styles.infoValue}>{clientData.recoveryStage || 'Not specified'}</span>
              </div>
              {clientData.sobrietyDate && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Sobriety Date:</span>
                  <span className={styles.infoValue}>
                    {new Date(clientData.sobrietyDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {clientData.primarySubstances?.length > 0 && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Primary Substances:</span>
                  <div className={styles.substancesList}>
                    {clientData.primarySubstances.map((substance, i) => (
                      <span key={i} className={styles.substanceBadge}>
                        {substance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom-left: Session Stats */}
          <div className={styles.overviewCard}>
            <h4 className={styles.cardTitle}>📊 Session Statistics</h4>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Sessions:</span>
                <span className={styles.infoValue}>{clientData.totalSessions || 0}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Last Contact:</span>
                <span className={styles.infoValue}>
                  {clientData.lastContact 
                    ? new Date(clientData.lastContact).toLocaleDateString()
                    : 'No recent contact'}
                </span>
              </div>
              {clientData.nextFollowup && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Next Follow-up:</span>
                  <span className={styles.infoValue}>
                    {new Date(clientData.nextFollowup).toLocaleDateString()}
                  </span>
                </div>
              )}
              {clientData.followupFrequency && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Follow-up Frequency:</span>
                  <span className={styles.infoValue}>
                    {clientData.followupFrequency.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom-right: Goals Summary */}
          <div className={styles.overviewCard}>
            <h4 className={styles.cardTitle}>🎯 Goals Summary</h4>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Active Goals:</span>
                <span className={styles.infoValue}>
                  {clientData.recoveryGoals?.filter(g => g.status === 'active').length || 0}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Completed Goals:</span>
                <span className={styles.infoValue}>
                  {clientData.recoveryGoals?.filter(g => g.status === 'completed').length || 0}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Goals:</span>
                <span className={styles.infoValue}>
                  {clientData.recoveryGoals?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Goals List (Read-only) */}
        {clientData.recoveryGoals && clientData.recoveryGoals.length > 0 && (
          <div className={styles.goalsSection}>
            <h4 className={styles.sectionTitle}>Your Recovery Goals</h4>
            <div className={styles.goalsList}>
              {clientData.recoveryGoals.map((goal) => (
                <div key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalCardHeader}>
                    <div className={styles.goalCardText}>
                      <div className={styles.goalTitle}>{goal.goal}</div>
                      <div className={styles.goalMeta}>
                        Created: {new Date(goal.created_at).toLocaleDateString()}
                        {goal.target_date && (
                          <> • Target: {new Date(goal.target_date).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div className={`${styles.goalStatusBadge} ${styles['status' + goal.status]}`}>
                      {goal.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery preferences */}
        {(clientData.wantRecoverySupport || clientData.comfortableDiscussing || clientData.attendMeetingsTogether) && (
          <div className={styles.preferencesSection}>
            <h5 className={styles.preferencesTitle}>Recovery Preferences</h5>
            <div className={styles.preferencesTags}>
              {clientData.wantRecoverySupport && (
                <span className={styles.preferenceTag}>Wants Recovery Support</span>
              )}
              {clientData.comfortableDiscussing && (
                <span className={styles.preferenceTag}>Comfortable Discussing Recovery</span>
              )}
              {clientData.attendMeetingsTogether && (
                <span className={styles.preferenceTag}>Attend Meetings Together</span>
              )}
              {clientData.recoveryAccountability && (
                <span className={styles.preferenceTag}>Recovery Accountability</span>
              )}
              {clientData.mentorshipInterest && (
                <span className={styles.preferenceTag}>Mentorship Interest</span>
              )}
            </div>
          </div>
        )}

        {/* Recovery context */}
        {clientData.recoveryContext && (
          <div className={styles.contextSection}>
            <h5 className={styles.contextTitle}>Recovery Context</h5>
            <p className={styles.contextText}>{clientData.recoveryContext}</p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render History Tab
   */
  const renderHistory = () => {
    return (
      <div className={styles.tabContent}>
        <div className={styles.historySection}>
          <h4>Session History</h4>
          
          {/* Session Stats */}
          <div className={styles.historyStats}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{clientData.totalSessions || 0}</div>
              <div className={styles.statLabel}>Total Sessions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {clientData.last_session_date 
                  ? new Date(clientData.last_session_date).toLocaleDateString()
                  : 'No sessions'
                }
              </div>
              <div className={styles.statLabel}>Last Session</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {clientData.nextFollowup 
                  ? new Date(clientData.nextFollowup).toLocaleDateString()
                  : 'Not scheduled'
                }
              </div>
              <div className={styles.statLabel}>Next Follow-up</div>
            </div>
          </div>

          {/* Session Timeline */}
          {clientData.progress_notes && clientData.progress_notes.length > 0 ? (
            <div className={styles.sessionsTimeline}>
              {clientData.progress_notes
                .sort((a, b) => new Date(b.created_at || b.session_time) - new Date(a.created_at || a.session_time))
                .map((session, index) => {
                  const sessionDate = new Date(session.created_at || session.session_time);
                  const isRecent = (Date.now() - sessionDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <div key={session.id || index} className={`${styles.sessionCard} ${isRecent ? styles.recentSession : ''}`}>
                      <div className={styles.sessionHeader}>
                        <div className={styles.sessionMeta}>
                          <span className={styles.sessionDate}>
                            {sessionDate.toLocaleDateString()}
                          </span>
                          <span className={styles.sessionTime}>
                            {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {session.session_type && (
                            <span className={styles.sessionType}>
                              {session.session_type.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                          {session.duration_minutes && (
                            <span className={styles.sessionDuration}>
                              {session.duration_minutes} min
                            </span>
                          )}
                        </div>
                        
                        {session.client_mood && (
                          <div className={`${styles.moodBadge} ${getMoodBadgeClass(session.client_mood)}`}>
                            {session.client_mood}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.sessionContent}>
                        <div className={styles.sessionNotes}>
                          {session.notes || 'No notes recorded'}
                        </div>
                        
                        {session.follow_up_scheduled && (
                          <div className={styles.sessionFollowup}>
                            Follow-up scheduled: {new Date(session.follow_up_scheduled).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {isRecent && (
                        <div className={styles.recentBadge}>Recent</div>
                      )}
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📝</div>
              <h4>No Session History</h4>
              <p>Your peer support specialist hasn't logged any sessions yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Purple Gradient Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h3 className={styles.modalTitle}>My Recovery Progress</h3>
            <div className={styles.modalSubtitle}>
              Tracked by your peer support specialist • {clientData.totalSessions || 0} sessions
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.modalTabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className={styles.tabIcon}>👤</span>
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className={styles.tabIcon}>📋</span>
            History ({(clientData.progress_notes || []).length})
          </button>
        </div>

        {/* Dynamic Content */}
        <div className={styles.modalBody}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </div>
    </div>
  );
};

export default ClientSelfViewModal;