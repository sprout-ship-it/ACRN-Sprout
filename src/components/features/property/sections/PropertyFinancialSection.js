// src/components/property/sections/PropertyFinancialSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { acceptedSubsidyPrograms } from '../../forms/constants/propertyConstants';

const PropertyFinancialSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  // ✅ Enhanced utilities options for granular control
  const utilityOptions = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' }, 
    { value: 'gas', label: 'Gas' },
    { value: 'trash', label: 'Trash Collection' },
    { value: 'internet', label: 'Internet/WiFi' },
    { value: 'cable_tv', label: 'Cable TV' },
    { value: 'heating', label: 'Heating' },
    { value: 'air_conditioning', label: 'Air Conditioning' }
  ];

  return (
    <>
      <h3 className="card-title mb-4">Financial Information & Housing Details</h3>
      
      {/* Basic Housing Details */}
      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">Total Bedrooms *</label>
          <input
            className={`input ${errors.total_beds ? 'border-red-500' : ''}`}
            type="number"
            name="total_beds"
            value={formData.total_beds}
            onChange={onInputChange}
            min="0"
            max="20"
            disabled={loading}
            required
          />
          {errors.total_beds && (
            <div className="text-red-500 mt-1">{errors.total_beds}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Available Beds</label>
          <input
            className="input"
            type="number"
            name="available_beds"
            value={formData.available_beds}
            onChange={onInputChange}
            min="0"
            max={formData.total_beds || 20}
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Currently available for new residents
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Bathrooms</label>
          <input
            className="input"
            type="number"
            name="bathrooms"
            value={formData.bathrooms || ''}
            onChange={onInputChange}
            min="0.5"
            step="0.5"
            max="10"
            disabled={loading}
          />
        </div>
      </div>

      {/* Pricing Information */}
      <h4 className="card-subtitle mb-3">Pricing & Financial Terms</h4>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Monthly Rent *</label>
          <input
            className={`input ${errors.rent_amount ? 'border-red-500' : ''}`}
            type="number"
            name="rent_amount"
            value={formData.rent_amount}
            onChange={onInputChange}
            placeholder="800"
            min="0"
            max="5000"
            disabled={loading}
            required
          />
          {errors.rent_amount && (
            <div className="text-red-500 mt-1">{errors.rent_amount}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Monthly rent per person/bed
          </div>
        </div>
        
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
            max="10000"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            One-time deposit (typically first month's rent)
          </div>
        </div>
      </div>

      {/* Additional Financial Information */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Application Fee</label>
          <input
            className="input"
            type="number"
            name="application_fee"
            value={formData.application_fee || ''}
            onChange={onInputChange}
            placeholder="50"
            min="0"
            max="500"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            One-time application processing fee
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Weekly Rate (if applicable)</label>
          <input
            className="input"
            type="number"
            name="weekly_rate"
            value={formData.weekly_rate || ''}
            onChange={onInputChange}
            placeholder="200"
            min="0"
            max="1000"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            For short-term or weekly rental options
          </div>
        </div>
      </div>

      {/* ✅ NEW: Housing Subsidy Acceptance */}
      <div className="form-group mb-4">
        <label className="label">
          Accepted Housing Assistance Programs
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all housing assistance programs that your property accepts. This helps match you with qualified residents.
        </div>
        <div className="checkbox-columns">
          {acceptedSubsidyPrograms.map(subsidy => (
            <label key={subsidy.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.accepted_subsidies?.includes(subsidy.value) || false}
                onChange={(e) => onArrayChange('accepted_subsidies', subsidy.value, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{subsidy.label}</span>
            </label>
          ))}
        </div>
        {errors.accepted_subsidies && (
          <div className="text-red-500 mt-1">{errors.accepted_subsidies}</div>
        )}
      </div>

      {/* ✅ CORRECTED: Enhanced Utilities Section with Array Handling */}
      <h4 className="card-subtitle mb-3">Utilities & Included Services</h4>
      
      <div className="form-group mb-4">
        <label className="label">Utilities Included</label>
        <div className="text-gray-500 mb-3 text-sm">
          Select which utilities are included in the rent payment.
        </div>
        <div className="checkbox-columns-compact">
          {utilityOptions.map(utility => (
            <label key={utility.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.utilities_included?.includes(utility.value) || false}
                onChange={(e) => onArrayChange('utilities_included', utility.value, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{utility.label}</span>
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
              name="furnished"
              checked={formData.furnished || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Furnished Rooms</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Basic furniture provided in bedrooms
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="meals_included"
              checked={formData.meals_included || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Meals Included</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Some or all meals provided
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="linens_provided"
              checked={formData.linens_provided || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Linens Provided</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Bedding and towels provided
          </div>
        </div>
      </div>

      {/* ✅ Enhanced styling for compact checkbox layout */}
      <style jsx>{`
        .checkbox-columns-compact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .checkbox-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .checkbox-label:hover {
          background-color: var(--secondary-teal-light, #f0f9ff);
        }
        
        .checkbox-text {
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--text-gray-700, #374151);
        }
        
        input[type="checkbox"] {
          margin-top: 0.1rem;
          flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
          .checkbox-columns-compact {
            grid-template-columns: 1fr;
          }
          
          .checkbox-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

PropertyFinancialSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default PropertyFinancialSection;