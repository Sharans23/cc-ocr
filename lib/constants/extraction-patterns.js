// Card issuer patterns for detection
export const ISSUER_PATTERNS = [
  { pattern: /IDFC\s*(?:First\s*)?Bank|IDFC/i, name: "IDFC First Bank" },
  { pattern: /RBL\s*Bank|RBLBANK/i, name: "RBL Bank" },
  { pattern: /HDFC\s*Bank|HDFC|HOFC/i, name: "HDFC Bank" }, // Added HOFC for OCR error
  { pattern: /ICICI\s*Bank|ICICI/i, name: "ICICI Bank" },
  { pattern: /Axis\s*Bank|AXIS/i, name: "Axis Bank" },
  { pattern: /SBI\s*Card|State\s*Bank/i, name: "SBI Card" },
  {
    pattern: /Bank\s+of\s+America|BOA|BANK OF AMERICA/i,
    name: "Bank of America",
  },
  { pattern: /American\s*Express|AMEX/i, name: "American Express" },
  { pattern: /Citibank|CITI/i, name: "Citibank" },
  { pattern: /Standard\s*Chartered/i, name: "Standard Chartered" },
  { pattern: /HSBC/i, name: "HSBC" },
  { pattern: /Kotak\s*Mahindra|Kotak/i, name: "Kotak Mahindra Bank" },
  { pattern: /IndusInd\s*Bank|IndusInd/i, name: "IndusInd Bank" },
  { pattern: /Bajaj\s*Finserv/i, name: "Bajaj Finserv" },
];

// Customer name patterns - IMPROVED
export const NAME_PATTERNS = [
  /(?:Customer\s*Name|Name|Cardholder|Holder's\s*Name|Mame)[\s:*]*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})/i,
  /^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})$/m,
  /Statement\s*for[\s:*]*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})/i,
  /Dear\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})/i,
  /Mame\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})/i,
  /(?:\n|\r)([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})(?:\n|\r)/,
];

// Card number patterns - IMPROVED
export const CARD_NUMBER_PATTERNS = [
  /(?:Card\s*Number|Card\s*No\.?)[\s:*]*[\d\sX*K]{12,}.*?(\d{4})/i,
  /(?:Account\s*Number)[\s:*]*\d{0,4}.*?(\d{4})/i,
  /(?:ending|ends\s*in|last\s*4)\s*(?:digits)?[\s:*]*(\d{4})/i,
  /[\d\sX*K]{8,}\s*(\d{4})/,
  /Card\s*No[\s:*]*(\d{4}\s*[\dX*K]{4}\s*[\dX*K]{4}\s*\d{4})/i,
  /4893\s*77X00\s*00K\s*(\d{4})/i,
  /Card\s*No[\s:*]*[\dX*K\s]{12,}?(\d{4})/i,
];

// Date patterns - IMPROVED
export const DATE_PATTERNS = [
  /(?:Payment\s*Due\s*Date|Due\s*Date)[\s:*]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /Due\s*Date[\s:*]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:Payment|Due)/i,
  /Payment\s*Due\s*Date[\s:*]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /Statement\s*Date[\s:*]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
];

// Billing cycle patterns - IMPROVED
export const BILLING_CYCLE_PATTERNS = [
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /Statement\s*Period[\s:*]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /Billing\s*Cycle[\s:*]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*Statement\s*Date/i,
];

// Amount patterns - IMPROVED
export const AMOUNT_PATTERNS = [
  /Total\s*Amount\s*Due[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /(?:Total\s*Amount\s*Due|Amount\s*Due)[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d{0,2})\s*(?:Total|Due|Payable|Balance)/i,
  /Total\s*Payment\s*Due[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /New\s*Balance\s*Total[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /Total\s*Dues[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /Minimum\s*Amount\s*Due[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /Current\s*Dues[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
];

// Credit limit patterns - IMPROVED
export const CREDIT_LIMIT_PATTERNS = [
  /(?:Credit\s*Limit|Total\s*Credit\s*Line)[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /(?:Available\s*Credit|Credit\s*Available)[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /Available\s*Credit\s*Limit[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
  /Available\s*Cash\s*Limit[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})/i,
];

// NEW: Email patterns
export const EMAIL_PATTERNS = [
  /Email[\s:]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
  /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
];

// NEW: Transaction patterns for the transactions table
export const TRANSACTION_PATTERNS = {
  date: /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  description:
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s+(.+?)\s+(-?\d{1,3}(?:,\d{3})*\.?\d{0,2})(?:\s*Cr)?$/,
  amount: /(-?\d{1,3}(?:,\d{3})*\.?\d{0,2})(?:\s*Cr)?$/,
  credit_indicator: /(\d{1,3}(?:,\d{3})*\.?\d{0,2})\s*Cr$/i,
};

// Common false positives
export const COMMON_FALSE_POSITIVES = ["0000", "0001", "1234", "4045", "5000"];
// Enhanced extraction function for HDFC specific format
export function extractHDFCSpecificFields(text) {
  const fields = {};
  
  // Extract Payment Due Date from the table format
  const dueDateMatch = text.match(/Payment\s*Due\s*Date\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dueDateMatch) {
    fields.paymentDueDate = dueDateMatch[1];
  }
  
  // Extract Total Dues from the table
  const totalDuesMatch = text.match(/Total\s*Dues\s*(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i);
  if (totalDuesMatch) {
    fields.totalAmountDue = totalDuesMatch[1];
  }
  
  // Extract Minimum Amount Due from the table
  const minAmountMatch = text.match(/Minimum\s*Amount\s*Due\s*(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i);
  if (minAmountMatch) {
    fields.minimumAmountDue = minAmountMatch[1];
  }
  
  // Extract Credit Limit information
  const creditLimitMatch = text.match(/Credit\s*Limit\s*(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i);
  if (creditLimitMatch) {
    fields.creditLimit = creditLimitMatch[1];
  }
  
  // Extract Statement Date
  const statementDateMatch = text.match(/Statement\s*Date\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (statementDateMatch) {
    fields.statementDate = statementDateMatch[1];
  }
  
  return fields;
}

// Function to clean OCR text
export function cleanOCRText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/(\d)\s+(\d)/g, '$1$2')
    .replace(/([a-zA-Z])\s+([a-zA-Z])/g, '$1$2')
    .replace(/[lI]/g, '1') // Common OCR errors
    .replace(/[oO]/g, '0')
    .trim();
}