// src/components/property/PropertyTypeSelector.js
import React from 'react';
import PropTypes from 'prop-types';

const PropertyTypeSelector = ({ onSelection }) => {
  return (
    <div className="property-type-selector">
      <div className="modal-header">
        <h2 className="modal-title">What type of property are you adding?</h2>
        <p className="selection-subtitle">
          Choose the option that best describes your rental property to get the appropriate form.
        </p>
      </div>

      <div className="property-type-options">
        {/* General Rental Option */}
        <div 
          className="property-type-card"
          onClick={() => onSelection('general_rental')}
        >
          <div className="type-icon">🏠</div>
          <h3 className="type-title">General Rental Property</h3>
          <p className="type-description">
            Standard rental property for the general market. Perfect for landlords renting 
            apartments, houses, or condos to any tenants.
          </p>
          <ul className="type-features">
            <li>Simple, streamlined form</li>
            <li>Basic property details</li>
            <li>Standard amenities</li>
            <li>General rental terms</li>
          </ul>
          <div className="type-action">
            <span className="btn-text">Choose General Rental</span>
          </div>
        </div>

        {/* Recovery Housing Option */}
        <div 
          className="property-type-card"
          onClick={() => onSelection('recovery_housing')}
        >
          <div className="type-icon">🌱</div>
          <h3 className="type-title">Recovery Housing</h3>
          <p className="type-description">
            Sober living homes, recovery residences, and specialized housing for people 
            in recovery from addiction.
          </p>
          <ul className="type-features">
            <li>Recovery-specific requirements</li>
            <li>Support services details</li>
            <li>House rules & restrictions</li>
            <li>Subsidy program acceptance</li>
          </ul>
          <div className="type-action">
            <span className="btn-text">Choose Recovery Housing</span>
          </div>
        </div>
      </div>

      <div className="selector-footer">
        <p className="footer-text">
          Don't worry - you can always edit your property details after creating it.
        </p>
      </div>

      <style jsx>{`
        .property-type-selector {
          max-width: 800px;
          width: 100%;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .modal-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: var(--primary-purple);
          margin: 0 0 1rem 0;
        }

        .selection-subtitle {
          color: var(--gray-600);
          font-size: 1rem;
          margin: 0;
          line-height: 1.5;
        }

        .property-type-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .property-type-card {
          background: white;
          border: 2px solid var(--border-beige);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          cursor: pointer;
          transition: var(--transition-normal);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .property-type-card:hover {
          border-color: var(--primary-purple);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .property-type-card:hover .type-action {
          background: var(--primary-purple);
          color: white;
        }

        .type-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .type-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--gray-800);
          margin: 0 0 1rem 0;
          font-weight: 600;
        }

        .type-description {
          color: var(--gray-600);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
        }

        .type-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
          text-align: left;
        }

        .type-features li {
          font-size: 0.85rem;
          color: var(--gray-700);
          padding: 0.25rem 0;
          position: relative;
          padding-left: 1.2rem;
        }

        .type-features li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--secondary-teal);
          font-weight: bold;
        }

        .type-action {
          background: var(--border-beige);
          color: var(--gray-700);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition-normal);
          margin-top: auto;
        }

        .btn-text {
          display: block;
        }

        .selector-footer {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-beige);
        }

        .footer-text {
          color: var(--gray-500);
          font-size: 0.85rem;
          margin: 0;
          font-style: italic;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .property-type-options {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .property-type-card {
            padding: 1.25rem;
          }

          .type-icon {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .property-type-selector {
            padding: 0.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .type-title {
            font-size: 1.1rem;
          }

          .type-description {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

PropertyTypeSelector.propTypes = {
  onSelection: PropTypes.func.isRequired
};

export default PropertyTypeSelector;