// src/components/dashboard/PropertyManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

// ==================== MOCK DATA ====================

const mockProperties = [
  {
    id: 1,
    title: 'Sunny 2BR Apartment',
    address: '123 Recovery Lane, Austin, TX 78701',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    rent: 1200,
    deposit: 1200,
    status: 'available',
    description: 'Beautiful 2-bedroom apartment in a quiet, recovery-friendly neighborhood. Recently renovated with modern amenities.',
    amenities: ['Laundry', 'Parking', 'Pet-friendly'],
    dateAdded: '2024-08-15',
    leaseLength: '12 months'
  },
  {
    id: 2,
    title: 'Cozy Studio Downtown',
    address: '456 Main Street, Austin, TX 78702',
    type: 'Studio',
    bedrooms: 0,
    bathrooms: 1,
    rent: 900,
    deposit: 900,
    status: 'rented',
    description: 'Compact studio in the heart of downtown, perfect for someone starting their recovery journey.',
    amenities: ['Gym access', 'Utilities included'],
    dateAdded: '2024-07-20',
    leaseLength: '6 months',
    tenant: 'Sarah M.'
  },
  {
    id: 3,
    title: 'Spacious 3BR House',
    address: '789 Serenity Drive, Austin, TX 78703',
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    rent: 2000,
    deposit: 2000,
    status: 'pending',
    description: 'Large house perfect for a sober living arrangement. Quiet neighborhood with recovery support nearby.',
    amenities: ['Yard', 'Garage', 'Dishwasher'],
    dateAdded: '2024-08-01',
    leaseLength: '12 months'
  },
  {
    id: 4,
    title: 'Modern 1BR Condo',
    address: '321 Hope Avenue, Austin, TX 78704',
    type: 'Condo',
    bedrooms: 1,
    bathrooms: 1,
    rent: 1100,
    deposit: 1100,
    status: 'maintenance',
    description: 'Modern condo with updated kitchen and bathroom. Great for someone in stable recovery.',
    amenities: ['Pool', 'Fitness center', 'Balcony'],
    dateAdded: '2024-06-10',
    leaseLength: '12 months'
  }
];

// ==================== PROPERTY MANAGEMENT COMPONENT ====================

const PropertyManagement = ({ onBack }) => {
  const { user, profile, hasRole } = useAuth();
  
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const [properties, setProperties] = useState(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: ''
  });
  
  // New property form data
  const [newProperty, setNewProperty] = useState({
    title: '',
    address: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    rent: '',
    deposit: '',
    description: '',
    amenities: '',
    leaseLength: ''
  });
  
  // Property types and statuses
  const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Studio', 'Room'];
  const propertyStatuses = ['available', 'rented', 'pending', 'maintenance'];
  
  // Load properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      if (!user || !hasRole('landlord')) {
        setInitialLoading(false);
        return;
      }

      try {
        // In a real app, this would load from database
        const { data, error } = await db.properties.getByLandlordId(user.id);
        
        if (error) {
          console.error('Error loading properties:', error);
          // Use mock data as fallback
          setProperties(mockProperties);
          setFilteredProperties(mockProperties);
        } else {
          setProperties(data || []);
          setFilteredProperties(data || []);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        // Use mock data as fallback
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProperties();
  }, [user, hasRole]);
  
  // Filter properties
  useEffect(() => {
    if (!hasRole('landlord')) {
      return;
    }
    
    let filtered = properties;
    
    if (filters.search) {
      filtered = filtered.filter(prop => 
        prop.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        prop.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(prop => prop.status === filters.status);
    }
    
    if (filters.type) {
      filtered = filtered.filter(prop => prop.type === filters.type);
    }
    
    setFilteredProperties(filtered);
  }, [properties, filters, hasRole]);
  
  // NOW CHECK FOR LANDLORD ROLE AFTER ALL HOOKS
  if (!hasRole('landlord')) {
    return (
      <div className="content">
        <div className="alert alert-info">
          <p>Property management is only available for landlords.</p>
        </div>
      </div>
    );
  }
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle new property input changes
  const handleNewPropertyChange = (key, value) => {
    setNewProperty(prev => ({ ...prev, [key]: value }));
  };
  
  // Add new property
  const handleAddProperty = async () => {
    if (!newProperty.title || !newProperty.address || !newProperty.rent) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const property = {
        landlord_id: user.id,
        title: newProperty.title,
        address: newProperty.address,
        property_type: newProperty.type,
        bedrooms: parseInt(newProperty.bedrooms) || 0,
        bathrooms: parseFloat(newProperty.bathrooms) || 1,
        monthly_rent: parseInt(newProperty.rent),
        security_deposit: parseInt(newProperty.deposit) || parseInt(newProperty.rent),
        description: newProperty.description,
        amenities: newProperty.amenities.split(',').map(a => a.trim()).filter(a => a),
        lease_length: newProperty.leaseLength,
        status: 'available'
      };

      // In a real app, save to database
      const { data, error } = await db.properties.create(property);
      
      if (error) {
        throw error;
      }

      // Update local state with new property
      const newProp = {
        ...property,
        id: data?.id || Date.now(),
        dateAdded: new Date().toISOString().split('T')[0]
      };
      
      setProperties(prev => [...prev, newProp]);
      setShowAddModal(false);
      setNewProperty({
        title: '', address: '', type: '', bedrooms: '', bathrooms: '',
        rent: '', deposit: '', description: '', amenities: '', leaseLength: ''
      });
      
      alert('Property added successfully!');
      
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update property status
  const handleStatusChange = async (propertyId, newStatus) => {
    setLoading(true);
    
    try {
      // In a real app, update in database
      const { error } = await db.properties.update(propertyId, { status: newStatus });
      
      if (error) {
        throw error;
      }
      
      setProperties(prev => prev.map(prop => 
        prop.id === propertyId ? { ...prop, status: newStatus } : prop
      ));
      
      alert(`Property status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, delete from database
      const { error } = await db.properties.delete(propertyId);
      
      if (error) {
        throw error;
      }
      
      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
      
      alert('Property deleted successfully');
      
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    const statusClasses = {
      available: 'badge-success',
      rented: 'badge-error',
      pending: 'badge-warning',
      maintenance: 'badge'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'badge'}`}>
        {status}
      </span>
    );
  };
  
  // Render property card
  const renderPropertyCard = (property) => (
    <div key={property.id} className="card">
      <div className="card" style={{ background: 'var(--bg-light-cream)', marginBottom: 'var(--spacing-lg)', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', color: 'var(--primary-purple)' }}>🏠</div>
      </div>
      
      <div>
        <div className="card-header">
          <div>
            <h3 className="card-title">{property.title}</h3>
            <p className="card-subtitle">{property.address}</p>
          </div>
          {renderStatusBadge(property.status)}
        </div>
        
        <div className="grid-2 mb-3">
          <div className="text-gray-600">
            <span>Type:</span>
            <span className="text-gray-800 ml-1">{property.type}</span>
          </div>
          <div className="text-gray-600">
            <span>Rent:</span>
            <span className="text-gray-800 ml-1">${property.rent}/mo</span>
          </div>
          <div className="text-gray-600">
            <span>Bedrooms:</span>
            <span className="text-gray-800 ml-1">{property.bedrooms || 'Studio'}</span>
          </div>
          <div className="text-gray-600">
            <span>Bathrooms:</span>
            <span className="text-gray-800 ml-1">{property.bathrooms}</span>
          </div>
        </div>
        
        <p className="card-text mb-3">
          {property.description && property.description.length > 100 
            ? `${property.description.substring(0, 100)}...`
            : property.description
          }
        </p>
        
        <div className="mb-3">
          <button
            className="btn btn-primary btn-sm mr-2"
            onClick={() => {
              setSelectedProperty(property);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          
          <select
            className="input btn-sm mr-2"
            value={property.status}
            onChange={(e) => handleStatusChange(property.id, e.target.value)}
            disabled={loading}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            {propertyStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteProperty(property.id)}
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (initialLoading) {
    return (
      <div className="content">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <LoadingSpinner message="Loading your properties..." />
        </div>
      </div>
    );
  }
  
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
          onClick={() => setShowAddModal(true)}
        >
          + Add Property
        </button>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="card mb-5">
        <div className="grid-auto">
          <div className="form-group">
            <label className="label">Search Properties</label>
            <input
              className="input"
              type="text"
              placeholder="Search by title or address..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {propertyStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Type</label>
            <select
              className="input"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No properties found</h3>
          <p>
            {properties.length === 0 
              ? 'You haven\'t added any properties yet. Click "Add Property" to get started.'
              : 'No properties match your current filters. Try adjusting your search criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="grid-auto">
          {filteredProperties.map(renderPropertyCard)}
        </div>
      )}
      
      {/* Back Button */}
      {onBack && (
        <div className="text-center mt-5">
          <button className="btn btn-outline" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      )}
      
      {/* Add Property Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Property</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="label">Property Title *</label>
                <input
                  className="input"
                  type="text"
                  value={newProperty.title}
                  onChange={(e) => handleNewPropertyChange('title', e.target.value)}
                  placeholder="e.g., Sunny 2BR Apartment"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Property Type *</label>
                <select
                  className="input"
                  value={newProperty.type}
                  onChange={(e) => handleNewPropertyChange('type', e.target.value)}
                >
                  <option value="">Select type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="label">Address *</label>
              <input
                className="input"
                type="text"
                value={newProperty.address}
                onChange={(e) => handleNewPropertyChange('address', e.target.value)}
                placeholder="Full address including city and state"
              />
            </div>
            
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="label">Bedrooms</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={newProperty.bedrooms}
                  onChange={(e) => handleNewPropertyChange('bedrooms', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="label">Bathrooms</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="0.5"
                  value={newProperty.bathrooms}
                  onChange={(e) => handleNewPropertyChange('bathrooms', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="label">Monthly Rent *</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={newProperty.rent}
                  onChange={(e) => handleNewPropertyChange('rent', e.target.value)}
                  placeholder="Monthly rent amount"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Security Deposit</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={newProperty.deposit}
                  onChange={(e) => handleNewPropertyChange('deposit', e.target.value)}
                  placeholder="Defaults to monthly rent"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="label">Description</label>
              <textarea
                className="input"
                value={newProperty.description}
                onChange={(e) => handleNewPropertyChange('description', e.target.value)}
                placeholder="Describe the property, neighborhood, and recovery-friendly features..."
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="label">Amenities</label>
                <input
                  className="input"
                  type="text"
                  value={newProperty.amenities}
                  onChange={(e) => handleNewPropertyChange('amenities', e.target.value)}
                  placeholder="Comma-separated list"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Lease Length</label>
                <select
                  className="input"
                  value={newProperty.leaseLength}
                  onChange={(e) => handleNewPropertyChange('leaseLength', e.target.value)}
                >
                  <option value="">Select lease length</option>
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="24 months">24 months</option>
                </select>
              </div>
            </div>
            
            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                className="btn btn-primary"
                onClick={handleAddProperty}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;