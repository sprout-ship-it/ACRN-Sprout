// src/utils/database/authService.js - Authentication service module
/**
 * Authentication service for Recovery Housing Connect
 * Handles all authentication operations with proper error handling and logging
 */

/**
 * Create authentication service
 * @param {Object} supabaseClient - Initialized Supabase client
 * @returns {Object} Authentication service methods
 */
const createAuthService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for auth service');
  }

  const service = {
    /**
     * Sign up new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Object} userData - Additional user metadata
     * @returns {Promise<Object>} Authentication result
     */
// TEMPORARY DEBUG VERSION - Replace your authService.js signUp method with this
// This strips down the signup call to the absolute minimum to isolate the issue

signUp: async (email, password, userData = {}) => {
  console.log('🔑 Auth: signUp initiated for:', email);
  console.log('🔑 Auth: Original userData:', userData);
  
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // ✅ CRITICAL TEST: Try with NO user metadata first
    console.log('🔑 Auth: Attempting signup with NO metadata (debugging)');
    
    const signupOptions = {
      email: email.toLowerCase().trim(),
      password
      // NO OPTIONS AT ALL - completely minimal
    };

    console.log('🔑 Auth: Signup options:', signupOptions);

    const { data, error } = await supabaseClient.auth.signUp(signupOptions);

    if (error) {
      console.error('❌ Auth: signUp failed:', error.message, error);
      return { 
        success: false, 
        data: null, 
        error: service._formatAuthError(error) 
      };
    }

    console.log('✅ Auth: signUp successful', {
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      needsConfirmation: !data?.session,
      userId: data?.user?.id
    });

    return { 
      success: true, 
      data, 
      error: null,
      needsEmailConfirmation: !data?.session
    };

  } catch (err) {
    console.error('💥 Auth: signUp exception:', err);
    return { 
      success: false, 
      data: null, 
      error: { message: err.message, code: 'signup_exception' }
    };
  }
},
    /**
     * Sign in existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication result
     */
    signIn: async (email, password) => {
      console.log('🔑 Auth: signIn initiated for:', email);
      
      try {
        // Validate inputs
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        });

        if (error) {
          console.error('❌ Auth: signIn failed:', error.message);
          return { 
            success: false, 
            data: null, 
            error: service._formatAuthError(error)
          };
        }

        console.log('✅ Auth: signIn successful', {
          hasUser: !!data?.user,
          hasSession: !!data?.session,
          userId: data?.user?.id
        });

        return { 
          success: true, 
          data, 
          error: null 
        };

      } catch (err) {
        console.error('💥 Auth: signIn exception:', err);
        return { 
          success: false, 
          data: null, 
          error: { message: err.message, code: 'signin_exception' }
        };
      }
    },

    /**
     * Sign out current user
     * @returns {Promise<Object>} Sign out result
     */
    signOut: async () => {
      console.log('🔑 Auth: signOut initiated');
      
      try {
        // Use a timeout to prevent hanging
        const signOutPromise = supabaseClient.auth.signOut();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign out timed out')), 5000)
        );

        const { error } = await Promise.race([signOutPromise, timeoutPromise]);

        if (error) {
          console.warn('⚠️ Auth: signOut error (but will clear local state):', error.message);
        }

        // Always consider sign out successful since we want to clear local state
        console.log('✅ Auth: signOut completed (local state cleared)');
        return { 
          success: true, 
          error: null 
        };

      } catch (err) {
        console.warn('⚠️ Auth: signOut exception (but will clear local state):', err.message);
        
        // Even on error, we want to clear local state
        return { 
          success: true, 
          error: null,
          warning: 'Sign out may have failed on server, but local session cleared'
        };
      }
    },

    /**
     * Get current session
     * @returns {Promise<Object>} Current session
     */
    getSession: async () => {
      console.log('🔑 Auth: getSession called');
      
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('❌ Auth: getSession failed:', error.message);
          return { 
            success: false, 
            session: null, 
            error: service._formatAuthError(error)
          };
        }

        console.log('✅ Auth: getSession result', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          expiresAt: session?.expires_at
        });

        return { 
          success: true, 
          session, 
          error: null 
        };

      } catch (err) {
        console.error('💥 Auth: getSession exception:', err);
        return { 
          success: false, 
          session: null, 
          error: { message: err.message, code: 'session_exception' }
        };
      }
    },

    /**
     * Get current user
     * @returns {Promise<Object>} Current user
     */
    getUser: async () => {
      console.log('🔑 Auth: getUser called');
      
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error) {
          console.error('❌ Auth: getUser failed:', error.message);
          return { 
            success: false, 
            user: null, 
            error: service._formatAuthError(error)
          };
        }

        console.log('✅ Auth: getUser result', {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email
        });

        return { 
          success: true, 
          user, 
          error: null 
        };

      } catch (err) {
        console.error('💥 Auth: getUser exception:', err);
        return { 
          success: false, 
          user: null, 
          error: { message: err.message, code: 'user_exception' }
        };
      }
    },

    /**
     * Listen to authentication state changes
     * @param {Function} callback - Callback function for auth changes
     * @returns {Object} Subscription object
     */
    onAuthStateChange: (callback) => {
      console.log('🔑 Auth: onAuthStateChange listener registered');
      
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }

      try {
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
          (event, session) => {
            console.log('🔑 Auth: State changed -', event, {
              hasSession: !!session,
              hasUser: !!session?.user
            });
            
            callback(event, session);
          }
        );

        return subscription;

      } catch (err) {
        console.error('💥 Auth: onAuthStateChange setup failed:', err);
        throw err;
      }
    },

    /**
     * Update user metadata
     * @param {Object} updates - User metadata updates
     * @returns {Promise<Object>} Update result
     */
    updateUser: async (updates) => {
      console.log('🔑 Auth: updateUser called');
      
      try {
        if (!updates || typeof updates !== 'object') {
          throw new Error('Updates object is required');
        }

        const { data, error } = await supabaseClient.auth.updateUser(updates);

        if (error) {
          console.error('❌ Auth: updateUser failed:', error.message);
          return { 
            success: false, 
            data: null, 
            error: service._formatAuthError(error)
          };
        }

        console.log('✅ Auth: updateUser successful');
        return { 
          success: true, 
          data, 
          error: null 
        };

      } catch (err) {
        console.error('💥 Auth: updateUser exception:', err);
        return { 
          success: false, 
          data: null, 
          error: { message: err.message, code: 'update_user_exception' }
        };
      }
    },

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset result
     */
    resetPassword: async (email) => {
      console.log('🔑 Auth: resetPassword initiated for:', email);
      
      try {
        if (!email) {
          throw new Error('Email is required');
        }

        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
          email.toLowerCase().trim()
        );

        if (error) {
          console.error('❌ Auth: resetPassword failed:', error.message);
          return { 
            success: false, 
            data: null, 
            error: service._formatAuthError(error)
          };
        }

        console.log('✅ Auth: resetPassword email sent');
        return { 
          success: true, 
          data, 
          error: null 
        };

      } catch (err) {
        console.error('💥 Auth: resetPassword exception:', err);
        return { 
          success: false, 
          data: null, 
          error: { message: err.message, code: 'reset_password_exception' }
        };
      }
    },

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>} Authentication status
     */
    isAuthenticated: async () => {
      try {
        const { session } = await service.getSession();
        return !!session?.user && !service._isSessionExpired(session);
      } catch (err) {
        console.warn('⚠️ Auth: isAuthenticated check failed:', err);
        return false;
      }
    },

    /**
     * Get authentication status summary
     * @returns {Promise<Object>} Auth status
     */
    getAuthStatus: async () => {
      try {
        const sessionResult = await service.getSession();
        const session = sessionResult.session;
        
        return {
          isAuthenticated: !!session?.user,
          user: session?.user || null,
          sessionExpired: session ? service._isSessionExpired(session) : false,
          expiresAt: session?.expires_at || null,
          lastCheck: new Date().toISOString()
        };
        
      } catch (err) {
        console.error('💥 Auth: getAuthStatus failed:', err);
        return {
          isAuthenticated: false,
          user: null,
          sessionExpired: true,
          error: err.message,
          lastCheck: new Date().toISOString()
        };
      }
    },

    // Private helper methods
    
    /**
     * Format authentication errors for consistent handling
     * @private
     */
    _formatAuthError: (error) => {
      const errorMap = {
        'Invalid login credentials': { message: 'Invalid email or password', code: 'invalid_credentials' },
        'Email not confirmed': { message: 'Please check your email and click the confirmation link', code: 'email_unconfirmed' },
        'Password should be at least 6 characters': { message: 'Password must be at least 6 characters long', code: 'weak_password' },
        'User already registered': { message: 'An account with this email already exists', code: 'user_exists' },
        'Invalid email': { message: 'Please enter a valid email address', code: 'invalid_email' }
      };

      const mapped = errorMap[error.message];
      if (mapped) {
        return mapped;
      }

      return {
        message: error.message || 'Authentication error occurred',
        code: error.code || 'auth_error'
      };
    },

    /**
     * Check if session is expired
     * @private
     */
    _isSessionExpired: (session) => {
      if (!session?.expires_at) return false;
      
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const bufferMinutes = 5; // Consider expired 5 minutes before actual expiry
      
      return (expiresAt.getTime() - now.getTime()) < (bufferMinutes * 60 * 1000);
    }
  };

  return service;
};

export default createAuthService;