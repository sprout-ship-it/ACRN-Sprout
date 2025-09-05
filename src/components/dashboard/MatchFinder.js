import React, { useState, useEffect } from 'react';
import '../../styles/global.css';

// ==================== MOCK DATA AND MATCHING ALGORITHM ====================

// Mock applicant data for demonstration
const mockApplicants = [
  {
    id: 1,
    firstName: 'Sarah',
    age: 28,
    location: 'Austin, TX',
    recoveryStage: 'stable',
    programType: ['AA', 'Outpatient therapy'],
    interests: ['Fitness/Exercise', 'Cooking', 'Reading'],
    housingType: ['Apartment', 'House'],
    priceRange: { min: 800, max: 1500 },
    sobrietyDate: '2023-01-15',
    aboutMe: 'I\'m a graphic designer who loves yoga and cooking healthy meals. I value honest communication and mutual respect.',
    lookingFor: 'Someone who shares similar recovery values and enjoys a peaceful, supportive living environment.',
    genderPreference: 'female',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'very-clean',
    isActive: true
  },
  {
    id: 2,
    firstName: 'Mike',
    age: 32,
    location: 'Austin, TX',
    recoveryStage: 'maintained',
    programType: ['NA', 'SMART Recovery'],
    interests: ['Outdoor activities', 'Music', 'Volunteering'],
    housingType: ['House', 'Townhouse'],
    priceRange: { min: 1000, max: 2000 },
    sobrietyDate: '2021-08-20',
    aboutMe: 'Musician and outdoor enthusiast. I work from home and enjoy a quiet, organized living space.',
    lookingFor: 'A responsible roommate who respects boundaries and shares recovery goals.',
    genderPreference: 'any',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'clean',
    isActive: true
  },
  {
    id: 3,
    firstName: 'Emma',
    age: 25,
    location: 'Austin, TX',
    recoveryStage: 'early',
    programType: ['AA', 'Celebrate Recovery'],
    interests: ['Art/Crafts', 'Movies/TV', 'Pets/Animals'],
    housingType: ['Apartment', 'Room in house'],
    priceRange: { min: 600, max: 1200 },
    sobrietyDate: '2024-06-01',
    aboutMe: 'Art student and dog lover. I\'m new to recovery but very committed to my sobriety.',
    lookingFor: 'Someone understanding and supportive who can help me stay on track.',
    genderPreference: 'female',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'moderate',
    isActive: true
  },
  {
    id: 4,
    firstName: 'David',
    age: 35,
    location: 'Austin, TX',
    recoveryStage: 'long-term',
    programType: ['AA', 'Peer support groups'],
    interests: ['Fitness/Exercise', 'Technology', 'Learning/Education'],
    housingType: ['Condo', 'House'],
    priceRange: { min: 1200, max: 2500 },
    sobrietyDate: '2018-03-10',
    aboutMe: 'Software engineer with 6+ years of sobriety. I mentor others in recovery.',
    lookingFor: 'A mature roommate who values structure and personal growth.',
    genderPreference: 'any',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'very-clean',
    isActive: true
  },
  {
    id: 5,
    firstName: 'Jessica',
    age: 29,
    location: 'Austin, TX',
    recoveryStage: 'stable',
    programType: ['NA', 'Meditation/Spirituality'],
    interests: ['Meditation/Spirituality', 'Cooking', 'Travel'],
    housingType: ['Apartment', 'Condo'],
    priceRange: { min: 900, max: 1800 },
    sobrietyDate: '2022-11-12',
    aboutMe: 'Yoga instructor focused on mindful living and spiritual growth.',
    lookingFor: 'Someone who appreciates mindfulness and supports each other\'s recovery journey.',
    genderPreference: 'female',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'very-clean',
    isActive: true
  },
  {
    id: 6,
    firstName: 'Alex',
    age: 27,
    location: 'Austin, TX',
    recoveryStage: 'maintained',
    programType: ['SMART Recovery', 'Secular recovery'],
    interests: ['Gaming', 'Technology', 'Sports'],
    housingType: ['Apartment', 'Room in house'],
    priceRange: { min: 700, max: 1400 },
    sobrietyDate: '2021-05-30',
    aboutMe: 'Tech worker who enjoys gaming and sports. I\'m introverted but friendly.',
    lookingFor: 'A respectful roommate who gives me space but is available for support when needed.',
    genderPreference: 'any',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'moderate',
    isActive: true
  }
];

