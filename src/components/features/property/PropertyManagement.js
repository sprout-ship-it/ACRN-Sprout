// src/components/dashboard/PropertyManagement.js - UPDATED WITH FIXES
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';

// Import the new sectioned components
import PropertyBasicInfoSection from './sections/PropertyBasicInfoSection';
import PropertyFinancialSection from './sections/PropertyFinancialSection';
import PropertyRecoverySection from './sections/PropertyRecoverySection';
import PropertyAmenitiesSection from './sections/PropertyAmenitiesSection';

// Import the new bifurcation components
import PropertyTypeSelector from './PropertyTypeSelector';
import SimplifiedPropertyForm from './SimplifiedPropertyForm';

// ✅ UPDATED: Import our new CSS foundation and component module
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

  // ✅ NEW: Bifurcation state variables
  const [propertyFormType, setPropertyFormType] = useState(null); // 'general_rental' or 'recovery_housing'
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // ✅ CORRECTED: Enhanced form data structure with schema-compliant fields
  const [formData, setFormData] = useState({
    // Basic Info
    property_name: '',
    property_type: 'sober_living_level_1',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    contact_email: '',
    description: '',
    
    // Financial & Housing
    total_beds: '',
    available_beds: '',
    bathrooms: '',
    rent_amount: '',
    security_deposit: '',
    application_fee: '',
    weekly_rate: '',
    utilities_included: [], // ✅ CORRECTED: Array instead of boolean
    furnished: false,
    meals_included: false,
    linens_provided: false,
    accepted_subsidies: [], // ✅ NEW
    
    // Recovery & Rules
    required_programs: [], // ✅ NEW
    min_sobriety_time: '',
    treatment_completion_required: '',
    house_rules: [], // ✅ NEW
    additional_house_rules: '',
    gender_restrictions: 'any',
    age_restrictions: '',
    pets_allowed: false,
    smoking_allowed: false,
    criminal_background_ok: false,
    sex_offender_restrictions: false,
    
    // Amenities & Services
    amenities: [],
    accessibility_features: [], // ✅ NEW
    neighborhood_features: [], // ✅ NEW
    case_management: false,
    counseling_services: false,
    job_training: false,
    medical_services: false,
    transportation_services: false,
    life_skills_training: false,
    license_number: '',
    accreditation: '',
    accepting_applications: true,
    property_status: 'available',
    additional_notes: ''
  });

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Form sections for navigation (recovery housing only)
  const formSections = [
    { id: 'basic', title: 'Basic Info', component: PropertyBasicInfoSection, icon: '🏠' },
    { id: 'financial', title: 'Financial', component: PropertyFinancialSection, icon: '💰' },
    { id: 'recovery', title: 'Recovery', component: PropertyRecoverySection, icon: '🌱' },
    { id: 'amenities', title: 'Amenities', component: PropertyAmenitiesSection, icon: '⭐' }
  ];

useEffect(() => {
  fetchProperties();
}, []);

const fetchProperties = async () => {
  if (!landlordProfileId) return; // Wait for landlord profile ID
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', landlordProfileId) // ✅ Fixed: use landlordProfileId
      .order('created_at', { ascending: false });

    if (error) throw error;
    setProperties(data || []);
  } catch (error) {
    console.error('Error fetching properties:', error);
  }
};

// ✅ ADD this new useEffect right after the above:
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
        console.log('Landlord profile ID found:', data.id);
      }
    } catch (error) {
      console.error('Error in fetchLandlordProfileId:', error);
    }
  };

  fetchLandlordProfileId();
}, [user?.id, profile?.id]);

// ✅ ADD this useEffect to re-fetch properties when landlordProfileId is available:
useEffect(() => {
  if (landlordProfileId) {
    fetchProperties();
  }
}, [landlordProfileId]);

  // ✅ MODIFIED: New "Add Property" button handler
  const handleAddProperty = () => {
    setEditingProperty(null); // ✅ FIX: Clear editing state for new property
    setShowTypeSelector(true);
    setShowForm(false);
  };

useEffect(() => {
  // Auto-focus first field when form opens - improved centering
  if (showForm && !editingProperty) {
    setTimeout(() => {
      const firstInput = document.querySelector('input[name="property_name"]');
      if (firstInput) {
        firstInput.focus();
        // ✅ IMPROVED: Center the field in the viewport
        firstInput.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  }
}, [showForm, editingProperty]);

  // ✅ NEW: Handler for property type selection
  const handlePropertyTypeSelection = (type) => {
    setPropertyFormType(type);
    setShowTypeSelector(false);
    setShowForm(true);
   
    // Reset form data based on type
    if (type === 'general_rental') {
      // Set simplified form defaults
      setFormData({
        property_name: '', 
        property_type: 'apartment', 
        address: '', 
        city: '', 
        state: '',
        zip_code: '', 
        phone: '', 
        contact_email: '', 
        description: '', 
        total_beds: '',
        bathrooms: '1', 
        rent_amount: '', 
        security_deposit: '', 
        application_fee: '',
        furnished: false, 
        pets_allowed: false, 
        smoking_allowed: false, 
        amenities: []
      });
    } else {
      // Keep existing complex form defaults
      setFormData({
        property_name: '', property_type: 'sober_living_level_1', address: '', city: '', state: '', 
        zip_code: '', phone: '', contact_email: '', description: '', total_beds: '', available_beds: '', 
        bathrooms: '', rent_amount: '', security_deposit: '', application_fee: '', weekly_rate: '',
        utilities_included: [], furnished: false, meals_included: false, linens_provided: false,
        accepted_subsidies: [], required_programs: [], min_sobriety_time: '', treatment_completion_required: '',
        house_rules: [], additional_house_rules: '', gender_restrictions: 'any', age_restrictions: '',
        pets_allowed: false, smoking_allowed: false, criminal_background_ok: false, sex_offender_restrictions: false,
        amenities: [], accessibility_features: [], neighborhood_features: [], case_management: false,
        counseling_services: false, job_training: false, medical_services: false, transportation_services: false,
        life_skills_training: false, license_number: '', accreditation: '', accepting_applications: true,
        property_status: 'available', additional_notes: ''
      });
    }
  };

  // Handle input changes for all field types
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ NEW: Handle array changes (checkboxes, multi-select)
  const handleArrayChange = (fieldName, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: isChecked
        ? [...(prev[fieldName] || []), value]
        : (prev[fieldName] || []).filter(item => item !== value)
    }));
    
    // Clear error when user makes changes
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // ✅ UPDATED: Form validation with type-specific requirements and debugging
  const validateForm = () => {
    const newErrors = {};
    
    // Base required fields for both types
    const baseRequiredFields = [
      'property_name', 'property_type', 'address', 'city', 
      'state', 'zip_code', 'phone', 'total_beds', 'rent_amount'
    ];
    
    // Check required fields
    baseRequiredFields.forEach(field => {
      const value = formData[field];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = 'This field is required';
        console.log(`Validation error - Required field missing: ${field}`, value);
      }
    });

    // Validate numeric fields - only if they have values and are required
    if (formData.total_beds) {
      const totalBeds = parseInt(formData.total_beds);
      if (isNaN(totalBeds) || totalBeds <= 0) {
        newErrors.total_beds = 'Must be a positive number';
        console.log(`Validation error - Invalid total_beds:`, formData.total_beds);
      }
    }
    
    if (formData.rent_amount) {
      const rentAmount = parseInt(formData.rent_amount);
      if (isNaN(rentAmount) || rentAmount <= 0) {
        newErrors.rent_amount = 'Must be a positive amount';
        console.log(`Validation error - Invalid rent_amount:`, formData.rent_amount);
      }
    }

    // Validate available beds doesn't exceed total beds (recovery housing only)
    if (propertyFormType === 'recovery_housing' && formData.available_beds && formData.total_beds) {
      const availableBeds = parseInt(formData.available_beds);
      const totalBeds = parseInt(formData.total_beds);
      if (!isNaN(availableBeds) && !isNaN(totalBeds) && availableBeds > totalBeds) {
        newErrors.available_beds = 'Cannot exceed total bedrooms';
        console.log(`Validation error - Available beds exceed total:`, availableBeds, '>', totalBeds);
      }
    }

    console.log('Form validation result:', {
      formType: propertyFormType,
      errorCount: Object.keys(newErrors).length,
      errors: newErrors,
      formData: formData
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submit triggered', { propertyFormType, currentSection, editingProperty });
  
  // ✅ ADD: Validate landlord profile ID is available
  if (!landlordProfileId) {
    alert('Unable to create property. Please ensure your landlord profile is complete.');
    return;
  }
  
  // ✅ IMPROVED: Better validation with debugging
  const isValid = validateForm();
  console.log('Validation result:', isValid, 'Errors:', errors);
  
  if (!isValid) {
    console.log('Form validation failed, errors found:', Object.keys(errors));
    
    // ✅ FIXED: Only navigate to error section for recovery housing AND only if we're not already on the last section
    if (propertyFormType === 'recovery_housing' && currentSection < formSections.length - 1) {
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const fieldSectionMap = {
          // Section 0: Basic Info
          property_name: 0, property_type: 0, address: 0, city: 0, state: 0, zip_code: 0, phone: 0, contact_email: 0, description: 0,
          // Section 1: Financial
          total_beds: 1, available_beds: 1, bathrooms: 1, rent_amount: 1, security_deposit: 1, application_fee: 1, weekly_rate: 1,
          // Section 2: Recovery 
          required_programs: 2, min_sobriety_time: 2, treatment_completion_required: 2, house_rules: 2, gender_restrictions: 2, age_restrictions: 2,
          // Section 3: Amenities
          amenities: 3, accessibility_features: 3, neighborhood_features: 3
        };
        
        const firstErrorField = errorFields[0];
        const targetSection = fieldSectionMap[firstErrorField];
        
        console.log('Navigating to error section:', {
          firstErrorField,
          targetSection,
          currentSection,
          willNavigate: typeof targetSection === 'number' && targetSection !== currentSection
        });
        
        // Only navigate if it's a different section
        if (typeof targetSection === 'number' && targetSection !== currentSection) {
          setCurrentSection(targetSection);
          
          // Scroll to the error field
          setTimeout(() => {
            const errorField = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorField) {
              errorField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              });
              errorField.focus();
            }
          }, 100);
        }
      }
    }
    
    // ✅ CRITICAL: Always return here when validation fails
    console.log('Returning early due to validation failure');
    return;
  }

  // ✅ If we get here, validation passed - proceed with submission
  console.log('Validation passed, proceeding with form submission');
  setLoading(true);
  
  try {
    // ✅ NEW: Create different property data objects based on type
    const propertyData = propertyFormType === 'general_rental'
      ? {
          // Simplified property data mapping
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
          bedrooms: parseInt(formData.total_beds) || 0,
          bathrooms: parseFloat(formData.bathrooms) || 1,
          monthly_rent: parseInt(formData.rent_amount),
          security_deposit: formData.security_deposit ? parseInt(formData.security_deposit) : null,
          application_fee: formData.application_fee ? parseInt(formData.application_fee) : 0,
          furnished: formData.furnished,
          pets_allowed: formData.pets_allowed,
          smoking_allowed: formData.smoking_allowed,
          amenities: formData.amenities,
          status: 'available',
          is_recovery_housing: false
        }
      : {
          // Recovery housing data mapping
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
          bedrooms: parseInt(formData.total_beds) || 0,
          bathrooms: parseFloat(formData.bathrooms) || 1,
          available_beds: parseInt(formData.available_beds) || 0,
          monthly_rent: parseInt(formData.rent_amount),
          security_deposit: formData.security_deposit ? parseInt(formData.security_deposit) : null,
          application_fee: formData.application_fee ? parseInt(formData.application_fee) : 0,
          weekly_rate: formData.weekly_rate ? parseInt(formData.weekly_rate) : null,
          utilities_included: formData.utilities_included || [],
          furnished: formData.furnished,
          pets_allowed: formData.pets_allowed,
          smoking_allowed: formData.smoking_allowed,
          accepted_subsidies: formData.accepted_subsidies,
          required_programs: formData.required_programs,
          min_sobriety_time: formData.min_sobriety_time || null,
          treatment_completion_required: formData.treatment_completion_required || null,
          house_rules: formData.house_rules,
          additional_house_rules: formData.additional_house_rules || null,
          gender_restrictions: formData.gender_restrictions,
          age_restrictions: formData.age_restrictions || null,
          criminal_background_ok: formData.criminal_background_ok,
          sex_offender_restrictions: formData.sex_offender_restrictions,
          accessibility_features: formData.accessibility_features,
          neighborhood_features: formData.neighborhood_features,
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
          amenities: formData.amenities,
          is_recovery_housing: true
        };

    console.log('Submitting property data:', propertyData);

    let result;
    if (editingProperty) {
      console.log('Updating existing property:', editingProperty.id);
      result = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', editingProperty.id);
    } else {
      console.log('Creating new property');
      result = await supabase
        .from('properties')
        .insert([propertyData]);
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      throw result.error;
    }

    console.log('Property saved successfully:', result);
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
      property_name: '', property_type: 'sober_living_level_1', address: '', city: '', state: '', 
      zip_code: '', phone: '', contact_email: '', description: '', total_beds: '', available_beds: '', 
      bathrooms: '', rent_amount: '', security_deposit: '', application_fee: '', weekly_rate: '',
      utilities_included: [], // ✅ CORRECTED: Array instead of boolean
      furnished: false, meals_included: false, linens_provided: false,
      accepted_subsidies: [], required_programs: [], min_sobriety_time: '', treatment_completion_required: '',
      house_rules: [], additional_house_rules: '', gender_restrictions: 'any', age_restrictions: '',
      pets_allowed: false, smoking_allowed: false, criminal_background_ok: false, sex_offender_restrictions: false,
      amenities: [], accessibility_features: [], neighborhood_features: [], case_management: false,
      counseling_services: false, job_training: false, medical_services: false, transportation_services: false,
      life_skills_training: false, license_number: '', accreditation: '', accepting_applications: true,
      property_status: 'available', additional_notes: ''
    });
    setEditingProperty(null);
    setShowForm(false);
    setShowTypeSelector(false);
    setPropertyFormType(null);
    setCurrentSection(0);
    setErrors({});
  };

  // ✅ UPDATED: Load property data for editing with type detection
  const editProperty = (property) => {
    // Detect property type from existing data
    const isRecoveryHousing = property.is_recovery_housing || 
                             property.property_type?.includes('sober_living') || 
                             property.accepted_subsidies?.length > 0 ||
                             property.required_programs?.length > 0;
    
    setPropertyFormType(isRecoveryHousing ? 'recovery_housing' : 'general_rental');

    if (isRecoveryHousing) {
      // Load full recovery housing data
      setFormData({
        property_name: property.title || '',
        property_type: property.property_type || 'sober_living_level_1',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        phone: property.phone || '',
        contact_email: property.contact_email || '',
        description: property.description || '',
        total_beds: property.bedrooms?.toString() || '',
        available_beds: property.available_beds?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        rent_amount: property.monthly_rent?.toString() || '',
        security_deposit: property.security_deposit?.toString() || '',
        application_fee: property.application_fee?.toString() || '',
        weekly_rate: property.weekly_rate?.toString() || '',
        
        // ✅ CORRECTED: Handle utilities_included as array
        utilities_included: property.utilities_included || [],
        furnished: property.furnished || false,
        pets_allowed: property.pets_allowed || false,
        smoking_allowed: property.smoking_allowed || false,
        
        // ✅ NEW: Load all the new fields
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
        amenities: property.amenities || []
      });
    } else {
      // Load simplified general rental data
      setFormData({
        property_name: property.title || '',
        property_type: property.property_type || 'apartment',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        phone: property.phone || '',
        contact_email: property.contact_email || '',
        description: property.description || '',
        total_beds: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '1',
        rent_amount: property.monthly_rent?.toString() || '',
        security_deposit: property.security_deposit?.toString() || '',
        application_fee: property.application_fee?.toString() || '',
        furnished: property.furnished || false,
        pets_allowed: property.pets_allowed || false,
        smoking_allowed: property.smoking_allowed || false,
        amenities: property.amenities || []
      });
    }

    setEditingProperty(property);
    setShowForm(true);
    setCurrentSection(0);
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

  // ✅ IMPROVED: Section navigation with better centering
const nextSection = () => {
  if (currentSection < formSections.length - 1) {
    setCurrentSection(currentSection + 1);
    
    // ✅ IMPROVED: Center the content instead of scrolling to top
    setTimeout(() => {
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      const firstInput = modalContent?.querySelector('input, select, textarea');
      
      if (firstInput) {
        firstInput.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      } else if (modalContent) {
        // Fallback: scroll to a centered position in the modal
        const centerPosition = modalContent.scrollHeight * 0.3;
        modalContent.scrollTo({ 
          top: centerPosition, 
          behavior: 'smooth' 
        });
      }
    }, 100);
  }
};

const prevSection = () => {
  if (currentSection > 0) {
    setCurrentSection(currentSection - 1);
    
    // ✅ IMPROVED: Center the content instead of scrolling to top
    setTimeout(() => {
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      const firstInput = modalContent?.querySelector('input, select, textarea');
      
      if (firstInput) {
        firstInput.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      } else if (modalContent) {
        // Fallback: scroll to a centered position in the modal
        const centerPosition = modalContent.scrollHeight * 0.3;
        modalContent.scrollTo({ 
          top: centerPosition, 
          behavior: 'smooth' 
        });
      }
    }, 100);
  }
};

  const goToSection = (index) => {
    setCurrentSection(index);
    
    // ✅ IMPROVED: Auto-center when jumping to section
    setTimeout(() => {
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      const firstInput = modalContent?.querySelector('input, select, textarea');
      
      if (firstInput) {
        firstInput.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const CurrentSectionComponent = formSections[currentSection]?.component;

  return (
    <div className="content">
      {/* ✅ UPDATED: Header using CSS module */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Property Management</h1>
          <p className={styles.headerSubtitle}>Manage your recovery-friendly rental properties</p>
        </div>
        
        <button
          className={styles.addPropertyButton}
          onClick={handleAddProperty}
        >
          + Add Property
        </button>
      </div>

      {/* ✅ UPDATED: Properties List using CSS module */}
      {properties.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🏠</div>
          <h3 className={styles.emptyStateTitle}>No properties yet</h3>
          <p className={styles.emptyStateText}>Add your first property to get started.</p>
        </div>
      ) : (
        <div className={styles.propertiesGrid}>
          {properties.map(property => (
            <div key={property.id} className={styles.propertyCard}>
              <div className={styles.propertyCardHeader}>
                <div className={styles.propertyInfo}>
                  <h3 className={styles.propertyTitle}>{property.title}</h3>
                  <p className={styles.propertyAddress}>{property.address}</p>
                </div>
                <div className={styles.propertyBadges}>
                  <span className={`badge ${property.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                    {property.status}
                  </span>
                  {property.is_recovery_housing && (
                    <span className={styles.badgeInfo}>Recovery Housing</span>
                  )}
                </div>
              </div>
              
              <div className={styles.propertyDetailsGrid}>
                <div className={styles.propertyDetail}>
                  <span className={styles.propertyDetailLabel}>Type:</span>
                  <span className={styles.propertyDetailValue}>{property.property_type?.replace(/_/g, ' ')}</span>
                </div>
                <div className={styles.propertyDetail}>
                  <span className={styles.propertyDetailLabel}>Rent:</span>
                  <span className={styles.propertyDetailValue}>${property.monthly_rent}/mo</span>
                </div>
                <div className={styles.propertyDetail}>
                  <span className={styles.propertyDetailLabel}>Beds:</span>
                  <span className={styles.propertyDetailValue}>{property.bedrooms || 'Studio'}</span>
                </div>
                {property.is_recovery_housing && (
                  <div className={styles.propertyDetail}>
                    <span className={styles.propertyDetailLabel}>Available:</span>
                    <span className={styles.propertyDetailValue}>{property.available_beds || 0} beds</span>
                  </div>
                )}
              </div>
              
              <div className={styles.propertyActions}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => editProperty(property)}
                >
                  Edit
                </button>
                
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteProperty(property.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ UPDATED: Property Type Selector Modal using CSS module */}
      {showTypeSelector && (
        <div className={styles.modalOverlay} onClick={() => setShowTypeSelector(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <PropertyTypeSelector onSelection={handlePropertyTypeSelection} />
          </div>
        </div>
      )}

      {/* ✅ UPDATED: Add/Edit Property Modal with Conditional Forms using CSS module */}
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
                // ✅ NEW: Simplified form for general rentals
                <SimplifiedPropertyForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  onInputChange={handleInputChange}
                  onArrayChange={handleArrayChange}
                  stateOptions={stateOptions}
                />
              ) : (
                // ✅ EXISTING: Complex form with sections for recovery housing
                <>
                  {/* ✅ UPDATED: Compact Section Navigation */}
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
                  
                  {/* Current Section */}
                  <CurrentSectionComponent
                    formData={formData}
                    errors={errors}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onArrayChange={handleArrayChange}
                    stateOptions={stateOptions}
                  />
                </>
              )}
              
              {/* ✅ UPDATED: Action buttons using CSS module */}
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
      
      {/* ✅ FIXED: Show proper button based on section */}
      {currentSection < formSections.length - 1 ? (
        <button
          type="button"  /* ✅ CRITICAL: type="button" prevents form submission */
          className={`${styles.actionButton} ${styles.actionPrimary}`}
          onClick={nextSection}
          disabled={loading}
        >
          Next →
        </button>
      ) : (
        <button
          type="submit"  /* ✅ CRITICAL: type="submit" on final section only */
          className={`${styles.actionButton} ${styles.actionPrimary}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Create Property')}
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
    </div>
  );
};

export default PropertyManagement;