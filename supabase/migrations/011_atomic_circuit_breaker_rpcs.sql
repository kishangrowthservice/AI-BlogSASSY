-- =====================================================================
-- Migration 011: Atomic Circuit Breaker State RPCs
-- SYSTEM_DESIGN.md §7 Circuit Breaker & PHASE3.md Task 1
--
-- Replaces non-atomic SELECT-then-UPDATE with atomic PostgreSQL functions
-- to prevent lost failure increments under high concurrent load.
-- =====================================================================

CREATE OR REPLACE FUNCTION record_circuit_failure(p_provider TEXT)
RETURNS TABLE(consecutive_failures INT, state TEXT) AS $$
BEGIN
  RETURN QUERY
  UPDATE circuit_breaker_state cb
  SET
    consecutive_failures = cb.consecutive_failures + 1,
    last_failure_at = now(),
    updated_at = now(),
    state = CASE
      WHEN cb.consecutive_failures + 1 >= cb.failure_threshold THEN 'open'
      ELSE cb.state
    END,
    opened_at = CASE
      WHEN cb.consecutive_failures + 1 >= cb.failure_threshold AND cb.state != 'open' THEN now()
      ELSE cb.opened_at
    END
  WHERE cb.provider = p_provider
  RETURNING cb.consecutive_failures, cb.state;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION record_circuit_success(p_provider TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE circuit_breaker_state
  SET consecutive_failures = 0, state = 'closed', updated_at = now()
  WHERE provider = p_provider;
END;
$$ LANGUAGE plpgsql;

-- Update default gemini_model to gemini-2.5-flash-lite (PHASE3.md Task 3)
ALTER TABLE site_profiles ALTER COLUMN gemini_model SET DEFAULT 'gemini-2.5-flash-lite';
UPDATE site_profiles SET gemini_model = 'gemini-2.5-flash-lite' WHERE gemini_model = 'gemini-2.0-flash';

