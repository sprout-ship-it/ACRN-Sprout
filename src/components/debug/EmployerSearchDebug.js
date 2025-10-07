// src/components/debug/EmployerSearchDebug.js
// Temporary debug component to help troubleshoot employer search issues
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, debugInfo } from '../../utils/supabase';

const EmployerSearchDebug = () => {
  const { user, profile } = useAuth();
  const [debugResults, setDebugResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check service availability
      results.serviceAvailability = {
        dbExists: !!db,
        employerProfilesExists: !!db?.employerProfiles,
        employerFavoritesExists: !!db?.employerProfiles?.favorites,
        matchRequestsExists: !!db?.matchRequests,
        matchRequestsGetByUserIdExists: typeof db?.matchRequests?.getByUserId === 'function'
      };

      // Test 2: Check current user/profile info
      results.userInfo = {
        userId: user?.id,
        profileId: profile?.id,
        profileRoles: profile?.roles,
        profileCity: profile?.city,
        profileState: profile?.state
      };

      // Test 3: Check debug info
      results.debugInfo = debugInfo;

      // Test 4: Test match requests call (the one that was failing)
      if (db?.matchRequests?.getByUserId && profile?.id) {
        try {
          console.log('🔍 Testing match requests call with correct parameters...');
          const matchRequestsResult = await db.matchRequests.getByUserId('applicant', profile.id);
          results.matchRequestsTest = {
            success: true,
            data: matchRequestsResult,
            dataLength: Array.isArray(matchRequestsResult.data) ? matchRequestsResult.data.length : 0
          };
        } catch (err) {
          results.matchRequestsTest = {
            success: false,
            error: err.message,
            stack: err.stack
          };
        }
      } else {
        results.matchRequestsTest = {
          success: false,
          error: 'Service not available or no profile ID'
        };
      }

      // Test 5: Test employer profiles service
      if (db?.employerProfiles?.getAvailable) {
        try {
          console.log('🔍 Testing employer profiles service...');
          const employersResult = await db.employerProfiles.getAvailable({ isActivelyHiring: true });
          results.employerProfilesTest = {
            success: true,
            data: employersResult,
            dataLength: Array.isArray(employersResult.data) ? employersResult.data.length : 0
          };
        } catch (err) {
          results.employerProfilesTest = {
            success: false,
            error: err.message,
            stack: err.stack
          };
        }
      } else {
        results.employerProfilesTest = {
          success: false,
          error: 'Employer profiles service not available'
        };
      }

      // Test 6: Test employer favorites service
      if (db?.employerProfiles?.favorites?.getByUserId && profile?.id) {
        try {
          console.log('🔍 Testing employer favorites service...');
          const favoritesResult = await db.employerProfiles.favorites.getByUserId(profile.id);
          results.favoritesTest = {
            success: true,
            data: favoritesResult,
            dataLength: Array.isArray(favoritesResult.data) ? favoritesResult.data.length : 0
          };
        } catch (err) {
          results.favoritesTest = {
            success: false,
            error: err.message,
            stack: err.stack
          };
        }
      } else {
        results.favoritesTest = {
          success: false,
          error: 'Favorites service not available or no profile ID'
        };
      }

      console.log('🔍 Debug results:', results);
      setDebugResults(results);

    } catch (err) {
      console.error('💥 Debug test failed:', err);
      setDebugResults({
        error: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(debugResults, null, 2));
    alert('Debug results copied to clipboard!');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      background: 'white', 
      border: '2px solid #red', 
      padding: '20px', 
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>🔧 Employer Search Debug</h3>
      
      <button 
        onClick={runDebugTests}
        disabled={loading}
        style={{
          background: '#3498db',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Debug Tests'}
      </button>

      {Object.keys(debugResults).length > 0 && (
        <>
          <button 
            onClick={copyToClipboard}
            style={{
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '10px',
              marginBottom: '15px'
            }}
          >
            📋 Copy Results
          </button>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              margin: 0,
              fontSize: '11px'
            }}>
              {JSON.stringify(debugResults, null, 2)}
            </pre>
          </div>
        </>
      )}

      <div style={{ marginTop: '15px', fontSize: '10px', color: '#666' }}>
        <strong>Instructions:</strong>
        <br />1. Click "Run Debug Tests"
        <br />2. Copy results and share with developer
        <br />3. Remove this component when fixed
      </div>
    </div>
  );
};

export default EmployerSearchDebug;