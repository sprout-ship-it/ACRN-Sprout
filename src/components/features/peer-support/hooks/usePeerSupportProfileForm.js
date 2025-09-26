// src/components/features/peer-support/hooks/usePeerSupportProfileForm.js - UPDATED FOR PHASE 6
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../utils/supabase';

const INITIAL_FORM_DATA = {
  // Contact Information
  primary_phone: '',
  contact_email: '',
  
  // Professional Information
  professional_title: 'Peer Support Specialist',
  is_licensed: false,
  years_experience: '',
  
  // Service Areas
  service_city: '',
  service_state: '',
  service_areas: [],
  
  // Specialties & Methods
  specialties: [],
  supported_recovery_methods: [],
  
  // Recovery Background
  recovery_stage: '',
  time_in_recovery: '',
  primary_issues: [],
  spiritual_affiliation: '',
  
  // Service Settings
  accepting_clients: true,
  
  // About
  bio: '',
  about_me: '',
  additional_info: '',
  
  // Legacy fields for compatibility with existing constants
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  title: '',
  certifications: [],
  license_number: '',
  recovery_approach: [],
  age_groups_served: [],
  populations_served: [],
  individual_sessions: true,
  group_sessions: true,
  crisis_support: false,
  housing_assistance: true,
  employment_support: false,
  available_hours: '',
  preferred_contact_method: 'phone',
  response_time: '24-hours',
  max_clients: 10,
  service_area: [],
  service_radius: 25,
  offers_telehealth: true,
  offers_in_person: true,
  recovery_story: '',
  
  // Status
  is_active: true,
  profile_completed: false,
  is_accepting_clients: true,
  is_verified: false
};

