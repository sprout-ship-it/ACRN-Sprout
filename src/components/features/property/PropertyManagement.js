// src/components/dashboard/PropertyManagement.js - ADDED QUICK STATUS TOGGLE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';

// ✅ Import the enhanced section components
import PropertyBasicInfoSection from './sections/PropertyBasicInfoSection';
import PropertyFinancialSection from './sections/PropertyFinancialSection';
import PropertyRecoverySection from './sections/PropertyRecoverySection';
import PropertyAmenitiesSection from './sections/PropertyAmenitiesSection';
import PropertyAvailabilitySection from './sections/PropertyAvailabilitySection';
import PropertyDetailsModal from '../connections/modals/PropertyDetailsModal';

// ✅ Import the finalized form components
import PropertyTypeSelector from './PropertyTypeSelector';
import GeneralPropertyForm from './GeneralPropertyForm';

// ✅ Import enhanced constants for validation and options
import { 
  getValidationRules, 
  isRecoveryPropertyType,
  getPropertyTypesByCategory 
} from './constants/propertyConstants';

// ✅ Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './PropertyManagement.module.css';

const PropertyManagement = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState({});
  const [landlordProfileId, setLandlordProfileId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // ✅ Enhanced bifurcation state
  const [propertyFormType, setPropertyFormType] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // ✅ NEW: Track which property status is being updated
  const [updatingStatusFor, setUpdatingStatusFor] = useState(null);

  // ✅ FINAL: Comprehensive form data structure supporting all fields
  const [formData, setFormData] = useState({
    // Universal Basic Info
    property_name: '',
    property_type: 'apartment',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    contact_email: '',
    description: '',
    
    // Universal Housing Details (Enhanced with proper bed/room distinction)
    bedrooms: '',
    total_beds: '',
    available_beds: '', // Recovery housing only
    bathrooms: '1',
    square_footage: '', // General rentals
    
    // Universal Financial
    rent_amount: '',
    security_deposit: '',
    application_fee: '',
    weekly_rate: '', // Recovery housing only
    
    // Universal Services & Features
    utilities_included: [],
    furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    amenities: [],
    accessibility_features: [],
    
    // Universal Availability & Terms (NEW SECTION FIELDS)
    available_date: '',
    lease_duration: '',
    accepting_applications: true,
    status: 'available',
    
    // General Rental Specific (NEW SECTION FIELDS)
    showing_availability: '',
    showing_notice: '',
    preferred_contact_method: 'phone',
    response_time_expectation: '24_hours',
    special_terms: '',
    
    // Recovery Housing Specific
    meals_included: false,
    linens_provided: false,
    accepted_subsidies: [],
    required_programs: [],
    min_sobriety_time: '',
    treatment_completion_required: '',
    house_rules: [],
    additional_house_rules: '',
    gender_restrictions: 'any',
    age_restrictions: '',
    criminal_background_ok: false,
    sex_offender_restrictions: false,
    neighborhood_features: [],
    case_management: false,
    counseling_services: false,
    job_training: false,
    medical_services: false,
    transportation_services: false,
    life_skills_training: false,
    license_number: '',
    accreditation: '',
    property_status: 'available',
    move_in_timeline: '', // Recovery housing availability
    
    // Universal Additional Info
    additional_notes: ''
  });

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // ✅ ENHANCED: Recovery housing form sections with availability section
  const formSections = [
    { id: 'basic', title: 'Basic Info', component: PropertyBasicInfoSection, icon: '🏠' },
    { id: 'financial', title: 'Financial', component: PropertyFinancialSection, icon: '💰' },
    { id: 'availability', title: 'Availability', component: PropertyAvailabilitySection, icon: '📅' },
    { id: 'recovery', title: 'Recovery', component: PropertyRecoverySection, icon: '🌱' },
    { id: 'amenities', title: 'Amenities', component: PropertyAmenitiesSection, icon: '⭐' }
  ];

  // ✅ NEW: Status options based on property type
  const getStatusOptions = (property) => {
    const isRecoveryHousing = property.is_recovery_housing || isRecoveryPropertyType(property.property_type);
    
    if (isRecoveryHousing) {
      return [
        { value: 'available', label: '✅ Available', color: '#10b981' },
        { value: 'waitlist', label: '⏳ Waitlist', color: '#f59e0b' },
        { value: 'full', label: '🚫 Full', color: '#ef4444' },
        { value: 'temporarily_closed', label: '⏸️ Temp Closed', color: '#6b7280' },
        { value: 'under_renovation', label: '🔧 Renovating', color: '#8b5cf6' }
      ];
    } else {
      return [
        { value: 'available', label: '✅ Available', color: '#10b981' },
        { value: 'waitlist', label: '⏳ Waitlist', color: '#f59e0b' },
        { value: 'full', label: '🚫 Full', color: '#ef4444' },
        { value: 'temporarily_closed', label: '⏸️ Temp Closed', color: '#6b7280' }
      ];
    }
  };

  // ✅ NEW: Quick status update handler
  const handleQuickStatusChange = async (property, newStatus) => {
    if (updatingStatusFor === property.id) return; // Prevent double-clicks
    
    setUpdatingStatusFor(property.id);
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', property.id);

      if (error) throw error;

      // Update local state
      setProperties(prevProperties => 
        prevProperties.map(p => 
          p.id === property.id ? { ...p, status: newStatus } : p
        )
      );

      // Optional: Show success feedback
      console.log(`✅ Property status updated to: ${newStatus}`);

    } catch (error) {
      console.error('Error updating property status:', error);
      alert('Failed to update property status. Please try again.');
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    if (!landlordProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  useEffect(() => {
    const fetchLandlordProfileId = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('landlord_profiles')
          .select('id')
          .eq('user_id', profile?.id)
          .single();

        if (error) {
          console.error('Error fetching landlord profile ID:', error);
          return;
        }

        if (data) {
          setLandlordProfileId(data.id);
        }
      } catch (error) {
        console.error('Error in fetchLandlordProfileId:', error);
      }
    };

    fetchLandlordProfileId();
  }, [user?.id, profile?.id]);

  useEffect(() => {
    if (landlordProfileId) {
      fetchProperties();
    }
  }, [landlordProfileId]);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowTypeSelector(true);
    setShowForm(false);
  };

  useEffect(() => {
    if (showForm && !editingProperty) {
      setTimeout(() => {
        const firstInput = document.querySelector('input[name="property_name"]');
        if (firstInput) {
          firstInput.focus();
          firstInput.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [showForm, editingProperty]);

  // ✅ ENHANCED: Property type selection with optimized defaults
  const handlePropertyTypeSelection = (type) => {
    setPropertyFormType(type);
    setShowTypeSelector(false);
    setShowForm(true);
   
    if (type === 'general_rental') {
      setFormData({
        // General rental optimized defaults
        property_name: '', 
        property_type: 'apartment',
        address: '', 
        city: '', 
        state: '',
        zip_code: '', 
        phone: '', 
        contact_email: '', 
        description: '', 
        bedrooms: '',
        total_beds: '',
        bathrooms: '1', 
        square_footage: '',
        rent_amount: '', 
        security_deposit: '', 
        application_fee: '',
        utilities_included: [],
        furnished: false, 
        pets_allowed: false, 
        smoking_allowed: false, 
        amenities: [],
        accessibility_features: [],
        available_date: '',
        lease_duration: '',
        showing_availability: '',
        showing_notice: '',
        preferred_contact_method: 'phone',
        response_time_expectation: '24_hours',
        special_terms: '',
        accepting_applications: true,
        status: 'available',
        additional_notes: ''
      });
    } else {
      setFormData({
        // Recovery housing defaults
        property_name: '', 
        property_type: 'sober_living_level_1', 
        address: '', 
        city: '', 
        state: '', 
        zip_code: '', 
        phone: '', 
        contact_email: '', 
        description: '', 
        bedrooms: '', 
        total_beds: '', 
        available_beds: '', 
        bathrooms: '', 
        rent_amount: '', 
        security_deposit: '', 
        application_fee: '', 
        weekly_rate: '',
        utilities_included: [], 
        furnished: false, 
        meals_included: false, 
        linens_provided: false,
        accepted_subsidies: [], 
        required_programs: [], 
        min_sobriety_time: '', 
        treatment_completion_required: '',
        house_rules: [], 
        additional_house_rules: '', 
        gender_restrictions: 'any', 
        age_restrictions: '',
        pets_allowed: false, 
        smoking_allowed: false, 
        criminal_background_ok: false, 
        sex_offender_restrictions: false,
        amenities: [], 
        accessibility_features: [], 
        neighborhood_features: [], 
        case_management: false,
        counseling_services: false, 
        job_training: false, 
        medical_services: false, 
        transportation_services: false,
        life_skills_training: false, 
        license_number: '', 
        accreditation: '', 
        available_date: '',
        lease_duration: '',
        move_in_timeline: '',
        accepting_applications: true,
        property_status: 'available', 
        additional_notes: ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (fieldName, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: isChecked
        ? [...(prev[fieldName] || []), value]
        : (prev[fieldName] || []).filter(item => item !== value)
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // ✅ ENHANCED: Advanced validation using constants
  const validateForm = () => {
    const newErrors = {};
    
    // Get validation rules based on property type
    const validationRules = getValidationRules(propertyFormType);
    
    // Check required fields
    validationRules.required.forEach(field => {
      const value = formData[field];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate numeric fields with min/max constraints
    Object.entries(validationRules.numeric.min).forEach(([field, minValue]) => {
      if (formData[field] && formData[field] !== '') {
        const numValue = parseFloat(formData[field]);
        if (isNaN(numValue) || numValue < minValue) {
          newErrors[field] = `Must be at least ${minValue}`;
        }
      }
    });

    Object.entries(validationRules.numeric.max).forEach(([field, maxValue]) => {
      if (formData[field] && formData[field] !== '') {
        const numValue = parseFloat(formData[field]);
        if (!isNaN(numValue) && numValue > maxValue) {
          newErrors[field] = `Must be no more than ${maxValue}`;
        }
      }
    });

    // Special validation: available beds cannot exceed total beds
    if (propertyFormType === 'recovery_housing' && formData.available_beds && formData.total_beds) {
      const availableBeds = parseInt(formData.available_beds);
      const totalBeds = parseInt(formData.total_beds);
      if (!isNaN(availableBeds) && !isNaN(totalBeds) && availableBeds > totalBeds) {
        newErrors.available_beds = 'Available beds cannot exceed total beds';
      }
    }

    // Date validation: available_date must be in the future
    if (formData.available_date) {
      const selectedDate = new Date(formData.available_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.available_date = 'Available date must be today or in the future';
      }
    }

    console.log('Enhanced validation result:', {
      formType: propertyFormType,
      errorCount: Object.keys(newErrors).length,
      errors: newErrors
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!landlordProfileId) {
      alert('Unable to create property. Please ensure your landlord profile is complete.');
      return;
    }
    
    const isValid = validateForm();
    if (!isValid) {
      // Enhanced error navigation for recovery housing
      if (propertyFormType === 'recovery_housing') {
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
          const fieldSectionMap = {
            // Section 0: Basic Info
            property_name: 0, property_type: 0, address: 0, city: 0, state: 0, zip_code: 0, phone: 0, contact_email: 0, description: 0,
            // Section 1: Financial
            bedrooms: 1, total_beds: 1, available_beds: 1, bathrooms: 1, rent_amount: 1, security_deposit: 1, application_fee: 1, weekly_rate: 1,
            // Section 2: Availability (NEW)
            available_date: 2, lease_duration: 2, move_in_timeline: 2, special_terms: 2,
            // Section 3: Recovery 
            required_programs: 3, min_sobriety_time: 3, treatment_completion_required: 3, house_rules: 3, gender_restrictions: 3, age_restrictions: 3,
            // Section 4: Amenities
            amenities: 4, accessibility_features: 4, neighborhood_features: 4
          };
          
          const firstErrorField = errorFields[0];
          const targetSection = fieldSectionMap[firstErrorField];
          
          if (typeof targetSection === 'number' && targetSection !== currentSection) {
            setCurrentSection(targetSection);
            setTimeout(() => {
              const errorField = document.querySelector(`[name="${firstErrorField}"]`);
              if (errorField) {
                errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorField.focus();
              }
            }, 100);
          }
        }
      }
      return;
    }

    setLoading(true);
    
    try {
      // ✅ FINAL: Enhanced property data mapping with all new fields
      const propertyData = propertyFormType === 'general_rental'
        ? {
            // General rental comprehensive mapping
            landlord_id: landlordProfileId,
            title: formData.property_name,
            property_type: formData.property_type,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            phone: formData.phone,
            contact_email: formData.contact_email || null,
            description: formData.description || null,
            bedrooms: parseInt(formData.bedrooms) || 0,
            total_beds: parseInt(formData.total_beds) || parseInt(formData.bedrooms) || 0,
            bathrooms: parseFloat(formData.bathrooms) || 1,
            square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
            monthly_rent: parseInt(formData.rent_amount),
            security_deposit: formData.security_deposit ? parseInt(formData.security_deposit) : null,
            application_fee: formData.application_fee ? parseInt(formData.application_fee) : 0,
            available_date: formData.available_date || null,
            lease_duration: formData.lease_duration || null,
            utilities_included: formData.utilities_included || [],
            furnished: formData.furnished,
            pets_allowed: formData.pets_allowed,
            smoking_allowed: formData.smoking_allowed,
            amenities: formData.amenities || [],
            accessibility_features: formData.accessibility_features || [],
            accepting_applications: formData.accepting_applications,
            status: formData.status || 'available',
            additional_notes: formData.additional_notes || null,
            // NEW: General rental specific fields stored in internal_notes as JSON
            internal_notes: JSON.stringify({
              showing_availability: formData.showing_availability,
              showing_notice: formData.showing_notice,
              preferred_contact_method: formData.preferred_contact_method,
              response_time_expectation: formData.response_time_expectation,
              special_terms: formData.special_terms
            }),
            is_recovery_housing: false
          }
        : {
            // Recovery housing comprehensive mapping
            landlord_id: landlordProfileId,
            title: formData.property_name,
            property_type: formData.property_type,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            phone: formData.phone,
            contact_email: formData.contact_email || null,
            description: formData.description || null,
            bedrooms: parseInt(formData.bedrooms) || 0,
            total_beds: parseInt(formData.total_beds) || 0,
            available_beds: parseInt(formData.available_beds) || 0,
            bathrooms: parseFloat(formData.bathrooms) || 1,
            monthly_rent: parseInt(formData.rent_amount),
            security_deposit: formData.security_deposit ? parseInt(formData.security_deposit) : null,
            application_fee: formData.application_fee ? parseInt(formData.application_fee) : 0,
            weekly_rate: formData.weekly_rate ? parseInt(formData.weekly_rate) : null,
            available_date: formData.available_date || null,
            lease_duration: formData.lease_duration || null,
            utilities_included: formData.utilities_included || [],
            furnished: formData.furnished,
            pets_allowed: formData.pets_allowed,
            smoking_allowed: formData.smoking_allowed,
            accepted_subsidies: formData.accepted_subsidies || [],
            required_programs: formData.required_programs || [],
            min_sobriety_time: formData.min_sobriety_time || null,
            treatment_completion_required: formData.treatment_completion_required || null,
            house_rules: formData.house_rules || [],
            additional_house_rules: formData.additional_house_rules || null,
            gender_restrictions: formData.gender_restrictions,
            age_restrictions: formData.age_restrictions || null,
            criminal_background_ok: formData.criminal_background_ok,
            sex_offender_restrictions: formData.sex_offender_restrictions,
            accessibility_features: formData.accessibility_features || [],
            neighborhood_features: formData.neighborhood_features || [],
            case_management: formData.case_management,
            counseling_services: formData.counseling_services,
            job_training: formData.job_training,
            medical_services: formData.medical_services,
            transportation_services: formData.transportation_services,
            life_skills_training: formData.life_skills_training,
            license_number: formData.license_number || null,
            accreditation: formData.accreditation || null,
            accepting_applications: formData.accepting_applications,
            meals_included: formData.meals_included,
            linens_provided: formData.linens_provided,
            status: formData.property_status || 'available',
            additional_notes: formData.additional_notes || null,
            amenities: formData.amenities || [],
            // NEW: Recovery housing specific fields in internal_notes
            internal_notes: JSON.stringify({
              move_in_timeline: formData.move_in_timeline,
              special_terms: formData.special_terms
            }),
            is_recovery_housing: true
          };

      let result;
      if (editingProperty) {
        result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id);
      } else {
        result = await supabase
          .from('properties')
          .insert([propertyData]);
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      await fetchProperties();
      resetForm();
      alert(editingProperty ? 'Property updated successfully!' : 'Property added successfully!');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      property_name: '', property_type: 'apartment', address: '', city: '', state: '', 
      zip_code: '', phone: '', contact_email: '', description: '', 
      bedrooms: '', total_beds: '', available_beds: '', bathrooms: '1', square_footage: '',
      rent_amount: '', security_deposit: '', application_fee: '', weekly_rate: '',
      utilities_included: [], furnished: false, meals_included: false, linens_provided: false,
      accepted_subsidies: [], required_programs: [], min_sobriety_time: '', treatment_completion_required: '',
      house_rules: [], additional_house_rules: '', gender_restrictions: 'any', age_restrictions: '',
      pets_allowed: false, smoking_allowed: false, criminal_background_ok: false, sex_offender_restrictions: false,
      amenities: [], accessibility_features: [], neighborhood_features: [], case_management: false,
      counseling_services: false, job_training: false, medical_services: false, transportation_services: false,
      life_skills_training: false, license_number: '', accreditation: '', 
      available_date: '', lease_duration: '', showing_availability: '', showing_notice: '',
      preferred_contact_method: 'phone', response_time_expectation: '24_hours', special_terms: '',
      move_in_timeline: '', accepting_applications: true, status: 'available', property_status: 'available', 
      additional_notes: ''
    });
    setEditingProperty(null);
    setShowForm(false);
    setShowTypeSelector(false);
    setPropertyFormType(null);
    setCurrentSection(0);
    setErrors({});
  };

  // ✅ ENHANCED: Smart property editing with better type detection and new field support
  const editProperty = (property) => {
    // Enhanced type detection
    const isRecoveryHousing = property.is_recovery_housing || 
                             isRecoveryPropertyType(property.property_type) ||
                             property.accepted_subsidies?.length > 0 ||
                             property.required_programs?.length > 0;
    
    setPropertyFormType(isRecoveryHousing ? 'recovery_housing' : 'general_rental');

    // Parse internal_notes for additional fields
    let internalNotes = {};
    try {
      if (property.internal_notes) {
        internalNotes = JSON.parse(property.internal_notes);
      }
    } catch (e) {
      console.warn('Could not parse internal_notes:', e);
    }

    if (isRecoveryHousing) {
      setFormData({
        // Recovery housing comprehensive editing
        property_name: property.title || '',
        property_type: property.property_type || 'sober_living_level_1',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        phone: property.phone || '',
        contact_email: property.contact_email || '',
        description: property.description || '',
        bedrooms: property.bedrooms?.toString() || '',
        total_beds: property.total_beds?.toString() || '',
        available_beds: property.available_beds?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        rent_amount: property.monthly_rent?.toString() || '',
        security_deposit: property.security_deposit?.toString() || '',
        application_fee: property.application_fee?.toString() || '',
        weekly_rate: property.weekly_rate?.toString() || '',
        available_date: property.available_date || '',
        lease_duration: property.lease_duration || '',
        utilities_included: property.utilities_included || [],
        furnished: property.furnished || false,
        pets_allowed: property.pets_allowed || false,
        smoking_allowed: property.smoking_allowed || false,
        accepted_subsidies: property.accepted_subsidies || [],
        required_programs: property.required_programs || [],
        min_sobriety_time: property.min_sobriety_time || '',
        treatment_completion_required: property.treatment_completion_required || '',
        house_rules: property.house_rules || [],
        additional_house_rules: property.additional_house_rules || '',
        gender_restrictions: property.gender_restrictions || 'any',
        age_restrictions: property.age_restrictions || '',
        criminal_background_ok: property.criminal_background_ok || false,
        sex_offender_restrictions: property.sex_offender_restrictions || false,
        accessibility_features: property.accessibility_features || [],
        neighborhood_features: property.neighborhood_features || [],
        case_management: property.case_management || false,
        counseling_services: property.counseling_services || false,
        job_training: property.job_training || false,
        medical_services: property.medical_services || false,
        transportation_services: property.transportation_services || false,
        life_skills_training: property.life_skills_training || false,
        license_number: property.license_number || '',
        accreditation: property.accreditation || '',
        accepting_applications: property.accepting_applications !== false,
        meals_included: property.meals_included || false,
        linens_provided: property.linens_provided || false,
        property_status: property.status || 'available',
        additional_notes: property.additional_notes || '',
        amenities: property.amenities || [],
        // NEW: Recovery housing internal notes
        move_in_timeline: internalNotes.move_in_timeline || '',
        special_terms: internalNotes.special_terms || ''
      });
    } else {
      setFormData({
        // General rental comprehensive editing
        property_name: property.title || '',
        property_type: property.property_type || 'apartment',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        phone: property.phone || '',
        contact_email: property.contact_email || '',
        description: property.description || '',
        bedrooms: property.bedrooms?.toString() || '',
        total_beds: property.total_beds?.toString() || property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '1',
        square_footage: property.square_footage?.toString() || '',
        rent_amount: property.monthly_rent?.toString() || '',
        security_deposit: property.security_deposit?.toString() || '',
        application_fee: property.application_fee?.toString() || '',
        available_date: property.available_date || '',
        lease_duration: property.lease_duration || '',
        utilities_included: property.utilities_included || [],
        furnished: property.furnished || false,
        pets_allowed: property.pets_allowed || false,
        smoking_allowed: property.smoking_allowed || false,
        amenities: property.amenities || [],
        accessibility_features: property.accessibility_features || [],
        accepting_applications: property.accepting_applications !== false,
        status: property.status || 'available',
        additional_notes: property.additional_notes || '',
        // NEW: General rental internal notes
        showing_availability: internalNotes.showing_availability || '',
        showing_notice: internalNotes.showing_notice || '',
        preferred_contact_method: internalNotes.preferred_contact_method || 'phone',
        response_time_expectation: internalNotes.response_time_expectation || '24_hours',
        special_terms: internalNotes.special_terms || ''
      });
    }

    setEditingProperty(property);
    setShowForm(true);
    setCurrentSection(0);
  };
  /**
   * Handle viewing property details in modal
   */
  const handleViewPropertyDetails = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  /**
   * Handle closing property details modal
   */
  const handleClosePropertyModal = () => {
    setSelectedProperty(null);
    setShowPropertyModal(false);
  };

  /**
   * Handle contact from modal (opens mailto)
   */
  const handleContactFromModal = (property) => {
    const subject = `Property Inquiry: ${property.title}`;
    const body = `Property Details:\n${property.address}\n${property.city}, ${property.state}\n\nContact: ${property.phone || 'N/A'}`;
    
    if (property.contact_email) {
      window.location.href = `mailto:${property.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      alert(`Contact Phone: ${property.phone || 'Not available'}`);
    }
  };
  
  const deleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      await fetchProperties();
      alert('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property. Please try again.');
    }
  };

  const nextSection = () => {
    if (currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
      setTimeout(() => {
        const modalContent = document.querySelector(`.${styles.modalContent}`);
        const firstInput = modalContent?.querySelector('input, select, textarea');
        if (firstInput) {
          firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setTimeout(() => {
        const modalContent = document.querySelector(`.${styles.modalContent}`);
        const firstInput = modalContent?.querySelector('input, select, textarea');
        if (firstInput) {
          firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const goToSection = (index) => {
    setCurrentSection(index);
    setTimeout(() => {
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      const firstInput = modalContent?.querySelector('input, select, textarea');
      if (firstInput) {
        firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // ✅ ENHANCED: Section component with isRecoveryHousing prop for availability section
  const getCurrentSectionComponent = () => {
    const section = formSections[currentSection];
    if (!section) return null;
    
    const Component = section.component;
    const baseProps = {
      formData,
      errors,
      loading,
      onInputChange: handleInputChange,
      onArrayChange: handleArrayChange,
      stateOptions
    };

    // Special handling for PropertyAvailabilitySection
    if (section.id === 'availability') {
      return <Component {...baseProps} isRecoveryHousing={true} />;
    }

    return <Component {...baseProps} />;
  };

  return (
    <div className="content">
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Property Management</h1>
          <p className={styles.headerSubtitle}>
            Manage all your rental properties - from traditional apartments to specialized recovery housing
          </p>
        </div>
        
        <button
          className={styles.addPropertyButton}
          onClick={handleAddProperty}
        >
          + Add Property
        </button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🏠</div>
          <h3 className={styles.emptyStateTitle}>No properties yet</h3>
          <p className={styles.emptyStateText}>Add your first property to get started with comprehensive property management.</p>
        </div>
      ) : (
        <div className={styles.propertiesGrid}>
          {properties.map(property => {
            const statusOptions = getStatusOptions(property);
            const currentStatus = statusOptions.find(opt => opt.value === property.status) || statusOptions[0];
            
            return (
              <div key={property.id} className={styles.propertyCard}>
                <div className={styles.propertyCardHeader}>
                  <div className={styles.propertyInfo}>
                    <h3 className={styles.propertyTitle}>{property.title}</h3>
                    <p className={styles.propertyAddress}>{property.address}, {property.city}, {property.state}</p>
                  </div>
                  <div className={styles.propertyBadges}>
                    {/* ✅ NEW: Quick Status Toggle */}
                    <div className={styles.statusToggleContainer}>
                      <label className={styles.statusToggleLabel}>Status:</label>
                      <select
                        className={styles.statusToggle}
                        value={property.status}
                        onChange={(e) => handleQuickStatusChange(property, e.target.value)}
                        disabled={updatingStatusFor === property.id}
                        style={{ 
                          borderColor: currentStatus.color,
                          color: currentStatus.color,
                          fontWeight: '600'
                        }}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {property.is_recovery_housing ? (
                      <span className={styles.badgeInfo}>Recovery Housing</span>
                    ) : (
                      <span className={styles.badgeSecondary}>General Rental</span>
                    )}
                    {property.accepting_applications && (
                      <span className={styles.badgeSuccess}>Accepting Applications</span>
                    )}
                  </div>
                </div>
                
                <div className={styles.propertyDetailsGrid}>
                  <div className={styles.propertyDetail}>
                    <span className={styles.propertyDetailLabel}>Type:</span>
                    <span className={styles.propertyDetailValue}>
                      {property.property_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className={styles.propertyDetail}>
                    <span className={styles.propertyDetailLabel}>Rent:</span>
                    <span className={styles.propertyDetailValue}>${property.monthly_rent}/mo</span>
                  </div>
                  <div className={styles.propertyDetail}>
                    <span className={styles.propertyDetailLabel}>Bedrooms:</span>
                    <span className={styles.propertyDetailValue}>{property.bedrooms || 'Studio'}</span>
                  </div>
                  <div className={styles.propertyDetail}>
                    <span className={styles.propertyDetailLabel}>Total Beds:</span>
                    <span className={styles.propertyDetailValue}>{property.total_beds || property.bedrooms || 'Studio'}</span>
                  </div>
                  {property.is_recovery_housing && (
                    <div className={styles.propertyDetail}>
                      <span className={styles.propertyDetailLabel}>Available Beds:</span>
                      <span className={styles.propertyDetailValue}>{property.available_beds || 0}</span>
                    </div>
                  )}
                  {property.available_date && (
                    <div className={styles.propertyDetail}>
                      <span className={styles.propertyDetailLabel}>Available:</span>
                      <span className={styles.propertyDetailValue}>
                        {new Date(property.available_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={styles.propertyActions}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleViewPropertyDetails(property)}
                  >
                    👁️ View Details
                  </button>
                  
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => editProperty(property)}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteProperty(property.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Type Selector Modal */}
      {showTypeSelector && (
        <div className={styles.modalOverlay} onClick={() => setShowTypeSelector(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <PropertyTypeSelector onSelection={handlePropertyTypeSelection} />
          </div>
        </div>
      )}

      {/* Add/Edit Property Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={`${styles.modalContent} ${styles.modalContentLarge}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingProperty ? 'Edit Property' : 'Add New Property'}
                {propertyFormType && (
                  <span className={styles.modalSubtitle}>
                    ({propertyFormType === 'general_rental' ? 'General Rental' : 'Recovery Housing'})
                  </span>
                )}
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {propertyFormType === 'general_rental' ? (
                // ✅ FINAL: Complete GeneralPropertyForm integration
                <GeneralPropertyForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  onInputChange={handleInputChange}
                  onArrayChange={handleArrayChange}
                  stateOptions={stateOptions}
                />
              ) : (
                // ✅ ENHANCED: Recovery housing with 5 sections including availability
                <>
                  <nav className={styles.sectionNav}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${((currentSection + 1) / formSections.length) * 100}%` }}
                      />
                    </div>
                    
                    <div className={styles.sectionNavContainer}>
                      {formSections.map((section, index) => (
                        <button
                          key={section.id}
                          type="button"
                          className={`${styles.sectionNavBtn} ${index === currentSection ? styles.active : ''} ${index < currentSection ? styles.completed : ''}`}
                          onClick={() => goToSection(index)}
                          disabled={loading}
                        >
                          <span className={styles.sectionNumber}>{index + 1}</span>
                          <div className={styles.sectionInfo}>
                            <span className={styles.sectionIcon}>{section.icon}</span>
                            <span className={styles.sectionTitle}>{section.title}</span>
                          </div>
                          {index < currentSection && <span className={styles.checkMark}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </nav>
                  
                  {getCurrentSectionComponent()}
                </>
              )}
              
              {/* Action buttons */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionOutline}`}
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                
                {propertyFormType === 'recovery_housing' && (
                  <>
                    {currentSection > 0 && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.actionSecondary}`}
                        onClick={prevSection}
                        disabled={loading}
                      >
                        ← Previous
                      </button>
                    )}
                    
                    {currentSection >= formSections.length - 1 ? (
                      <button
                        type="submit"
                        className={`${styles.actionButton} ${styles.actionPrimary}`}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Create Property')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.actionPrimary}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextSection();
                        }}
                        disabled={loading}
                      >
                        Next → ({currentSection + 1} of {formSections.length})
                      </button>
                    )}
                  </>
                )}
                
                {propertyFormType === 'general_rental' && (
                  <button
                    type="submit"
                    className={`${styles.actionButton} ${styles.actionPrimary}`}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Create Property')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <PropertyDetailsModal
          isOpen={showPropertyModal}
          property={selectedProperty}
          connectionStatus={null}
          onClose={handleClosePropertyModal}
          onContact={handleContactFromModal}
          showContactInfo={true}
          showActions={false}
          isLandlordView={true}
        />
      )}

    </div>
  );
};

export default PropertyManagement;