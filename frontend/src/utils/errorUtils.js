/**
 * Safely extracts an error message from an error object
 * Handles various error formats from RTK Query and other sources
 * @param {Object} error - The error object
 * @returns {string} - A string error message
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  // If error is already a string, return it
  if (typeof error === "string") return error;

  // Try to get message from error.data.message
  if (error?.data?.message) {
    return String(error.data.message);
  }

  // Try to get message from error.data
  if (error?.data && typeof error.data === "string") {
    return error.data;
  }

  // Try error.error - but check if it's an object
  if (error?.error) {
    if (typeof error.error === "string") {
      return error.error;
    }
    // If error.error is an object, try to extract a message from it
    if (typeof error.error === "object") {
      if (error.error?.message) {
        return String(error.error.message);
      }
      if (error.error?.data?.message) {
        return String(error.error.data.message);
      }
      // If it's an object with status/data, return a generic message
      return "An error occurred while processing your request";
    }
  }

  // Try error.message
  if (error?.message) {
    return String(error.message);
  }

  // Fallback
  return "An unknown error occurred";
};

