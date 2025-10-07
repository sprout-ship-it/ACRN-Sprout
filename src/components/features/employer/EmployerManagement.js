// src/components/features/employer/EmployerManagement.js - UPDATED FOR NEW SCHEMA
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';
import styles from './EmployerManagement.module.css';

// Import form sections
import EmployerBasicInfoSection from './sections/EmployerBasicInfoSection';
import EmployerDetailsSection from './sections/EmployerDetailsSection';
import EmployerPoliciesSection from './sections/EmployerPoliciesSection';
import EmployerJobsSection from './sections/EmployerJobsSection';

const EmployerManagement = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  // ✅ UPDATED: Form data structure matching new schema exactly
  const [formData, setFormData] = useState({
    // Section 1: Basic Company Information
    company_name: '',
    industry: '',
    business_type: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    additional_locations: [], // JSONB array
    phone: '',
    contact_email: '',
    website: '',
    contact_person: '',
    preferred_contact_method: '',
    
    // Section 2: Company Details
    description: '',
    company_size: '',
    founded_year: '',
    company_culture: '',
    diversity_commitment: '',
    
    // Section 3: Recovery-Friendly Features & Policies
    recovery_friendly_features: [],
    accommodation_policies: '',
    hiring_practices: '',
    drug_testing_policy: '',
    background_check_policy: '',
    
    // Section 4: Employment Overview
    job_types_available: [],
    remote_work_options: '',
    benefits_offered: [],
    application_process: '',
    is_actively_hiring: true,
    
    // Status
    is_active: true
  });

  // ✅ UPDATED: State options (same as before)
  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // ✅ UPDATED: Form sections matching new schema
  const formSections = [
    { id: 'basic', title: 'Basic Info', component: EmployerBasicInfoSection, icon: '🏢' },
    { id: 'details', title: 'Company Details', component: EmployerDetailsSection, icon: '📋' },
    { id: 'policies', title: 'Recovery-Friendly', component: EmployerPoliciesSection, icon: '🤝' },
    { id: 'employment', title: 'Employment Info', component: EmployerJobsSection, icon: '💼' }
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchEmployers();
    }
  }, [profile?.id]);

  const fetchEmployers = async () => {
    if (!profile?.id) return;

    try {
      setError(null);
      console.log('📊 Fetching employer profiles for user:', profile.id);
      
      const { data, error } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch employer profiles');
      }
      
      console.log(`✅ Loaded ${data?.length || 0} employer profiles`);
      setEmployers(data || []);
      
    } catch (err) {
      console.error('💥 Error fetching employers:', err);
      setError(err.message || 'Failed to load employer profiles');
      setEmployers([]);
    }
  };

  const handleAddEmployer = () => {
    setEditingEmployer(null);
    setShowForm(true);
    setCurrentSection(0);
    setError(null);
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

  // Handle array changes (checkboxes, multi-select)
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

  // ✅ NEW: Handle additional locations (JSONB array)
  const handleLocationChange = (locations) => {
    setFormData(prev => ({
      ...prev,
      additional_locations: locations
    }));
  };

  // ✅ UPDATED: Form validation matching new schema
  const validateForm = () => {
    const newErrors = {};
    
    // ✅ UPDATED: Required fields based on new schema
    const requiredFields = [
      'company_name', 'industry', 'business_type', 'city', 
      'state', 'zip_code', 'phone', 'description'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate phone format
    if (formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format (555) 123-4567';
    }

    // Validate email format if provided
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    // Validate website format if provided
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    // Validate founded year if provided
    if (formData.founded_year) {
      const year = parseInt(formData.founded_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear) {
        newErrors.founded_year = `Founded year must be between 1800 and ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ UPDATED: Handle submit with correct field mapping
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error section
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const fieldSectionMap = {
          company_name: 0, industry: 0, business_type: 0, city: 0, state: 0, phone: 0,
          description: 1, company_size: 1, founded_year: 1,
          recovery_friendly_features: 2, accommodation_policies: 2, hiring_practices: 2,
          job_types_available: 3, benefits_offered: 3, application_process: 3
        };
        
        const firstErrorField = errorFields[0];
        const sectionIndex = fieldSectionMap[firstErrorField] || 0;
        setCurrentSection(sectionIndex);
      }
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // ✅ UPDATED: Create employer data object matching new schema exactly
      const employerData = {
        user_id: profile.id,
        
        // Section 1: Basic Company Information
        company_name: formData.company_name,
        industry: formData.industry,
        business_type: formData.business_type,
        address: formData.address || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        additional_locations: formData.additional_locations.length > 0 ? formData.additional_locations : [],
        phone: formData.phone,
        contact_email: formData.contact_email || null,
        website: formData.website || null,
        contact_person: formData.contact_person || null,
        preferred_contact_method: formData.preferred_contact_method || null,
        
        // Section 2: Company Details
        description: formData.description,
        company_size: formData.company_size || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        company_culture: formData.company_culture || null,
        diversity_commitment: formData.diversity_commitment || null,
        
        // Section 3: Recovery-Friendly Features & Policies
        recovery_friendly_features: formData.recovery_friendly_features,
        accommodation_policies: formData.accommodation_policies || null,
        hiring_practices: formData.hiring_practices || null,
        drug_testing_policy: formData.drug_testing_policy || null,
        background_check_policy: formData.background_check_policy || null,
        
        // Section 4: Employment Overview
        job_types_available: formData.job_types_available,
        remote_work_options: formData.remote_work_options || null,
        benefits_offered: formData.benefits_offered,
        application_process: formData.application_process || null,
        is_actively_hiring: formData.is_actively_hiring,
        
        // Status
        is_active: formData.is_active
      };

      console.log('💼 Saving employer profile:', employerData);

      let result;
      if (editingEmployer) {
        const { data, error } = await supabase
          .from('employer_profiles')
          .update(employerData)
          .eq('id', editingEmployer.id)
          .select()
          .single();
        
        result = { success: !error, data: data, error: error };
      } else {
        const { data, error } = await supabase
          .from('employer_profiles')
          .insert(employerData)
          .select()
          .single();
        
        result = { success: !error, data: data, error: error };
      }

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save employer profile');
      }

      console.log('✅ Employer profile saved successfully');
      await fetchEmployers();
      resetForm();
      
      // Show success message
      setError(null);
      alert(editingEmployer ? 'Employer profile updated successfully!' : 'Employer profile added successfully!');
      
    } catch (err) {
      console.error('💥 Error saving employer:', err);
      setError(err.message || 'Failed to save employer profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Reset form with new schema fields
  const resetForm = () => {
    setFormData({
      company_name: '', industry: '', business_type: '', address: '', city: '', state: '', 
      zip_code: '', additional_locations: [], phone: '', contact_email: '', website: '', 
      contact_person: '', preferred_contact_method: '', description: '', company_size: '', 
      founded_year: '', company_culture: '', diversity_commitment: '', recovery_friendly_features: [],
      accommodation_policies: '', hiring_practices: '', drug_testing_policy: '', 
      background_check_policy: '', job_types_available: [], remote_work_options: '', 
      benefits_offered: [], application_process: '', is_actively_hiring: true, is_active: true
    });
    setEditingEmployer(null);
    setShowForm(false);
    setCurrentSection(0);
    setErrors({});
    setError(null);
  };

  // ✅ UPDATED: Load employer data for editing with new schema fields
  const editEmployer = (employer) => {
    setFormData({
      company_name: employer.company_name || '',
      industry: employer.industry || '',
      business_type: employer.business_type || '',
      address: employer.address || '',
      city: employer.city || '',
      state: employer.state || '',
      zip_code: employer.zip_code || '',
      additional_locations: employer.additional_locations || [],
      phone: employer.phone || '',
      contact_email: employer.contact_email || '',
      website: employer.website || '',
      contact_person: employer.contact_person || '',
      preferred_contact_method: employer.preferred_contact_method || '',
      
      description: employer.description || '',
      company_size: employer.company_size || '',
      founded_year: employer.founded_year?.toString() || '',
      company_culture: employer.company_culture || '',
      diversity_commitment: employer.diversity_commitment || '',
      
      recovery_friendly_features: employer.recovery_friendly_features || [],
      accommodation_policies: employer.accommodation_policies || '',
      hiring_practices: employer.hiring_practices || '',
      drug_testing_policy: employer.drug_testing_policy || '',
      background_check_policy: employer.background_check_policy || '',
      
      job_types_available: employer.job_types_available || [],
      remote_work_options: employer.remote_work_options || '',
      benefits_offered: employer.benefits_offered || [],
      application_process: employer.application_process || '',
      is_actively_hiring: employer.is_actively_hiring !== false,
      
      is_active: employer.is_active !== false
    });

    setEditingEmployer(employer);
    setShowForm(true);
    setCurrentSection(0);
    setError(null);
  };

  const deleteEmployer = async (employerId) => {
    if (!window.confirm('Are you sure you want to delete this employer profile?')) {
      return;
    }

    try {
      setError(null);
      console.log('🗑️ Deleting employer profile:', employerId);
      
      const { error } = await supabase
        .from('employer_profiles')
        .delete()
        .eq('id', employerId);

      if (error) {
        throw new Error(error.message || 'Failed to delete employer profile');
      }

      console.log('✅ Employer profile deleted successfully');
      await fetchEmployers();
      alert('Employer profile deleted successfully');
      
    } catch (err) {
      console.error('💥 Error deleting employer:', err);
      setError(err.message || 'Failed to delete employer profile. Please try again.');
    }
  };

  // Section navigation
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
          <h1 className="welcome-title">Employer Management</h1>
          <p className="welcome-text">Manage your recovery-friendly employer profiles</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleAddEmployer}
        >
          + Add Employer Profile
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Employers List */}
      {employers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <h3 className="empty-state-title">No employer profiles yet</h3>
          <p>Add your first employer profile to help applicants find recovery-friendly job opportunities.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {employers.map(employer => (
            <div key={employer.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{employer.company_name}</h3>
                  <p className="card-subtitle">{employer.industry} • {employer.city}, {employer.state}</p>
                  {employer.additional_locations?.length > 0 && (
                    <p className="text-sm text-gray-600">+{employer.additional_locations.length} additional location{employer.additional_locations.length > 1 ? 's' : ''}</p>
                  )}
                </div>
                <div>
                  <span className={`badge ${employer.is_actively_hiring ? 'badge-success' : 'badge-warning'}`}>
                    {employer.is_actively_hiring ? 'Hiring' : 'Not Hiring'}
                  </span>
                  <span className="badge badge-info ml-2">{employer.business_type?.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="grid-2 text-gray-600 mb-3">
                  <div>
                    <span>Company Size:</span>
                    <span className="text-gray-800 ml-1">{employer.company_size || 'Not specified'}</span>
                  </div>
                  <div>
                    <span>Contact Method:</span>
                    <span className="text-gray-800 ml-1">{employer.preferred_contact_method?.replace('_', ' ') || 'Not specified'}</span>
                  </div>
                </div>
                
                {employer.job_types_available?.length > 0 && (
                  <div className="mb-3">
                    <div className="label mb-2">Job Types Available</div>
                    <div className="mb-2">
                      {employer.job_types_available.slice(0, 3).map((type, i) => (
                        <span key={i} className="badge badge-success mr-1 mb-1">
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                      {employer.job_types_available.length > 3 && (
                        <span className="text-sm text-gray-600">
                          +{employer.job_types_available.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {employer.recovery_friendly_features?.length > 0 && (
                  <div className="mb-3">
                    <div className="label mb-2">Recovery-Friendly Features</div>
                    <div className="mb-2">
                      {employer.recovery_friendly_features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="badge badge-info mr-1 mb-1">
                          {feature.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {employer.recovery_friendly_features.length > 3 && (
                        <span className="text-sm text-gray-600">
                          +{employer.recovery_friendly_features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => editEmployer(employer)}
                >
                  Edit
                </button>
                
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteEmployer(employer.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Employer Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className={`modal-content ${styles.modalContentLarge}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEmployer ? 'Edit Employer Profile' : 'Add New Employer Profile'}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            {/* Form Error Display */}
            {error && (
              <div className="alert alert-danger mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Section Navigation */}
              <nav className={styles.sectionNav}>
                {formSections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`${styles.sectionNavBtn} ${index === currentSection ? styles.active : ''}`}
                    onClick={() => goToSection(index)}
                    disabled={loading}
                  >
                    <span className={styles.sectionIcon}>{section.icon}</span>
                    <span className={styles.sectionTitle}>{section.title}</span>
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
                onLocationChange={handleLocationChange}
                stateOptions={stateOptions}
              />
              
              {/* Action buttons */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                
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
                    {loading ? 'Saving...' : (editingEmployer ? 'Update Profile' : 'Add Profile')}
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

export default EmployerManagement;