// Matching algorithm
const calculateMatchScore = (user, candidate) => {
  let score = 0;
  let maxScore = 0;
  
  // Recovery stage compatibility (25 points)
  maxScore += 25;
  const recoveryStages = ['early', 'stable', 'maintained', 'long-term'];
  const userStageIndex = recoveryStages.indexOf(user.recoveryStage);
  const candidateStageIndex = recoveryStages.indexOf(candidate.recoveryStage);
  const stageDiff = Math.abs(userStageIndex - candidateStageIndex);
  if (stageDiff === 0) score += 25;
  else if (stageDiff === 1) score += 20;
  else if (stageDiff === 2) score += 10;
  
  // Program type overlap (20 points)
  maxScore += 20;
  const programOverlap = user.programType.filter(p => candidate.programType.includes(p)).length;
  score += Math.min(20, programOverlap * 7);
  
  // Interest overlap (15 points)
  maxScore += 15;
  const interestOverlap = user.interests.filter(i => candidate.interests.includes(i)).length;
  score += Math.min(15, interestOverlap * 3);
  
  // Housing type compatibility (10 points)
  maxScore += 10;
  const housingOverlap = user.housingType.filter(h => candidate.housingType.includes(h)).length;
  if (housingOverlap > 0) score += 10;
  
  // Price range compatibility (10 points)
  maxScore += 10;
  const priceOverlap = Math.max(0, Math.min(user.priceRange.max, candidate.priceRange.max) - 
                               Math.max(user.priceRange.min, candidate.priceRange.min));
  if (priceOverlap > 0) score += 10;
  
  // Gender preference (10 points)
  maxScore += 10;
  if (user.genderPreference === 'any' || candidate.genderPreference === 'any' || 
      user.genderPreference === candidate.gender) score += 10;
  
  // Lifestyle compatibility (10 points)
  maxScore += 10;
  if (user.smokingPreference === candidate.smokingPreference) score += 5;
  if (user.cleanlinessLevel === candidate.cleanlinessLevel) score += 5;
  
  return Math.round((score / maxScore) * 100);
};

// Generate compatibility flags
const generateCompatibilityFlags = (user, candidate, score) => {
  const greenFlags = [];
  const redFlags = [];
  
  // Program overlap
  const programOverlap = user.programType.filter(p => candidate.programType.includes(p));
  if (programOverlap.length > 0) {
    greenFlags.push(`Shared programs: ${programOverlap.join(', ')}`);
  }
  
  // Interest overlap
  const interestOverlap = user.interests.filter(i => candidate.interests.includes(i));
  if (interestOverlap.length >= 2) {
    greenFlags.push(`Common interests: ${interestOverlap.slice(0, 2).join(', ')}`);
  }
  
  // Recovery stage
  if (user.recoveryStage === candidate.recoveryStage) {
    greenFlags.push('Similar recovery stage');
  }
  
  // Lifestyle
  if (user.smokingPreference === candidate.smokingPreference && user.smokingPreference === 'non-smoking') {
    greenFlags.push('Both non-smoking');
  }
  
  if (user.cleanlinessLevel === candidate.cleanlinessLevel) {
    greenFlags.push('Compatible cleanliness standards');
  }
  
  // Red flags
  if (score < 60) {
    redFlags.push('Lower overall compatibility');
  }
  
  if (user.priceRange.max < candidate.priceRange.min || candidate.priceRange.max < user.priceRange.min) {
    redFlags.push('Price range mismatch');
  }
  
  const recoveryStages = ['early', 'stable', 'maintained', 'long-term'];
  const userStageIndex = recoveryStages.indexOf(user.recoveryStage);
  const candidateStageIndex = recoveryStages.indexOf(candidate.recoveryStage);
  if (Math.abs(userStageIndex - candidateStageIndex) > 2) {
    redFlags.push('Very different recovery stages');
  }
  
  return { greenFlags, redFlags };
};

// ==================== MATCH FINDER COMPONENT ====================

const MatchFinder = ({ user, onRequestMatch, onBack }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    recoveryStage: '',
    ageRange: '',
    location: ''
  });
  
  // Mock user profile for demonstration
  const mockUserProfile = {
    recoveryStage: 'stable',
    programType: ['AA', 'Outpatient therapy'],
    interests: ['Fitness/Exercise', 'Cooking', 'Reading'],
    housingType: ['Apartment', 'House'],
    priceRange: { min: 800, max: 1600 },
    genderPreference: 'any',
    smokingPreference: 'non-smoking',
    cleanlinessLevel: 'clean'
  };
  
  // Find matches function
  const findMatches = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filter active applicants (exclude self)
      let candidates = mockApplicants.filter(applicant => 
        applicant.isActive && applicant.id !== user?.id
      );
      
      // Apply filters
      if (filters.recoveryStage) {
        candidates = candidates.filter(c => c.recoveryStage === filters.recoveryStage);
      }
      
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
        candidates = candidates.filter(c => c.age >= minAge && c.age <= maxAge);
      }
      
      // Calculate match scores
      const matchesWithScores = candidates.map(candidate => {
        const score = calculateMatchScore(mockUserProfile, candidate);
        const flags = generateCompatibilityFlags(mockUserProfile, candidate, score);
        
        return {
          ...candidate,
          matchScore: score,
          ...flags
        };
      });
      
      // Sort by score and take top 6
      const topMatches = matchesWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);
      
      setMatches(topMatches);
      
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load matches on component mount
  useEffect(() => {
    findMatches();
  }, []);
  
  // Handle show details
  const handleShowDetails = (match) => {
    setSelectedMatch(match);
    setShowDetails(true);
  };
  
  // Handle request match
  const handleRequestMatch = (match) => {
    if (onRequestMatch) {
      onRequestMatch(match);
    }
    alert(`Match request sent to ${match.firstName}!`);
  };
  
  return (
    <>
      <div className="content">
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Your Perfect Roommate Match</h1>
          <p className="welcome-text">
            Discover compatible roommates based on recovery goals, lifestyle preferences, and personal compatibility
          </p>
        </div>
        
        {/* Search Controls */}
        <div className="card mb-5">
          <div className="grid-auto">
            <div className="form-group">
              <label className="label">Recovery Stage</label>
              <select
                className="input"
                value={filters.recoveryStage}
                onChange={(e) => setFilters(prev => ({ ...prev, recoveryStage: e.target.value }))}
              >
                <option value="">Any stage</option>
                <option value="early">Early recovery</option>
                <option value="stable">Stable recovery</option>
                <option value="maintained">Maintained recovery</option>
                <option value="long-term">Long-term recovery</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Age Range</label>
              <select
                className="input"
                value={filters.ageRange}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
              >
                <option value="">Any age</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-65">46+</option>
              </select>
            </div>
            
            <div className="form-group">
              <button
                className="btn btn-primary"
                onClick={findMatches}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Update Matches'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="empty-state">
            <div className="loading-spinner large"></div>
            <p>Finding your perfect matches...</p>
          </div>
        )}
        
        {/* No Matches State */}
        {!loading && matches.length === 0 && (
          <div className="card text-center">
            <h3>No matches found</h3>
            <p>Try adjusting your filters or check back later for new applicants.</p>
          </div>
        )}
        
        {/* Matches Grid */}
        {!loading && matches.length > 0 && (
          <div className="grid-auto mb-5">
            {matches.map((match, index) => (
              <div key={match.id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{match.firstName}</div>
                    <div className="card-subtitle">{match.matchScore}% Match</div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <div className="grid-2 text-gray-600">
                      <div><span className="text-gray-600">Age:</span> <span className="text-gray-800">{match.age}</span></div>
                      <div><span className="text-gray-600">Location:</span> <span className="text-gray-800">{match.location}</span></div>
                      <div><span className="text-gray-600">Recovery Stage:</span> <span className="text-gray-800">{match.recoveryStage.charAt(0).toUpperCase() + match.recoveryStage.slice(1)}</span></div>
                      <div><span className="text-gray-600">Price Range:</span> <span className="text-gray-800">${match.priceRange.min} - ${match.priceRange.max}</span></div>
                    </div>
                  </div>
                  
                  {/* Green Flags */}
                  {match.greenFlags.length > 0 && (
                    <div className="mb-4">
                      <div className="label mb-2">✓ Compatibility Highlights</div>
                      <div className="mb-2">
                        {match.greenFlags.map((flag, i) => (
                          <span key={i} className="badge badge-success mr-1 mb-1">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Red Flags */}
                  {match.redFlags.length > 0 && (
                    <div className="mb-4">
                      <div className="label mb-2">⚠ Potential Concerns</div>
                      <div className="mb-2">
                        {match.redFlags.map((flag, i) => (
                          <span key={i} className="badge badge-warning mr-1 mb-1">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid-2">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleShowDetails(match)}
                    >
                      Show Details
                    </button>
                    
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleRequestMatch(match)}
                    >
                      Request Match
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Back Button */}
        {onBack && (
          <div className="text-center">
            <button
              className="btn btn-outline"
              onClick={onBack}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
      
      {/* Match Details Modal */}
      {showDetails && selectedMatch && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedMatch.firstName} - {selectedMatch.matchScore}% Match
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="card-title">About {selectedMatch.firstName}</h4>
              <p className="card-text">{selectedMatch.aboutMe}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="card-title">What they're looking for</h4>
              <p className="card-text">{selectedMatch.lookingFor}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="card-title">Recovery Programs</h4>
              <div className="mb-2">
                {selectedMatch.programType.map((program, i) => (
                  <span key={i} className="badge badge-success mr-1 mb-1">{program}</span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="card-title">Interests</h4>
              <div className="mb-2">
                {selectedMatch.interests.map((interest, i) => (
                  <span key={i} className="badge badge-info mr-1 mb-1">{interest}</span>
                ))}
              </div>
            </div>
            
            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => {
                  handleRequestMatch(selectedMatch);
                  setShowDetails(false);
                }}
              >
                Send Match Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchFinder;