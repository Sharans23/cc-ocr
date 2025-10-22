// Card issuer patterns for detection
export const ISSUER_PATTERNS = [
  { pattern: /IDFC\s*FIRST\s*Bank/i, name: "IDFC FIRST Bank" },
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
];

// Customer name patterns - FIXED for actual HDFC format
export const NAME_PATTERNS = [
  // Pattern 1: "Name : MURALI KRISHNA VARIKUTI" format (HDFC specific)
  /Name\s*:\s*([A-Z][A-Z\s]+?)(?=\s*Statement|\s*Email|\s*$)/im,

  // Pattern 2: Name on its own line (all caps, 2-4 words)
  /^([A-Z]{3,}\s+[A-Z]{3,}(?:\s+[A-Z]{3,}){0,2})$/m,

  // Pattern 3: Mixed case name on its own line
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m,

  // Pattern 4: Name after cardholder/customer label
  /(?:Cardholder|Customer|Name)\s*[:\s]+([A-Z][A-Za-z\s]+?)(?=\s*(?:Email|Card|Address|Statement))/i,

  // Pattern 5: MR/MS/MRS prefix
  /^(?:MR|MS|MRS|DR)\.?\s+([A-Z][A-Z\s]+?)(?=\s+(?:H-no|FLAT|NO|HOUSE|\d))/im,
];

// Card number patterns - FIXED for HDFC format "4893 77XX XXXX 2950"
export const CARD_NUMBER_PATTERNS = [
  // Pattern 1: HDFC format with XX - get last 4 digits
  /Card\s*No\s*:\s*\d{4}\s+\d{0,2}X+\s+X+\s+(\d{4})/i,

  // Pattern 2: Card No with any masking, get last 4
  /Card\s*No\s*:\s*[\dX\s]+?(\d{4})(?:\s|$|Tab)/i,

  // Pattern 3: Standard format
  /(?:Card\s*(?:No|Number))\s*:\s*[\dX\s]+(\d{4})/i,

  // Pattern 4: Just the pattern with X's
  /\d{4}\s+[\dX]{2,4}\s+[X]{4}\s+(\d{4})/,

  // Pattern 5: Account number
  /(?:Account\s*Number)\s*:\s*[\dX\s]+(\d{4})/i,
];

// Date patterns - FIXED for HDFC DD/MM/YYYY format
export const DATE_PATTERNS = [
  // Pattern 1: "Payment Due Date" on separate line, then date (HDFC format)
  /Payment\s+Due\s+Date\s+(\d{2}\/\d{2}\/\d{4})/i,

  // Pattern 2: Due Date with colon
  /Due\s+Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,

  // Pattern 3: Just DD/MM/YYYY near "Due"
  /(\d{2}\/\d{2}\/\d{4})\s+\d{1,3},\d{3}/,

  // Pattern 4: Standard format
  /(?:Payment\s*)?Due\s*Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
];

// Statement date patterns
export const STATEMENT_DATE_PATTERNS = [
  // HDFC format: "Statement Date:11/01/2023"
  /Statement\s+Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,
  /Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,
];

// Billing cycle patterns
export const BILLING_CYCLE_PATTERNS = [
  // Standard range format
  /(?:Statement\s*Period|Billing\s*(?:Cycle|Period))[:\s]*(\d{2}\/\d{2}\/\d{4})\s*(?:to|-|–)\s*(\d{2}\/\d{2}\/\d{4})/i,

  // Just two dates with separator
  /(\d{2}\/\d{2}\/\d{4})\s*(?:to|-|–)\s*(\d{2}\/\d{2}\/\d{4})/,
];

