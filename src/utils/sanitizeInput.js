// Utility to sanitize user input for forms
export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[&<>"]/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
      }[c];
    });
} 