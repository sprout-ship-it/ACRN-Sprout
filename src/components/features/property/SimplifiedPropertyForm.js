import React from 'react';
import PropTypes from 'prop-types';

const SimplifiedPropertyForm = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange,
  stateOptions
}) => {
  const basicAmenities = [
    { value: 'washer_dryer', label: 'Washer/Dryer' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'air_conditioning', label: 'Air Conditioning' },
    { value: 'heating', label: 'Heating' },
    { value: 'parking', label: 'Parking Available' },
    { value: 'yard', label: 'Yard/Outdoor Space' },
    { value: 'pool', label: 'Pool' },
    { value: 'gym', label: 'Gym/Fitness Center' },
    { value: 'internet', label: 'Internet Included' },
    { value: 'cable', label: 'Cable TV Included' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Rental Property Details</h3>
      
      {/* Basic Property Information */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h4 className="text-lg font-medium mb-4">Property Information</h4>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="label">Property Name/Title *</label>
            <input
              className={`input ${errors.property_name ? 'border-red-500' : ''}`}
              type="text"
              name="property_name"
              value={formData.property_name}
              onChange={onInputChange}
              placeholder="e.g., Cozy 2BR Near Downtown"
              disabled={loading}
              required
            />
            {errors.property_name && (
              <div className="text-red-500 mt-1 text-sm">{errors.property_name}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Property Type</label>
            <select
              className="input"
              name="property_type"
              value={formData.property_type}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="townhouse">Townhouse</option>
              <option value="condo">Condo</option>
              <option value="duplex">Duplex</option>
              <option value="studio">Studio</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="form-group md:col-span-2">
            <label className="label">Street Address *</label>
            <input
              className={`input ${errors.address ? 'border-red-500' : ''}`}
              type="text"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              disabled={loading}
              required
            />
            {errors.address && (
              <div className="text-red-500 mt-1 text-sm">{errors.address}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">City *</label>
            <input
              className={`input ${errors.city ? 'border-red-500' : ''}`}
              type="text"
              name="city"
              value={formData.city}
              onChange={onInputChange}
              disabled={loading}
              required
            />
            {errors.city && (
              <div className="text-red-500 mt-1 text-sm">{errors.city}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">State *</label>
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
              <div className="text-red-500 mt-1 text-sm">{errors.state}</div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">ZIP Code *</label>
            <input
              className={`input ${errors.zip_code ? 'border-red-500' : ''}`}
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={onInputChange}
              disabled={loading}
              required
            />
            {errors.zip_code && (
              <div className="text-red-500 mt-1 text-sm">{errors.zip_code}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Contact Phone *</label>
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
              <div className="text-red-500 mt-1 text-sm">{errors.phone}</div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h4 className="text-lg font-medium mb-4">Property Details</h4>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="form-group">
            <label className="label">Bedrooms *</label>
            <select
              className={`input ${errors.total_beds ? 'border-red-500' : ''}`}
              name="total_beds"
              value={formData.total_beds}
              onChange={onInputChange}
              disabled={loading}
              required
            >
              <option value="">Select</option>
              <option value="0">Studio</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
            {errors.total_beds && (
              <div className="text-red-500 mt-1 text-sm">{errors.total_beds}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Bathrooms</label>
            <select
              className="input"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="1">1 Bathroom</option>
              <option value="1.5">1.5 Bathrooms</option>
              <option value="2">2 Bathrooms</option>
              <option value="2.5">2.5 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="3.5">3.5 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Monthly Rent *</label>
            <input
              className={`input ${errors.rent_amount ? 'border-red-500' : ''}`}
              type="number"
              name="rent_amount"
              value={formData.rent_amount}
              onChange={onInputChange}
              placeholder="1200"
              min="0"
              disabled={loading}
              required
            />
            {errors.rent_amount && (
              <div className="text-red-500 mt-1 text-sm">{errors.rent_amount}</div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Security Deposit</label>
            <input
              className="input"
              type="number"
              name="security_deposit"
              value={formData.security_deposit}
              onChange={onInputChange}
              placeholder="Usually equal to monthly rent"
              min="0"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Application Fee</label>
            <input
              className="input"
              type="number"
              name="application_fee"
              value={formData.application_fee}
              onChange={onInputChange}
              placeholder="50"
              min="0"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Property Features */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h4 className="text-lg font-medium mb-4">Property Features</h4>
        
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="furnished"
                checked={formData.furnished || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className="checkbox-text">Furnished</span>
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="pets_allowed"
                checked={formData.pets_allowed || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className="checkbox-text">Pets Allowed</span>
            </label>
          </div>
          
          <div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="smoking_allowed"
                checked={formData.smoking_allowed || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className="checkbox-text">Smoking Allowed</span>
            </label>
          </div>
        </div>

        {/* Amenities */}
        <div className="form-group">
          <label className="label mb-3">Amenities</label>
          <div className="grid md:grid-cols-2 gap-2">
            {basicAmenities.map(amenity => (
              <label key={amenity.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.amenities?.includes(amenity.value) || false}
                  onChange={(e) => onArrayChange('amenities', amenity.value, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-medium mb-4">Additional Information</h4>
        
        <div className="form-group mb-4">
          <label className="label">Contact Email</label>
          <input
            className="input"
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={onInputChange}
            placeholder="landlord@example.com"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">Property Description</label>
          <textarea
            className="input"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows="4"
            placeholder="Describe your property, neighborhood, and any special features..."
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

SimplifiedPropertyForm.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  stateOptions: PropTypes.array.isRequired
};

export default SimplifiedPropertyForm;