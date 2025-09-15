// src/components/property/sections/PropertyRecoverySection.js
import React from 'react';
import PropTypes from 'prop-types';
import { 
  requiredRecoveryPrograms,
  houseRulesOptions
} from '../../forms/constants/propertyConstants';

const PropertyRecoverySection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Recovery Requirements & House Rules</h3>
      
      {/* Recovery Program Requirements */}
      <div className="form-group mb-4">
        <label className="label">
          Required Recovery Programs
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all recovery programs that residents must participate in or maintain.
        </div>
        <div className="checkbox-columns">
          {requiredRecoveryPrograms.map(program => (
            <label key={program.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.required_programs?.includes(program.value) || false}
                onChange={(e) => onArrayChange('required_programs', program.value, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{program.label}</span>
            </label>
          ))}
        </div>
        {errors.required_programs && (
          <div className="text-red-500 mt-1">{errors.required_programs}</div>
        )}
      </div>

      {/* Recovery Stage Requirements */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Minimum Sobriety Time Required</label>
          <select
            className="input"
            name="min_sobriety_time"
            value={formData.min_sobriety_time || ''}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="">No minimum required</option>
            <option value="0_days">Accept residents at any stage</option>
            <option value="30_days">30 days sober</option>
            <option value="60_days">60 days sober</option>
            <option value="90_days">90 days sober</option>
            <option value="6_months">6 months sober</option>
            <option value="1_year">1 year sober</option>
            <option value="2_years">2+ years sober</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Minimum time of continuous sobriety required
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Treatment Program Completion</label>
          <select
            className="input"
            name="treatment_completion_required"
            value={formData.treatment_completion_required || ''}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="">No specific requirement</option>
            <option value="none_required">No treatment completion required</option>
            <option value="detox_completed">Detox completion required</option>
            <option value="inpatient_completed">Inpatient treatment completion required</option>
            <option value="outpatient_completed">Outpatient treatment completion required</option>
            <option value="currently_in_treatment">Must be currently in treatment</option>
            <option value="flexible">Flexible based on individual circumstances</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Treatment program requirements for admission
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="form-group mb-4">
        <label className="label">
          House Rules & Requirements
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all rules and requirements that apply to your property.
        </div>
        <div className="checkbox-columns">
          {houseRulesOptions.map(rule => (
            <label key={rule} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.house_rules?.includes(rule) || false}
                onChange={(e) => onArrayChange('house_rules', rule, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{rule}</span>
            </label>
          ))}
        </div>
        {errors.house_rules && (
          <div className="text-red-500 mt-1">{errors.house_rules}</div>
        )}
      </div>

      {/* Additional House Rules */}
      <div className="form-group mb-4">
        <label className="label">Additional House Rules</label>
        <textarea
          className="input"
          name="additional_house_rules"
          value={formData.additional_house_rules || ''}
          onChange={onInputChange}
          placeholder="Describe any additional house rules, expectations, or requirements not covered above..."
          style={{ minHeight: '80px', resize: 'vertical' }}
          disabled={loading}
          maxLength="500"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.additional_house_rules?.length || 0)}/500 characters
        </div>
      </div>

      {/* Resident Restrictions */}
      <h4 className="card-subtitle mb-3">Resident Restrictions & Preferences</h4>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Gender Restrictions</label>
          <select
            className="input"
            name="gender_restrictions"
            value={formData.gender_restrictions || 'any'}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="any">Any Gender Welcome</option>
            <option value="male_only">Male Only</option>
            <option value="female_only">Female Only</option>
            <option value="lgbtq_friendly">LGBTQ+ Friendly</option>
            <option value="non_binary_friendly">Non-Binary Friendly</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="label">Age Restrictions</label>
          <input
            className="input"
            type="text"
            name="age_restrictions"
            value={formData.age_restrictions || ''}
            onChange={onInputChange}
            placeholder="e.g., '18+', '25-55', 'Adults Only'"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Age range or requirements for residents
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
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
          <div className="text-gray-500 mt-1 text-sm">
            Residents can have pets (specify restrictions in additional rules)
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="smoking_allowed"
              checked={formData.smoking_allowed || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Smoking Allowed (Designated Areas)</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Smoking permitted in designated outdoor areas only
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="criminal_background_ok"
              checked={formData.criminal_background_ok || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Accept Criminal Background</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Will consider applicants with criminal history
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="sex_offender_restrictions"
              checked={formData.sex_offender_restrictions || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Sex Offender Restrictions Apply</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Cannot accept registered sex offenders
          </div>
        </div>
      </div>
    </>
  );
};

PropertyRecoverySection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default PropertyRecoverySection;