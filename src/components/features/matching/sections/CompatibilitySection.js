// src/components/features/matching/sections/CompatibilitySection.js - FIXED WITH STANDARDIZED FIELD NAMES
import React from 'react';
import PropTypes from 'prop-types';
import {
  housingSubsidyOptions,
  interestOptions
} from '../constants/matchingFormConstants';

const CompatibilitySection = ({
  formData,
  errors,
  loading,
  profile,      // Added for interface consistency
  onInputChange,
  onArrayChange,
  onRangeChange, // Added for interface consistency
  styles = {}   // CSS module styles passed from parent
}) => {
  return (
    <>
      {/* About You Section Header */}
      <h3 className="card-title mb-4">About You</h3>
      
      <div className="alert alert-info mb-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>💫</span>
          Complete Your Profile
        </h4>
        <p className="mb-0">
          This final section helps potential roommates understand who you are beyond the basics. 
          Your personality, interests, and housing situation details create the foundation for meaningful connections.
        </p>
      </div>

      {/* Personal Story & Compatibility - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Personal Story & What You're Looking For</h4>
        <p className="card-subtitle">
          Share your story and help potential roommates understand what you're seeking in a living situation
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          About Me <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.about_me ? 'border-red-500' : ''}`}
          value={formData.about_me || ''}
          onChange={(e) => onInputChange('about_me', e.target.value)}
          placeholder="Tell potential roommates about yourself, your recovery journey, your personality, and what makes you a good roommate. Share what's important to you and what kind of environment helps you thrive..."
          rows="5"
          disabled={loading}
          maxLength="750"
          required
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.about_me || '').length}/750 characters - Be authentic and highlight what makes you unique
        </div>
        {errors.about_me && (
          <div className="text-red-500 mt-1 text-sm">{errors.about_me}</div>
        )}
      </div>

      <div className="form-group mb-4">
        <label className="label">
          What I'm Looking For <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.looking_for ? 'border-red-500' : ''}`}
          value={formData.looking_for || ''}
          onChange={(e) => onInputChange('looking_for', e.target.value)}
          placeholder="Describe your ideal roommate and living situation. What qualities are important to you? What kind of support do you need? What does a successful roommate relationship look like to you?"
          rows="5"
          disabled={loading}
          maxLength="750"
          required
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.looking_for || '').length}/750 characters - Be specific about your needs and expectations
        </div>
        {errors.looking_for && (
          <div className="text-red-500 mt-1 text-sm">{errors.looking_for}</div>
        )}
      </div>

      {/* Interests & Hobbies - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Interests & Hobbies</h4>
        <p className="card-subtitle">
          Shared interests help build connections and create opportunities for positive activities together
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          My Interests & Hobbies <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all interests and hobbies that apply to you. This helps us find roommates with compatible lifestyles and shared activities.
        </div>
        
        <div className={styles.checkboxColumns || 'grid-2'}>
          {interestOptions.map(interest => (
            <label key={interest} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.interests || []).includes(interest)}
                onChange={(e) => onArrayChange('interests', interest, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{interest}</span>
            </label>
          ))}
        </div>
        {errors.interests && (
          <div className="text-red-500 mt-1 text-sm">{errors.interests}</div>
        )}
      </div>

      <div className="form-group mb-4">
        <label className="label">Additional Interests or Hobbies</label>
        <input
          className="input"
          type="text"
          value={formData.additional_interests || ''}
          onChange={(e) => onInputChange('additional_interests', e.target.value)}
          placeholder="List any other interests not mentioned above..."
          disabled={loading}
          maxLength="200"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.additional_interests || '').length}/200 characters (optional)
        </div>
      </div>

      {/* Living Situation Preferences - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Living Situation Preferences</h4>
        <p className="card-subtitle">
          Your preferences for shared living arrangements and household dynamics
        </p>
      </div>
      
      <div className="form-group mb-4">
        <div className={styles.checkboxColumns || 'grid-2'}>
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.pets_owned || false}
              onChange={(e) => onInputChange('pets_owned', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>I own pets</span>
          </label>
          
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.pets_comfortable || false}
              onChange={(e) => onInputChange('pets_comfortable', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>I'm comfortable with roommate's pets</span>
          </label>
          
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.overnight_guests_ok || false}
              onChange={(e) => onInputChange('overnight_guests_ok', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>Overnight guests are OK</span>
          </label>
          
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.shared_groceries || false}
              onChange={(e) => onInputChange('shared_groceries', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>I'm open to sharing groceries/meals</span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.shared_transportation || false}
              onChange={(e) => onInputChange('shared_transportation', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>Open to sharing transportation occasionally</span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.shared_activities_interest || false}
              onChange={(e) => onInputChange('shared_activities_interest', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>Interested in shared activities/outings</span>
          </label>
        </div>
      </div>

      {/* Housing Assistance - FIXED: Using standardized field name */}
      <div className="card-header">
        <h4 className="card-title">Housing Assistance Programs</h4>
        <p className="card-subtitle">
          Select any housing assistance programs that will help cover your monthly housing costs
        </p>
      </div>
      
      <div className="form-group mb-4">
        <div className={styles.housingAssistanceSubtitle || 'housing-assistance-subtitle'}>
          Housing assistance programs provide financial support for rent, utilities, or deposits. 
          Selecting applicable programs helps us match you with compatible housing opportunities and roommates.
        </div>
        
        <div className={styles.checkboxColumnsCompact || 'grid-2'}>
          {housingSubsidyOptions.map(subsidy => (
            <label key={subsidy.value} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.housing_assistance || []).includes(subsidy.value)}
                onChange={(e) => onArrayChange('housing_assistance', subsidy.value, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{subsidy.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Recovery Support & Community - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Recovery Support & Community</h4>
        <p className="card-subtitle">
          How you envision recovery support and community in your living situation
        </p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.recovery_accountability || false}
              onChange={(e) => onInputChange('recovery_accountability', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I value recovery accountability and check-ins
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.shared_recovery_activities || false}
              onChange={(e) => onInputChange('shared_recovery_activities', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Open to attending recovery activities together
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.mentorship_interest || false}
              onChange={(e) => onInputChange('mentorship_interest', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Interested in peer mentorship/support
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.recovery_community || false}
              onChange={(e) => onInputChange('recovery_community', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Want to be part of a recovery-focused community
            </span>
          </label>
        </div>
      </div>

      {/* Goals & Aspirations - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Goals & Aspirations</h4>
        <p className="card-subtitle">
          Share your goals to connect with roommates who can support your journey
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">Short-term Goals (next 6-12 months)</label>
        <textarea
          className="input"
          value={formData.short_term_goals || ''}
          onChange={(e) => onInputChange('short_term_goals', e.target.value)}
          placeholder="What are you working toward in the near future? (education, career, health, relationships, etc.)"
          rows="3"
          disabled={loading}
          maxLength="300"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.short_term_goals || '').length}/300 characters (optional)
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Long-term Vision</label>
        <textarea
          className="input"
          value={formData.long_term_vision || ''}
          onChange={(e) => onInputChange('long_term_vision', e.target.value)}
          placeholder="What does your ideal future look like? What are you building toward in your recovery and life?"
          rows="3"
          disabled={loading}
          maxLength="300"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.long_term_vision || '').length}/300 characters (optional)
        </div>
      </div>

      {/* Profile Status & Visibility - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Profile Status & Matching</h4>
        <p className="card-subtitle">
          Control your profile visibility and matching preferences
        </p>
      </div>

      <div className="form-group mb-4">
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.is_active || false}
            onChange={(e) => onInputChange('is_active', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Keep my profile active for matching
          </span>
        </label>
        <div className="text-gray-500 mt-1 text-sm">
          You can activate/deactivate your profile at any time to control when you receive new matches
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Profile Visibility</label>
        <select
          className="input"
          value={formData.profile_visibility || 'verified-members'}
          onChange={(e) => onInputChange('profile_visibility', e.target.value)}
          disabled={loading}
        >
          <option value="verified-members">Verified members only</option>
          <option value="recovery-community">Recovery community members only</option>
          <option value="private">Private - only show to my matches</option>
        </select>
        <div className="text-gray-500 mt-1 text-sm">
          Control who can see your profile in search results
        </div>
      </div>

      {/* Profile Completion Tips */}
      <div className="alert alert-success">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🎯</span>
          Profile Completion Tips
        </h4>
        <p className="mb-2">
          <strong>Creating an effective profile:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Be authentic:</strong> Honest profiles lead to better, lasting matches</li>
          <li><strong>Be specific:</strong> Details help us find truly compatible roommates</li>
          <li><strong>Share your story:</strong> Your recovery journey can inspire and connect with others</li>
          <li><strong>Set boundaries:</strong> Clear expectations prevent future conflicts</li>
        </ul>
        <p className="text-sm">
          Remember: The goal is finding someone who genuinely supports your recovery journey and creates 
          a positive living environment where you can both thrive.
        </p>
      </div>

      {/* Final Privacy & Safety Notice */}
      <div className="alert alert-info">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🔐</span>
          Privacy, Safety & Next Steps
        </h4>
        <p className="mb-2">
          <strong>Your information is protected and will be used to:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li>Match you with compatible, verified roommates</li>
          <li>Suggest appropriate housing opportunities</li>
          <li>Connect you with relevant recovery resources and support</li>
          <li>Provide personalized recommendations and guidance</li>
        </ul>
        <div className="grid-2 mt-3">
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => window.open('/privacy', '_blank')}
            disabled={loading}
          >
            Review Privacy Policy
          </button>
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => window.open('/help/matching-process', '_blank')}
            disabled={loading}
          >
            How Matching Works
          </button>
        </div>
      </div>
    </>
  );
};

CompatibilitySection.propTypes = {
  formData: PropTypes.shape({
    about_me: PropTypes.string,                         // FIXED: Standardized
    looking_for: PropTypes.string,                      // FIXED: Standardized
    interests: PropTypes.arrayOf(PropTypes.string),     // Same
    additional_interests: PropTypes.string,              // FIXED: Standardized
    pets_owned: PropTypes.bool,                         // FIXED: Standardized
    pets_comfortable: PropTypes.bool,                   // FIXED: Standardized
    overnight_guests_ok: PropTypes.bool,                // FIXED: Standardized
    shared_groceries: PropTypes.bool,                   // FIXED: Standardized
    shared_transportation: PropTypes.bool,              // FIXED: Standardized
    shared_activities_interest: PropTypes.bool,         // FIXED: Standardized
    housing_assistance: PropTypes.arrayOf(PropTypes.string), // FIXED: Standardized
    recovery_accountability: PropTypes.bool,            // FIXED: Standardized
    shared_recovery_activities: PropTypes.bool,         // FIXED: Standardized
    mentorship_interest: PropTypes.bool,                // FIXED: Standardized
    recovery_community: PropTypes.bool,                 // FIXED: Standardized
    short_term_goals: PropTypes.string,                 // FIXED: Standardized
    long_term_vision: PropTypes.string,                 // FIXED: Standardized
    is_active: PropTypes.bool,                          // FIXED: Standardized
    profile_visibility: PropTypes.string                // FIXED: Standardized
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  styles: PropTypes.object
};

CompatibilitySection.defaultProps = {
  profile: null,
  styles: {}
};

export default CompatibilitySection;