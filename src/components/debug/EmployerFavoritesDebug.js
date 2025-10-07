// src/components/debug/EmployerFavoritesDebug.js - TEST FAVORITES FUNCTIONALITY
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';

const EmployerFavoritesDebug = () => {
  const { user, profile } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test employer favorites functionality
  const runFavoritesTest = async () => {
    if (!profile?.id) {
      setTestResults({ error: 'No profile found. Please login first.' });
      return;
    }

    setLoading(true);
    setTestResults(null);

    try {
      const results = {
        timestamp: new Date().toISOString(),
        user_info: {
          auth_user_id: user?.id,
          registrant_profile_id: profile?.id,
          profile_roles: profile?.roles
        },
        tests: {}
      };

      console.log('🧪 Starting employer favorites tests...');

      // Test 1: Check if favorites service exists
      console.log('📋 Test 1: Service availability...');
      if (!db?.employerProfiles?.favorites) {
        results.tests.service_availability = {
          success: false,
          error: 'db.employerProfiles.favorites not available'
        };
        setTestResults(results);
        return;
      }

      results.tests.service_availability = {
        success: true,
        message: 'Favorites service is available'
      };

      // Test 2: Test database connection
      console.log('📋 Test 2: Database connection...');
      const connectionTest = await db.employerProfiles.favorites.testConnection();
      results.tests.database_connection = connectionTest;

      // Test 3: Get current favorites
      console.log('📋 Test 3: Get current favorites...');
      const currentFavorites = await db.employerProfiles.favorites.getByUserId(profile.id);
      results.tests.get_favorites = {
        success: currentFavorites.success,
        data: currentFavorites.data,
        error: currentFavorites.error,
        count: currentFavorites.data?.length || 0
      };

      // Test 4: Get available employers to test with
      console.log('📋 Test 4: Get test employer...');
      const employersResult = await db.employerProfiles.getAvailable({ limit: 1 });
      
      if (employersResult.success && employersResult.data?.length > 0) {
        const testEmployer = employersResult.data[0];
        results.test_employer = {
          id: testEmployer.id,
          user_id: testEmployer.user_id,
          company_name: testEmployer.company_name
        };

        // Test 5: Check if employer is favorited
        console.log('📋 Test 5: Check favorite status...');
        const isFavorited = await db.employerProfiles.favorites.isFavorited(
          profile.id, 
          testEmployer.user_id
        );
        results.tests.check_favorite_status = isFavorited;

        // Test 6: Add to favorites (if not already favorited)
        if (isFavorited.success && !isFavorited.data) {
          console.log('📋 Test 6: Add to favorites...');
          const addResult = await db.employerProfiles.favorites.add(
            profile.id,
            testEmployer.user_id
          );
          results.tests.add_favorite = addResult;

          // Test 7: Verify it was added
          if (addResult.success) {
            console.log('📋 Test 7: Verify addition...');
            const verifyResult = await db.employerProfiles.favorites.isFavorited(
              profile.id,
              testEmployer.user_id
            );
            results.tests.verify_addition = verifyResult;
          }
        } else if (isFavorited.success && isFavorited.data) {
          results.tests.add_favorite = {
            success: false,
            message: 'Employer already favorited - skipping add test',
            skip: true
          };
        }

      } else {
        results.tests.get_test_employer = {
          success: false,
          error: 'No employers available for testing',
          employers_result: employersResult
        };
      }

      // Test 8: Get favorites count
      console.log('📋 Test 8: Get favorites count...');
      const countResult = await db.employerProfiles.favorites.getCount(profile.id);
      results.tests.get_count = countResult;

      console.log('✅ All tests completed:', results);
      setTestResults(results);

    } catch (err) {
      console.error('💥 Test suite failed:', err);
      setTestResults({
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Test individual favorite toggle
  const testFavoriteToggle = async (employerUserId, companyName) => {
    if (!profile?.id) return;

    try {
      console.log(`🔄 Testing favorite toggle for ${companyName}...`);
      
      const result = await db.employerProfiles.favorites.toggle(
        profile.id,
        employerUserId
      );

      console.log('Toggle result:', result);
      
      // Refresh the full test to see updated state
      await runFavoritesTest();

    } catch (err) {
      console.error('💥 Toggle test failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ margin: '20px 0' }}>
        <div className="card-header">
          <h3>🧪 Employer Favorites Debug</h3>
        </div>
        <div className="card-body">
          <p>Please log in to test employer favorites functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ margin: '20px 0' }}>
      <div className="card-header">
        <h3>🧪 Employer Favorites Debug</h3>
        <button 
          className="btn btn-primary btn-sm"
          onClick={runFavoritesTest}
          disabled={loading}
        >
          {loading ? 'Running Tests...' : 'Run Favorites Tests'}
        </button>
      </div>

      <div className="card-body">
        {loading && (
          <div className="alert alert-info">
            <strong>Running tests...</strong> This may take a few seconds.
          </div>
        )}

        {testResults && (
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            <h4>Test Results:</h4>
            
            {testResults.error ? (
              <div className="alert alert-danger">
                <strong>Test Suite Failed:</strong>
                <pre>{testResults.error}</pre>
              </div>
            ) : (
              <>
                {/* User Info */}
                <div className="alert alert-info">
                  <strong>User Info:</strong>
                  <pre>{JSON.stringify(testResults.user_info, null, 2)}</pre>
                </div>

                {/* Test Results */}
                {Object.entries(testResults.tests).map(([testName, result]) => (
                  <div key={testName} className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                    <strong>{testName.replace(/_/g, ' ').toUpperCase()}:</strong>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                ))}

                {/* Test Employer Info */}
                {testResults.test_employer && (
                  <div className="alert alert-warning">
                    <strong>TEST EMPLOYER:</strong>
                    <pre>{JSON.stringify(testResults.test_employer, null, 2)}</pre>
                    <button 
                      className="btn btn-sm btn-outline mt-2"
                      onClick={() => testFavoriteToggle(
                        testResults.test_employer.user_id, 
                        testResults.test_employer.company_name
                      )}
                    >
                      Toggle Favorite for {testResults.test_employer.company_name}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!testResults && !loading && (
          <div className="alert alert-info">
            <p><strong>Debug Information:</strong></p>
            <ul>
              <li>Current User ID: <code>{user?.id}</code></li>
              <li>Profile ID: <code>{profile?.id}</code></li>
              <li>Profile Roles: <code>{profile?.roles?.join(', ')}</code></li>
              <li>Service Available: <code>{db?.employerProfiles?.favorites ? 'YES' : 'NO'}</code></li>
            </ul>
            <p>Click "Run Favorites Tests" to test the employer favorites functionality.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerFavoritesDebug;