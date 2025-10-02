-- src/schema/functions/utility_functions.sql
-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================
-- General utility functions used across multiple tables and systems
-- Dependencies: None - these are standalone utility functions
-- ============================================================================

-- ============================================================================
-- TIMESTAMP UPDATE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;