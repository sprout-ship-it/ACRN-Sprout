// src/components/features/peer-support/ClientProfileModal.js
import React, { useState } from 'react';
import MatchCard from '../matching/components/MatchCard';
import styles from './ClientProfileModal.module.css';

const ClientProfileModal = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!client || !client.applicantProfile) {
    return null;
  }

  /**
   * Transform client data into MatchCard format
   */
  const transformClientForMatchCard = () => {
    const applicant = client.applicantProfile;
    const profile = client.profile;

    return {
      // Basic info from registrant_profiles
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,

      // All fields from applicant_matching_profiles
      date_of_birth: applicant.date_of_birth,
      primary_phone: applicant.primary_phone,
      gender_identity: applicant.gender_identity,
      biological_sex: applicant.biological_sex,
      preferred_roommate_gender: applicant.preferred_roommate_gender,
      gender_inclusive: applicant.gender_inclusive,
      
      // Location
      primary_city: applicant.primary_city,
      primary_state: applicant.primary_state,
      primary_location: applicant.primary_location,
      current_address: applicant.current_address,
      current_city: applicant.current_city,
      current_state: applicant.current_state,
      current_zip_code: applicant.current_zip_code,
      target_zip_codes: applicant.target_zip_codes,
      search_radius_miles: applicant.search_radius_miles,
      location_flexibility: applicant.location_flexibility,
      max_commute_minutes: applicant.max_commute_minutes,
      transportation_method: applicant.transportation_method,

      // Budget & Housing
      budget_min: applicant.budget_min,
      budget_max: applicant.budget_max,
      housing_assistance: applicant.housing_assistance,
      has_section8: applicant.has_section8,
      housing_types_accepted: applicant.housing_types_accepted,
      preferred_bedrooms: applicant.preferred_bedrooms,
      furnished_preference: applicant.furnished_preference,
      utilities_included_preference: applicant.utilities_included_preference,
      accessibility_needed: applicant.accessibility_needed,
      parking_required: applicant.parking_required,
      public_transit_access: applicant.public_transit_access,

      // Recovery
      recovery_stage: applicant.recovery_stage,
      calculated_recovery_stage: applicant.recovery_stage,
      sobriety_date: applicant.sobriety_date,
      primary_substance: applicant.primary_substance,
      recovery_methods: applicant.recovery_methods,
      program_types: applicant.program_types,
      treatment_history: applicant.treatment_history,
      support_meetings: applicant.support_meetings,
      sponsor_mentor: applicant.sponsor_mentor,
      primary_issues: applicant.primary_issues,
      spiritual_affiliation: applicant.spiritual_affiliation,
      want_recovery_support: applicant.want_recovery_support,
      comfortable_discussing_recovery: applicant.comfortable_discussing_recovery,
      attend_meetings_together: applicant.attend_meetings_together,
      substance_free_home_required: applicant.substance_free_home_required,
      recovery_goal_timeframe: applicant.recovery_goal_timeframe,
      recovery_context: applicant.recovery_context,

      // Lifestyle
      social_level: applicant.social_level,
      cleanliness_level: applicant.cleanliness_level,
      noise_tolerance: applicant.noise_tolerance,
      work_schedule: applicant.work_schedule,
      work_from_home_frequency: applicant.work_from_home_frequency,
      bedtime_preference: applicant.bedtime_preference,
      early_riser: applicant.early_riser,
      night_owl: applicant.night_owl,
      guests_policy: applicant.guests_policy,
      social_activities_at_home: applicant.social_activities_at_home,
      overnight_guests_ok: applicant.overnight_guests_ok,

      // Activities & Habits
      cooking_enthusiast: applicant.cooking_enthusiast,
      cooking_frequency: applicant.cooking_frequency,
      exercise_at_home: applicant.exercise_at_home,
      plays_instruments: applicant.plays_instruments,
      tv_streaming_regular: applicant.tv_streaming_regular,
      chore_sharing_style: applicant.chore_sharing_style,
      chore_sharing_preference: applicant.chore_sharing_preference,
      shared_groceries: applicant.shared_groceries,

      // Communication & Preferences
      communication_style: applicant.communication_style,
      conflict_resolution_style: applicant.conflict_resolution_style,
      preferred_support_structure: applicant.preferred_support_structure,

      // Pets & Smoking
      pets_owned: applicant.pets_owned,
      pets_comfortable: applicant.pets_comfortable,
      pet_preference: applicant.pet_preference,
      smoking_status: applicant.smoking_status,
      smoking_preference: applicant.smoking_preference,

      // Move-in timeline
      move_in_date: applicant.move_in_date,
      move_in_flexibility: applicant.move_in_flexibility,
      lease_duration: applicant.lease_duration,
      relocation_timeline: applicant.relocation_timeline,

      // Goals & Interests
      short_term_goals: applicant.short_term_goals,
      long_term_vision: applicant.long_term_vision,
      interests: applicant.interests,
      additional_interests: applicant.additional_interests,
      shared_activities_interest: applicant.shared_activities_interest,

      // Preferences
      important_qualities: applicant.important_qualities,
      deal_breakers: applicant.deal_breakers,
      about_me: applicant.about_me,
      looking_for: applicant.looking_for,
      additional_info: applicant.additional_info,
      special_needs: applicant.special_needs,

      // Roommate preferences
      age_range_min: applicant.age_range_min,
      age_range_max: applicant.age_range_max,
      age_flexibility: applicant.age_flexibility,
      prefer_recovery_experience: applicant.prefer_recovery_experience,
      supportive_of_recovery: applicant.supportive_of_recovery,
      respect_privacy: applicant.respect_privacy,
      similar_schedules: applicant.similar_schedules,
      shared_chores: applicant.shared_chores,
      financially_stable: applicant.financially_stable,
      respectful_guests: applicant.respectful_guests,
      lgbtq_friendly: applicant.lgbtq_friendly,
      culturally_sensitive: applicant.culturally_sensitive,

      // Deal breakers
      deal_breaker_substance_use: applicant.deal_breaker_substance_use,
      deal_breaker_loudness: applicant.deal_breaker_loudness,
      deal_breaker_uncleanliness: applicant.deal_breaker_uncleanliness,
      deal_breaker_financial_issues: applicant.deal_breaker_financial_issues,
      deal_breaker_pets: applicant.deal_breaker_pets,
      deal_breaker_smoking: applicant.deal_breaker_smoking,

      // Additional preferences
      overnight_guests_preference: applicant.overnight_guests_preference,
      shared_transportation: applicant.shared_transportation,
      recovery_accountability: applicant.recovery_accountability,
      shared_recovery_activities: applicant.shared_recovery_activities,
      mentorship_interest: applicant.mentorship_interest,
      recovery_community: applicant.recovery_community,

      // Profile metadata
      completion_percentage: applicant.completion_percentage,
      profile_quality_score: applicant.profile_quality_score,
      is_active: applicant.is_active,
      profile_completed: applicant.profile_completed,

      // Emergency contact
      emergency_contact_name: applicant.emergency_contact_name,
      emergency_contact_phone: applicant.emergency_contact_phone,
      emergency_contact_relationship: applicant.emergency_contact_relationship
    };
  };

  /**
   * Render detailed profile sections with all data
   */
  const renderDetailedProfile = () => {
    const applicant = client.applicantProfile;

    return (
      <div className={styles.detailedProfile}>
        {/* Budget & Housing Section */}
        <div className={styles.profileSection}>
          <h4 className={styles.sectionTitle}>💰 Budget & Housing Preferences</h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Budget Range:</span>
              <span className={styles.detailValue}>${applicant.budget_min} - ${applicant.budget_max}/month</span>
            </div>
            {applicant.housing_assistance?.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Housing Assistance:</span>
                <span className={styles.detailValue}>{applicant.housing_assistance.join(', ')}</span>
              </div>
            )}
            {applicant.has_section8 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Section 8:</span>
                <span className={styles.detailValue}>Yes</span>
              </div>
            )}
            {applicant.housing_types_accepted?.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Housing Types:</span>
                <span className={styles.detailValue}>{applicant.housing_types_accepted.join(', ')}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Preferred Bedrooms:</span>
              <span className={styles.detailValue}>{applicant.preferred_bedrooms || 'Any'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Furnished:</span>
              <span className={styles.detailValue}>{applicant.furnished_preference ? 'Preferred' : 'Not Required'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Utilities Included:</span>
              <span className={styles.detailValue}>{applicant.utilities_included_preference ? 'Preferred' : 'Not Required'}</span>
            </div>
          </div>
        </div>

        {/* Location & Transportation */}
        <div className={styles.profileSection}>
          <h4 className={styles.sectionTitle}>📍 Location & Transportation</h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Target Location:</span>
              <span className={styles.detailValue}>{applicant.primary_city}, {applicant.primary_state}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Search Radius:</span>
              <span className={styles.detailValue}>{applicant.search_radius_miles} miles</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Max Commute:</span>
              <span className={styles.detailValue}>{applicant.max_commute_minutes} minutes</span>
            </div>
            {applicant.transportation_method && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Transportation:</span>
                <span className={styles.detailValue}>{applicant.transportation_method}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Parking Required:</span>
              <span className={styles.detailValue}>{applicant.parking_required ? 'Yes' : 'No'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Public Transit:</span>
              <span className={styles.detailValue}>{applicant.public_transit_access ? 'Required' : 'Not Required'}</span>
            </div>
          </div>
        </div>

        {/* Recovery Details */}
        <div className={styles.profileSection}>
          <h4 className={styles.sectionTitle}>🌱 Recovery Journey</h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Recovery Stage:</span>
              <span className={styles.detailValue}>{applicant.recovery_stage}</span>
            </div>
            {applicant.sobriety_date && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sobriety Date:</span>
                <span className={styles.detailValue}>{new Date(applicant.sobriety_date).toLocaleDateString()}</span>
              </div>
            )}
            {applicant.primary_substance && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Primary Substance:</span>
                <span className={styles.detailValue}>{applicant.primary_substance}</span>
              </div>
            )}
            {applicant.recovery_methods?.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Recovery Methods:</span>
                <span className={styles.detailValue}>{applicant.recovery_methods.join(', ')}</span>
              </div>
            )}
            {applicant.program_types?.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Program Types:</span>
                <span className={styles.detailValue}>{applicant.program_types.join(', ')}</span>
              </div>
            )}
            {applicant.support_meetings && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Support Meetings:</span>
                <span className={styles.detailValue}>{applicant.support_meetings}</span>
              </div>
            )}
            {applicant.sponsor_mentor && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sponsor/Mentor:</span>
                <span className={styles.detailValue}>{applicant.sponsor_mentor}</span>
              </div>
            )}
            {applicant.spiritual_affiliation && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Spiritual Affiliation:</span>
                <span className={styles.detailValue}>{applicant.spiritual_affiliation}</span>
              </div>
            )}
          </div>

          {applicant.recovery_context && (
            <div className={styles.detailFull}>
              <span className={styles.detailLabel}>Recovery Context:</span>
              <p className={styles.detailTextBlock}>{applicant.recovery_context}</p>
            </div>
          )}
        </div>

        {/* Lifestyle Preferences */}
        <div className={styles.profileSection}>
          <h4 className={styles.sectionTitle}>🏠 Lifestyle & Daily Habits</h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Social Level:</span>
              <span className={styles.detailValue}>{applicant.social_level}/5</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Cleanliness:</span>
              <span className={styles.detailValue}>{applicant.cleanliness_level}/5</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Noise Tolerance:</span>
              <span className={styles.detailValue}>{applicant.noise_tolerance}/5</span>
            </div>
            {applicant.work_schedule && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Work Schedule:</span>
                <span className={styles.detailValue}>{applicant.work_schedule.replace(/_/g, ' ')}</span>
              </div>
            )}
            {applicant.bedtime_preference && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Bedtime:</span>
                <span className={styles.detailValue}>{applicant.bedtime_preference}</span>
              </div>
            )}
            {applicant.cooking_frequency && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cooking:</span>
                <span className={styles.detailValue}>{applicant.cooking_frequency}</span>
              </div>
            )}
            {applicant.guests_policy && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Guests Policy:</span>
                <span className={styles.detailValue}>{applicant.guests_policy}</span>
              </div>
            )}
            {applicant.smoking_status && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Smoking:</span>
                <span className={styles.detailValue}>{applicant.smoking_status.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Goals & Vision */}
        {(applicant.short_term_goals || applicant.long_term_vision) && (
          <div className={styles.profileSection}>
            <h4 className={styles.sectionTitle}>🎯 Goals & Vision</h4>
            {applicant.short_term_goals && (
              <div className={styles.detailFull}>
                <span className={styles.detailLabel}>Short-term Goals:</span>
                <p className={styles.detailTextBlock}>{applicant.short_term_goals}</p>
              </div>
            )}
            {applicant.long_term_vision && (
              <div className={styles.detailFull}>
                <span className={styles.detailLabel}>Long-term Vision:</span>
                <p className={styles.detailTextBlock}>{applicant.long_term_vision}</p>
              </div>
            )}
          </div>
        )}

        {/* Important Qualities & Deal Breakers */}
        <div className={styles.profileSection}>
          <h4 className={styles.sectionTitle}>⭐ Roommate Preferences</h4>
          {applicant.important_qualities?.length > 0 && (
            <div className={styles.detailFull}>
              <span className={styles.detailLabel}>Important Qualities:</span>
              <div className={styles.tagsList}>
                {applicant.important_qualities.map((quality, i) => (
                  <span key={i} className={styles.tagGreen}>{quality}</span>
                ))}
              </div>
            </div>
          )}
          {applicant.deal_breakers?.length > 0 && (
            <div className={styles.detailFull}>
              <span className={styles.detailLabel}>Deal Breakers:</span>
              <div className={styles.tagsList}>
                {applicant.deal_breakers.map((breaker, i) => (
                  <span key={i} className={styles.tagRed}>{breaker}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const matchCardData = transformClientForMatchCard();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header with purple gradient */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Client Profile: {client.displayName}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Quick View
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'detailed' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('detailed')}
          >
            Full Profile
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.modalBody}>
          {activeTab === 'profile' && (
            <div className={styles.matchCardContainer}>
              <MatchCard
                match={matchCardData}
                onShowDetails={() => setActiveTab('detailed')}
                onRequestMatch={() => {}}
                isAlreadyMatched={true}
              />
            </div>
          )}

          {activeTab === 'detailed' && renderDetailedProfile()}
        </div>
      </div>
    </div>
  );
};

export default ClientProfileModal;