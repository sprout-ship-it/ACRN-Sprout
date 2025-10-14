// src/components/features/employer/EmployerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './EmployerDashboard.module.css';

const EmployerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [insights, setInsights] = useState({
    totalFavorites: 0,
    totalActiveConnections: 0,
    recentActivity: []
  });
  const [updatingToggle, setUpdatingToggle] = useState(null);

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData();
    }
  }, [profile?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load user's employer profiles
      const { data: companiesData, error: companiesError } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      // Load connection insights
      if (companiesData && companiesData.length > 0) {
        await loadConnectionInsights(companiesData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionInsights = async (companiesData) => {
    try {
      // Get all employer profile IDs for this user
      const employerIds = companiesData.map(c => c.id);

      // Count favorites (employer_favorites table uses user_id not employer_profile id)
      // We need to count favorites where employer_user_id matches our user_id
      const { data: favoritesData, error: favError } = await supabase
        .from('employer_favorites')
        .select('id, user_id, created_at, registrant_profiles!employer_favorites_user_id_fkey(first_name, last_name)')
        .eq('employer_user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (favError) console.warn('Error loading favorites:', favError);

      // Count active employment matches
      const { data: connectionsData, error: connError } = await supabase
        .from('employment_matches')
        .select('id, applicant_id, created_at, applicant_matching_profiles!employment_matches_applicant_id_fkey(user_id, registrant_profiles!applicant_matching_profiles_user_id_fkey(first_name, last_name))')
        .in('employer_id', employerIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (connError) console.warn('Error loading connections:', connError);

      // Combine recent activity
      const recentActivity = [];
      
      if (favoritesData) {
        favoritesData.slice(0, 3).forEach(fav => {
          recentActivity.push({
            type: 'favorite',
            name: `${fav.registrant_profiles?.first_name || 'User'} ${fav.registrant_profiles?.last_name?.charAt(0) || ''}.`,
            date: fav.created_at
          });
        });
      }

      if (connectionsData) {
        connectionsData.slice(0, 3).forEach(conn => {
          recentActivity.push({
            type: 'connection',
            name: `${conn.applicant_matching_profiles?.registrant_profiles?.first_name || 'User'} ${conn.applicant_matching_profiles?.registrant_profiles?.last_name?.charAt(0) || ''}.`,
            date: conn.created_at
          });
        });
      }

      // Sort by date and take top 5
      recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

      setInsights({
        totalFavorites: favoritesData?.length || 0,
        totalActiveConnections: connectionsData?.length || 0,
        recentActivity: recentActivity.slice(0, 5)
      });
    } catch (err) {
      console.error('Error loading insights:', err);
    }
  };

  const handleToggleHiring = async (companyId, currentStatus) => {
    setUpdatingToggle(companyId);

    try {
      const { error } = await supabase
        .from('employer_profiles')
        .update({ 
          is_actively_hiring: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, is_actively_hiring: !currentStatus }
          : company
      ));
    } catch (err) {
      console.error('Error toggling hiring status:', err);
      alert('Failed to update hiring status. Please try again.');
    } finally {
      setUpdatingToggle(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return '1d ago';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="content">
        <div className="text-center" style={{ padding: '4rem' }}>
          <LoadingSpinner size="large" text="Loading your employer dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="alert alert-danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={loadDashboardData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1 className="welcome-title">Welcome, {profile?.first_name}!</h1>
        <p className="welcome-text">
          <strong>Your Role:</strong> Recovery-Friendly Employer 💼
        </p>
      </div>

      {/* Quick Actions */}
      <div className={`card ${styles.quickActionsCard}`}>
        <div className={styles.quickActionsHeader}>
          <h3 className="card-title">🚀 Quick Actions</h3>
        </div>
        <div className={styles.quickActionsGrid}>
          <button
            className={`btn ${styles.btnCoral}`}
            onClick={() => navigate('/app/employers')}
          >
            ➕ Add New Company
          </button>
          <button
            className={`btn ${styles.btnCoralOutline}`}
            onClick={() => navigate('/app/employers')}
          >
            ✏️ Manage Companies
          </button>
          <button
            className={`btn ${styles.btnCoralOutline}`}
            onClick={() => navigate('/app/connection-hub')}
          >
            🤝 View Connections
          </button>
        </div>
      </div>

      {/* Companies Overview */}
      <div className="card">
        <div className="card-header mb-4">
          <h3 className="card-title">
            My Companies ({companies.length})
          </h3>
        </div>

        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3 className="empty-state-title">No Companies Yet</h3>
            <p>Add your first company profile to start connecting with job seekers in recovery.</p>
            <button
              className={`btn ${styles.btnCoral}`}
              onClick={() => navigate('/app/employers')}
            >
              Add Company Profile
            </button>
          </div>
        ) : (
          <div className="grid-auto">
            {companies.map(company => (
              <div key={company.id} className={`card ${styles.companyCard}`}>
                <div className={styles.companyCardHeader}>
                  <div>
                    <h4 className={styles.companyName}>{company.company_name}</h4>
                    <p className={styles.companyLocation}>
                      {company.industry} • {company.city}, {company.state}
                    </p>
                  </div>
                  <span className={`badge ${company.is_actively_hiring ? 'badge-success' : styles.badgeCoral}`}>
                    {company.is_actively_hiring ? '🟢 Hiring' : '⏸️ Not Hiring'}
                  </span>
                </div>

                <div className={styles.companyStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {company.job_types_available?.length || 0}
                    </span>
                    <span className={styles.statLabel}>Job Types</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {company.recovery_friendly_features?.length || 0}
                    </span>
                    <span className={styles.statLabel}>Features</span>
                  </div>
                </div>

                {/* Hiring Toggle */}
                <div className={styles.hiringToggleSection}>
                  <label className={styles.toggleLabel}>
                    <span>Actively Hiring</span>
                    <button
                      className={`${styles.toggleButton} ${company.is_actively_hiring ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => handleToggleHiring(company.id, company.is_actively_hiring)}
                      disabled={updatingToggle === company.id}
                    >
                      <span className={styles.toggleSlider}></span>
                    </button>
                  </label>
                </div>

                <div className={styles.companyActions}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/app/employers')}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Insights */}
      {companies.length > 0 && (
        <div className={`card ${styles.insightsCard}`}>
          <div className="card-header mb-4">
            <h3 className="card-title">📊 Connection Insights</h3>
          </div>

          <div className={styles.insightsGrid}>
            <div className={styles.insightStat}>
              <div className={styles.insightValue}>{insights.totalFavorites}</div>
              <div className={styles.insightLabel}>Total Favorites</div>
            </div>
            <div className={styles.insightStat}>
              <div className={styles.insightValue}>{insights.totalActiveConnections}</div>
              <div className={styles.insightLabel}>Active Connections</div>
            </div>
          </div>

          {insights.recentActivity.length > 0 && (
            <div className={styles.recentActivity}>
              <h4 className={styles.activityTitle}>Recent Activity</h4>
              <div className={styles.activityList}>
                {insights.recentActivity.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <span className={styles.activityIcon}>
                      {activity.type === 'favorite' ? '❤️' : '🤝'}
                    </span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>{activity.name}</strong> {activity.type === 'favorite' ? 'saved your company' : 'connected with you'}
                      </span>
                      <span className={styles.activityTime}>{formatTimeAgo(activity.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <button
              className={`btn ${styles.btnCoralOutline}`}
              onClick={() => navigate('/app/connection-hub')}
            >
              View All in Connection Hub →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;