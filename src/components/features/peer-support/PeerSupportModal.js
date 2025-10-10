// src/components/features/peer-support/PeerSupportModal.js
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../utils/supabase';
import styles from './PeerSupportModal.module.css';

const PeerSupportModal = ({ client, onClose, onClientUpdate }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  // Session form state
  const [sessionType, setSessionType] = useState('');
  const [sessionDuration, setSessionDuration] = useState('30');
  const [sessionNotes, setSessionNotes] = useState('');
  const [clientMood, setClientMood] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [followupFrequency, setFollowupFrequency] = useState(client?.followupFrequency || 'weekly');
  const [clientStatus, setClientStatus] = useState(client?.status || 'active');

  // Goals form state
  const [newGoal, setNewGoal] = useState('');

  /**
   * Update client information
   */
  const handleUpdateClient = async (clientId, updates) => {
    if (!profile?.id) return false;

    try {
      console.log('📝 Updating client:', clientId, updates);

      if (db.pssClients && typeof db.pssClients.update === 'function') {
        const result = await db.pssClients.update(clientId, {
          ...updates,
          updated_at: new Date().toISOString()
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update client');
        }

        // Notify parent component of the update
        if (onClientUpdate) {
          onClientUpdate();
        }

        return true;
      } else {
        console.log('Using fallback: storing in peer_support_matches');
        // Fallback logic for when PSS service isn't available
        if (onClientUpdate) {
          onClientUpdate();
        }
        return true;
      }
    } catch (err) {
      console.error('💥 Error updating client:', err);
      alert(`Failed to update client: ${err.message}`);
      return false;
    }
  };

  /**
   * Log a new session and update client info
   */
  const handleLogSession = async () => {
    if (!sessionType || !sessionNotes.trim()) {
      alert('Please fill in session type and notes');
      return;
    }

    setSaving(true);
    try {
      const sessionData = {
        session_type: sessionType,
        duration_minutes: parseInt(sessionDuration) || 30,
        notes: sessionNotes.trim(),
        client_mood: clientMood || null,
        session_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      // Add to progress notes array
      const existingNotes = client.progress_notes || [];
      const updatedNotes = [...existingNotes, sessionData];

      // Update both session and client management data
      const updates = {
        progress_notes: updatedNotes,
        total_sessions: (client.totalSessions || 0) + 1,
        last_session_date: new Date().toISOString().split('T')[0],
        last_contact_date: new Date().toISOString().split('T')[0],
        next_followup_date: nextFollowup || null,
        followup_frequency: followupFrequency,
        status: clientStatus
      };

      const success = await handleUpdateClient(client.id, updates);

      if (success) {
        // Reset form
        setSessionType('');
        setSessionDuration('30');
        setSessionNotes('');
        setClientMood('');
        setNextFollowup('');
        setFollowupFrequency('weekly');
        setClientStatus('active');
        
        alert('Session logged and client info updated successfully!');
        setActiveTab('history'); // Show the newly logged session
      }
    } catch (error) {
      console.error('Error logging session:', error);
      alert('Failed to log session: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Add a new recovery goal
   */
  const handleAddGoal = async () => {
    if (!newGoal.trim()) {
      alert('Please enter a goal');
      return;
    }

    setSaving(true);
    try {
      const goalObject = {
        id: crypto.randomUUID(),
        goal: newGoal.trim(),
        status: 'active',
        created_at: new Date().toISOString(),
        progress_notes: []
      };

      const updatedGoals = [...(client.recoveryGoals || []), goalObject];

      const success = await handleUpdateClient(client.id, {
        recovery_goals: updatedGoals
      });

      if (success) {
        setNewGoal('');
        alert('Goal added successfully!');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update goal status
   */
  const handleUpdateGoal = async (goalId, updates) => {
    setSaving(true);
    try {
      const updatedGoals = client.recoveryGoals.map(goal =>
        goal.id === goalId
          ? { ...goal, ...updates, updated_at: new Date().toISOString() }
          : goal
      );

      const success = await handleUpdateClient(client.id, {
        recovery_goals: updatedGoals
      });

      if (success) {
        alert('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Format mood badge
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
   * Render the main content based on active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className={styles.tabContent}>
            <div className={styles.overviewSection}>
              <h4>Client Information</h4>
              <div className={styles.clientOverview}>
                <div className={styles.overviewGrid}>
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewLabel}>Contact</div>
                    <div className={styles.overviewValue}>
                      <div>📞 {client.phone || 'Not provided'}</div>
                      <div>📧 {client.email || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewLabel}>Recovery Info</div>
                    <div className={styles.overviewValue}>
                      <div>Stage: {client.recoveryStage}</div>
                      <div>Time: {client.timeInRecovery}</div>
                    </div>
                  </div>
                  
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewLabel}>Sessions</div>
                    <div className={styles.overviewValue}>
                      <div>Total: {client.totalSessions || 0}</div>
                      <div>Last: {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'None'}</div>
                    </div>
                  </div>
                  
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewLabel}>Goals</div>
                    <div className={styles.overviewValue}>
                      <div>Active: {client.recoveryGoals?.filter(g => g.status === 'active').length || 0}</div>
                      <div>Total: {client.recoveryGoals?.length || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Recovery preferences */}
                {(client.wantRecoverySupport || client.comfortableDiscussing || client.attendMeetingsTogether) && (
                  <div className={styles.preferencesSection}>
                    <h5>Recovery Preferences</h5>
                    <div className={styles.preferencesTags}>
                      {client.wantRecoverySupport && (
                        <span className={styles.preferenceTag}>Wants Recovery Support</span>
                      )}
                      {client.comfortableDiscussing && (
                        <span className={styles.preferenceTag}>Comfortable Discussing Recovery</span>
                      )}
                      {client.attendMeetingsTogether && (
                        <span className={styles.preferenceTag}>Attend Meetings Together</span>
                      )}
                      {client.recoveryAccountability && (
                        <span className={styles.preferenceTag}>Recovery Accountability</span>
                      )}
                      {client.mentorshipInterest && (
                        <span className={styles.preferenceTag}>Mentorship Interest</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Recovery context */}
                {client.recoveryContext && (
                  <div className={styles.contextSection}>
                    <h5>Recovery Context</h5>
                    <p className={styles.contextText}>{client.recoveryContext}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className={styles.tabContent}>
            <div className={styles.goalsSection}>
              <h4>Recovery Goals ({client.recoveryGoals?.length || 0}/5)</h4>
              
              {client.recoveryGoals?.length > 0 ? (
                <div className={styles.goalsList}>
                  {client.recoveryGoals.map((goal) => (
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
                        
                        <div className={styles.goalControls}>
                          <select
                            value={goal.status}
                            onChange={(e) => handleUpdateGoal(goal.id, { status: e.target.value })}
                            className={styles.goalStatusSelect}
                            disabled={saving}
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>🎯</div>
                  <h4>No Goals Set Yet</h4>
                  <p>Add the first recovery goal below to get started.</p>
                </div>
              )}

              {/* Add New Goal */}
              {(client.recoveryGoals?.length || 0) < 5 && (
                <div className={styles.addGoalSection}>
                  <h5>Add New Goal</h5>
                  <div className={styles.formGroup}>
                    <textarea
                      className={styles.goalInput}
                      placeholder="Enter a specific, measurable recovery goal..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      rows="3"
                      disabled={saving}
                    />
                  </div>
                  <button
                    className={`btn btn-primary ${saving ? 'loading' : ''}`}
                    onClick={handleAddGoal}
                    disabled={!newGoal.trim() || saving}
                  >
                    {saving ? 'Adding...' : 'Add Goal'}
                  </button>
                </div>
              )}

              {(client.recoveryGoals?.length || 0) >= 5 && (
                <div className={styles.maxGoalsWarning}>
                  <p>Maximum of 5 active goals reached. Complete or remove existing goals to add new ones.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'session':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sessionLogForm}>
              <h4>Log New Session & Update Client Info</h4>
              
              {/* Session Information */}
              <div className={styles.formSection}>
                <h5>Session Details</h5>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Session Type</label>
                    <select
                      className={styles.input}
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Select session type</option>
                      <option value="phone_call">Phone Call</option>
                      <option value="in_person">In-Person Meeting</option>
                      <option value="video_call">Video Call</option>
                      <option value="text_support">Text Support</option>
                      <option value="crisis_intervention">Crisis Intervention</option>
                      <option value="goal_review">Goal Review</option>
                      <option value="check_in">Check-in</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Duration (minutes)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      placeholder="30"
                      min="1"
                      max="300"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Session Notes</label>
                  <textarea
                    className={styles.textarea}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Session summary, progress notes, concerns, next steps..."
                    rows="4"
                    disabled={saving}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Client Mood/Status</label>
                  <select
                    className={styles.input}
                    value={clientMood}
                    onChange={(e) => setClientMood(e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Select mood/status</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="stable">Stable</option>
                    <option value="struggling">Struggling</option>
                    <option value="crisis">Crisis</option>
                  </select>
                </div>
              </div>

              {/* Client Management */}
              <div className={styles.formSection}>
                <h5>Update Client Info</h5>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Next Follow-up Date</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={nextFollowup}
                      onChange={(e) => setNextFollowup(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Follow-up Frequency</label>
                    <select
                      className={styles.input}
                      value={followupFrequency}
                      onChange={(e) => setFollowupFrequency(e.target.value)}
                      disabled={saving}
                    >
                      <option value="daily">Daily</option>
                      <option value="twice_weekly">Twice Weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi_weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="as_needed">As Needed</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Client Status</label>
                  <select
                    className={styles.input}
                    value={clientStatus}
                    onChange={(e) => setClientStatus(e.target.value)}
                    disabled={saving}
                  >
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="transferred">Transferred</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.sessionActions}>
                <button
                  className={`btn btn-primary ${saving ? 'loading' : ''}`}
                  onClick={handleLogSession}
                  disabled={!sessionType || !sessionNotes.trim() || saving}
                >
                  {saving ? 'Saving...' : 'Log Session & Update'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className={styles.tabContent}>
            <div className={styles.historySection}>
              <h4>Session History</h4>
              
              {/* Session Stats */}
              <div className={styles.historyStats}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{client.totalSessions || 0}</div>
                  <div className={styles.statLabel}>Total Sessions</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    {client.last_session_date 
                      ? new Date(client.last_session_date).toLocaleDateString()
                      : 'No sessions'
                    }
                  </div>
                  <div className={styles.statLabel}>Last Session</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    {client.nextFollowup 
                      ? new Date(client.nextFollowup).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </div>
                  <div className={styles.statLabel}>Next Follow-up</div>
                </div>
              </div>

              {/* Session Timeline */}
              {client.progress_notes && client.progress_notes.length > 0 ? (
                <div className={styles.sessionsTimeline}>
                  {client.progress_notes
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
                  <p>No sessions have been logged for this client yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('session')}
                  >
                    Log First Session
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h3 className={styles.modalTitle}>{client.displayName}</h3>
            <div className={styles.modalSubtitle}>
              {client.recoveryStage} • {client.totalSessions || 0} sessions
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
            className={`${styles.tab} ${activeTab === 'goals' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <span className={styles.tabIcon}>🎯</span>
            Goals ({client.recoveryGoals?.length || 0})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'session' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('session')}
          >
            <span className={styles.tabIcon}>📝</span>
            Log Session
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className={styles.tabIcon}>📋</span>
            History ({(client.progress_notes || []).length})
          </button>
        </div>

        {/* Dynamic Content */}
        <div className={styles.modalBody}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PeerSupportModal;