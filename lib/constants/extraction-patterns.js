// Card issuer patterns for detection
export const ISSUER_PATTERNS = [
  { pattern: /IDFC\s*(?:First\s*)?Bank|IDFC/i, name: "IDFC First Bank" },
  { pattern: /RBL\s*Bank|RBLBANK/i, name: "RBL Bank" },
  { pattern: /HDFC\s*Bank|HDFC/i, name: "HDFC Bank" },
  { pattern: /ICICI\s*Bank|ICICI/i, name: "ICICI Bank" },
  { pattern: /Axis\s*Bank|AXIS/i, name: "Axis Bank" },
  { pattern: /SBI\s*Card|State\s*Bank/i, name: "SBI Card" },
  { pattern: /Bank\s+of\s+America|BOA|BANK OF AMERICA/i, name: "Bank of America" },
  { pattern: /American\s*Express|AMEX/i, name: "American Express" },
  { pattern: /Citibank|CITI/i, name: "Citibank" },
  { pattern: /Standard\s*Chartered/i, name: "Standard Chartered" },
  { pattern: /HSBC/i, name: "HSBC" },
  { pattern: /Kotak\s*Mahindra|Kotak/i, name: "Kotak Mahindra Bank" },
  { pattern: /IndusInd\s*Bank|IndusInd/i, name: "IndusInd Bank" },
  { pattern: /Bajaj\s*Finserv/i, name: "Bajaj Finserv" },
]

// Customer name patterns
export const NAME_PATTERNS = [
  /(?:Customer Name|Name|Cardholder|Holder's Name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m,
  /Statement for[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /Dear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /(?:\n|\r)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\n|\r)/,
]

// Card number patterns
export const CARD_NUMBER_PATTERNS = [
  /(?:Card\s*Number|Card\s*No\.?)[:\s]*[\dX*]{8,}.*?(\d{4})/i,
  /(?:Account\s*Number)[:\s]*\d{0,4}.*?(\d{4})/i,
  /(?:ending|ends\s*in|last\s*4)\s*(?:digits)?[:\s]*(\d{4})/i,
  /[X*]{8,}\s*(\d{4})/,
  /Card Number:\s*[\dX*]{8,}.*?(\d{4})/i,
]

// Date patterns
export const DATE_PATTERNS = [
  /(?:Payment\s*Due\s*Date|Due\s*Date)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  /Due\s*Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:Payment|Due)/i,
  /Payment Due Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
]

// Billing cycle patterns
export const BILLING_CYCLE_PATTERNS = [
  /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  /Statement Period[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  /Billing Cycle[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
]

// Amount patterns
export const AMOUNT_PATTERNS = [
  /Total Amount Due[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /(?:Total\s*Amount\s*Due|Amount\s*Due)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /(?:Rs\.?|INR|₹|¥)\s*([\d,]+\.?\d*)\s*(?:Total|Due|Payable|Balance)/i,
  /Total Payment Due[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /New Balance Total[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
]

// Credit limit patterns
export const CREDIT_LIMIT_PATTERNS = [
  /(?:Credit\s*Limit|Total\s*Credit\s*Line)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
  /(?:Available\s*Credit|Credit\s*Available)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
]

// Common false positives
export const COMMON_FALSE_POSITIVES = ["0000", "0001", "1234", "4045", "5000"]
