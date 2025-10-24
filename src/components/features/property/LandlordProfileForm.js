// src/components/features/property/LandlordProfileForm.js - SIMPLIFIED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import '../../../styles/main.css';

const LandlordProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    primary_phone: '',
    contact_email: ''
  });

  // Load existing profile data if in edit mode
  useEffect(() => {
    if (editMode && profile?.id) {
      loadExistingProfile();
    }
  }, [editMode, profile?.id]);

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('landlord_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        setExistingProfile(data);
        setFormData({
          primary_phone: data.primary_phone || '',
          contact_email: data.contact_email || ''
        });
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Primary phone is required
    if (!formData.primary_phone || formData.primary_phone.trim() === '') {
      newErrors.primary_phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.primary_phone)) {
      newErrors.primary_phone = 'Please enter a valid phone number';
    }

    // Email validation (optional, but if provided must be valid)
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        user_id: profile.id,
        primary_phone: formData.primary_phone.trim(),
        contact_email: formData.contact_email?.trim() || null,
        profile_completed: true,
        is_active: true
      };

      let result;
      if (existingProfile) {
        result = await supabase
          .from('landlord_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
      } else {
        result = await supabase
          .from('landlord_profiles')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      alert(existingProfile ? 'Profile updated successfully!' : 'Profile created successfully! You can now add properties.');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="form-title">
          {editMode ? 'Edit Landlord Profile' : 'Create Your Landlord Profile'}
        </h2>
        
        <p className="form-subtitle" style={{ maxWidth: '600px', margin: '1rem auto 0' }}>
          {editMode 
            ? 'Update your contact information for property management.'
            : 'Just a couple quick details to get started. All property-specific information will be added when you create your listings.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Contact Information */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            This information will be used by the system to contact you regarding your property listings.
          </p>
          
          <div className="form-group">
            <label className="label">
              Primary Phone <span className="required">*</span>
            </label>
            <input
              className={`input ${errors.primary_phone ? 'input-error' : ''}`}
              type="tel"
              name="primary_phone"
              value={formData.primary_phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              disabled={loading}
              required
            />
            {errors.primary_phone && (
              <div className="error-text">{errors.primary_phone}</div>
            )}
            <div className="helper-text">
              Your primary contact number for property inquiries
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Contact Email (Optional)</label>
            <input
              className={`input ${errors.contact_email ? 'input-error' : ''}`}
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleInputChange}
              placeholder="landlord@example.com"
              disabled={loading}
            />
            {errors.contact_email && (
              <div className="error-text">{errors.contact_email}</div>
            )}
            <div className="helper-text">
              Alternative contact method for property inquiries
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--info-text)', display: 'block', marginBottom: '0.5rem' }}>
                What's Next?
              </strong>
              <p style={{ color: 'var(--info-text)', fontSize: '0.9rem', margin: 0 }}>
                After creating your profile, you'll be able to add property listings. Each property can have its own specific contact preferences, amenities, and requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Create Profile & Continue')}
          </button>
        </div>
      </form>

      {/* Additional CSS for this form */}
      <style jsx>{`
        .form-title {
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          color: var(--gray-600);
          font-size: 1rem;
          line-height: 1.6;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-beige);
        }

        .form-section-title {
          color: var(--gray-900);
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          font-family: var(--font-serif);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .label {
          display: block;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .required {
          color: var(--coral);
        }

        .input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--gray-300);
          border-radius: 8px;
          font-size: 1rem;
          transition: var(--transition-fast);
          font-family: var(--font-sans);
        }

        .input:focus {
          outline: none;
          border-color: var(--primary-purple);
          box-shadow: 0 0 0 3px rgba(160, 32, 240, 0.1);
        }

        .input-error {
          border-color: var(--coral);
        }

        .input:disabled {
          background: var(--gray-100);
          cursor: not-allowed;
        }

        .error-text {
          color: var(--error-text);
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .error-text::before {
          content: '⚠️';
        }

        .helper-text {
          color: var(--gray-600);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: var(--transition-fast);
          border: 2px solid transparent;
          font-family: var(--font-sans);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--primary-purple);
          color: white;
          border-color: var(--primary-purple);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--secondary-purple);
          border-color: var(--secondary-purple);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-outline {
          background: white;
          color: var(--gray-700);
          border-color: var(--gray-300);
        }

        .btn-outline:hover:not(:disabled) {
          background: var(--gray-100);
          border-color: var(--gray-400);
        }

        @media (max-width: 768px) {
          .form-section {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LandlordProfileForm;