// Amount patterns - FIXED for HDFC "14,098.00" format
export const AMOUNT_PATTERNS = [
  // Pattern 1: "Total Dues" followed by number on same/next line (HDFC specific)
  /Total\s+Dues\s+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,

  // Pattern 2: Total Amount Due
  /Total\s+Amount\s+Due[:\s]*(?:Rs\.?|INR|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,

  // Pattern 3: Just "Total" with currency
  /Total[:\s]*(?:Rs\.?|INR|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,

  // Pattern 4: Amount Due
  /Amount\s+Due[:\s]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
];

// Minimum payment patterns - FIXED for HDFC format
export const MINIMUM_PAYMENT_PATTERNS = [
  // Pattern 1: "Minimum Amount Due" followed by number (HDFC layout)
  /Minimum\s+Amount\s+Due\s+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,

  // Pattern 2: With colon
  /Minimum\s+Amount\s+Due[:\s]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,

  // Pattern 3: Just Minimum Due
  /Minimum\s+Due[:\s]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
];

// Credit limit patterns - FIXED for HDFC "1,83,000" format (Indian numbering)
export const CREDIT_LIMIT_PATTERNS = [
  // Pattern 1: "Credit Limit" followed by number
  /Credit\s+Limit\s+(\d{1,3}(?:,\d{2,3})*)/i,

  // Pattern 2: With colon
  /Credit\s+Limit[:\s]*(\d{1,3}(?:,\d{2,3})*)/i,

  // Pattern 3: Total Credit Limit
  /Total\s+Credit\s+Limit[:\s]*(\d{1,3}(?:,\d{2,3})*)/i,
];

// Available credit patterns
export const AVAILABLE_CREDIT_PATTERNS = [
  // HDFC format: "Available Credit Limit"
  /Available\s+Credit\s+Limit\s+(\d{1,3}(?:,\d{2,3})*)/i,
  /Available\s+Credit[:\s]*(\d{1,3}(?:,\d{2,3})*)/i,
];

// Opening balance patterns
export const OPENING_BALANCE_PATTERNS = [
  // HDFC shows this in Account Summary section
  /Opening\s+Balance\s+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
  /Opening[:\s]+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
];

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
];

// Helper function to clean extracted amounts
export function cleanAmount(amount) {
  if (!amount) return null;
  // Remove commas and convert to number
  return parseFloat(amount.replace(/,/g, ""));
}

// Helper function to validate card last 4 digits
export function isValidCardDigits(digits) {
  if (!digits || digits.length !== 4) return false;
  if (COMMON_FALSE_POSITIVES.includes(digits)) return false;
  // Check if all digits are the same
  if (/^(\d)\1{3}$/.test(digits)) return false;
  return true;
}

// Helper to extract customer name with validation
export function extractCustomerName(text) {
  for (const pattern of NAME_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim().replace(/\s+/g, " ");

      // Skip if it looks like a city or address
      if (
        /GURGAON|DELHI|MUMBAI|CHENNAI|BANGALORE|FLAT|HOUSE|ROAD|AVENUE/i.test(
          name
        )
      ) {
        continue;
      }

      // Validate: 2-4 words, each 2+ chars
      const words = name.split(" ");
      if (
        words.length >= 2 &&
        words.length <= 4 &&
        words.every((w) => w.length >= 2)
      ) {
        return name;
      }
    }
  }
  return null;
}

// Helper to extract card last 4
export function extractCardLast4(text) {
  for (const pattern of CARD_NUMBER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const last4 = match[match.length - 1];
      if (last4 && last4.length === 4 && isValidCardDigits(last4)) {
        return last4;
      }
    }
  }
  return null;
}

// Master extraction function for HDFC
export function extractCreditCardData(text) {
  // Detect issuer
  let issuer = "Unknown";
  for (const { pattern, name } of ISSUER_PATTERNS) {
    if (pattern.test(text)) {
      issuer = name;
      break;
    }
  }

  // Extract all fields
  const customerName = extractCustomerName(text);
  const cardLast4 = extractCardLast4(text);

  // Extract dates
  const dueDateMatch =
    text.match(DATE_PATTERNS[0]) || text.match(DATE_PATTERNS[1]);
  const statementDateMatch = text.match(STATEMENT_DATE_PATTERNS[0]);

  // Extract amounts
  const totalDuesMatch =
    text.match(AMOUNT_PATTERNS[0]) || text.match(AMOUNT_PATTERNS[1]);
  const minDueMatch = text.match(MINIMUM_PAYMENT_PATTERNS[0]);
  const creditLimitMatch = text.match(CREDIT_LIMIT_PATTERNS[0]);
  const availableCreditMatch = text.match(AVAILABLE_CREDIT_PATTERNS[0]);
  const openingBalanceMatch = text.match(OPENING_BALANCE_PATTERNS[0]);

  // Extract billing cycle
  const billingCycleMatch =
    text.match(BILLING_CYCLE_PATTERNS[0]) ||
    text.match(BILLING_CYCLE_PATTERNS[1]);

  return {
    issuer,
    customerName,
    cardLast4,
    statementDate: statementDateMatch?.[1] || null,
    dueDate: dueDateMatch?.[1] || null,
    billingCycle: billingCycleMatch
      ? `${billingCycleMatch[1]} to ${billingCycleMatch[2]}`
      : null,
    totalDues: totalDuesMatch ? cleanAmount(totalDuesMatch[1]) : null,
    minimumDue: minDueMatch ? cleanAmount(minDueMatch[1]) : null,
    creditLimit: creditLimitMatch ? cleanAmount(creditLimitMatch[1]) : null,
    availableCredit: availableCreditMatch
      ? cleanAmount(availableCreditMatch[1])
      : null,
    openingBalance: openingBalanceMatch
      ? cleanAmount(openingBalanceMatch[1])
      : null,
  };
}
