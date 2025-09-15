// src/components/Settings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import '../styles/global.css';

const Settings = () => {
  const { user, profile, updateProfile, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy');
  const [successMessage, setSuccessMessage] = useState('');
  const [userSettings, setUserSettings] = useState(null);

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'active_users', // 'public', 'active_users', 'matches_only', 'private'
    allowMatchRequests: true,
    allowPeerSupportRequests: true,
    allowEmploymentInquiries: true,
    allowPropertyInquiries: true,
    showAge: true,
    showLocation: true,
    showRecoveryStage: true,
    showRecoveryMethods: false,
    showContactInfo: false,
    appearInSearch: true,
    allowMessages: true
  });

  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Communication Preferences State
  const [communicationSettings, setCommunicationSettings] = useState({
    emailNotifications: true,
    matchRequestNotifications: true,
    messageNotifications: true,
    propertyUpdateNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
    smsNotifications: false,
    phoneNumber: ''
  });

  // Load settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, [user, profile]);

  /**
   * Load user settings from database and profile
   */
  const loadUserSettings = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      // Load basic account info from profile
      setAccountSettings({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setCommunicationSettings(prev => ({
        ...prev,
        phoneNumber: profile.phone || ''
      }));

      // TODO: Load privacy and communication settings from user_settings table
      // For now, using defaults with some profile-based logic
      setPrivacySettings(prev => ({
        ...prev,
        // If user has completed profiles, show more info by default
        showRecoveryStage: !!profile.roles?.includes('applicant'),
        allowPeerSupportRequests: !!profile.roles?.includes('applicant'),
        allowEmploymentInquiries: !!profile.roles?.includes('applicant'),
        allowPropertyInquiries: !!profile.roles?.includes('applicant') || !!profile.roles?.includes('landlord')
      }));

      console.log('✅ Settings loaded for user:', user.id);
    } catch (err) {
      console.error('💥 Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save privacy settings
   */
  const savePrivacySettings = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      // Update profile with privacy preferences
      const updates = {
        privacy_settings: privacySettings,
        updated_at: new Date().toISOString()
      };

      const result = await updateProfile(updates);
      
      if (result.success) {
        setSuccessMessage('Privacy settings saved successfully!');
        console.log('✅ Privacy settings saved');
      } else {
        throw new Error(result.error || 'Failed to save privacy settings');
      }
    } catch (err) {
      console.error('💥 Error saving privacy settings:', err);
      alert(`Failed to save privacy settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Save account settings
   */
  const saveAccountSettings = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      // Validate password change if attempting
      if (accountSettings.newPassword) {
        if (!accountSettings.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        if (accountSettings.newPassword !== accountSettings.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (accountSettings.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long');
        }
      }

      // Update basic profile information
      const updates = {
        first_name: accountSettings.firstName,
        last_name: accountSettings.lastName,
        phone: accountSettings.phone,
        updated_at: new Date().toISOString()
      };

      const result = await updateProfile(updates);
      
      if (result.success) {
        setSuccessMessage('Account settings saved successfully!');
        
        // Clear password fields
        setAccountSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        console.log('✅ Account settings saved');
      } else {
        throw new Error(result.error || 'Failed to save account settings');
      }

      // TODO: Handle password change via Supabase auth
      if (accountSettings.newPassword) {
        console.log('🔑 Password change would be handled here via Supabase auth');
        // await supabase.auth.updateUser({ password: accountSettings.newPassword });
      }

    } catch (err) {
      console.error('💥 Error saving account settings:', err);
      alert(`Failed to save account settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Save communication settings
   */
  const saveCommunicationSettings = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      const updates = {
        communication_preferences: communicationSettings,
        phone: communicationSettings.phoneNumber,
        updated_at: new Date().toISOString()
      };

      const result = await updateProfile(updates);
      
      if (result.success) {
        setSuccessMessage('Communication preferences saved successfully!');
        console.log('✅ Communication settings saved');
      } else {
        throw new Error(result.error || 'Failed to save communication settings');
      }
    } catch (err) {
      console.error('💥 Error saving communication settings:', err);
      alert(`Failed to save communication settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle account deactivation
   */
  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate your account? This will hide your profile from searches and disable matching. You can reactivate anytime by signing back in.'
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      
      const updates = {
        is_active: false,
        deactivated_at: new Date().toISOString()
      };

      await updateProfile(updates);
      alert('Account deactivated successfully. You will be signed out.');
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('💥 Error deactivating account:', err);
      alert('Failed to deactivate account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Type "DELETE" to confirm.'
    );

    if (!confirmed) return;

    const deleteConfirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (deleteConfirmation !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    try {
      setSaving(true);
      
      // TODO: Implement account deletion logic
      console.log('🗑️ Account deletion would be handled here');
      alert('Account deletion feature coming soon. Please contact support for assistance.');
      
    } catch (err) {
      console.error('💥 Error deleting account:', err);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Export user data
   */
  const handleExportData = async () => {
    try {
      setSaving(true);
      
      // TODO: Implement data export
      console.log('📤 Data export would be handled here');
      alert('Data export feature coming soon. Please contact support for assistance.');
      
    } catch (err) {
      console.error('💥 Error exporting data:', err);
      alert('Failed to export data. Please contact support.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'communication', label: 'Communication', icon: '📧' },
    { id: 'data', label: 'Data & Security', icon: '🛡️' }
  ];

  if (loading) {
    return (
      <div className="content">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <div className="loading-text">Loading your settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="text-center mb-5">
        <h1 className="welcome-title">Account Settings</h1>
        <p className="welcome-text">
          Manage your privacy, account information, and communication preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success mb-4">
          {successMessage}
        </div>
      )}

      {/* Settings Navigation */}
      <div className="card mb-5">
        <nav className="navigation">
          <ul className="nav-list">
            {tabs.map(tab => (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Privacy Settings Tab */}
      {activeTab === 'privacy' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔒 Privacy Settings</h3>
            <p className="card-subtitle">Control who can see your information and contact you</p>
          </div>

          {/* Profile Visibility */}
          <div className="form-group">
            <label className="label">Profile Visibility</label>
            <select
              className="input"
              value={privacySettings.profileVisibility}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
            >
              <option value="public">Public - Anyone can see my profile</option>
              <option value="active_users">Active Users - Only registered users can see my profile</option>
              <option value="matches_only">Matches Only - Only my matches can see my profile</option>
              <option value="private">Private - Hide my profile from searches</option>
            </select>
          </div>

          {/* Contact Permissions */}
          <div className="form-group">
            <label className="label">Who can contact me?</label>
            <div className="grid-2">
              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, allowMatchRequests: !prev.allowMatchRequests }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.allowMatchRequests}
                  onChange={() => {}}
                />
                <span>Allow roommate match requests</span>
              </div>

              {hasRole('applicant') && (
                <>
                  <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, allowPeerSupportRequests: !prev.allowPeerSupportRequests }))}>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowPeerSupportRequests}
                      onChange={() => {}}
                    />
                    <span>Allow peer support requests</span>
                  </div>

                  <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, allowEmploymentInquiries: !prev.allowEmploymentInquiries }))}>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowEmploymentInquiries}
                      onChange={() => {}}
                    />
                    <span>Allow employment inquiries</span>
                  </div>
                </>
              )}

              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, allowPropertyInquiries: !prev.allowPropertyInquiries }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.allowPropertyInquiries}
                  onChange={() => {}}
                />
                <span>Allow property inquiries</span>
              </div>
            </div>
          </div>

          {/* Information Visibility */}
          <div className="form-group">
            <label className="label">Information visible to matches</label>
            <div className="grid-2">
              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, showAge: !prev.showAge }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.showAge}
                  onChange={() => {}}
                />
                <span>Show my age</span>
              </div>

              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, showLocation: !prev.showLocation }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.showLocation}
                  onChange={() => {}}
                />
                <span>Show my location</span>
              </div>

              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, showRecoveryStage: !prev.showRecoveryStage }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.showRecoveryStage}
                  onChange={() => {}}
                />
                <span>Show my recovery stage</span>
              </div>

              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, showRecoveryMethods: !prev.showRecoveryMethods }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.showRecoveryMethods}
                  onChange={() => {}}
                />
                <span>Show my recovery methods</span>
              </div>

              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, showContactInfo: !prev.showContactInfo }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.showContactInfo}
                  onChange={() => {}}
                />
                <span>Show my contact information</span>
              </div>

              <div className="checkbox-item" onClick={() => setPrivacySettings(prev => ({ ...prev, appearInSearch: !prev.appearInSearch }))}>
                <input
                  type="checkbox"
                  checked={privacySettings.appearInSearch}
                  onChange={() => {}}
                />
                <span>Appear in search results</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              className="btn btn-primary"
              onClick={savePrivacySettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Account Settings Tab */}
      {activeTab === 'account' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👤 Account Information</h3>
            <p className="card-subtitle">Update your basic account details</p>
          </div>

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">First Name</label>
              <input
                className="input"
                type="text"
                value={accountSettings.firstName}
                onChange={(e) => setAccountSettings(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label className="label">Last Name</label>
              <input
                className="input"
                type="text"
                value={accountSettings.lastName}
                onChange={(e) => setAccountSettings(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={accountSettings.email}
              disabled
              style={{ backgroundColor: 'var(--bg-light-cream)', color: 'var(--gray-600)' }}
            />
            <small className="text-gray-600">Email cannot be changed. Contact support if needed.</small>
          </div>

          <div className="form-group">
            <label className="label">Phone Number</label>
            <input
              className="input"
              type="tel"
              value={accountSettings.phone}
              onChange={(e) => setAccountSettings(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Password Change Section */}
          <div className="card mt-4" style={{ background: 'var(--bg-light-cream)' }}>
            <h4 className="card-title">Change Password</h4>
            
            <div className="form-group">
              <label className="label">Current Password</label>
              <input
                className="input"
                type="password"
                value={accountSettings.currentPassword}
                onChange={(e) => setAccountSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">New Password</label>
                <input
                  className="input"
                  type="password"
                  value={accountSettings.newPassword}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label className="label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  value={accountSettings.confirmPassword}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              className="btn btn-primary"
              onClick={saveAccountSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Account Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Communication Settings Tab */}
      {activeTab === 'communication' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📧 Communication Preferences</h3>
            <p className="card-subtitle">Choose how you want to receive notifications</p>
          </div>

          <div className="form-group">
            <label className="label">Email Notifications</label>
            <div className="grid-2">
              <div className="checkbox-item" onClick={() => setCommunicationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}>
                <input
                  type="checkbox"
                  checked={communicationSettings.emailNotifications}
                  onChange={() => {}}
                />
                <span>Enable email notifications</span>
              </div>

              <div className="checkbox-item" onClick={() => setCommunicationSettings(prev => ({ ...prev, matchRequestNotifications: !prev.matchRequestNotifications }))}>
                <input
                  type="checkbox"
                  checked={communicationSettings.matchRequestNotifications}
                  onChange={() => {}}
                />
                <span>Match request notifications</span>
              </div>

              <div className="checkbox-item" onClick={() => setCommunicationSettings(prev => ({ ...prev, messageNotifications: !prev.messageNotifications }))}>
                <input
                  type="checkbox"
                  checked={communicationSettings.messageNotifications}
                  onChange={() => {}}
                />
                <span>Message notifications</span>
              </div>

              <div className="checkbox-item" onClick={() => setCommunicationSettings(prev => ({ ...prev, propertyUpdateNotifications: !prev.propertyUpdateNotifications }))}>
                <input
                  type="checkbox"
                  checked={communicationSettings.propertyUpdateNotifications}
                  onChange={() => {}}
                />
                <span>Property update notifications</span>
              </div>

              <div className="checkbox-item" onClick={() => setCommunicationSettings(prev => ({ ...prev, weeklyDigest: !prev.weeklyDigest }))}>
                <input
                  type="checkbox"
                  checked={communicationSettings.weeklyDigest}
                  onChange={() => {}}
                />
                <span>Weekly digest emails</span>
              </div>

              <div className="checkbox-item" onClick={() => setCommunicationSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}>
                <input
                  type="checkbox"
                  checked={communicationSettings.marketingEmails}
                  onChange={() => {}}
                />
                <span>Marketing and promotional emails</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">SMS Notifications (Coming Soon)</label>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  type="tel"
                  value={communicationSettings.phoneNumber}
                  onChange={(e) => setCommunicationSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  checked={communicationSettings.smsNotifications}
                  onChange={(e) => setCommunicationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                  disabled
                />
                <span>Enable SMS notifications (Coming Soon)</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              className="btn btn-primary"
              onClick={saveCommunicationSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Communication Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Data & Security Tab */}
      {activeTab === 'data' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🛡️ Data & Security</h3>
            <p className="card-subtitle">Manage your data and account security</p>
          </div>

          {/* Data Export */}
          <div className="card mb-4" style={{ background: 'var(--bg-light-cream)' }}>
            <h4 className="card-title">Export Your Data</h4>
            <p className="card-text">
              Download a copy of all your data including profile information, messages, and match history.
            </p>
            <button
              className="btn btn-outline"
              onClick={handleExportData}
              disabled={saving}
            >
              {saving ? 'Preparing Export...' : 'Export My Data'}
            </button>
          </div>

          {/* Account Actions */}
          <div className="card mb-4" style={{ background: '#fff9f9' }}>
            <h4 className="card-title">Account Actions</h4>
            
            <div className="mb-4">
              <h5 className="text-warning">Deactivate Account</h5>
              <p className="card-text">
                Temporarily hide your profile from searches and disable matching. You can reactivate anytime.
              </p>
              <button
                className="btn btn-outline"
                onClick={handleDeactivateAccount}
                disabled={saving}
              >
                Deactivate Account
              </button>
            </div>

            <div className="mb-4">
              <h5 className="text-error">Delete Account</h5>
              <p className="card-text">
                <strong>Permanently delete</strong> your account and all associated data. This action cannot be undone.
              </p>
              <button
                className="btn btn-outline"
                onClick={handleDeleteAccount}
                disabled={saving}
                style={{ color: 'var(--coral)', borderColor: 'var(--coral)' }}
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Security Tips */}
          <div className="card" style={{ background: 'var(--bg-light-cream)' }}>
            <h4 className="card-title">Security Tips</h4>
            <ul className="text-sm">
              <li>Use a strong, unique password for your account</li>
              <li>Never share your login credentials with others</li>
              <li>Be cautious when sharing personal information</li>
              <li>Report any suspicious activity to our support team</li>
              <li>Regularly review your privacy settings</li>
            </ul>
          </div>
        </div>
      )}

      {/* Back to Dashboard */}
      <div className="text-center mt-5">
        <button
          className="btn btn-outline"
          onClick={() => navigate('/app')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Settings;