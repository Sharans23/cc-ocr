import {
  ISSUER_PATTERNS,
  NAME_PATTERNS,
  CARD_NUMBER_PATTERNS,
  DATE_PATTERNS,
  BILLING_CYCLE_PATTERNS,
  AMOUNT_PATTERNS,
  CREDIT_LIMIT_PATTERNS,
  COMMON_FALSE_POSITIVES,
} from "../constants/extraction-patterns"
import { cleanText, formatDate, detectCurrency, isCommonFalsePositive } from "../utils/text-processing"

// Extract structured data from OCR text
export const extractDataFromText = (text) => {
  console.log("Raw OCR Text:", text)
  const cleanedText = cleanText(text)
  console.log("Cleaned Text:", cleanedText)

  const data = {
    cardIssuer: "Not Detected",
    cardLast4: "Not Detected",
    billingCycle: "Not Detected",
    dueDate: "Not Detected",
    totalDue: "Not Detected",
    customerName: "Not Detected",
    creditLimit: "Not Detected",
    availableCredit: "Not Detected",
  }

  // Extract customer name
  for (const pattern of NAME_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (!name.match(/(?:Customer|Relationship|Account|Number|Statement|Date)/i) && name.length > 3) {
        data.customerName = name
        break
      }
    }
  }

  // Fallback for all-caps names
  if (data.customerName === "Not Detected") {
    const allCapsMatch = cleanedText.match(
      /([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})(?:\s+(?:GURGAON|DELHI|MUMBAI|CHENNAI|BANGALORE|KOLKATA|HYDERABAD|PUNE|MAHARASHTRA|KARNATAKA))/i,
    )
    if (allCapsMatch) {
      data.customerName = allCapsMatch[1]
    }
  }

  // Extract card issuer
  for (const { pattern, name } of ISSUER_PATTERNS) {
    if (pattern.test(cleanedText)) {
      data.cardIssuer = name
      break
    }
  }

  // Extract card last 4 digits
  for (const pattern of CARD_NUMBER_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1]) {
      const last4 = match[1]
      if (!isCommonFalsePositive(last4, cleanedText, COMMON_FALSE_POSITIVES)) {
        data.cardLast4 = last4
        break
      }
    }
  }

  // Extract due date
  for (const pattern of DATE_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1]) {
      data.dueDate = formatDate(match[1])
      break
    }
  }

  // Extract billing cycle
  for (const pattern of BILLING_CYCLE_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1] && match[2]) {
      data.billingCycle = `${formatDate(match[1])} → ${formatDate(match[2])}`
      break
    }
  }

  // Extract total amount due
  for (const pattern of AMOUNT_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1]) {
      const amount = match[1].replace(/,/g, "")
      const currency = detectCurrency(cleanedText)
      data.totalDue = `${currency}${amount}`
      break
    }
  }

  // Extract credit limits
  for (const pattern of CREDIT_LIMIT_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1]) {
      const amount = match[1].replace(/,/g, "")
      const currency = detectCurrency(cleanedText)
      if (pattern.source.includes("Credit Limit")) {
        data.creditLimit = `${currency}${amount}`
      } else {
        data.availableCredit = `${currency}${amount}`
      }
    }
  }

  console.log("Final Extracted Data:", data)
  return data
}