export const usePeerSupportProfileForm = ({ editMode = false, onComplete } = {}) => {
  const { user, profile } = useAuth();
  
  // State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!profile?.id) {
        setInitialLoading(false);
        return;
      }

      try {
        console.log('Loading existing peer support profile for user:', profile.id);
        
        // Check if peer support service exists and has the required method
        if (db.peerSupportService && typeof db.peerSupportService.getByUserId === 'function') {
          const { data: peerProfile, error } = await db.peerSupportService.getByUserId(profile.id);
          
          if (error) {
            console.warn('Error loading peer support profile:', error);
          } else if (peerProfile) {
            console.log('Loaded existing peer support profile:', peerProfile);
            setFormData(prev => ({
              ...prev,
              // Map database fields to form fields
              primary_phone: peerProfile.primary_phone || '',
              contact_email: peerProfile.contact_email || '',
              professional_title: peerProfile.professional_title || 'Peer Support Specialist',
              is_licensed: peerProfile.is_licensed || false,
              years_experience: peerProfile.years_experience || '',
              service_city: peerProfile.service_city || '',
              service_state: peerProfile.service_state || '',
              service_areas: peerProfile.service_areas || [],
              specialties: peerProfile.specialties || [],
              supported_recovery_methods: peerProfile.supported_recovery_methods || [],
              recovery_stage: peerProfile.recovery_stage || '',
              time_in_recovery: peerProfile.time_in_recovery || '',
              primary_issues: peerProfile.primary_issues || [],
              spiritual_affiliation: peerProfile.spiritual_affiliation || '',
              accepting_clients: peerProfile.accepting_clients !== false,
              bio: peerProfile.bio || '',
              about_me: peerProfile.about_me || '',
              additional_info: peerProfile.additional_info || '',
              is_active: peerProfile.is_active !== false,
              profile_completed: peerProfile.profile_completed || false,
              is_accepting_clients: peerProfile.accepting_clients !== false,
              
              // Legacy field mapping for compatibility
              phone: peerProfile.primary_phone || '',
              address: peerProfile.address || '',
              city: peerProfile.service_city || '',
              state: peerProfile.service_state || '',
              zip_code: peerProfile.zip_code || '',
              title: peerProfile.professional_title || '',
              certifications: peerProfile.certifications || [],
              license_number: peerProfile.license_number || '',
              recovery_approach: peerProfile.supported_recovery_methods || [],
              age_groups_served: peerProfile.age_groups_served || [],
              populations_served: peerProfile.populations_served || [],
              individual_sessions: peerProfile.individual_sessions !== false,
              group_sessions: peerProfile.group_sessions !== false,
              crisis_support: peerProfile.crisis_support || false,
              housing_assistance: peerProfile.housing_assistance !== false,
              employment_support: peerProfile.employment_support || false,
              available_hours: peerProfile.available_hours || '',
              preferred_contact_method: peerProfile.preferred_contact_method || 'phone',
              response_time: peerProfile.response_time || '24-hours',
              max_clients: peerProfile.max_clients || 10,
              service_area: peerProfile.service_areas || [],
              service_radius: peerProfile.service_radius || 25,
              offers_telehealth: peerProfile.offers_telehealth !== false,
              offers_in_person: peerProfile.offers_in_person !== false,
              recovery_story: peerProfile.recovery_story || '',
              is_verified: peerProfile.is_verified || false
            }));
          }
        } else {
          console.log('Peer support service not available yet - starting with empty form');
        }
      } catch (error) {
        console.error('Error loading peer support profile:', error);
        setErrors({ load: 'Failed to load your profile. Please refresh the page.' });
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, [profile?.id]);

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    const requiredFields = [
      'primary_phone', 'bio', 'specialties'
    ];
    
    const optionalButImportantFields = [
      'professional_title', 'years_experience', 'service_city', 'service_state',
      'supported_recovery_methods', 'about_me'
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
      if (field === 'supported_recovery_methods') {
        if (formData[field]?.length > 0) score += 4;
      } else if (formData[field]?.toString().trim()) {
        score += 4;
      }
    });

    return Math.min(100, Math.round((score / totalPossible) * 100));
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Sync legacy fields for compatibility
      ...(field === 'primary_phone' && { phone: value }),
      ...(field === 'professional_title' && { title: value }),
      ...(field === 'service_city' && { city: value }),
      ...(field === 'service_state' && { state: value }),
      ...(field === 'accepting_clients' && { is_accepting_clients: value })
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle array field changes
  const handleArrayChange = useCallback((field, value, checked) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [field]: newArray,
        // Sync legacy fields for compatibility
        ...(field === 'specialties' && { specialties: newArray }),
        ...(field === 'supported_recovery_methods' && { recovery_approach: newArray }),
        ...(field === 'service_areas' && { service_area: newArray })
      };
    });

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Validation
  const validateForm = useCallback((isSubmission = false) => {
    const newErrors = {};
    
    // Required fields
    if (!formData.primary_phone?.trim()) {
      newErrors.primary_phone = 'Phone number is required';
    } else {
      // Phone validation
      const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
      if (!phoneRegex.test(formData.primary_phone.replace(/\D/g, ''))) {
        newErrors.primary_phone = 'Please enter a valid phone number';
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
      if (!formData.professional_title?.trim()) {
        newErrors.professional_title = 'Professional title is recommended for profile completion';
      }

      if (!formData.service_city?.trim()) {
        newErrors.service_city = 'Service city is helpful for client matching';
      }

      if (!formData.service_state?.trim()) {
        newErrors.service_state = 'Service state is helpful for client matching';
      }

      if (formData.years_experience && formData.years_experience < 0) {
        newErrors.years_experience = 'Years of experience cannot be negative';
      }

      if (formData.max_clients && formData.max_clients < 1) {
        newErrors.max_clients = 'Maximum clients must be at least 1';
      }

      if (formData.service_radius && formData.service_radius < 1) {
        newErrors.service_radius = 'Service radius must be at least 1 mile';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission
  const submitForm = useCallback(async (isSubmission = true) => {
    if (!profile?.id) {
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
      // Check if peer support service exists
      if (!db.peerSupportService) {
        setErrors({ submit: 'Peer support profile creation is not yet available. Please check back later.' });
        return false;
      }

      // Prepare data for database
      const peerProfileData = {
        user_id: profile.id,
        
        // Contact Information
        primary_phone: formData.primary_phone.trim(),
        contact_email: formData.contact_email?.trim() || null,
        
        // Professional Information
        professional_title: formData.professional_title?.trim() || 'Peer Support Specialist',
        is_licensed: formData.is_licensed || false,
        years_experience: formData.years_experience || null,
        
        // Service Areas
        service_city: formData.service_city?.trim() || null,
        service_state: formData.service_state || null,
        service_areas: formData.service_areas || [],
        
        // Specialties & Methods
        specialties: formData.specialties || [],
        supported_recovery_methods: formData.supported_recovery_methods || [],
        
        // Recovery Background
        recovery_stage: formData.recovery_stage?.trim() || null,
        time_in_recovery: formData.time_in_recovery?.trim() || null,
        primary_issues: formData.primary_issues || [],
        spiritual_affiliation: formData.spiritual_affiliation?.trim() || null,
        
        // Service Settings
        accepting_clients: formData.accepting_clients !== false,
        
        // About
        bio: formData.bio.trim(),
        about_me: formData.about_me?.trim() || null,
        additional_info: formData.additional_info?.trim() || null,
        
        // Legacy fields for compatibility
        address: formData.address?.trim() || null,
        zip_code: formData.zip_code?.trim() || null,
        certifications: formData.certifications || [],
        license_number: formData.license_number?.trim() || null,
        age_groups_served: formData.age_groups_served || [],
        populations_served: formData.populations_served || [],
        individual_sessions: formData.individual_sessions !== false,
        group_sessions: formData.group_sessions !== false,
        crisis_support: formData.crisis_support || false,
        housing_assistance: formData.housing_assistance !== false,
        employment_support: formData.employment_support || false,
        available_hours: formData.available_hours?.trim() || null,
        preferred_contact_method: formData.preferred_contact_method || 'phone',
        response_time: formData.response_time || '24-hours',
        max_clients: formData.max_clients || 10,
        service_radius: formData.service_radius || 25,
        offers_telehealth: formData.offers_telehealth !== false,
        offers_in_person: formData.offers_in_person !== false,
        recovery_story: formData.recovery_story?.trim() || null,
        
        // Status
        is_active: formData.is_active !== false,
        profile_completed: isSubmission && completionPercentage() >= 80,
        is_verified: formData.is_verified || false,
        
        // Timestamps
        updated_at: new Date().toISOString()
      };

      console.log('Submitting peer support profile data:', peerProfileData);

      // Try to update existing profile, or create new one
      let result;
      if (editMode) {
        if (typeof db.peerSupportService.update === 'function') {
          result = await db.peerSupportService.update(profile.id, peerProfileData);
        } else {
          throw new Error('Profile update functionality not available yet');
        }
      } else {
        if (typeof db.peerSupportService.create === 'function') {
          result = await db.peerSupportService.create(peerProfileData);
        } else {
          throw new Error('Profile creation functionality not available yet');
        }
      }

      if (result?.error) {
        throw new Error(result.error.message || 'Failed to save profile');
      }

      const successMsg = isSubmission 
        ? 'Peer support profile completed successfully!'
        : 'Progress saved successfully!';
      
      setSuccessMessage(successMsg);
      
      // Call onComplete callback if provided and this is a final submission
      if (isSubmission && onComplete && typeof onComplete === 'function') {
        setTimeout(() => onComplete(), 1500);
      }
      
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
  }, [profile?.id, formData, validateForm, completionPercentage, editMode, onComplete]);

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