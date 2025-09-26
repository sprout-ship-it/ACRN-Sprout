// src/components/features/matching/sections/CompatibilitySection.js - FULLY ALIGNED WITH NEW SCHEMA
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  housingSubsidyOptions,
  interestOptions
} from '../constants/matchingFormConstants';

const CompatibilitySection = ({
  formData,
  errors,
  loading,
  profile,
  onInputChange,
  onArrayChange,
  onRangeChange,
  styles = {},
  fieldMapping,   // Schema field mapping from parent
  sectionId,      // Section identifier
  isActive,       // Whether this section is currently active
  validationMessage // Current validation message
}) => {
  // Calculate character limits and validation
  const aboutMeLength = (formData.about_me || '').length;
  const lookingForLength = (formData.looking_for || '').length;
  const shortTermGoalsLength = (formData.short_term_goals || '').length;
  const longTermVisionLength = (formData.long_term_vision || '').length;
  const additionalInterestsLength = (formData.additional_interests || '').length;

  // Validation helpers
  const validateTextLength = useCallback((text, minLength, fieldName) => {
    if (!text || text.trim().length < minLength) {
      return `${fieldName} should be at least ${minLength} characters for meaningful matching`;
    }
    return null;
  }, []);

  // Calculate profile completion metrics
  const calculateCompletionMetrics = useCallback(() => {
    let completedSections = 0;
    let totalSections = 6;
    
    // Core story sections
    if (aboutMeLength >= 50) completedSections++;
    if (lookingForLength >= 50) completedSections++;
    if ((formData.interests || []).length >= 3) completedSections++;
    
    // Optional but valuable sections
    if ((formData.housing_assistance || []).length > 0) completedSections++;
    if (shortTermGoalsLength >= 20 || longTermVisionLength >= 20) completedSections++;
    if (formData.profile_visibility) completedSections++;
    
    return {
      completedSections,
      totalSections,
      percentage: Math.round((completedSections / totalSections) * 100)
    };
  }, [aboutMeLength, lookingForLength, formData.interests, formData.housing_assistance, shortTermGoalsLength, longTermVisionLength, formData.profile_visibility]);

  // Get readiness indicators
  const getReadinessIndicators = useCallback(() => {
    const indicators = [];
    
    // Essential story elements
    if (aboutMeLength >= 100) {
      indicators.push({ type: 'success', text: 'Strong personal story' });
    } else if (aboutMeLength >= 50) {
      indicators.push({ type: 'warning', text: 'Good personal story - consider adding more detail' });
    } else {
      indicators.push({ type: 'error', text: 'Personal story needs more detail' });
    }
    
    if (lookingForLength >= 100) {
      indicators.push({ type: 'success', text: 'Clear roommate preferences' });
    } else if (lookingForLength >= 50) {
      indicators.push({ type: 'warning', text: 'Good preferences - consider being more specific' });
    } else {
      indicators.push({ type: 'error', text: 'Roommate preferences need more detail' });
    }
    
    const interestCount = (formData.interests || []).length;
    if (interestCount >= 5) {
      indicators.push({ type: 'success', text: 'Rich interest profile for compatibility' });
    } else if (interestCount >= 3) {
      indicators.push({ type: 'warning', text: 'Good interests - more selections improve matching' });
    } else {
      indicators.push({ type: 'error', text: 'Select more interests for better matching' });
    }
    
    return indicators;
  }, [aboutMeLength, lookingForLength, formData.interests]);

  const completionMetrics = calculateCompletionMetrics();
  const readinessIndicators = getReadinessIndicators();
  
  const aboutMeError = validateTextLength(formData.about_me, 50, 'About Me');
  const lookingForError = validateTextLength(formData.looking_for, 50, 'What I\'m Looking For');

  return (
    <>
      {/* Compatibility Section Header */}
      <div className="section-intro">
        <h3 className="card-title mb-4">Personal Story & What You're Looking For</h3>
        <div className="alert alert-info mb-4">
          <h4 className="mb-2">
            <span style={{ marginRight: '8px' }}>💫</span>
            Complete Your Recovery Housing Profile
          </h4>
          <p className="mb-0">
            This final section helps potential roommates understand who you are beyond demographics and preferences. 
            Your authentic story, interests, and housing situation create the foundation for meaningful connections 
            that support everyone's recovery journey.
          </p>
        </div>
      </div>

      {/* Personal Story - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Your Personal Story</h4>
        <p className="card-subtitle">
          Share your authentic story to help potential roommates understand who you are and what makes you unique
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          About Me <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.about_me || aboutMeError ? 'border-red-500 bg-red-50' : aboutMeLength >= 100 ? 'border-green-500 bg-green-50' : ''}`}
          value={formData.about_me || ''}
          onChange={(e) => onInputChange('about_me', e.target.value)}
          placeholder="Tell potential roommates about yourself, your recovery journey, your personality, and what makes you a good roommate. Share what's important to you, what brings you joy, and what kind of environment helps you thrive. Be authentic - this helps create genuine connections..."
          rows="6"
          disabled={loading}
          maxLength="1000"
          required
        />
        <div className="flex justify-between items-center mt-1">
          <div className={`text-sm ${aboutMeLength >= 100 ? 'text-green-600' : aboutMeLength >= 50 ? 'text-blue-600' : 'text-gray-500'}`}>
            {aboutMeLength}/1000 characters
            {aboutMeLength >= 100 && ' - Great detail for matching!'}
            {aboutMeLength >= 50 && aboutMeLength < 100 && ' - Good start, consider adding more'}
            {aboutMeLength < 50 && ' - Add more detail for better matches'}
          </div>
        </div>
        {aboutMeError && (
          <div className="text-red-500 mt-1 text-sm font-medium">{aboutMeError}</div>
        )}
        {errors.about_me && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.about_me}</div>
        )}
        <div className="text-gray-500 mt-2 text-sm">
          <strong>Tips:</strong> Share your personality, values, what you enjoy doing, your recovery approach, 
          what makes you a considerate roommate, and what environment supports your well-being.
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          What I'm Looking For <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.looking_for || lookingForError ? 'border-red-500 bg-red-50' : lookingForLength >= 100 ? 'border-green-500 bg-green-50' : ''}`}
          value={formData.looking_for || ''}
          onChange={(e) => onInputChange('looking_for', e.target.value)}
          placeholder="Describe your ideal roommate and living situation. What qualities are important to you? What kind of support do you need or want? What does a successful roommate relationship look like? Be specific about your needs, boundaries, and what you can offer in return..."
          rows="6"
          disabled={loading}
          maxLength="1000"
          required
        />
        <div className="flex justify-between items-center mt-1">
          <div className={`text-sm ${lookingForLength >= 100 ? 'text-green-600' : lookingForLength >= 50 ? 'text-blue-600' : 'text-gray-500'}`}>
            {lookingForLength}/1000 characters
            {lookingForLength >= 100 && ' - Excellent specificity for matching!'}
            {lookingForLength >= 50 && lookingForLength < 100 && ' - Good detail, consider being more specific'}
            {lookingForLength < 50 && ' - Add more specifics for better matches'}
          </div>
        </div>
        {lookingForError && (
          <div className="text-red-500 mt-1 text-sm font-medium">{lookingForError}</div>
        )}
        {errors.looking_for && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.looking_for}</div>
        )}
        <div className="text-gray-500 mt-2 text-sm">
          <strong>Tips:</strong> Be specific about roommate qualities, communication style, recovery support needs, 
          living environment preferences, and what you can contribute to a positive household.
        </div>
      </div>

      {/* Interests & Compatibility - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Interests & Activities</h4>
        <p className="card-subtitle">
          Shared interests create opportunities for connection and positive activities that support recovery
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          My Interests & Hobbies <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all interests and hobbies that apply to you. This helps find roommates with compatible lifestyles 
          and creates opportunities for shared positive activities. <strong>Select at least 3 for good matching.</strong>
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
        
        {/* Interest selection feedback */}
        <div className="mt-3 p-2 rounded border">
          <div className={`text-sm ${(formData.interests || []).length >= 5 ? 'text-green-600' : (formData.interests || []).length >= 3 ? 'text-blue-600' : 'text-red-600'}`}>
            <strong>Selected:</strong> {(formData.interests || []).length} interests
            {(formData.interests || []).length >= 5 && ' - Excellent for compatibility matching!'}
            {(formData.interests || []).length >= 3 && (formData.interests || []).length < 5 && ' - Good selection, more improves matching'}
            {(formData.interests || []).length < 3 && ' - Select more for better matching opportunities'}
          </div>
          {(formData.interests || []).length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              <strong>Your interests:</strong> {(formData.interests || []).join(', ')}
            </div>
          )}
        </div>
        
        {errors.interests && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.interests}</div>
        )}
      </div>

      <div className="form-group mb-4">
        <label className="label">Additional Interests or Hobbies</label>
        <input
          className={`input ${errors.additional_interests ? 'border-red-500 bg-red-50' : ''}`}
          type="text"
          value={formData.additional_interests || ''}
          onChange={(e) => onInputChange('additional_interests', e.target.value)}
          placeholder="List any other interests, hobbies, or activities not mentioned above..."
          disabled={loading}
          maxLength="300"
        />
        {errors.additional_interests && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.additional_interests}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          {additionalInterestsLength}/300 characters (optional but helpful for unique interests)
        </div>
      </div>

      {/* Housing Assistance & Financial Support - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Housing Assistance Programs</h4>
        <p className="card-subtitle">
          Select any programs that will help cover your monthly housing costs or provide housing support
        </p>
      </div>
      
      <div className="form-group mb-4">
        <div className="text-gray-500 mb-3 text-sm">
          Housing assistance programs provide financial support for rent, utilities, deposits, or other housing costs. 
          Selecting applicable programs helps us match you with compatible housing opportunities and roommates 
          who understand these support systems.
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
        
        {(formData.housing_assistance || []).length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-blue-800 text-sm">
              <strong>Selected assistance programs:</strong> {(formData.housing_assistance || []).map(value => 
                housingSubsidyOptions.find(option => option.value === value)?.label || value
              ).join(', ')}
            </div>
          </div>
        )}
        
        {errors.housing_assistance && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.housing_assistance}</div>
        )}
      </div>

      {/* Living Situation Preferences */}
      <div className="card-header">
        <h4 className="card-title">Living Situation Preferences</h4>
        <p className="card-subtitle">Your preferences for shared living arrangements and household dynamics</p>
      </div>
      
      <div className="form-group mb-4">
        <div className="grid-2">
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
            <span className={styles.checkboxText || ''}>Overnight guests are acceptable</span>
          </label>
          
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.shared_groceries || false}
              onChange={(e) => onInputChange('shared_groceries', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>Open to sharing groceries/meals occasionally</span>
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

      {/* Recovery Support & Community - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Recovery Support & Community Preferences</h4>
        <p className="card-subtitle">How you envision recovery support and community in your living situation</p>
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
              Interested in peer mentorship/support relationships
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

      {/* Goals & Aspirations - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Goals & Aspirations</h4>
        <p className="card-subtitle">Share your goals to connect with roommates who can support and inspire your journey</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Short-term Goals (next 6-12 months)</label>
          <textarea
            className={`input ${errors.short_term_goals ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.short_term_goals || ''}
            onChange={(e) => onInputChange('short_term_goals', e.target.value)}
            placeholder="What are you working toward in the near future? (education, career, health, relationships, recovery milestones, etc.)"
            rows="3"
            disabled={loading}
            maxLength="400"
          />
          {errors.short_term_goals && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.short_term_goals}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            {shortTermGoalsLength}/400 characters (optional but valuable for compatibility)
          </div>
        </div>

        <div className="form-group">
          <label className="label">Long-term Vision</label>
          <textarea
            className={`input ${errors.long_term_vision ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.long_term_vision || ''}
            onChange={(e) => onInputChange('long_term_vision', e.target.value)}
            placeholder="What does your ideal future look like? What are you building toward in your recovery and life journey?"
            rows="3"
            disabled={loading}
            maxLength="400"
          />
          {errors.long_term_vision && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.long_term_vision}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            {longTermVisionLength}/400 characters (optional but helpful for long-term compatibility)
          </div>
        </div>
      </div>

      {/* Profile Settings & Visibility - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Profile Settings & Matching Preferences</h4>
        <p className="card-subtitle">Control your profile visibility and matching activity</p>
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
          You can activate/deactivate your profile at any time to control when you receive new matches and opportunities
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Profile Visibility</label>
        <select
          className={`input ${errors.profile_visibility ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.profile_visibility || 'verified-members'}
          onChange={(e) => onInputChange('profile_visibility', e.target.value)}
          disabled={loading}
        >
          <option value="verified-members">Verified members only</option>
          <option value="recovery-community">Recovery community members only</option>
          <option value="private">Private - only show to my matches</option>
          <option value="limited-info">Limited info - basic compatibility only</option>
        </select>
        {errors.profile_visibility && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.profile_visibility}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          Control who can see your full profile in search results and matching
        </div>
      </div>

      {/* Profile Completion Status */}
      {sectionId && isActive && (
        <div className="section-status mt-6">
          <div className="card-header">
            <h4 className="card-title">Profile Completion & Readiness</h4>
          </div>
          
          <div className="grid-2 mb-4">
            <div>
              <strong>Completion Metrics:</strong>
              <div className="mt-2">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${completionMetrics.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {completionMetrics.completedSections}/{completionMetrics.totalSections} sections complete ({completionMetrics.percentage}%)
                </span>
              </div>
            </div>
            
            <div>
              <strong>Profile Readiness:</strong>
              <ul className="mt-2 text-sm">
                {readinessIndicators.map((indicator, index) => (
                  <li key={index} className={
                    indicator.type === 'success' ? 'text-green-600' : 
                    indicator.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }>
                    {indicator.type === 'success' ? '✓' : indicator.type === 'warning' ? '⚠' : '✗'} {indicator.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {validationMessage && (
            <div className="alert alert-warning">
              <strong>Validation Note:</strong> {validationMessage}
            </div>
          )}
        </div>
      )}

      {/* Profile Enhancement Tips */}
      <div className="alert alert-success mt-6">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🎯</span>
          Profile Completion Excellence Tips
        </h4>
        <p className="mb-2">
          <strong>Creating a compelling and effective profile:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Authentic Storytelling:</strong> Share your genuine personality and journey - authenticity attracts the right matches</li>
          <li><strong>Specific Preferences:</strong> Be detailed about what you're looking for - specificity leads to better compatibility</li>
          <li><strong>Interest Diversity:</strong> Select varied interests to create multiple connection opportunities</li>
          <li><strong>Recovery Focus:</strong> Include how your living situation supports your recovery goals</li>
          <li><strong>Growth Mindset:</strong> Share your goals and aspirations to attract like-minded roommates</li>
          <li><strong>Boundary Clarity:</strong> Be clear about your needs and what you can offer in return</li>
        </ul>
        <p className="text-sm">
          The most successful matches happen when profiles authentically represent who you are, what you need, 
          and what kind of positive environment you want to create together.
        </p>
      </div>

      {/* Privacy, Safety & Next Steps */}
      <div className="alert alert-info mt-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🔐</span>
          Privacy Protection & Next Steps
        </h4>
        <p className="mb-2">
          <strong>Your complete profile information will be used to:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Smart Matching:</strong> Find highly compatible roommates using our enhanced algorithm</li>
          <li><strong>Housing Opportunities:</strong> Connect you with appropriate recovery-friendly housing</li>
          <li><strong>Support Resources:</strong> Suggest relevant recovery resources and peer support</li>
          <li><strong>Community Building:</strong> Help build supportive recovery-focused communities</li>
          <li><strong>Safety Verification:</strong> Enable secure, verified connections with potential roommates</li>
        </ul>
        <div className="grid-2 mt-3">
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => window.open('/privacy/complete-profile', '_blank')}
            disabled={loading}
          >
            Complete Privacy Policy
          </button>
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => window.open('/help/next-steps-after-profile', '_blank')}
            disabled={loading}
          >
            What Happens Next?
          </button>
        </div>
      </div>

      {/* Final Completion Guidance */}
      <div className="alert alert-success mt-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🚀</span>
          Ready to Connect & Find Your Perfect Roommate Match?
        </h4>
        <p className="mb-2">
          Your enhanced matching profile uses our advanced compatibility algorithm to find roommates who will 
          truly support your recovery journey and create a positive living environment.
        </p>
        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
          <div className="text-green-800 font-medium mb-2">
            After completing your profile, you'll be able to:
          </div>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Browse compatible roommate matches with detailed compatibility scores</li>
            <li>• Search recovery-friendly housing options in your preferred area</li>
            <li>• Connect with peer support specialists and recovery resources</li>
            <li>• Join recovery-focused community groups and activities</li>
            <li>• Receive personalized recommendations for housing and support services</li>
          </ul>
        </div>
      </div>
    </>
  );
};

CompatibilitySection.propTypes = {
  formData: PropTypes.shape({
    // Personal story - schema standardized
    about_me: PropTypes.string,                         // Required - standardized
    looking_for: PropTypes.string,                      // Required - standardized
    
    // Interests and activities - schema standardized
    interests: PropTypes.arrayOf(PropTypes.string),     // Required - standardized
    additional_interests: PropTypes.string,              // Optional - standardized
    
    // Housing assistance - schema standardized
    housing_assistance: PropTypes.arrayOf(PropTypes.string), // Optional - standardized
    
    // Living preferences - schema standardized
    pets_owned: PropTypes.bool,                         // Optional - standardized
    pets_comfortable: PropTypes.bool,                   // Optional - standardized
    overnight_guests_ok: PropTypes.bool,                // Optional - standardized
    shared_groceries: PropTypes.bool,                   // Optional - standardized
    shared_transportation: PropTypes.bool,              // Optional - standardized
    shared_activities_interest: PropTypes.bool,         // Optional - standardized
    
    // Recovery community - schema standardized
    recovery_accountability: PropTypes.bool,            // Optional - standardized
    shared_recovery_activities: PropTypes.bool,         // Optional - standardized
    mentorship_interest: PropTypes.bool,                // Optional - standardized
    recovery_community: PropTypes.bool,                 // Optional - standardized
    
    // Goals and aspirations - schema standardized
    short_term_goals: PropTypes.string,                 // Optional - standardized
    long_term_vision: PropTypes.string,                 // Optional - standardized
    
    // Profile settings - schema standardized
    is_active: PropTypes.bool,                          // Optional - standardized
    profile_visibility: PropTypes.string                // Optional - standardized
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
  styles: PropTypes.object,                           // CSS module styles
  fieldMapping: PropTypes.object,                     // Schema field mapping
  sectionId: PropTypes.string,                        // Section identifier
  isActive: PropTypes.bool,                           // Whether section is active
  validationMessage: PropTypes.string                 // Current validation message
};

CompatibilitySection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'compatibility',
  isActive: false,
  validationMessage: null
};

export default CompatibilitySection;