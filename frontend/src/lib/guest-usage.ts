// Define the key for storing guest usage in localStorage
const GUEST_USAGE_KEY = 'guest_feature_usage';
// Define the maximum number of free uses allowed for guest users
const GUEST_USAGE_LIMIT = 2; // As per AC-UM-5

/**
 * Retrieves the current guest usage count from localStorage.
 * @returns The current usage count as a number, or 0 if not found.
 */
export function getUsageCount(): number {
  if (typeof window === 'undefined') {
    return 0; // Return 0 if not in a browser environment
  }
  const usage = localStorage.getItem(GUEST_USAGE_KEY);
  return usage ? parseInt(usage, 10) : 0;
}

/**
 * Increments the guest usage count in localStorage.
 * This should be called after a guest successfully uses a core feature.
 */
export function incrementUsageCount(): void {
  if (typeof window === 'undefined') {
    return; // Do nothing if not in a browser environment
  }
  const currentUsage = getUsageCount();
  localStorage.setItem(GUEST_USAGE_KEY, (currentUsage + 1).toString());
}

/**
 * Checks if the guest user has reached their usage limit.
 * @returns True if the usage limit has been reached, false otherwise.
 */
export function checkUsageLimit(): boolean {
  if (typeof window === 'undefined') {
    return false; // Assume no limit reached if not in a browser environment
  }
  return getUsageCount() >= GUEST_USAGE_LIMIT;
}

/**
 * Resets the guest usage count to 0.
 * This might be useful after a user registers or logs in.
 */
export function resetUsageCount(): void {
  if (typeof window === 'undefined') {
    return; // Do nothing if not in a browser environment
  }
  localStorage.removeItem(GUEST_USAGE_KEY);
}

// Export the usage limit for potential display or external reference
export const GUEST_LIMIT = GUEST_USAGE_LIMIT;
