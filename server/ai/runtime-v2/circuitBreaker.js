const cfg = require('../../config/automation');

const STATE = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open',
};

const state = {};

function _init(provider) {
  if (!state[provider]) {
    const failureThreshold = cfg.circuitBreaker?.failureThreshold || 5;
    const recoveryTimeout = cfg.circuitBreaker?.recoveryTimeout || 60000;
    const halfOpenMaxCalls = cfg.circuitBreaker?.halfOpenMaxCalls || 3;

    state[provider] = {
      currentState: STATE.CLOSED,
      failureCount: 0,
      successCount: 0,
      consecutiveFailureCount: 0,
      lastFailureTime: null,
      halfOpenCalls: 0,
      failureThreshold,
      recoveryTimeout,
      halfOpenMaxCalls,
      lastStateChange: Date.now(),
    };
  }
  return state[provider];
}

function isAvailable(provider) {
  const s = _init(provider);

  switch (s.currentState) {
    case STATE.CLOSED:
      return true;
    case STATE.OPEN:
      if (Date.now() - s.lastStateChange >= s.recoveryTimeout) {
        s.currentState = STATE.HALF_OPEN;
        s.halfOpenCalls = 0;
        s.lastStateChange = Date.now();
        return true;
      }
      return false;
    case STATE.HALF_OPEN:
      return s.halfOpenCalls < s.halfOpenMaxCalls;
    default:
      return true;
  }
}

function recordSuccess(provider) {
  const s = _init(provider);
  s.successCount++;
  s.consecutiveFailureCount = 0;

  if (s.currentState === STATE.HALF_OPEN) {
    s.halfOpenCalls++;
    if (s.halfOpenCalls >= s.halfOpenMaxCalls) {
      s.currentState = STATE.CLOSED;
      s.failureCount = 0;
      s.lastStateChange = Date.now();
    }
  }
}

function recordFailure(provider, errorType) {
  const s = _init(provider);

  if (errorType === 'provider_unavailable' || errorType === 'rate_limited') {
    s.consecutiveFailureCount++;
    s.failureCount++;

    if (s.currentState === STATE.HALF_OPEN || (s.currentState === STATE.CLOSED && s.consecutiveFailureCount >= s.failureThreshold)) {
      s.currentState = STATE.OPEN;
      s.lastStateChange = Date.now();
    }

    s.lastFailureTime = Date.now();
  }
}

function getState(provider) {
  const s = _init(provider);
  return { ...s };
}

function reset(provider) {
  if (state[provider]) {
    delete state[provider];
  }
}

function resetAll() {
  for (const p of Object.keys(state)) {
    delete state[p];
  }
}

module.exports = {
  STATE,
  isAvailable,
  recordSuccess,
  recordFailure,
  getState,
  reset,
  resetAll,
};
