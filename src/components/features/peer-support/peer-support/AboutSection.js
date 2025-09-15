// src/components/forms/sections/peer-support/AboutSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { HELP_TEXT, VALIDATION_RULES } from '../../constants/peerSupportConstants';

const AboutSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  const bioLength = formData.bio?.length || 0;
  const recoveryStoryLength = formData.recovery_story?.length || 0;
  const bioMaxLength = VALIDATION_RULES.bio.maxLength;
  const bioMinLength = VALIDATION_RULES.bio.minLength;

  return (
    <>
      <h3 className="card-title mb-4">About You</h3>
      
      {/* Bio - Required */}
      <div className="form-group mb-4">
        <label className="label">
          Your Bio <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          {HELP_TEXT.bio}
        </div>
        <textarea
          className={`input ${errors.bio ? 'border-red-500' : ''}`}
          value={formData.bio}
          onChange={(e) => onInputChange('bio', e.target.value)}
          placeholder="Tell people about your approach to peer support, what makes you unique, and how you help others in their recovery journey..."
          disabled={loading}
          required
          style={{ minHeight: '120px', resize: 'vertical' }}
          maxLength={bioMaxLength}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio && (
            <div className="text-red-500">{errors.bio}</div>
          )}
          <div className={`text-sm ml-auto ${bioLength < bioMinLength ? 'text-red-500' : 'text-gray-500'}`}>
            {bioLength}/{bioMaxLength} characters {bioLength < bioMinLength && `(minimum ${bioMinLength})`}
          </div>
        </div>
        {bioLength < bioMinLength && !errors.bio && (
          <div className="text-red-500 mt-1 text-sm">
            Please write at least {bioMinLength} characters to give clients a good sense of your approach.
          </div>
        )}
      </div>

      {/* Recovery Story - Optional */}
      <div className="form-group mb-4">
        <label className="label">Your Recovery Story (Optional)</label>
        <div className="text-gray-500 mb-3 text-sm">
          {HELP_TEXT.recovery_story}
        </div>
        <textarea
          className="input"
          value={formData.recovery_story}
          onChange={(e) => onInputChange('recovery_story', e.target.value)}
          placeholder="Share what you're comfortable sharing about your recovery journey, challenges you've overcome, and what drives your passion for peer support..."
          disabled={loading}
          style={{ minHeight: '100px', resize: 'vertical' }}
          maxLength="1000"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {recoveryStoryLength}/1000 characters
        </div>
      </div>

      {/* Personal Approach */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Your Approach to Peer Support
      </h4>

      <div className="form-group mb-4">
        <label className="label">Philosophy & Methods (Optional)</label>
        <textarea
          className="input"
          value={formData.philosophy || ''}
          onChange={(e) => onInputChange('philosophy', e.target.value)}
          placeholder="Describe your philosophy about recovery, your methods for supporting others, or any specific techniques you use..."
          disabled={loading}
          style={{ minHeight: '80px', resize: 'vertical' }}
          maxLength="500"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.philosophy?.length || 0)}/500 characters
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">What Makes You Unique (Optional)</label>
        <textarea
          className="input"
          value={formData.unique_qualities || ''}
          onChange={(e) => onInputChange('unique_qualities', e.target.value)}
          placeholder="What sets you apart as a peer support specialist? Special skills, experiences, or perspectives you bring..."
          disabled={loading}
          style={{ minHeight: '80px', resize: 'vertical' }}
          maxLength="400"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.unique_qualities?.length || 0)}/400 characters
        </div>
      </div>

      {/* Privacy and Sharing Notice */}
      <div className="alert alert-info">
        <div className="mb-2">
          <strong>Privacy & Sharing:</strong>
        </div>
        <ul className="text-sm space-y-1">
          <li>• Your bio will be visible to potential clients browsing peer support specialists</li>
          <li>• Your recovery story is optional and only shared if you choose to include it</li>
          <li>• You can edit or update this information at any time</li>
          <li>• All information is kept confidential and only shared with verified users</li>
        </ul>
      </div>

      {/* Writing Tips */}
      <div className="alert alert-success">
        <div className="mb-2">
          <strong>Tips for writing your bio:</strong>
        </div>
        <ul className="text-sm space-y-1">
          <li>• Focus on your experience and approach rather than personal details</li>
          <li>• Mention specific areas where you excel or have special experience</li>
          <li>• Use warm, welcoming language that makes people feel comfortable</li>
          <li>• Include what someone can expect when working with you</li>
          <li>• Keep it professional but personal - let your personality show through</li>
        </ul>
      </div>
    </>
  );
};

AboutSection.propTypes = {
  formData: PropTypes.shape({
    bio: PropTypes.string.isRequired,
    recovery_story: PropTypes.string,
    philosophy: PropTypes.string,
    unique_qualities: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default AboutSection;