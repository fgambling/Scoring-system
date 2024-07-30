/**
 * Converts an ISO date string to 'yyyy-mm-dd hh:mm:ss' format.
 *
 * @param isoDateString - The ISO date string to format.
 * @returns Formatted date string in 'yyyy-mm-dd hh:mm:ss' format.
 */
export function formatISODateSimple(isoDateString: string | null): string {
  if (!isoDateString) {
    return "";
  }

  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const isValidMongoDBId = (id: string): boolean => {
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  return mongoIdRegex.test(id);
};
