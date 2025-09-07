import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../lib/supabase';

const PropertyManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    property_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '', // ✅ PHASE 3: Phone field added for properties
    property_type: 'sober_living',
    total_beds: '',
    available_beds: '',
    rent_amount: '',
    security_deposit: '',
    utilities_included: false,
    furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    gender_restrictions: 'any',
    age_restrictions: '',
    description: '',
    amenities: [],
    house_rules: '',
    contact_email: '',
    license_number: '',
    accreditation: '',
    accepting_applications: true
  });

  const propertyTypes = [
    { value: 'sober_living', label: 'Sober Living Home' },
    { value: 'transitional', label: 'Transitional Housing' },
    { value: 'halfway_house', label: 'Halfway House' },
    { value: 'supportive_housing', label: 'Supportive Housing' },
    { value: 'recovery_residence', label: 'Recovery Residence' }
  ];

  const amenityOptions = [
    'WiFi', 'Laundry', 'Kitchen Access', 'Parking', 'Public Transportation',
    'Gym/Fitness', 'Garden/Outdoor Space', 'Meeting Rooms', 'Computer Lab',
    'Library', 'Counseling Services', 'Job Training', 'Medical Services'
  ];

  const genderOptions = [
    { value: 'any', label: 'Any Gender' },
    { value: 'male', label: 'Male Only' },
    { value: 'female', label: 'Female Only' },
    { value: 'non_binary', label: 'Non-Binary Friendly' }
  ];

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    const required = ['property_name', 'address', 'city', 'state', 'zip_code', 'phone', 'total_beds', 'rent_amount'];
    return required.every(field => formData[field].toString().trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        landlord_id: user.id,
        title: formData.property_name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        phone: formData.phone, // ✅ PHASE 3: Phone field added
        property_type: formData.property_type,
        bedrooms: parseInt(formData.total_beds) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 1,
        monthly_rent: parseFloat(formData.rent_amount),
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
        utilities_included: formData.utilities_included,
        furnished: formData.furnished,
        pets_allowed: formData.pets_allowed,
        smoking_allowed: formData.smoking_allowed,
        gender_restrictions: formData.gender_restrictions,
        age_restrictions: formData.age_restrictions || null,
        description: formData.description || null,
        amenities: formData.amenities,
        house_rules: formData.house_rules || null,
        contact_email: formData.contact_email || null,
        license_number: formData.license_number || null,
        accreditation: formData.accreditation || null,
        accepting_applications: formData.accepting_applications,
        status: 'available'
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
      property_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      property_type: 'sober_living',
      total_beds: '',
      available_beds: '',
      rent_amount: '',
      security_deposit: '',
      utilities_included: false,
      furnished: false,
      pets_allowed: false,
      smoking_allowed: false,
      gender_restrictions: 'any',
      age_restrictions: '',
      description: '',
      amenities: [],
      house_rules: '',
      contact_email: '',
      license_number: '',
      accreditation: '',
      accepting_applications: true
    });
    setEditingProperty(null);
    setShowForm(false);
  };

  const editProperty = (property) => {
    setFormData({
      property_name: property.title || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zip_code: property.zip_code || '',
      phone: property.phone || '', // ✅ PHASE 3: Load phone field for editing
      property_type: property.property_type || 'sober_living',
      total_beds: property.bedrooms?.toString() || '',
      available_beds: property.available_beds?.toString() || '',
      rent_amount: property.monthly_rent?.toString() || '',
      security_deposit: property.security_deposit?.toString() || '',
      utilities_included: property.utilities_included || false,
      furnished: property.furnished || false,
      pets_allowed: property.pets_allowed || false,
      smoking_allowed: property.smoking_allowed || false,
      gender_restrictions: property.gender_restrictions || 'any',
      age_restrictions: property.age_restrictions || '',
      description: property.description || '',
      amenities: property.amenities || [],
      house_rules: property.house_rules || '',
      contact_email: property.contact_email || '',
      license_number: property.license_number || '',
      accreditation: property.accreditation || '',
      accepting_applications: property.accepting_applications !== false
    });
    setEditingProperty(property);
    setShowForm(true);
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
          onClick={() => setShowForm(true)}
        >
          + Add Property
        </button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No properties yet</h3>
          <p>Add your first recovery-friendly property to get started.</p>
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
                <span className={`badge ${property.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                  {property.status}
                </span>
              </div>
              
              <div className="grid-2 mb-3">
                <div className="text-gray-600">
                  <span>Type:</span>
                  <span className="text-gray-800 ml-1">{property.property_type}</span>
                </div>
                <div className="text-gray-600">
                  <span>Rent:</span>
                  <span className="text-gray-800 ml-1">${property.monthly_rent}/mo</span>
                </div>
                <div className="text-gray-600">
                  <span>Bedrooms:</span>
                  <span className="text-gray-800 ml-1">{property.bedrooms || 'Studio'}</span>
                </div>
                <div className="text-gray-600">
                  <span>Phone:</span>
                  <span className="text-gray-800 ml-1">{property.phone || 'Not provided'}</span>
                </div>
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

      {/* Add/Edit Property Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="grid-2 mb-4">
                <div className="form-group">
                  <label className="label">Property Name *</label>
                  <input
                    className="input"
                    type="text"
                    name="property_name"
                    value={formData.property_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Sunny 2BR Recovery Home"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Property Type *</label>
                  <select
                    className="input"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Address Information */}
              <div className="form-group mb-4">
                <label className="label">Address *</label>
                <input
                  className="input"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  required
                />
              </div>
              
              <div className="grid-3 mb-4">
                <div className="form-group">
                  <label className="label">City *</label>
                  <input
                    className="input"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">State *</label>
                  <select
                    className="input"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select State</option>
                    {stateOptions.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">ZIP Code *</label>
                  <input
                    className="input"
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              {/* ✅ PHASE 3: Phone field added to form */}
              <div className="form-group mb-4">
                <label className="label">Contact Phone *</label>
                <input
                  className="input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
                <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem' }}>
                  Primary contact number for this property
                </div>
              </div>
              
              {/* Property Details */}
              <div className="grid-2 mb-4">
                <div className="form-group">
                  <label className="label">Total Bedrooms *</label>
                  <input
                    className="input"
                    type="number"
                    name="total_beds"
                    value={formData.total_beds}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Monthly Rent *</label>
                  <input
                    className="input"
                    type="number"
                    name="rent_amount"
                    value={formData.rent_amount}
                    onChange={handleInputChange}
                    placeholder="1200"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="label">Security Deposit</label>
                <input
                  className="input"
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleInputChange}
                  placeholder="Usually equal to monthly rent"
                  min="0"
                />
              </div>
              
              {/* Amenities */}
              <div className="form-group mb-4">
                <label className="label">Amenities</label>
                <div className="grid-3">
                  {amenityOptions.map(amenity => (
                    <label key={amenity} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <span className="checkbox-text">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Property Features */}
              <div className="grid-2 mb-4">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="utilities_included"
                      checked={formData.utilities_included}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Utilities Included</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="furnished"
                      checked={formData.furnished}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Furnished</span>
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pets_allowed"
                      checked={formData.pets_allowed}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Pets Allowed</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="accepting_applications"
                      checked={formData.accepting_applications}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Accepting Applications</span>
                  </label>
                </div>
              </div>
              
              {/* Description */}
              <div className="form-group mb-4">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property, neighborhood, and recovery-friendly features..."
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="grid-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Add Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;