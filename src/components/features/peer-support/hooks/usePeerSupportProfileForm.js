// src/components/forms/hooks/usePeerSupportProfileForm.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { db } from '../../../../utils/supabase';

const INITIAL_FORM_DATA = {
  // Contact Information
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  
  // Professional Information
  title: '',
  years_experience: 0,
  certifications: [],
  license_number: '',
  
  // Service Information
  specialties: [],
  recovery_approach: [],
  age_groups_served: [],
  populations_served: [],
  
  // Service Types
  individual_sessions: true,
  group_sessions: true,
  crisis_support: false,
  housing_assistance: true,
  employment_support: false,
  
  // Availability & Contact
  available_hours: '',
  preferred_contact_method: 'phone',
  response_time: '24-hours',
  max_clients: 10,
  service_area: [],
  service_radius: 25,
  offers_telehealth: true,
  offers_in_person: true,
  
  // About
  bio: '',
  recovery_story: '',
  
  // Status
  is_accepting_clients: true,
  is_verified: false
};

export const usePeerSupportProfileForm = ({ editMode = false, onComplete } = {}) => {
  const { user } = useAuth();
  
  // State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data: peerProfile } = await db.peerSupportProfiles.getByUserId(user.id);
        
        if (peerProfile) {
          setFormData(prev => ({
            ...prev,
            // Contact Information
            phone: peerProfile.phone || '',
            address: peerProfile.address || '',
            city: peerProfile.city || '',
            state: peerProfile.state || '',
            zip_code: peerProfile.zip_code || '',
            
            // Professional Information
            title: peerProfile.title || '',
            years_experience: peerProfile.years_experience || 0,
            certifications: peerProfile.certifications || [],
            license_number: peerProfile.license_number || '',
            
            // Service Information
            specialties: peerProfile.specialties || [],
            recovery_approach: peerProfile.recovery_approach || [],
            age_groups_served: peerProfile.age_groups_served || [],
            populations_served: peerProfile.populations_served || [],
            
            // Service Types
            individual_sessions: peerProfile.individual_sessions !== false,
            group_sessions: peerProfile.group_sessions !== false,
            crisis_support: peerProfile.crisis_support || false,
            housing_assistance: peerProfile.housing_assistance !== false,
            employment_support: peerProfile.employment_support || false,
            
            // Availability & Contact
            available_hours: peerProfile.available_hours || '',
            preferred_contact_method: peerProfile.preferred_contact_method || 'phone',
            response_time: peerProfile.response_time || '24-hours',
            max_clients: peerProfile.max_clients || 10,
            service_area: peerProfile.service_area || [],
            service_radius: peerProfile.service_radius || 25,
            offers_telehealth: peerProfile.offers_telehealth !== false,
            offers_in_person: peerProfile.offers_in_person !== false,
            
            // About
            bio: peerProfile.bio || '',
            recovery_story: peerProfile.recovery_story || '',
            
            // Status
            is_accepting_clients: peerProfile.is_accepting_clients !== false,
            is_verified: peerProfile.is_verified || false
          }));
        }
      } catch (error) {
        console.error('Error loading peer support profile:', error);
        setErrors({ load: 'Failed to load your profile. Please refresh the page.' });
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    const requiredFields = [
      'phone', 'bio', 'specialties'
    ];
    
    const optionalButImportantFields = [
      'title', 'years_experience', 'certifications', 'recovery_approach',
      'preferred_contact_method', 'response_time', 'recovery_story'
    ];

    let score = 0;
    const totalPossible = requiredFields.length * 20 + optionalButImportantFields.length * 4;

    // Required fields (20 points each)
    requiredFields.forEach(field => {
      if (field === 'specialties') {
        if (formData[field]?.length > 0) score += 20;
      } else if (formData[field]?.toString().trim()) {
        score += 20;
      }
    });

    // Optional but important fields (4 points each)
    optionalButImportantFields.forEach(field => {
      if (field === 'certifications' || field === 'recovery_approach') {
        if (formData[field]?.length > 0) score += 4;
      } else if (formData[field]?.toString().trim()) {
        score += 4;
      }
    });

    return Math.min(100, Math.round((score / totalPossible) * 100));
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle array field changes
  const handleArrayChange = useCallback((field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }));

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Validation
  const validateForm = useCallback((isSubmission = false) => {
    const newErrors = {};
    
    // Required fields
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Phone validation
      const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.bio?.trim()) {
      newErrors.bio = 'Bio is required';
    }

    if (!formData.specialties?.length) {
      newErrors.specialties = 'Please select at least one specialty';
    }

    // Additional validation for final submission
    if (isSubmission) {
      if (!formData.title?.trim()) {
        newErrors.title = 'Professional title is recommended for profile completion';
      }

      if (formData.years_experience < 0) {
        newErrors.years_experience = 'Years of experience cannot be negative';
      }

      if (formData.max_clients < 1) {
        newErrors.max_clients = 'Maximum clients must be at least 1';
      }

      if (formData.service_radius < 1) {
        newErrors.service_radius = 'Service radius must be at least 1 mile';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission
  const submitForm = useCallback(async (isSubmission = true) => {
    if (!user) {
      setErrors({ submit: 'You must be logged in to save your profile' });
      return false;
    }

    // Validate form
    if (!validateForm(isSubmission)) {
      return false;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      // Prepare data for database
      const peerProfileData = {
        user_id: user.id,
        
        // Contact Information
        phone: formData.phone.trim(),
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state || null,
        zip_code: formData.zip_code?.trim() || null,
        
        // Professional Information
        title: formData.title?.trim() || null,
        years_experience: formData.years_experience || 0,
        certifications: formData.certifications || [],
        license_number: formData.license_number?.trim() || null,
        
        // Service Information
        specialties: formData.specialties || [],
        recovery_approach: formData.recovery_approach || [],
        age_groups_served: formData.age_groups_served || [],
        populations_served: formData.populations_served || [],
        
        // Service Types
        individual_sessions: formData.individual_sessions,
        group_sessions: formData.group_sessions,
        crisis_support: formData.crisis_support,
        housing_assistance: formData.housing_assistance,
        employment_support: formData.employment_support,
        
        // Availability & Contact
        available_hours: formData.available_hours?.trim() || null,
        preferred_contact_method: formData.preferred_contact_method,
        response_time: formData.response_time,
        max_clients: formData.max_clients,
        service_area: formData.service_area || [],
        service_radius: formData.service_radius,
        offers_telehealth: formData.offers_telehealth,
        offers_in_person: formData.offers_in_person,
        
        // About
        bio: formData.bio.trim(),
        recovery_story: formData.recovery_story?.trim() || null,
        
        // Status
        is_accepting_clients: formData.is_accepting_clients,
        is_verified: formData.is_verified,
        
        // Timestamps
        updated_at: new Date().toISOString()
      };

      // Try to update existing profile, or create new one
      const { data: existingProfile } = await db.peerSupportProfiles.getByUserId(user.id);
      
      let result;
      if (existingProfile) {
        result = await db.peerSupportProfiles.update(user.id, peerProfileData);
      } else {
        result = await db.peerSupportProfiles.create(peerProfileData);
      }

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save profile');
      }

      const successMsg = isSubmission 
        ? 'Peer support profile completed successfully!'
        : 'Progress saved successfully!';
      
      setSuccessMessage(successMsg);
      return true;

    } catch (error) {
      console.error('Error saving peer support profile:', error);
      setErrors({ 
        submit: error.message || 'Failed to save peer support profile. Please try again.' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, formData, validateForm]);

  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage('');
  }, []);

  return {
    // State
    formData,
    errors,
    loading,
    initialLoading,
    successMessage,
    
    // Computed values
    completionPercentage: completionPercentage(),
    canSubmit: completionPercentage() >= 80,
    
    // Handlers
    handleInputChange,
    handleArrayChange,
    submitForm,
    validateForm,
    
    // Utils
    setSuccessMessage,
    clearSuccessMessage
  };
};