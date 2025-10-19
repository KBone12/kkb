/**
 * Date utilities
 */

/**
 * Get current timestamp in ISO 8601 format
 * @returns ISO 8601 timestamp string (e.g., "2025-10-18T12:34:56.789Z")
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get current date in ISO 8601 date format
 * @returns ISO 8601 date string (e.g., "2025-10-18")
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate if a string is a valid ISO 8601 date (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns True if valid ISO 8601 date
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  // Verify that the date was not auto-corrected (e.g., 2025-02-30 -> 2025-03-02)
  // by checking if the formatted date matches the input
  const [year, month, day] = dateString.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

/**
 * Format a Date object to YYYY-MM-DD format for HTML date input
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "2025-10-18")
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string from YYYY-MM-DD to YYYY/MM/DD
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string with slashes
 */
export function formatDateWithSlash(dateString: string): string {
  return dateString.replace(/-/g, '/');
}

/**
 * Format a date string from YYYY-MM-DD to YYYY年MM月DD日
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted Japanese date string or original string if invalid
 */
export function formatDateJapanese(dateString: string): string {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return dateString; // Return original string if format is invalid
  }
  const [year, month, day] = parts;
  return `${year}年${month}月${day}日`;
}
