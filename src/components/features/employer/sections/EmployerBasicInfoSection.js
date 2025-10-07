// src/components/features/employer/sections/EmployerBasicInfoSection.js - UPDATED FOR NEW SCHEMA
import React, { useState } from 'react';
import styles from './EmployerSections.module.css';

const EmployerBasicInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onLocationChange,
  stateOptions
}) => {
  const [newLocation, setNewLocation] = useState({
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  // ✅ UPDATED: Industry options matching schema constraints
  const industryOptions = [
    'Construction', 'Healthcare', 'Retail', 'Food Service', 'Manufacturing',
    'Transportation', 'Technology', 'Education', 'Nonprofit', 'Professional Services',
    'Hospitality', 'Agriculture', 'Finance', 'Real Estate', 'Arts & Entertainment',
    'Government', 'Utilities', 'Other'
  ];

  // ✅ UPDATED: Business type options matching schema constraints
  const businessTypeOptions = [
    { value: 'small_business', label: 'Small Business (1-50 employees)' },
    { value: 'medium_business', label: 'Medium Business (51-250 employees)' },
    { value: 'large_corporation', label: 'Large Corporation (250+ employees)' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'startup', label: 'Startup' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
    { value: 'government', label: 'Government Agency' },
    { value: 'cooperative', label: 'Cooperative' }
  ];

  // ✅ NEW: Preferred contact method options
  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'website', label: 'Company Website' },
    { value: 'in_person', label: 'In Person' }
  ];

  // ✅ NEW: Handle additional location input changes
  const handleLocationInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ NEW: Add additional location
  const handleAddLocation = () => {
    if (newLocation.city && newLocation.state && newLocation.zip) {
      const locations = [...(formData.additional_locations || []), newLocation];
      onLocationChange(locations);
      setNewLocation({ address: '', city: '', state: '', zip: '' });
    }
  };

  // ✅ NEW: Remove additional location
  const handleRemoveLocation = (index) => {
    const locations = formData.additional_locations.filter((_, i) => i !== index);
    onLocationChange(locations);
  };

  // ✅ NEW: Validate new location
  const isNewLocationValid = () => {
    return newLocation.city.trim() && newLocation.state && newLocation.zip.trim();
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Basic Company Information</h3>
      
      {/* Company Identity Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Company Identity</h4>
        
        <div className="form-group">
          <label className="label">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.company_name ? 'border-red-500' : ''}`}
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={onInputChange}
            placeholder="Your Company Name"
            disabled={loading}
            required
          />
          {errors.company_name && (
            <div className="text-red-500 text-sm mt-1">{errors.company_name}</div>
          )}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.industry ? 'border-red-500' : ''}`}
              name="industry"
              value={formData.industry}
              onChange={onInputChange}
              disabled={loading}
              required
            >
              <option value="">Select Industry</option>
              {industryOptions.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && (
              <div className="text-red-500 text-sm mt-1">{errors.industry}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.business_type ? 'border-red-500' : ''}`}
              name="business_type"
              value={formData.business_type}
              onChange={onInputChange}
              disabled={loading}
              required
            >
              <option value="">Select Business Type</option>
              {businessTypeOptions.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.business_type && (
              <div className="text-red-500 text-sm mt-1">{errors.business_type}</div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Location Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Primary Location</h4>

        <div className="form-group">
          <label className="label">Street Address</label>
          <input
            className="input"
            type="text"
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="123 Business Street, Suite 100"
            disabled={loading}
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">
              City <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.city ? 'border-red-500' : ''}`}
              type="text"
              name="city"
              value={formData.city}
              onChange={onInputChange}
              placeholder="City"
              disabled={loading}
              required
            />
            {errors.city && (
              <div className="text-red-500 text-sm mt-1">{errors.city}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              State <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.state ? 'border-red-500' : ''}`}
              name="state"
              value={formData.state}
              onChange={onInputChange}
              disabled={loading}
              required
            >
              <option value="">Select State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <div className="text-red-500 text-sm mt-1">{errors.state}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="label">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.zip_code ? 'border-red-500' : ''} ${styles.zipInput}`}
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={onInputChange}
            placeholder="12345"
            disabled={loading}
            required
          />
          {errors.zip_code && (
            <div className="text-red-500 text-sm mt-1">{errors.zip_code}</div>
          )}
        </div>
      </div>

      {/* ✅ NEW: Additional Locations Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Additional Locations</h4>
        <div className={styles.helperText}>
          Add any additional company locations where you hire employees
        </div>

        {/* Existing Additional Locations */}
        {formData.additional_locations?.length > 0 && (
          <div className={styles.dynamicList}>
            <div className="label mb-2">Current Additional Locations:</div>
            {formData.additional_locations.map((location, index) => (
              <div key={index} className={styles.listItem}>
                <div className="flex-1">
                  <div className="font-medium">
                    {location.address && `${location.address}, `}
                    {location.city}, {location.state} {location.zip}
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn btn-outline btn-sm ${styles.removeButton}`}
                  onClick={() => handleRemoveLocation(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Location Form */}
        <div className="form-group">
          <label className="label">Add Additional Location</label>
          
          <div className="form-group">
            <input
              className="input"
              type="text"
              name="address"
              value={newLocation.address}
              onChange={handleLocationInputChange}
              placeholder="Street Address (optional)"
              disabled={loading}
            />
          </div>
          
          <div className="grid-2">
            <input
              className="input"
              type="text"
              name="city"
              value={newLocation.city}
              onChange={handleLocationInputChange}
              placeholder="City *"
              disabled={loading}
            />
            
            <select
              className="input"
              name="state"
              value={newLocation.state}
              onChange={handleLocationInputChange}
              disabled={loading}
            >
              <option value="">Select State *</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-2">
            <input
              className={`input ${styles.zipInput}`}
              type="text"
              name="zip"
              value={newLocation.zip}
              onChange={handleLocationInputChange}
              placeholder="ZIP Code *"
              disabled={loading}
            />
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddLocation}
              disabled={loading || !isNewLocationValid()}
            >
              Add Location
            </button>
          </div>
          
          <div className={styles.helperText}>
            City, state, and ZIP code are required for additional locations
          </div>
        </div>
      </div>

      {/* Contact Information Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Contact Information</h4>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              className={`input ${errors.phone ? 'border-red-500' : ''}`}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="(555) 123-4567"
              disabled={loading}
              required
            />
            {errors.phone && (
              <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Contact Email</label>
            <input
              className={`input ${errors.contact_email ? 'border-red-500' : ''}`}
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={onInputChange}
              placeholder="jobs@company.com"
              disabled={loading}
            />
            {errors.contact_email && (
              <div className="text-red-500 text-sm mt-1">{errors.contact_email}</div>
            )}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">Company Website</label>
            <input
              className={`input ${errors.website ? 'border-red-500' : ''}`}
              type="url"
              name="website"
              value={formData.website}
              onChange={onInputChange}
              placeholder="https://www.company.com"
              disabled={loading}
            />
            {errors.website && (
              <div className="text-red-500 text-sm mt-1">{errors.website}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Contact Person</label>
            <input
              className="input"
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={onInputChange}
              placeholder="Hiring Manager Name"
              disabled={loading}
            />
          </div>
        </div>

        {/* ✅ NEW: Preferred Contact Method */}
        <div className="form-group">
          <label className="label">Preferred Contact Method</label>
          <select
            className="input"
            name="preferred_contact_method"
            value={formData.preferred_contact_method}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="">Select Preferred Method</option>
            {contactMethodOptions.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
          <div className={styles.helperText}>
            How should applicants preferably contact your company?
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerBasicInfoSection;