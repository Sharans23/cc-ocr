// Clean and normalize text
export const cleanText = (text) => {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s@.,$₹¥€£\-:/()%*#&\n]/g, "") // Keep important chars
    .replace(/\n\s*\n/g, "\n") // Remove extra newlines
    .trim()
}

// Format date string to DD/MM/YYYY
export const formatDate = (dateStr) => {
  // Remove all spaces first
  dateStr = dateStr.replace(/\s+/g, "")

  // Handle DDMMYYYY format (8 digits)
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.substring(0, 2)}/${dateStr.substring(2, 4)}/${dateStr.substring(4, 8)}`
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  return dateStr.replace(/-/g, "/")
}

// Detect currency from text
export const detectCurrency = (text) => {
  if (/₹|INR|Rs\.?|{/.test(text)) return "₹";
  if (/\$|USD/.test(text)) return "$";
  if (/€|EUR/.test(text)) return "€";
  if (/£|GBP/.test(text)) return "£";
  return "₹"; // default
};

// Check if number is a common false positive
export const isCommonFalsePositive = (number, text, falsePositives) => {
  return falsePositives.includes(number) || text.includes(`Relationship ${number}`)
}

// Normalize amount - remove commas, handle Indian formatting
export const normalizeAmount = (amountStr) => {
  if (!amountStr) return null

  // Remove all commas and spaces
  let normalized = amountStr.replace(/[,\s]/g, "")

  // Handle cases like "1.832.000" (OCR error) - convert to "1832000"
  if ((normalized.match(/\./g) || []).length > 1) {
    normalized = normalized.replace(/\./g, "")
  }

  // Handle cases where decimal point is at the end
  if (normalized.endsWith(".")) {
    normalized = normalized.slice(0, -1)
  }

  // Validate it's a valid number
  if (!/^\d+\.?\d*$/.test(normalized)) {
    return null
  }

  // Check for unreasonably long numbers (likely concatenation errors)
  if (normalized.replace(".", "").length > 10) {
    return null
  }

  return normalized
}

// Validate card last 4 digits
export const validateCardLast4 = (last4, text, falsePositives) => {
  // Must be exactly 4 digits
  if (!/^\d{4}$/.test(last4)) return false

  // Check against common false positives
  if (falsePositives.includes(last4)) return false

  // Check if it's a year (2020-2030)
  const num = Number.parseInt(last4)
  if (num >= 2020 && num <= 2030) return false

  // Check if it appears in context that suggests it's not a card number
  if (
    text.includes(`Relationship ${last4}`) ||
    text.includes(`Customer ${last4}`) ||
    text.includes(`Account ${last4}`)
  ) {
    return false
  }

  return true
}

// Validate date format
export const validateDate = (dateStr) => {
  if (!dateStr) return false

  // Try to parse the date
  const parts = dateStr.split(/[\s\-/]/)
  if (parts.length !== 3) return false

  const [day, month, year] = parts.map((p) => Number.parseInt(p))

  // Basic validation
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false

  // Handle 2-digit years
  let fullYear = year
  if (year < 100) {
    fullYear = year < 50 ? 2000 + year : 1900 + year
  }

  if (fullYear < 2000 || fullYear > 2030) return false

  return true
}

// Extract value near a label (context-aware extraction)
export const extractContextualValue = (text, label, pattern) => {
  // Find the label in text
  const labelIndex = text.toLowerCase().indexOf(label.toLowerCase())
  if (labelIndex === -1) return null

  // Extract text around the label (next 100 chars)
  const context = text.substring(labelIndex, labelIndex + 100)

  // Try to match pattern in context
  const match = context.match(pattern)
  return match ? match[1] : null
}
