import { ISSUER_PATTERNS } from "../constants/extraction-patterns"
import { detectCurrency } from "../utils/text-processing"

// Helper to find value after a label in text
const findValueAfterLabel = (text, labelPatterns, valuePattern) => {
  for (const label of labelPatterns) {
    // Try to find label followed by value on same line
    const regex = new RegExp(label + String.raw`\s*[:\s]\s*` + valuePattern, "i")
    const match = text.match(regex)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return null
}

// Extract customer name - look for name at top of document
const extractCustomerName = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // Strategy 1: Look for "Name :" or "Name:" label
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i]
    const match = line.match(/Name\s*:\s*([A-Z][A-Za-z\s]+)/i)
    if (match && match[1]) {
      const name = match[1].trim()
      // Validate: should be 2-5 words, 5-50 chars
      const words = name.split(/\s+/)
      if (words.length >= 2 && words.length <= 5 && name.length >= 5 && name.length <= 50) {
        return name
      }
    }
  }

  // Strategy 2: Look for MR/MS/MRS prefix (all caps name)
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i]
    const match = line.match(/^((?:MR|MS|MRS|DR)\.?\s+[A-Z][A-Z\s]+)$/i)
    if (match && match[1]) {
      const name = match[1].replace(/\s+/g, " ").trim()
      const words = name.split(/\s+/)
      if (words.length >= 2 && words.length <= 5 && name.length <= 50) {
        return name
      }
    }
  }

  // Strategy 3: Look for all-caps name (2-4 words) followed by address line
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i]
    const nextLine = i + 1 < lines.length ? lines[i + 1] : ""

    // Check if line is all-caps name (2-4 words)
    if (/^[A-Z][A-Z\s]+$/.test(line)) {
      const words = line.split(/\s+/)
      if (words.length >= 2 && words.length <= 4 && line.length >= 10 && line.length <= 50) {
        // Check if next line looks like address
        if (nextLine && (/^[A-Z0-9]/.test(nextLine) || /FLAT|HOUSE|PLOT|ROAD|STREET|AVENUE/i.test(nextLine))) {
          return line.trim()
        }
      }
    }
  }

  // Strategy 4: Look for Title Case name at top
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i]
    const match = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/)
    if (match && match[1]) {
      const name = match[1].trim()
      if (name.length >= 5 && name.length <= 50) {
        return name
      }
    }
  }

  return null
}

