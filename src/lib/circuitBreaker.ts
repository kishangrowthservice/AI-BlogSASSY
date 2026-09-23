import { getDbClient } from "./db";

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitStatus {
  isOpen: boolean;
  state: CircuitState;
  consecutiveFailures: number;
  reason?: string;
}

// In-memory fallback state if remote table is not yet migrated
const localCircuitState = {
  consecutiveFailures: 0,
  failureThreshold: 3,
  cooloffSeconds: 30,
  openedAt: 0,
  state: "closed" as CircuitState,
};

/**
 * Checks if the primary provider's circuit is open (§7 Circuit Breaking).
 * If Groq has failed the last N requests within a short window, skip trying it
 * and go straight to Gemini for the next few seconds.
 */
export async function getCircuitBreakerStatus(
  provider: string = "groq"
): Promise<CircuitStatus> {
  const now = Date.now();

  try {
    const supabase = getDbClient();

    // 1. High-concurrency canary acquisition (eliminates thundering herd across 10,000+ requests)
    const { data: canaryData, error: canaryErr } = await supabase.rpc("acquire_circuit_canary", {
      p_provider: provider,
      p_cooloff_seconds: 30,
    });

    if (!canaryErr && canaryData && Array.isArray(canaryData) && canaryData.length > 0) {
      const canary = canaryData[0];
      if (canary.current_state === "open") {
        return {
          isOpen: true,
          state: "open",
          consecutiveFailures: 3,
          reason: `Circuit OPEN for ${provider}. Cool-off active.`,
        };
      }
      if (canary.current_state === "half-open") {
        return {
          isOpen: !canary.should_probe,
          state: "half-open",
          consecutiveFailures: 3,
          reason: canary.should_probe
            ? `Circuit HALF-OPEN: Testing ${provider} recovery with probe request.`
            : `Circuit HALF-OPEN: Canary probe in flight. Cool-off active.`,
        };
      }
      return {
        isOpen: false,
        state: "closed",
        consecutiveFailures: 0,
      };
    }

    // 2. Fallback direct read query
    const { data } = await supabase
      .from("circuit_breaker_state")
      .select("*")
      .eq("provider", provider)
      .single();

    if (data) {
      const { consecutive_failures, failure_threshold, cooloff_seconds, opened_at, state } = data;

      if (state === "open" && opened_at) {
        const openedTime = new Date(opened_at).getTime();
        const elapsedSeconds = (now - openedTime) / 1000;

        if (elapsedSeconds < cooloff_seconds) {
          return {
            isOpen: true,
            state: "open",
            consecutiveFailures: consecutive_failures,
            reason: `Circuit OPEN for ${provider}. Cool-off active (${Math.ceil(cooloff_seconds - elapsedSeconds)}s remaining).`,
          };
        }

        // Cool-off elapsed: enter half-open to test provider
        return {
          isOpen: false,
          state: "half-open",
          consecutiveFailures: consecutive_failures,
          reason: `Circuit HALF-OPEN: Testing ${provider} recovery with probe request.`,
        };
      }

      return {
        isOpen: false,
        state: "closed",
        consecutiveFailures: consecutive_failures,
      };
    }
  } catch {
    // Fall back to local in-memory circuit state
  }

  // Local state check
  if (localCircuitState.state === "open") {
    const elapsedSeconds = (now - localCircuitState.openedAt) / 1000;
    if (elapsedSeconds < localCircuitState.cooloffSeconds) {
      return {
        isOpen: true,
        state: "open",
        consecutiveFailures: localCircuitState.consecutiveFailures,
        reason: `Local Circuit OPEN for ${provider}. Cool-off active (${Math.ceil(localCircuitState.cooloffSeconds - elapsedSeconds)}s remaining).`,
      };
    }
    return {
      isOpen: false,
      state: "half-open",
      consecutiveFailures: localCircuitState.consecutiveFailures,
    };
  }

  return {
    isOpen: false,
    state: "closed",
    consecutiveFailures: localCircuitState.consecutiveFailures,
  };
}

/**
 * Record successful completion on provider — resets circuit to closed.
 */
export async function recordCircuitSuccess(provider: string = "groq"): Promise<void> {
  localCircuitState.consecutiveFailures = 0;
  localCircuitState.state = "closed";

  try {
    const supabase = getDbClient();
    await supabase.rpc("record_circuit_success", { p_provider: provider });
  } catch {
    // Local state above already reflects success — graceful degradation.
  }
}

/**
 * Record failure on provider — trips circuit to open when threshold reached.
 */
export async function recordCircuitFailure(provider: string = "groq"): Promise<void> {
  const now = Date.now();
  localCircuitState.consecutiveFailures += 1;
  if (localCircuitState.consecutiveFailures >= localCircuitState.failureThreshold) {
    localCircuitState.state = "open";
    localCircuitState.openedAt = now;
  }

  try {
    const supabase = getDbClient();
    await supabase.rpc("record_circuit_failure", { p_provider: provider });
  } catch {
    // Local state above already reflects the failure — graceful degradation.
  }
}
