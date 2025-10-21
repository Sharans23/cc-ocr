// Clean and normalize text
export const cleanText = (text) => {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s@.,$₹¥€£\-:/()%*#&\n]/g, "")
    .replace(/(\d)\s+(\d)/g, "$1$2")
    .replace(/\n\s*\n/g, "\n")
    .trim()
}

// Format date string
export const formatDate = (dateStr) => {
  return dateStr.replace(/-/g, "/")
}

// Detect currency from text
export const detectCurrency = (text) => {
  if (/USD|\$/.test(text)) return "$"
  if (/INR|Rs|₹/.test(text)) return "₹"
  if (/¥/.test(text)) return "¥"
  return "₹"
}

// Check if number is a common false positive
export const isCommonFalsePositive = (number, text, falsePositives) => {
  return falsePositives.includes(number) || text.includes(`Relationship ${number}`)
}