// Extract card last 4 digits
const extractCardLast4 = (text) => {
  // Look for patterns like "Card No: 4893 77XX XXXX 2950" or "5369 XXXX XXXX 2070"
  const patterns = [
    /Card\s*(?:No|Number)\s*[:\s]\s*(?:\d{4}[\s\-X*x#¥]+){3}(\d{4})/i,
    /(\d{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(\d{4})/i,
    /(?:X{4}|x{4}|\*{4}|#{4}|¥{4}|\d{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(\d{4})/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // Get last captured group
      const last4 = match[match.length - 1]
      if (/^\d{4}$/.test(last4)) {
        // Validate: not a year
        const num = Number.parseInt(last4)
        if (num < 2000 || num > 2030) {
          return last4
        }
      }
    }
  }

  return null
}

// Extract dates
const extractDate = (text, labels) => {
  for (const label of labels) {
    // Look for label followed by date
    const patterns = [
      new RegExp(label + String.raw`\s*[:\s]\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})`, "i"),
      new RegExp(label + String.raw`\s*[:\s]\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})`, "i"), // "November 21, 2021"
      new RegExp(label + String.raw`\s*[:\s]\s*(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})`, "i"), // "21 November 2021"
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
  }
  return null
}

// Extract amounts
const extractAmount = (text, labels) => {
  for (const label of labels) {
    // Look for label followed by amount
    const pattern = new RegExp(label + String.raw`\s*[:\s]\s*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)\s*(?:Dr|Cr)?`, "i")
    const match = text.match(pattern)
    if (match && match[1]) {
      const amount = match[1].replace(/,/g, "")
      const num = Number.parseFloat(amount)
      if (!isNaN(num) && num > 0) {
        return amount
      }
    }
  }
  return null
}

// Extract billing cycle
const extractBillingCycle = (text) => {
  const patterns = [
    /(?:Statement\s*Period|Billing\s*(?:Cycle|Period))\s*[:\s]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[2]) {
      return `${match[1]} to ${match[2]}`
    }
  }

  return null
}

// Main extraction function
export const extractDataFromText = (text) => {
  console.log("[v0] === Starting Fresh Extraction ===")
  console.log("[v0] Text length:", text.length)
  console.log("[v0] First 500 chars:", text.substring(0, 500))

  const data = {
    cardIssuer: "Not Detected",
    cardLast4: "Not Detected",
    billingCycle: "Not Detected",
    dueDate: "Not Detected",
    totalDue: "Not Detected",
    minimumDue: "Not Detected",
    customerName: "Not Detected",
    creditLimit: "Not Detected",
    availableCredit: "Not Detected",
    openingBalance: "Not Detected",
    statementDate: "Not Detected",
  }

  // Detect card issuer
  for (const { pattern, name } of ISSUER_PATTERNS) {
    if (pattern.test(text)) {
      data.cardIssuer = name
      console.log("[v0] ✓ Card Issuer:", name)
      break
    }
  }

  // Detect currency
  const currency = detectCurrency(text)
  console.log("[v0] Currency:", currency)

  // Extract customer name
  const name = extractCustomerName(text)
  if (name) {
    data.customerName = name
    console.log("[v0] ✓ Customer Name:", name)
  } else {
    console.log("[v0] ✗ Customer Name: Not found")
  }

  // Extract card last 4
  const last4 = extractCardLast4(text)
  if (last4) {
    data.cardLast4 = last4
    console.log("[v0] ✓ Card Last 4:", last4)
  } else {
    console.log("[v0] ✗ Card Last 4: Not found")
  }

  // Extract statement date
  const stmtDate = extractDate(text, ["Statement Date", "Statement Generation Date"])
  if (stmtDate) {
    data.statementDate = stmtDate
    console.log("[v0] ✓ Statement Date:", stmtDate)
  }

  // Extract payment due date
  const dueDate = extractDate(text, ["Payment Due Date", "Due Date", "Pay By"])
  if (dueDate) {
    data.dueDate = dueDate
    console.log("[v0] ✓ Due Date:", dueDate)
  } else {
    console.log("[v0] ✗ Due Date: Not found")
  }

  // Extract billing cycle
  const cycle = extractBillingCycle(text)
  if (cycle) {
    data.billingCycle = cycle
    console.log("[v0] ✓ Billing Cycle:", cycle)
  } else {
    console.log("[v0] ✗ Billing Cycle: Not found")
  }

  // Extract total amount due
  const total = extractAmount(text, [
    "Total Amount Due",
    "Total Amount due",
    "Total Dues",
    "Total Due",
    "Total Payment Due",
  ])
  if (total) {
    data.totalDue = `${currency}${total}`
    console.log("[v0] ✓ Total Due:", data.totalDue)
  } else {
    console.log("[v0] ✗ Total Due: Not found")
  }

  // Extract minimum due
  const minimum = extractAmount(text, [
    "Minimum Amount Due",
    "Minimum Amount due",
    "Minimum Payment Due",
    "Minimum Due",
  ])
  if (minimum) {
    data.minimumDue = `${currency}${minimum}`
    console.log("[v0] ✓ Minimum Due:", data.minimumDue)
  } else {
    console.log("[v0] ✗ Minimum Due: Not found")
  }

  // Extract credit limit
  const limit = extractAmount(text, ["Credit Limit", "Total Credit Limit"])
  if (limit && Number.parseFloat(limit) >= 10000) {
    data.creditLimit = `${currency}${limit}`
    console.log("[v0] ✓ Credit Limit:", data.creditLimit)
  } else {
    console.log("[v0] ✗ Credit Limit: Not found or invalid")
  }

  // Extract available credit
  const available = extractAmount(text, ["Available Credit Limit", "Available Credit"])
  if (available) {
    data.availableCredit = `${currency}${available}`
    console.log("[v0] ✓ Available Credit:", data.availableCredit)
  } else {
    console.log("[v0] ✗ Available Credit: Not found")
  }

  // Extract opening balance
  const opening = extractAmount(text, ["Opening Balance", "Previous Balance"])
  if (opening) {
    data.openingBalance = `${currency}${opening}`
    console.log("[v0] ✓ Opening Balance:", data.openingBalance)
  }

  console.log("[v0] === Extraction Complete ===")
  return data
}
