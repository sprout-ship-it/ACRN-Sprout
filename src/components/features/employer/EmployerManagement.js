// src/components/dashboard/EmployerManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';

// Import form sections
import EmployerBasicInfoSection from './sections/EmployerBasicInfoSection';
import EmployerDetailsSection from './sections/EmployerDetailsSection';
import EmployerPoliciesSection from './sections/EmployerPoliciesSection';
import EmployerJobsSection from './sections/EmployerJobsSection';

const EmployerManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState({});

  // Form data structure
  const [formData, setFormData] = useState({
    // Basic Info
    company_name: '',
    industry: '',
    business_type: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    contact_email: '',
    website: '',
    contact_person: '',
    
    // Company Details
    description: '',
    company_size: '',
    founded_year: '',
    company_culture: '',
    diversity_commitment: '',
    community_involvement: '',
    
    // Recovery-Friendly Features & Policies
    recovery_friendly_features: [],
    accommodation_policies: '',
    hiring_practices: '',
    drug_testing_policy: '',
    background_check_policy: '',
    
    // Employment Information
    job_types_available: [],
    remote_work_options: '',
    benefits_offered: [],
    salary_ranges: {},
    current_openings: [],
    application_process: '',
    
    // Status
    is_actively_hiring: true,
    additional_notes: ''
  });

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Form sections for navigation
  const formSections = [
    { id: 'basic', title: 'Basic Info', component: EmployerBasicInfoSection, icon: '🏢' },
    { id: 'details', title: 'Company Details', component: EmployerDetailsSection, icon: '📋' },
    { id: 'policies', title: 'Policies & Culture', component: EmployerPoliciesSection, icon: '🤝' },
    { id: 'jobs', title: 'Jobs & Benefits', component: EmployerJobsSection, icon: '💼' }
  ];

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployers(data || []);
    } catch (error) {
      console.error('Error fetching employers:', error);
    }
  };

  const handleAddEmployer = () => {
    setEditingEmployer(null);
    setShowForm(true);
    setCurrentSection(0);
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

  // Handle special object changes (like salary ranges)
  const handleObjectChange = (fieldName, subField, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [subField]: value
      }
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
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
          job_types_available: 3, benefits_offered: 3, current_openings: 3
        };
        
        const firstErrorField = errorFields[0];
        const sectionIndex = fieldSectionMap[firstErrorField] || 0;
        setCurrentSection(sectionIndex);
      }
      return;
    }

    setLoading(true);
    try {
      // Create employer data object
      const employerData = {
        user_id: user.id,
        company_name: formData.company_name,
        industry: formData.industry,
        business_type: formData.business_type,
        address: formData.address || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        phone: formData.phone,
        contact_email: formData.contact_email || null,
        website: formData.website || null,
        contact_person: formData.contact_person || null,
        
        description: formData.description,
        company_size: formData.company_size || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        company_culture: formData.company_culture || null,
        diversity_commitment: formData.diversity_commitment || null,
        community_involvement: formData.community_involvement || null,
        
        recovery_friendly_features: formData.recovery_friendly_features,
        accommodation_policies: formData.accommodation_policies || null,
        hiring_practices: formData.hiring_practices || null,
        drug_testing_policy: formData.drug_testing_policy || null,
        background_check_policy: formData.background_check_policy || null,
        
        job_types_available: formData.job_types_available,
        remote_work_options: formData.remote_work_options || null,
        benefits_offered: formData.benefits_offered,
        salary_ranges: Object.keys(formData.salary_ranges).length > 0 ? formData.salary_ranges : null,
        current_openings: formData.current_openings,
        application_process: formData.application_process || null,
        
        is_actively_hiring: formData.is_actively_hiring,
        additional_notes: formData.additional_notes || null,
        profile_completed: true
      };

      let result;
      if (editingEmployer) {
        result = await supabase
          .from('employer_profiles')
          .update(employerData)
          .eq('id', editingEmployer.id);
      } else {
        result = await supabase
          .from('employer_profiles')
          .insert([employerData]);
      }

      if (result.error) throw result.error;

      await fetchEmployers();
      resetForm();
      alert(editingEmployer ? 'Employer profile updated successfully!' : 'Employer profile added successfully!');
    } catch (error) {
      console.error('Error saving employer:', error);
      alert('Error saving employer profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '', industry: '', business_type: '', address: '', city: '', state: '', 
      zip_code: '', phone: '', contact_email: '', website: '', contact_person: '',
      description: '', company_size: '', founded_year: '', company_culture: '', 
      diversity_commitment: '', community_involvement: '', recovery_friendly_features: [],
      accommodation_policies: '', hiring_practices: '', drug_testing_policy: '', 
      background_check_policy: '', job_types_available: [], remote_work_options: '', 
      benefits_offered: [], salary_ranges: {}, current_openings: [], application_process: '',
      is_actively_hiring: true, additional_notes: ''
    });
    setEditingEmployer(null);
    setShowForm(false);
    setCurrentSection(0);
    setErrors({});
  };

  // Load employer data for editing
  const editEmployer = (employer) => {
    setFormData({
      company_name: employer.company_name || '',
      industry: employer.industry || '',
      business_type: employer.business_type || '',
      address: employer.address || '',
      city: employer.city || '',
      state: employer.state || '',
      zip_code: employer.zip_code || '',
      phone: employer.phone || '',
      contact_email: employer.contact_email || '',
      website: employer.website || '',
      contact_person: employer.contact_person || '',
      
      description: employer.description || '',
      company_size: employer.company_size || '',
      founded_year: employer.founded_year?.toString() || '',
      company_culture: employer.company_culture || '',
      diversity_commitment: employer.diversity_commitment || '',
      community_involvement: employer.community_involvement || '',
      
      recovery_friendly_features: employer.recovery_friendly_features || [],
      accommodation_policies: employer.accommodation_policies || '',
      hiring_practices: employer.hiring_practices || '',
      drug_testing_policy: employer.drug_testing_policy || '',
      background_check_policy: employer.background_check_policy || '',
      
      job_types_available: employer.job_types_available || [],
      remote_work_options: employer.remote_work_options || '',
      benefits_offered: employer.benefits_offered || [],
      salary_ranges: employer.salary_ranges || {},
      current_openings: employer.current_openings || [],
      application_process: employer.application_process || '',
      
      is_actively_hiring: employer.is_actively_hiring !== false,
      additional_notes: employer.additional_notes || ''
    });

    setEditingEmployer(employer);
    setShowForm(true);
    setCurrentSection(0);
  };

  const deleteEmployer = async (employerId) => {
    if (!window.confirm('Are you sure you want to delete this employer profile?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('employer_profiles')
        .delete()
        .eq('id', employerId);

      if (error) throw error;

      await fetchEmployers();
      alert('Employer profile deleted successfully');
    } catch (error) {
      console.error('Error deleting employer:', error);
      alert('Error deleting employer profile. Please try again.');
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
                </div>
                <div>
                  <span className={`badge ${employer.is_actively_hiring ? 'badge-success' : 'badge-warning'}`}>
                    {employer.is_actively_hiring ? 'Hiring' : 'Not Hiring'}
                  </span>
                  <span className="badge badge-info ml-2">{employer.business_type}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="grid-2 text-gray-600 mb-3">
                  <div>
                    <span>Company Size:</span>
                    <span className="text-gray-800 ml-1">{employer.company_size || 'Not specified'}</span>
                  </div>
                  <div>
                    <span>Remote Options:</span>
                    <span className="text-gray-800 ml-1">{employer.remote_work_options || 'Not specified'}</span>
                  </div>
                </div>
                
                {employer.current_openings?.length > 0 && (
                  <div className="mb-3">
                    <div className="label mb-2">Current Openings</div>
                    <div className="mb-2">
                      {employer.current_openings.slice(0, 3).map((opening, i) => (
                        <span key={i} className="badge badge-success mr-1 mb-1">
                          {opening}
                        </span>
                      ))}
                      {employer.current_openings.length > 3 && (
                        <span className="text-sm text-gray-600">
                          +{employer.current_openings.length - 3} more
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
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
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
            
            <form onSubmit={handleSubmit}>
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
                onObjectChange={handleObjectChange}
                stateOptions={stateOptions}
              />
              
              {/* Action buttons */}
              <div className="form-actions">
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

export default EmployerManagement;