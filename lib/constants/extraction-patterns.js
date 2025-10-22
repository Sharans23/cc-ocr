// Card issuer patterns for detection
export const ISSUER_PATTERNS = [
  { pattern: /RBL\s*Bank|RBLBANK/i, name: "RBL Bank" },
  { pattern: /HDFC\s*Bank|HDFC/i, name: "HDFC Bank" },
  { pattern: /AXIS\s*Bank|AXIS/i, name: "Axis Bank" },
  { pattern: /YES\s*Bank|YESBANK|ALWAYS\s*YOU\s*FIRST/i, name: "Yes Bank" },
  { pattern: /ICICI\s*Bank|ICICI/i, name: "ICICI Bank" },
  { pattern: /SBI\s*Card|State\s*Bank/i, name: "SBI Card" },
  { pattern: /IDFC\s*(?:First\s*)?Bank|IDFC/i, name: "IDFC First Bank" },
  { pattern: /Kotak\s*Mahindra|Kotak/i, name: "Kotak Mahindra Bank" },
  { pattern: /IndusInd\s*Bank|IndusInd/i, name: "IndusInd Bank" },
  { pattern: /Standard\s*Chartered/i, name: "Standard Chartered" },
  { pattern: /Citibank|CITI/i, name: "Citibank" },
  { pattern: /American\s*Express|AMEX/i, name: "American Express" },
]

// Customer name patterns - based on real samples
export const NAME_PATTERNS = [
  // Pattern 1: Name on its own line (most common in statements)
  // Matches: "Ved Prakash", "SHAILENDRA SAXENA", "Chennuru Abhiram Gowrav"
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*$/im,
  /^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\s*$/im,

  // Pattern 2: Name followed by address components
  /^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,3})\s+(?:H-no|FLAT|NO|HOUSE|PLOT|DOOR|\d)/im,

  // Pattern 3: MR/MS/MRS prefix
  /^(?:MR|MS|MRS|DR|PROF)\.?\s+([A-Z][A-Z\s]+?)(?:\s+(?:H-no|FLAT|NO|HOUSE|PLOT|DOOR|POWER|RAHUL|\d))/im,

  // Pattern 4: Name after cardholder/customer label
  /(?:Cardholder|Customer|Name)[:\s]+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,3})/i,
]

// Card number patterns - handle various formats and OCR errors
export const CARD_NUMBER_PATTERNS = [
  // Pattern 1: Standard format with X's or asterisks
  /(?:Card\s*(?:No|Number)|Account\s*Number)[:\s]*(?:\d{4}[\s\-#¥X*]+){3}(\d{4})/i,

  // Pattern 2: Just the last 4 digits with X's before
  /(?:\d{4}[\s\-#¥X*]+){2,3}(\d{4})/,

  // Pattern 3: Explicit "last 4" or "ending in"
  /(?:last\s*4|ending|ends\s*in)[:\s]*(\d{4})/i,

  // Pattern 4: Card number with various separators
  /(?:Card\s*No|Card\s*Number)[:\s]*[\dX*#¥]{4}[\s\-#¥X*]+[\dX*#¥]{4}[\s\-#¥X*]+[\dX*#¥]{4}[\s\-#¥X*]+(\d{4})/i,

  // Pattern 5: Just digits with X's (flexible)
  /[\dX*#¥]{4}[\s\-#¥X*]+[\dX*#¥]{4}[\s\-#¥X*]+[\dX*#¥]{4}[\s\-#¥X*]+(\d{4})/,
]

// Date patterns - handle DD/MM/YYYY, DD-MM-YYYY, DDMMYYYY formats
export const DATE_PATTERNS = [
  // Pattern 1: Payment Due Date with various formats
  /(?:Payment\s*Due\s*Date|Due\s*Date)[:\s]*(\d{1,2}[\s\-/]*\d{1,2}[\s\-/]*\d{2,4})/i,

  // Pattern 2: Just "Due Date"
  /Due\s*Date[:\s]*(\d{1,2}[\s\-/]*\d{1,2}[\s\-/]*\d{2,4})/i,

  // Pattern 3: Date before "Due" or "Payment"
  /(\d{1,2}[\s\-/]\d{1,2}[\s\-/]\d{2,4})(?:\s+(?:Payment|Due))/i,
]

// Statement date patterns
export const STATEMENT_DATE_PATTERNS = [
  /(?:Statement\s*Date)[:\s]*(\d{1,2}[\s\-/]*\d{1,2}[\s\-/]*\d{2,4})/i,
  /(?:Date)[:\s]*(\d{1,2}[\s\-/]*\d{1,2}[\s\-/]*\d{2,4})/i,
]

// Billing cycle patterns - handle various date formats
export const BILLING_CYCLE_PATTERNS = [
  // Pattern 1: Standard "from - to" format
  /(?:Statement\s*Period|Billing\s*(?:Cycle|Period))[:\s]*(\d{1,2}[\s\-/]*\d{1,2}[\s\-/]*\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[\s\-/]*\d{1,2}[\s\-/]*\d{2,4})/i,

  // Pattern 2: Just two dates with separator
  /(\d{1,2}[\s\-/]\d{1,2}[\s\-/]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[\s\-/]\d{1,2}[\s\-/]\d{2,4})/,

  // Pattern 3: Compact format without separators (DDMMYYYY)
  /(\d{8})\s*(?:to|-)\s*(\d{8})/,
]

// Amount patterns - handle Indian number formatting
export const AMOUNT_PATTERNS = [
  // Pattern 1: Total Amount Due with currency
  /(?:Total\s*Amount\s*Due|Total\s*Dues?|Amount\s*Due|Total\s*Payment\s*Due)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,

  // Pattern 2: Just "Total" with amount
  /Total[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,

  // Pattern 3: Currency symbol followed by amount
  /(?:Rs\.?|INR|₹|¥)\s*([\d,]+\.?\d*)\s*(?:Total|Due|Payable|Balance)/i,
]

// Minimum payment patterns
export const MINIMUM_PAYMENT_PATTERNS = [
  /(?:Minimum\s*(?:Amount\s*)?Due|Minimum\s*Payment|Minimum\s*Amount\s*Due)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /Minimum[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
]

// Credit limit patterns
export const CREDIT_LIMIT_PATTERNS = [
  /(?:Total\s*)?Credit\s*Limit[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /Credit\s*Limit[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  // Match format like "71,81,000" or "240,000.00"
  /Limit[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
]

// Available credit patterns
export const AVAILABLE_CREDIT_PATTERNS = [
  /(?:Available\s*Credit(?:\s*Limit)?)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /(?:Available\s*Limit)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
]

// Opening balance patterns
export const OPENING_BALANCE_PATTERNS = [/(?:Opening\s*Balance)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i]

// Common false positives to avoid
export const COMMON_FALSE_POSITIVES = [
  "0000",
  "0001",
  "1234",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "1000",
  "2000",
  "3000",
  "4000",
  "5000",
  "6000",
  "7000",
  "8000",
  "9000",
]

// Indian cities for name extraction context
export const INDIAN_CITIES = [
  "GURGAON",
  "DELHI",
  "MUMBAI",
  "CHENNAI",
  "BANGALORE",
  "HYDERABAD",
  "PUNE",
  "KOLKATA",
  "AHMEDABAD",
  "JAIPUR",
  "LUCKNOW",
  "KANPUR",
  "NAGPUR",
  "INDORE",
  "THANE",
  "BHOPAL",
  "VISAKHAPATNAM",
  "PATNA",
  "VADODARA",
  "GHAZIABAD",
  "LUDHIANA",
  "AGRA",
  "NASHIK",
  "FARIDABAD",
  "MEERUT",
  "RAJKOT",
  "VARANASI",
  "SRINAGAR",
  "AURANGABAD",
  "AMRITSAR",
  "ALLAHABAD",
  "RANCHI",
  "HOWRAH",
  "COIMBATORE",
  "VIJAYAWADA",
  "JODHPUR",
  "MADURAI",
  "RAIPUR",
  "KOTA",
  "CHANDIGARH",
  "GUWAHATI",
  "MYSORE",
  "NOIDA",
  "JAMNAGAR",
]
