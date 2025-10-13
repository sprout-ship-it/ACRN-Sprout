// src/components/features/connections/modals/PropertyDetailsModal.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './PropertyDetailsModal.module.css';

const PropertyDetailsModal = ({
  isOpen,
  property,
  connectionStatus,
  onClose,
  onContact,
  onConnect,
  showContactInfo = false
}) => {
  if (!isOpen || !property) return null;

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    if (!amount) return 'Contact for pricing';
    return `$${amount.toLocaleString()}`;
  };

  /**
   * Format property type display
   */
  const formatPropertyType = (type) => {
    if (!type) return 'Property';
    const typeMap = {
      'apartment': 'Apartment',
      'house': 'House',
      'condo': 'Condo',
      'townhouse': 'Townhouse',
      'studio': 'Studio',
      'room': 'Private Room',
      'shared_room': 'Shared Room',
      'recovery_residence': 'Recovery Residence',
      'sober_living': 'Sober Living Home',
      'halfway_house': 'Halfway House'
    };
    return typeMap[type] || type;
  };

  /**
   * Format lease term
   */
  const formatLeaseTerm = (term) => {
    if (!term) return 'Flexible';
    const termMap = {
      'month_to_month': 'Month-to-Month',
      '3_month': '3 Months',
      '6_month': '6 Months',
      '1_year': '1 Year',
      'flexible': 'Flexible'
    };
    return termMap[term] || term;
  };

  /**
   * Get property header gradient based on type
   */
  const getHeaderGradient = () => {
    if (property.is_recovery_housing) {
      return 'linear-gradient(135deg, #20B2AA 0%, #178B8B 100%)';
    }
    return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalBody}>
          {/* Property Header */}
          <div className={styles.propertyHeader} style={{ background: getHeaderGradient() }}>
            <div className={styles.propertyHeaderContent}>
              <div className={styles.propertyIcon}>
                {property.is_recovery_housing ? '🌱' : '🏠'}
              </div>
              <div className={styles.propertyHeaderInfo}>
                <h2 className={styles.propertyTitle}>
                  {property.property_name || property.street_address || 'Property Listing'}
                </h2>
                <div className={styles.propertyLocation}>
                  📍 {property.city}{property.state && `, ${property.state}`}
                  {property.zip_code && ` ${property.zip_code}`}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className={styles.badgeSection}>
            {connectionStatus && (
              <span className={`badge ${connectionStatus === 'confirmed' || connectionStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {connectionStatus}
              </span>
            )}
            {property.is_recovery_housing && (
              <span className="badge badge-success">🌱 Recovery Housing</span>
            )}
            {property.recovery_friendly && !property.is_recovery_housing && (
              <span className="badge badge-info">✨ Recovery Friendly</span>
            )}
            {property.utilities_included && (
              <span className="badge badge-info">💡 Utilities Included</span>
            )}
            {property.furnished && (
              <span className="badge badge-info">🛋️ Furnished</span>
            )}
            {property.pets_allowed && (
              <span className="badge badge-info">🐾 Pets Allowed</span>
            )}
          </div>

          {/* Key Information Grid */}
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Property Overview</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💰</span>
                <div>
                  <div className={styles.infoLabel}>Monthly Rent</div>
                  <div className={styles.infoValue}>
                    {formatCurrency(property.rent_amount || property.monthly_rent)}
                    {property.rent_amount && '/month'}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏢</span>
                <div>
                  <div className={styles.infoLabel}>Property Type</div>
                  <div className={styles.infoValue}>{formatPropertyType(property.property_type)}</div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🛏️</span>
                <div>
                  <div className={styles.infoLabel}>Bedrooms</div>
                  <div className={styles.infoValue}>
                    {property.bedrooms === 0 ? 'Studio' : property.bedrooms || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🚿</span>
                <div>
                  <div className={styles.infoLabel}>Bathrooms</div>
                  <div className={styles.infoValue}>{property.bathrooms || 'Not specified'}</div>
                </div>
              </div>

              {property.square_footage && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📐</span>
                  <div>
                    <div className={styles.infoLabel}>Square Footage</div>
                    <div className={styles.infoValue}>{property.square_footage.toLocaleString()} sq ft</div>
                  </div>
                </div>
              )}

              {property.lease_term && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📋</span>
                  <div>
                    <div className={styles.infoLabel}>Lease Term</div>
                    <div className={styles.infoValue}>{formatLeaseTerm(property.lease_term)}</div>
                  </div>
                </div>
              )}

              {property.available_date && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📅</span>
                  <div>
                    <div className={styles.infoLabel}>Available Date</div>
                    <div className={styles.infoValue}>
                      {new Date(property.available_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {property.deposit_amount && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🔒</span>
                  <div>
                    <div className={styles.infoLabel}>Security Deposit</div>
                    <div className={styles.infoValue}>{formatCurrency(property.deposit_amount)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Address */}
          {property.street_address && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📍 Location</h4>
              <div className={styles.addressBox}>
                <div className={styles.addressLine}>{property.street_address}</div>
                {property.unit_number && (
                  <div className={styles.addressLine}>Unit {property.unit_number}</div>
                )}
                <div className={styles.addressLine}>
                  {property.city}, {property.state} {property.zip_code}
                </div>
              </div>
            </div>
          )}

          {/* Recovery Housing Features */}
          {property.is_recovery_housing && (property.support_services || property.house_rules || property.recovery_stage_requirements) && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>🌱 Recovery Housing Details</h4>
              <div className={styles.detailsList}>
                {property.support_services && property.support_services.length > 0 && (
                  <div className={styles.detailItem}>
                    <strong>Support Services Available:</strong>
                    <div className={styles.tagList}>
                      {property.support_services.map((service, i) => (
                        <span key={i} className={styles.tag}>{service}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {property.recovery_stage_requirements && property.recovery_stage_requirements.length > 0 && (
                  <div className={styles.detailItem}>
                    <strong>Recovery Stage Requirements:</strong>
                    <div className={styles.tagList}>
                      {property.recovery_stage_requirements.map((stage, i) => (
                        <span key={i} className={styles.tag}>{stage}</span>
                      ))}
                    </div>
                  </div>
                )}

                {property.house_rules && property.house_rules.length > 0 && (
                  <div className={styles.detailItem}>
                    <strong>House Rules:</strong>
                    <ul className={styles.rulesList}>
                      {property.house_rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>✨ Amenities</h4>
              <div className={styles.tagList}>
                {property.amenities.map((amenity, i) => (
                  <span key={i} className={styles.tag}>{amenity}</span>
                ))}
              </div>
            </div>
          )}

          {/* Property Description */}
          {property.description && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📝 Property Description</h4>
              <p className={styles.bioText}>{property.description}</p>
            </div>
          )}

          {/* Additional Requirements */}
          {(property.income_requirement || property.credit_check_required || property.background_check_required) && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📋 Requirements</h4>
              <div className={styles.detailsList}>
                {property.income_requirement && (
                  <div className={styles.detailItem}>
                    <strong>Income Requirement:</strong> {property.income_requirement}
                  </div>
                )}
                {property.credit_check_required !== undefined && (
                  <div className={styles.detailItem}>
                    <strong>Credit Check:</strong> {property.credit_check_required ? 'Required' : 'Not Required'}
                  </div>
                )}
                {property.background_check_required !== undefined && (
                  <div className={styles.detailItem}>
                    <strong>Background Check:</strong> {property.background_check_required ? 'Required' : 'Not Required'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Landlord Contact Info - Only if connection is active */}
          {showContactInfo && property.landlord_profiles && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📞 Landlord Contact</h4>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>👤</span>
                  <div>
                    <div className={styles.contactLabel}>Name</div>
                    <div className={styles.contactValue}>
                      {property.landlord_profiles.registrant_profiles?.first_name || 'Property Owner'}
                      {property.landlord_profiles.registrant_profiles?.last_name && 
                        ` ${property.landlord_profiles.registrant_profiles.last_name.charAt(0)}.`
                      }
                    </div>
                  </div>
                </div>

                {property.landlord_profiles.primary_phone && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📱</span>
                    <div>
                      <div className={styles.contactLabel}>Phone</div>
                      <a href={`tel:${property.landlord_profiles.primary_phone}`} className={styles.contactValue}>
                        {property.landlord_profiles.primary_phone}
                      </a>
                    </div>
                  </div>
                )}

                {(property.landlord_profiles.contact_email || property.landlord_profiles.registrant_profiles?.email) && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📧</span>
                    <div>
                      <div className={styles.contactLabel}>Email</div>
                      <a 
                        href={`mailto:${property.landlord_profiles.contact_email || property.landlord_profiles.registrant_profiles?.email}`} 
                        className={styles.contactValue}
                      >
                        {property.landlord_profiles.contact_email || property.landlord_profiles.registrant_profiles?.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info Locked Message */}
          {!showContactInfo && (
            <div className={styles.contactInfoLocked}>
              <div className={styles.lockIcon}>🔒</div>
              <div className={styles.lockMessage}>
                <strong>Contact information available after connection is confirmed</strong>
                <p>Once approved, you'll be able to contact the landlord directly to discuss the property and application process.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.modalActions}>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
            
            {showContactInfo && onContact && (
              <button className="btn btn-primary" onClick={() => onContact(property)}>
                📞 Contact Landlord
              </button>
            )}
            
            {!showContactInfo && onConnect && connectionStatus !== 'active' && connectionStatus !== 'confirmed' && (
              <button className="btn btn-primary" onClick={() => onConnect(property)}>
                🤝 Request Connection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PropertyDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  property: PropTypes.shape({
    property_name: PropTypes.string,
    street_address: PropTypes.string,
    unit_number: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zip_code: PropTypes.string,
    property_type: PropTypes.string,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    square_footage: PropTypes.number,
    rent_amount: PropTypes.number,
    monthly_rent: PropTypes.number,
    deposit_amount: PropTypes.number,
    lease_term: PropTypes.string,
    available_date: PropTypes.string,
    description: PropTypes.string,
    amenities: PropTypes.array,
    is_recovery_housing: PropTypes.bool,
    recovery_friendly: PropTypes.bool,
    support_services: PropTypes.array,
    house_rules: PropTypes.array,
    recovery_stage_requirements: PropTypes.array,
    utilities_included: PropTypes.bool,
    furnished: PropTypes.bool,
    pets_allowed: PropTypes.bool,
    income_requirement: PropTypes.string,
    credit_check_required: PropTypes.bool,
    background_check_required: PropTypes.bool,
    landlord_profiles: PropTypes.object
  }),
  connectionStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onContact: PropTypes.func,
  onConnect: PropTypes.func,
  showContactInfo: PropTypes.bool
};

PropertyDetailsModal.defaultProps = {
  showContactInfo: false
};

export default PropertyDetailsModal;