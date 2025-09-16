// src/components/features/property/search/PropertyAdvancedFilters.js
import React from 'react';
import PropTypes from 'prop-types';
import { 
  acceptedSubsidyPrograms, 
  propertyAmenities,
  accessibilityFeatures 
} from '../constants/propertyConstants';

const PropertyAdvancedFilters = ({
  advancedFilters,
  onAdvancedFilterChange,
  onArrayFilterChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  loading
}) => {
  // ✅ Utility options that match PropertyFinancialSection.js
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

  // ✅ Smoking policy options
  const smokingPolicyOptions = [
    { value: '', label: 'Any Smoking Policy' },
    { value: 'not_allowed', label: 'Non-Smoking Properties Only' },
    { value: 'allowed', label: 'Smoking Allowed Properties OK' }
  ];

  // ✅ Lease length options
  const leaseLengthOptions = [
    { value: '', label: 'Any Lease Length' },
    { value: '1', label: '1+ months minimum' },
    { value: '3', label: '3+ months minimum' },
    { value: '6', label: '6+ months minimum' },
    { value: '12', label: '12+ months minimum' },
    { value: '24', label: '24+ months minimum' }
  ];

  // ✅ Background check options
  const backgroundCheckOptions = [
    { value: '', label: 'Any Background Policy' },
    { value: 'required', label: 'Background Check Required OK' },
    { value: 'not_required', label: 'No Background Check Preferred' },
    { value: 'flexible', label: 'Flexible Background Policy' }
  ];

  return (
    <div className="card mb-4 advanced-filters-card">
      {/* ✅ Collapsible Header */}
      <div className="advanced-filters-header" onClick={onToggleAdvancedFilters}>
        <div className="header-content">
          <h3 className="card-title">
            <span className="title-icon">⚙️</span>
            Advanced Search Options
          </h3>
          <p className="card-subtitle">
            Fine-tune your search with detailed criteria and preferences
          </p>
        </div>
        <button className="toggle-button">
          <span className={`toggle-icon ${showAdvancedFilters ? 'expanded' : ''}`}>
            ▼
          </span>
          <span className="toggle-text">
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </span>
        </button>
      </div>

      {/* ✅ Collapsible Content */}
      {showAdvancedFilters && (
        <div className="advanced-filters-content">
          
          {/* ✅ Housing Assistance Programs */}
          <div className="filter-section">
            <h4 className="section-title">Housing Assistance & Subsidies</h4>
            <div className="form-group">
              <label className="label">Accepted Subsidy Programs</label>
              <div className="input-hint mb-3">
                Select housing assistance programs you want properties to accept
              </div>
              <div className="subsidies-grid">
                {acceptedSubsidyPrograms.map(subsidy => (
                  <div
                    key={subsidy.value}
                    className={`subsidy-item ${advancedFilters.acceptedSubsidies?.includes(subsidy.value) ? 'selected' : ''}`}
                    onClick={() => onArrayFilterChange('advanced', 'acceptedSubsidies', subsidy.value, !advancedFilters.acceptedSubsidies?.includes(subsidy.value))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.acceptedSubsidies?.includes(subsidy.value) || false}
                      onChange={() => {}} // Handled by onClick
                      disabled={loading}
                    />
                    <span className="subsidy-text">{subsidy.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Required Amenities */}
          <div className="filter-section">
            <h4 className="section-title">Required Amenities</h4>
            <div className="form-group">
              <label className="label">Must-Have Amenities</label>
              <div className="input-hint mb-3">
                Select amenities that properties must have
              </div>
              <div className="amenities-grid">
                {propertyAmenities.map(amenity => (
                  <div
                    key={amenity}
                    className={`amenity-item ${advancedFilters.amenities?.includes(amenity) ? 'selected' : ''}`}
                    onClick={() => onArrayFilterChange('advanced', 'amenities', amenity, !advancedFilters.amenities?.includes(amenity))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.amenities?.includes(amenity) || false}
                      onChange={() => {}} // Handled by onClick
                      disabled={loading}
                    />
                    <span className="amenity-text">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Utilities & Services */}
          <div className="filter-section">
            <h4 className="section-title">Utilities & Services</h4>
            <div className="form-group">
              <label className="label">Utilities Included in Rent</label>
              <div className="input-hint mb-3">
                Select utilities that should be included in the monthly rent
              </div>
              <div className="utilities-grid">
                {utilityOptions.map(utility => (
                  <div
                    key={utility.value}
                    className={`utility-item ${advancedFilters.utilitiesIncluded?.includes(utility.value) ? 'selected' : ''}`}
                    onClick={() => onArrayFilterChange('advanced', 'utilitiesIncluded', utility.value, !advancedFilters.utilitiesIncluded?.includes(utility.value))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.utilitiesIncluded?.includes(utility.value) || false}
                      onChange={() => {}} // Handled by onClick
                      disabled={loading}
                    />
                    <span className="utility-text">{utility.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Accessibility Features */}
          <div className="filter-section">
            <h4 className="section-title">Accessibility Features</h4>
            <div className="form-group">
              <label className="label">Required Accessibility Features</label>
              <div className="input-hint mb-3">
                Select accessibility features that properties must have
              </div>
              <div className="accessibility-grid">
                {accessibilityFeatures.map(feature => (
                  <div
                    key={feature}
                    className={`accessibility-item ${advancedFilters.accessibilityFeatures?.includes(feature) ? 'selected' : ''}`}
                    onClick={() => onArrayFilterChange('advanced', 'accessibilityFeatures', feature, !advancedFilters.accessibilityFeatures?.includes(feature))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.accessibilityFeatures?.includes(feature) || false}
                      onChange={() => {}} // Handled by onClick
                      disabled={loading}
                    />
                    <span className="accessibility-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Property Policies & Requirements */}
          <div className="filter-section">
            <h4 className="section-title">Property Policies & Requirements</h4>
            <div className="policies-grid">
              <div className="form-group">
                <label className="label">Smoking Policy</label>
                <select
                  className="input"
                  value={advancedFilters.smokingPolicy}
                  onChange={(e) => onAdvancedFilterChange('smokingPolicy', e.target.value)}
                  disabled={loading}
                >
                  {smokingPolicyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Minimum Lease Length</label>
                <select
                  className="input"
                  value={advancedFilters.leaseLength}
                  onChange={(e) => onAdvancedFilterChange('leaseLength', e.target.value)}
                  disabled={loading}
                >
                  {leaseLengthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Background Check Policy</label>
                <select
                  className="input"
                  value={advancedFilters.backgroundCheck}
                  onChange={(e) => onAdvancedFilterChange('backgroundCheck', e.target.value)}
                  disabled={loading}
                >
                  {backgroundCheckOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Guest Policy</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., 'Overnight guests allowed', 'No guests'"
                  value={advancedFilters.guestPolicy}
                  onChange={(e) => onAdvancedFilterChange('guestPolicy', e.target.value)}
                  disabled={loading}
                />
                <div className="input-hint">
                  Describe your guest policy preferences
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Move-in Costs */}
          <div className="filter-section">
            <h4 className="section-title">Move-in Costs</h4>
            <div className="form-group">
              <label className="label">Maximum Move-in Cost</label>
              <input
                className="input"
                type="number"
                placeholder="e.g., 2000"
                value={advancedFilters.moveInCost}
                onChange={(e) => onAdvancedFilterChange('moveInCost', e.target.value)}
                disabled={loading}
                min="0"
                step="100"
              />
              <div className="input-hint">
                Total upfront costs including deposits, fees, and first month's rent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Component Styles */}
      <style jsx>{`
        .advanced-filters-card {
          border: 2px solid var(--border-beige);
          overflow: hidden;
        }

        .advanced-filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: var(--transition-normal);
          background: linear-gradient(135deg, rgba(160, 32, 240, 0.02) 0%, rgba(255, 255, 255, 1) 100%);
        }

        .advanced-filters-header:hover {
          background: linear-gradient(135deg, rgba(160, 32, 240, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        }

        .header-content {
          flex: 1;
        }

        .title-icon {
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: none;
          border: 2px solid var(--border-beige);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          color: var(--primary-purple);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .toggle-button:hover {
          border-color: var(--primary-purple);
          background: rgba(160, 32, 240, 0.05);
        }

        .toggle-icon {
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }

        .toggle-icon.expanded {
          transform: rotate(180deg);
        }

        .advanced-filters-content {
          padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
          border-top: 1px solid var(--border-beige);
          background: white;
        }

        .filter-section {
          padding: var(--spacing-lg) 0;
        }

        .filter-section:not(:last-child) {
          border-bottom: 1px solid var(--border-beige);
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-md);
        }

        .subsidies-grid,
        .amenities-grid,
        .utilities-grid,
        .accessibility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--spacing-sm);
        }

        .subsidy-item,
        .amenity-item,
        .utility-item,
        .accessibility-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          border: 2px solid var(--border-beige);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-normal);
          background: white;
        }

        .subsidy-item:hover,
        .amenity-item:hover,
        .utility-item:hover,
        .accessibility-item:hover {
          border-color: var(--primary-purple);
          background: rgba(160, 32, 240, 0.02);
        }

        .subsidy-item.selected,
        .amenity-item.selected,
        .utility-item.selected,
        .accessibility-item.selected {
          border-color: var(--primary-purple);
          background: rgba(160, 32, 240, 0.05);
        }

        .subsidy-text,
        .amenity-text,
        .utility-text,
        .accessibility-text {
          font-size: 0.85rem;
          color: var(--gray-700);
          line-height: 1.3;
        }

        .policies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
        }

        .input-hint {
          font-size: 0.8rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
          line-height: 1.3;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .advanced-filters-header {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-md);
          }

          .toggle-button {
            align-self: center;
          }

          .subsidies-grid,
          .amenities-grid,
          .utilities-grid,
          .accessibility-grid {
            grid-template-columns: 1fr;
          }

          .policies-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }
        }

        @media (max-width: 480px) {
          .advanced-filters-header,
          .advanced-filters-content {
            padding: var(--spacing-md);
          }

          .toggle-text {
            font-size: 0.8rem;
          }

          .subsidy-text,
          .amenity-text,
          .utility-text,
          .accessibility-text {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

PropertyAdvancedFilters.propTypes = {
  advancedFilters: PropTypes.shape({
    acceptedSubsidies: PropTypes.array.isRequired,
    amenities: PropTypes.array.isRequired,
    utilitiesIncluded: PropTypes.array.isRequired,
    accessibilityFeatures: PropTypes.array,
    smokingPolicy: PropTypes.string.isRequired,
    guestPolicy: PropTypes.string.isRequired,
    backgroundCheck: PropTypes.string.isRequired,
    leaseLength: PropTypes.string.isRequired,
    moveInCost: PropTypes.string.isRequired
  }).isRequired,
  onAdvancedFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  showAdvancedFilters: PropTypes.bool.isRequired,
  onToggleAdvancedFilters: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyAdvancedFilters;