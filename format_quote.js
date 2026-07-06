const fs = require('fs');

/**
 * Sanitizes an object by replacing null values with defaults.
 * @param {any} obj - The object to sanitize.
 * @returns {any} The sanitized object.
 */
function sanitize(obj) {
  if (obj === null || obj === undefined) {
    return ""; // Default for null/undefined
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitize(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

try {
  const data = JSON.parse(fs.readFileSync('quote_response.json', 'utf8'));
  const sanitizedData = sanitize(data);
  fs.writeFileSync('quote_response_formatted.json', JSON.stringify(sanitizedData, null, 2));
  console.log('Successfully sanitized quote_response.json and saved to quote_response_formatted.json');
} catch (error) {
  console.error('Error processing JSON:', error.message);
  process.exit(1);
}
