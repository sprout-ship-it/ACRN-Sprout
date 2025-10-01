// src/components/features/property/search/PropertyTypeSelection.js - Search Property Type Selector
import React from 'react';
import PropTypes from 'prop-types';

// ✅ Import CSS module
import styles from './PropertyTypeSelection.module.css';

const PropertyTypeSelection = ({ 
  selectedType, 
  onTypeChange, 
  loading 
}) => {
  const propertyTypeOptions = [
    {
      value: 'all_housing',
      icon: '🏠',
      title: 'All Housing Types',
      description: 'Search both general rentals and recovery housing with recovery-friendly options prioritized in results.',
      features: [
        'General apartments, houses, condos',
        'Recovery housing & sober living',
        'Recovery-friendly properties prioritized',
        'Largest selection of options'
      ],
      badgeText: 'Most Options',
      badgeClass: 'success'
    },
    {
      value: 'general_only',
      icon: '🏢',
      title: 'General Rentals Only',
      description: 'Standard rental properties including apartments, houses, and condos for the general market.',
      features: [
        'Apartments, houses, condos',
        'Standard rental agreements',
        'Traditional lease terms',
        'No recovery-specific requirements'
      ],
      badgeText: 'Traditional',
      badgeClass: 'secondary'
    },
    {
      value: 'recovery_only',
      icon: '🌱',
      title: 'Recovery Housing Only',
      description: 'Specialized housing designed specifically for people in recovery with support services and structured environments.',
      features: [
        'Sober living homes',
        'Recovery residences',
        'Support services available',
        'Recovery-focused community'
      ],
      badgeText: 'Specialized',
      badgeClass: 'primary'
    }
  ];

  return (
    <div className={styles.propertyTypeSelection}>
      <div className={styles.selectionHeader}>
        <h2 className={styles.selectionTitle}>What type of housing are you looking for?</h2>
        <p className={styles.selectionSubtitle}>
          Choose your housing preference to see relevant properties and filter options
        </p>
      </div>

      <div className={styles.typeOptionsGrid}>
        {propertyTypeOptions.map((option) => (
          <div
            key={option.value}
            className={`${styles.typeOption} ${selectedType === option.value ? styles.selected : ''} ${loading ? styles.disabled : ''}`}
            onClick={() => !loading && onTypeChange(option.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (!loading && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onTypeChange(option.value);
              }
            }}
          >
            {/* Selection Indicator */}
            <div className={styles.selectionIndicator}>
              <input
                type="radio"
                name="property-type"
                checked={selectedType === option.value}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
            </div>

            {/* Option Content */}
            <div className={styles.optionContent}>
              <div className={styles.optionHeader}>
                <div className={styles.optionIcon}>{option.icon}</div>
                <div className={styles.optionTitleSection}>
                  <h3 className={styles.optionTitle}>{option.title}</h3>
                  <span className={`${styles.optionBadge} ${styles[option.badgeClass]}`}>
                    {option.badgeText}
                  </span>
                </div>
              </div>

              <p className={styles.optionDescription}>
                {option.description}
              </p>

              <ul className={styles.optionFeatures}>
                {option.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <span className={styles.featureIcon}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Selection Action */}
            <div className={styles.optionAction}>
              {selectedType === option.value ? (
                <span className={styles.selectedText}>Selected</span>
              ) : (
                <span className={styles.selectText}>Select</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedType && (
        <div className={styles.selectionSummary}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryIcon}>
              {propertyTypeOptions.find(opt => opt.value === selectedType)?.icon}
            </span>
            <div className={styles.summaryText}>
              <strong>Searching:</strong> {propertyTypeOptions.find(opt => opt.value === selectedType)?.title}
            </div>
            {selectedType !== 'all_housing' && (
              <button
                className={styles.expandSearchBtn}
                onClick={() => onTypeChange('all_housing')}
                disabled={loading}
              >
                <span className={styles.expandIcon}>🔍</span>
                Search All Housing Types
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Context Help */}
      <div className={styles.searchContextHelp}>
        <div className={styles.helpItem}>
          <span className={styles.helpIcon}>💡</span>
          <span className={styles.helpText}>
            <strong>Tip:</strong> Start with "All Housing Types" to see the most options, then narrow down using filters below.
          </span>
        </div>
        
        {selectedType === 'recovery_only' && (
          <div className={styles.helpItem}>
            <span className={styles.helpIcon}>🌱</span>
            <span className={styles.helpText}>
              <strong>Recovery Focus:</strong> You'll see specialized filters for recovery programs, support services, and house rules.
            </span>
          </div>
        )}
        
        {selectedType === 'general_only' && (
          <div className={styles.helpItem}>
            <span className={styles.helpIcon}>🏢</span>
            <span className={styles.helpText}>
              <strong>General Rentals:</strong> Streamlined filters focused on standard rental criteria and amenities.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

PropertyTypeSelection.propTypes = {
  selectedType: PropTypes.oneOf(['all_housing', 'general_only', 'recovery_only']).isRequired,
  onTypeChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyTypeSelection;