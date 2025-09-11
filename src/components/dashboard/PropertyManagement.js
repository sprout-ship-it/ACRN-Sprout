// src/components/dashboard/PropertyManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

// Import the new sectioned components
import PropertyBasicInfoSection from '../property/sections/PropertyBasicInfoSection';
import PropertyFinancialSection from '../property/sections/PropertyFinancialSection';
import PropertyRecoverySection from '../property/sections/PropertyRecoverySection';
import PropertyAmenitiesSection from '../property/sections/PropertyAmenitiesSection';

// Import the new bifurcation components
import PropertyTypeSelector from '../property/PropertyTypeSelector';
import SimplifiedPropertyForm from '../property/SimplifiedPropertyForm';

const PropertyManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState({});

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
    { id: 'financial', title: 'Financial & Housing', component: PropertyFinancialSection, icon: '💰' },
    { id: 'recovery', title: 'Recovery & Rules', component: PropertyRecoverySection, icon: '🌱' },
    { id: 'amenities', title: 'Amenities & Services', component: PropertyAmenitiesSection, icon: '⭐' }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  // ✅ MODIFIED: New "Add Property" button handler
  const handleAddProperty = () => {
    setEditingProperty(null); // ✅ FIX: Clear editing state for new property
    setShowTypeSelector(true);
    setShowForm(false);
  };

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

  // ✅ UPDATED: Form validation with type-specific requirements
  const validateForm = () => {
    const newErrors = {};
    
    // Base required fields for both types
    const baseRequiredFields = [
      'property_name', 'property_type', 'address', 'city', 
      'state', 'zip_code', 'phone', 'total_beds', 'rent_amount'
    ];
    
    baseRequiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate numeric fields
    if (formData.total_beds && (isNaN(formData.total_beds) || formData.total_beds <= 0)) {
      newErrors.total_beds = 'Must be a positive number';
    }
    
    if (formData.rent_amount && (isNaN(formData.rent_amount) || formData.rent_amount <= 0)) {
      newErrors.rent_amount = 'Must be a positive amount';
    }

    // Validate available beds doesn't exceed total beds (recovery housing only)
    if (propertyFormType === 'recovery_housing' && formData.available_beds && formData.total_beds && 
        parseInt(formData.available_beds) > parseInt(formData.total_beds)) {
      newErrors.available_beds = 'Cannot exceed total bedrooms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ UPDATED: Handle submit with different property data based on type
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error section (recovery housing only)
      if (propertyFormType === 'recovery_housing') {
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
          const fieldSectionMap = {
            property_name: 0, property_type: 0, address: 0, city: 0, state: 0, zip_code: 0, phone: 0,
            total_beds: 1, rent_amount: 1, security_deposit: 1,
            required_programs: 2, house_rules: 2, gender_restrictions: 2,
            amenities: 3, accessibility_features: 3
          };
          
          const firstErrorField = errorFields[0];
          const sectionIndex = fieldSectionMap[firstErrorField] || 0;
          setCurrentSection(sectionIndex);
        }
      }
      return;
    }

    setLoading(true);
    try {
      // ✅ NEW: Create different property data objects based on type
      const propertyData = propertyFormType === 'general_rental'
        ? {
            // Simplified property data mapping
            landlord_id: user.id,
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
            is_recovery_housing: false // Add this flag to distinguish property types
          }
        : {
            // ✅ CORRECTED: Map form data to database structure with proper types (recovery housing)
            landlord_id: user.id,
            title: formData.property_name,
            property_type: formData.property_type,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            phone: formData.phone,
            contact_email: formData.contact_email || null,
            description: formData.description || null,
            
            // ✅ CORRECTED: Match your existing schema
            bedrooms: parseInt(formData.total_beds) || 0,
            bathrooms: parseFloat(formData.bathrooms) || 1,
            available_beds: parseInt(formData.available_beds) || 0,
            monthly_rent: parseInt(formData.rent_amount), // Your schema uses integer
            security_deposit: formData.security_deposit ? parseInt(formData.security_deposit) : null,
            application_fee: formData.application_fee ? parseInt(formData.application_fee) : 0, // Your schema has default 0
            weekly_rate: formData.weekly_rate ? parseInt(formData.weekly_rate) : null,
            
            // ✅ CORRECTED: utilities_included as array
            utilities_included: formData.utilities_included || [],
            furnished: formData.furnished,
            pets_allowed: formData.pets_allowed,
            smoking_allowed: formData.smoking_allowed,
            
            // ✅ NEW: All the new fields from migration
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
            
            // ✅ KEEP: Your existing amenities field (already array)
            amenities: formData.amenities,
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

      if (result.error) throw result.error;

      await fetchProperties();
      resetForm();
      alert(editingProperty ? 'Property updated successfully!' : 'Property added successfully!');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property. Please try again.');
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

  // Section navigation (recovery housing only)
  const nextSection = () => {
    if (currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const goToSection = (index) => {
    setCurrentSection(index);
  };

  const CurrentSectionComponent = formSections[currentSection]?.component;

  return (
    <div className="content">
      {/* Header */}
      <div className="card-header mb-5">
        <div>
          <h1 className="welcome-title">Property Management</h1>
          <p className="welcome-text">Manage your recovery-friendly rental properties</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleAddProperty}
        >
          + Add Property
        </button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No properties yet</h3>
          <p>Add your first property to get started.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {properties.map(property => (
            <div key={property.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{property.title}</h3>
                  <p className="card-subtitle">{property.address}</p>
                </div>
                <div>
                  <span className={`badge ${property.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                    {property.status}
                  </span>
                  {property.is_recovery_housing && (
                    <span className="badge badge-info ml-2">Recovery Housing</span>
                  )}
                </div>
              </div>
              
              <div className="grid-2 mb-3">
                <div className="text-gray-600">
                  <span>Type:</span>
                  <span className="text-gray-800 ml-1">{property.property_type?.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-gray-600">
                  <span>Rent:</span>
                  <span className="text-gray-800 ml-1">${property.monthly_rent}/mo</span>
                </div>
                <div className="text-gray-600">
                  <span>Beds:</span>
                  <span className="text-gray-800 ml-1">{property.bedrooms || 'Studio'}</span>
                </div>
                {property.is_recovery_housing && (
                  <div className="text-gray-600">
                    <span>Available:</span>
                    <span className="text-gray-800 ml-1">{property.available_beds || 0} beds</span>
                  </div>
                )}
              </div>
              
              <div className="grid-2">
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

      {/* ✅ NEW: Property Type Selector Modal */}
      {showTypeSelector && (
        <div className="modal-overlay" onClick={() => setShowTypeSelector(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <PropertyTypeSelector onSelection={handlePropertyTypeSelection} />
          </div>
        </div>
      )}

      {/* ✅ UPDATED: Add/Edit Property Modal with Conditional Forms */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
                {propertyFormType && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({propertyFormType === 'general_rental' ? 'General Rental' : 'Recovery Housing'})
                  </span>
                )}
              </h2>
              <button
                className="modal-close"
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
                  {/* Section Navigation */}
                  <nav className="section-nav mb-4">
                    {formSections.map((section, index) => (
                      <button
                        key={section.id}
                        type="button"
                        className={`section-nav-btn ${index === currentSection ? 'active' : ''}`}
                        onClick={() => goToSection(index)}
                        disabled={loading}
                      >
                        <span className="section-icon">{section.icon}</span>
                        <span className="section-title">{section.title}</span>
                      </button>
                    ))}
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
              
              {/* ✅ UPDATED: Action buttons with different layouts for different form types */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
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
                        className="btn btn-secondary"
                        onClick={prevSection}
                        disabled={loading}
                      >
                        Previous
                      </button>
                    )}
                    
                    {currentSection < formSections.length - 1 ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={nextSection}
                        disabled={loading}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Add Property')}
                      </button>
                    )}
                  </>
                )}
                
                {propertyFormType === 'general_rental' && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Add Property')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced modal CSS */}
      <style jsx>{`
        .modal-content.large {
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .section-nav {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--border-beige);
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        
        .section-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid var(--border-beige);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 0;
        }
        
        .section-nav-btn:hover {
          background: var(--secondary-teal-light);
          border-color: var(--secondary-teal);
        }
        
        .section-nav-btn.active {
          background: var(--secondary-teal);
          color: white;
          border-color: var(--secondary-teal);
        }
        
        .section-icon {
          font-size: 1.5rem;
        }
        
        .section-title {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-beige);
        }
        
        .badge.badge-info {
          background-color: #3b82f6;
          color: white;
        }
        
        @media (max-width: 768px) {
          .section-nav {
            flex-wrap: wrap;
          }
          
          .section-nav-btn {
            flex: 1 1 calc(50% - 0.5rem);
          }
          
          .section-title {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyManagement;