// src/components/features/property/search/PropertyTypeSelection.js - Compact Cards with Better Borders
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
      description: 'Search both general rentals and recovery housing with recovery-friendly options prioritized.',
      features: [
        'Largest selection available',
        'Recovery housing prioritized',
        'General rentals included'
      ],
      badgeText: 'Most Options',
      badgeClass: 'success'
    },
    {
      value: 'general_only',
      icon: '🏢',
      title: 'General Rentals Only',
      description: 'Standard rental properties including apartments, houses, and condos.',
      features: [
        'Traditional lease terms',
        'Standard rental agreements',
        'No recovery requirements'
      ],
      badgeText: 'Traditional',
      badgeClass: 'secondary'
    },
    {
      value: 'recovery_only',
      icon: '🌱',
      title: 'Recovery Housing Only',
      description: 'Specialized housing designed for people in recovery with support services.',
      features: [
        'Sober living homes',
        'Recovery residences',
        'Support services available'
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
                tabIndex={-1}
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

            {/* Selection Status */}
            {selectedType === option.value && (
              <div className={styles.selectedBanner}>
                <span className={styles.selectedIcon}>✓</span>
                Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selection Context Help */}
      {selectedType && (
        <div className={styles.selectionContext}>
          <div className={styles.contextContent}>
            <span className={styles.contextIcon}>💡</span>
            <div className={styles.contextText}>
              <strong>Tip:</strong> {
                selectedType === 'all_housing' ? 'You\'ll see the most options. Use the tabs below to filter by location, recovery features, and more.' :
                selectedType === 'recovery_only' ? 'You\'ll see specialized recovery housing filters in the Recovery tab.' :
                'You\'ll see streamlined filters focused on standard rental criteria.'
              }
            </div>
            {selectedType !== 'all_housing' && (
              <button
                className={styles.expandSearchBtn}
                onClick={() => onTypeChange('all_housing')}
                disabled={loading}
              >
                🔍 View All Housing
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

PropertyTypeSelection.propTypes = {
  selectedType: PropTypes.oneOf(['all_housing', 'general_only', 'recovery_only']).isRequired,
  onTypeChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyTypeSelection;