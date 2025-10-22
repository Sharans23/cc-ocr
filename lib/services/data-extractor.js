import { ISSUER_PATTERNS } from "../constants/extraction-patterns";
import { detectCurrency } from "../utils/text-processing";

// Extract customer name - look for name at top of document
const extractCustomerName = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Strategy 1: ICICI format - "MR SACHIN NARAYAN KUMBHAR" at top (first 10 lines)
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    // Check for MR/MS/MRS prefix followed by all caps name
    const titleMatch = line.match(/^((?:MR|MS|MRS|DR)\.?\s+[A-Z][A-Z\s]+?)$/);
    if (titleMatch && titleMatch[1]) {
      const name = titleMatch[1].replace(/\s+/g, " ").trim();
      const words = name.split(/\s+/);
      // Name should be 3-6 words (including title), 15-60 chars
      if (
        words.length >= 3 &&
        words.length <= 6 &&
        name.length >= 15 &&
        name.length <= 60
      ) {
        // Skip if it looks like a header or bank name
        if (
          !/CREDIT|CARD|STATEMENT|BANK|ICICI|HDFC|DOWNLOAD|VIEW/i.test(name)
        ) {
          console.log("[v0] Found ICICI name:", name);
          return name;
        }
      }
    }
  }

  // Strategy 2: HDFC format - "Name : MURALI KRISHNA VARIKUTI"
  const nameMatch = text.match(
    /Name\s*:\s*([A-Z][A-Z\s]+?)(?=\s+Statement|\s+Email|\s*\n)/i
  );
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    const words = name.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 5 &&
      name.length >= 5 &&
      name.length <= 50
    ) {
      if (
        !/STATEMENT|DUPLICATE|CHENNAI|MUMBAI|DELHI|BANGALORE|CARD|BANK|CREDIT/i.test(
          name
        )
      ) {
        console.log("[v0] Found HDFC name:", name);
        return name;
      }
    }
  }

  // Strategy 3: IDFC format - Name after "jelect" or other markers, before address
  // Look for pattern: "jelect	Ved Prakash	H-no-"
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    // IDFC has name in Title Case (Ved Prakash) after "jelect" and before address
    const idfcNameMatch = line.match(
      /jelect\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+[HhFf]-?[Nn]o/i
    );
    if (idfcNameMatch && idfcNameMatch[1]) {
      const name = idfcNameMatch[1].trim();
      if (name.length >= 5 && name.length <= 50) {
        console.log("[v0] Found IDFC name (jelect pattern):", name);
        return name;
      }
    }

    // Alternative: Look for Title Case name between markers and address
    const parts = line.split(/\t+/);
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j].trim();
      // Title Case name pattern (2-4 words)
      if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(part)) {
        const nextPart = j + 1 < parts.length ? parts[j + 1] : "";
        // Check if next part looks like an address
        if (
          nextPart &&
          /[Hh]-?[Nn]o|[Ff]lat|address|colony|road/i.test(nextPart)
        ) {
          if (!/Bank|IDFC|Credit|Card|Statement|First/i.test(part)) {
            console.log("[v0] Found IDFC name (Title Case):", part);
            return part;
          }
        }
      }
    }
  }

  // Strategy 4: Axis Bank format - All caps name before address (typically line 2-4)
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";

    // Look for all-caps name (2-4 words) followed by address indicators
    if (/^[A-Z][A-Z\s]+$/.test(line)) {
      const words = line.split(/\s+/);
      if (
        words.length >= 2 &&
        words.length <= 4 &&
        line.length >= 8 &&
        line.length <= 50
      ) {
        // Check if next line looks like an address (has numbers, common address words)
        if (
          nextLine &&
          /\d+|FLAT|FLOOR|APPARTMENT|APARTMENT|COLONY|ROAD|STREET|NEAR|BUILDING/i.test(
            nextLine
          )
        ) {
          if (
            !/STATEMENT|DUPLICATE|CARD|BANK|CREDIT|AXIS|ICICI|HDFC|IDFC|SUMMARY|PAYMENT|ZONE|ALWAYS|YOU|FIRST/i.test(
              line
            )
          ) {
            console.log("[v0] Found Axis name (before address):", line.trim());
            return line.trim();
          }
        }
      }
    }
  }

  // Strategy 5: Look for all-caps name (2-5 words) before Email or Address
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";

    if (/^[A-Z][A-Z\s]+$/.test(line)) {
      const words = line.split(/\s+/);
      if (
        words.length >= 2 &&
        words.length <= 5 &&
        line.length >= 10 &&
        line.length <= 50
      ) {
        if (nextLine && /Email|Address|Card|POWER|RAHUL/i.test(nextLine)) {
          if (!/STATEMENT|DUPLICATE|CARD|BANK|CREDIT|HOFC|ICICI/i.test(line)) {
            return line.trim();
          }
        }
      }
    }
  }

  // Strategy 6: Look for Title Case name
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    const match = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length >= 5 && name.length <= 50) {
        return name;
      }
    }
  }

  return null;
};

// Extract card last 4 digits
const extractCardLast4 = (text) => {
  // IDFC Bank specific patterns first
  const idfcPatterns = [
    // "Card Number: XXXX 9058" format
    /Card\s+Number\s*:\s*X+\s*(\d{4})/i,
    /Card\s+Number\s*:\s*XXXX\s*(\d{4})/i,
  ];

  for (const pattern of idfcPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const last4 = match[1];
      const num = Number.parseInt(last4);
      if (num < 2000 || num > 2030) {
        console.log("[v0] Found IDFC card last 4:", last4);
        return last4;
      }
    }
  }

  // Axis Bank specific patterns
  const axisPatterns = [
    // "451457******0446" format
    /\b\d{6}\*+(\d{4})\b/,
    // "Card No: 451457******0446" format
    /Card\s*No\s*:\s*\d{6}\*+(\d{4})/i,
  ];

  for (const pattern of axisPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const last4 = match[1];
      const num = Number.parseInt(last4);
      // Verify it's not a year
      if (num < 2000 || num > 2030) {
        console.log("[v0] Found Axis card last 4:", last4);
        return last4;
      }
    }
  }

  // ICICI specific patterns
  const iciciPatterns = [
    // "0000XXXXXXXX6647" format
    /\b\d{4}X+(\d{4})\b/,
    /\b0000X+(\d{4})\b/,
  ];

  for (const pattern of iciciPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const last4 = match[1];
      const num = Number.parseInt(last4);
      if (num < 2000 || num > 2030) {
        return last4;
      }
    }
  }

  // HDFC specific patterns
  const hdfcPatterns = [
    // "Card No: 4893 77XX XXXX 2950"
    /Card\s*No\s*:\s*\d{4}\s+\d{0,2}X+\s+X+\s+(\d{4})/i,
    /Card\s*No\s*:\s*\d{4}\s+[\dX]{2,4}\s+X{4}\s+(\d{4})/i,
  ];

  for (const pattern of hdfcPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // General patterns
  const patterns = [
    /Card\s*(?:No|Number)\s*[:\s]\s*(?:\d{4}[\s\-X*x#¥]+){3}(\d{4})/i,
    /(\d{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(\d{4})/i,
    /(?:X{4}|x{4}|\*{4}|#{4}|¥{4}|\d{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(?:X{4}|x{4}|\*{4}|#{4}|¥{4})[\s\-X*x#¥]+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const last4 = match[match.length - 1];
      if (/^\d{4}$/.test(last4)) {
        const num = Number.parseInt(last4);
        if (num < 2000 || num > 2030) {
          return last4;
        }
      }
    }
  }

  return null;
};

// Extract dates with more flexible matching
const extractDate = (text, labels) => {
  for (const label of labels) {
    // Pattern 1: Axis Bank table format - look for date in header row
    // "Payment Due Date	09/10/2023" or on next line after header
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (new RegExp(label, "i").test(lines[i])) {
        // Check same line first for date after the label
        const sameLine = lines[i];
        const sameLineMatch = sameLine.match(/(\d{2}\/\d{2}\/\d{4})/g);
        if (sameLineMatch && sameLineMatch.length > 0) {
          // For Axis: if multiple dates on same line, need to determine which column
          // "Payment Due Date	Statement Generation Date" -> next line has dates
          // So check next line
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextLineDates = nextLine.match(/(\d{2}\/\d{2}\/\d{4})/g);
            if (nextLineDates && nextLineDates.length > 0) {
              // Count position of label in header
              const headerParts = sameLine.split(/\t+/);
              const labelIndex = headerParts.findIndex((part) =>
                new RegExp(label, "i").test(part)
              );

              if (labelIndex >= 0 && nextLineDates[labelIndex]) {
                console.log(
                  `[v0] Found Axis date for ${label} (column ${labelIndex}):`,
                  nextLineDates[labelIndex]
                );
                return nextLineDates[labelIndex];
              }

              // Fallback: if we can't determine column, use first date for "Payment Due Date"
              if (
                /Payment\s+Due\s+Date/i.test(label) &&
                nextLineDates.length >= 2
              ) {
                // Payment Due Date is typically after Statement Period in Axis format
                console.log(
                  `[v0] Found Axis Payment Due Date:`,
                  nextLineDates[0]
                );
                return nextLineDates[0];
              }
            }
          }
        }

        // Check next few lines for a date
        for (let j = i; j < Math.min(i + 3, lines.length); j++) {
          // HDFC format: DD/MM/YYYY
          const numericDateMatch = lines[j].match(/(\d{2}\/\d{2}\/\d{4})/);
          if (numericDateMatch) {
            return numericDateMatch[1];
          }

          // ICICI format: "November 21, 2021" or "December 9, 2021"
          const textDateMatch = lines[j].match(
            /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/
          );
          if (textDateMatch) {
            return textDateMatch[1];
          }
        }
      }
    }

    // Pattern 2: Simple pattern for label and date on same line
    const axisTablePattern = new RegExp(
      label + String.raw`[^\d]*(\d{2}\/\d{2}\/\d{4})`,
      "i"
    );
    const axisMatch = text.match(axisTablePattern);
    if (axisMatch && axisMatch[1]) {
      console.log(`[v0] Found date for ${label}:`, axisMatch[1]);
      return axisMatch[1];
    }

    // Pattern 3: Label and date on same line
    const patterns = [
      // Text date format (ICICI)
      new RegExp(
        label + String.raw`\s*[:\s]\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})`,
        "i"
      ),
      // Numeric format (HDFC)
      new RegExp(
        label + String.raw`\s*[:\s]\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})`,
        "i"
      ),
      new RegExp(label + String.raw`\s+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})`, "i"),
      // Alternative text format
      new RegExp(
        label + String.raw`\s*[:\s]\s*(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})`,
        "i"
      ),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  return null;
};

// Extract amounts with more flexible matching
const extractAmount = (text, labels) => {
  // Declare lines once at the top of the function to avoid redeclaration
  const lines = text.split("\n");

  for (const label of labels) {
    // Axis Bank specific handling
    if (
      label === "Total Payment Due" ||
      label === "Total Amount Due" ||
      label === "Total Due"
    ) {
      // Axis: "Total Payment Due	Minimum Payment Due	Statement Period	Payment Due Date	Statement Generation Date
      //       235,103.73 Dr	11,756.00 Dr	..."
      // Look for amount followed by "Dr" in table format
      const axisTableMatch = text.match(
        /Total\s+Payment\s+Due\s+Minimum\s+Payment\s+Due[^\d]+([\d,]+\.?\d*)\s+Dr/i
      );
      if (axisTableMatch && axisTableMatch[1]) {
        console.log("[v0] Found Axis Total Due (table):", axisTableMatch[1]);
        return axisTableMatch[1];
      }

      // Try line-by-line for Axis format
      for (let i = 0; i < lines.length; i++) {
        if (/Total\s+Payment\s+Due\s+Minimum\s+Payment\s+Due/i.test(lines[i])) {
          // Next line should have amounts
          if (i + 1 < lines.length) {
            const amountMatch = lines[i + 1].match(/([\d,]+\.?\d*)\s+Dr/);
            if (amountMatch && amountMatch[1]) {
              const num = Number.parseFloat(amountMatch[1].replace(/,/g, ""));
              if (!isNaN(num) && num > 0) {
                console.log(
                  "[v0] Found Axis Total Due (next line):",
                  amountMatch[1]
                );
                return amountMatch[1];
              }
            }
          }
        }
      }
    }

    if (
      label === "Minimum Payment Due" ||
      label === "Minimum Amount Due" ||
      label === "Minimum Due"
    ) {
      // Axis: "235,103.73 Dr	11,756.00 Dr" - second amount is minimum
      const axisTableMatch = text.match(
        /Total\s+Payment\s+Due\s+Minimum\s+Payment\s+Due[^\d]+[\d,]+\.?\d*\s+Dr\s+([\d,]+\.?\d*)\s+Dr/i
      );
      if (axisTableMatch && axisTableMatch[1]) {
        console.log("[v0] Found Axis Minimum Due (table):", axisTableMatch[1]);
        return axisTableMatch[1];
      }

      // Try line-by-line
      for (let i = 0; i < lines.length; i++) {
        if (/Total\s+Payment\s+Due\s+Minimum\s+Payment\s+Due/i.test(lines[i])) {
          if (i + 1 < lines.length) {
            // Look for two amounts with Dr, take the second one
            const amountsMatch = lines[i + 1].match(
              /([\d,]+\.?\d*)\s+Dr\s+([\d,]+\.?\d*)\s+Dr/
            );
            if (amountsMatch && amountsMatch[2]) {
              console.log(
                "[v0] Found Axis Minimum Due (next line):",
                amountsMatch[2]
              );
              return amountsMatch[2];
            }
          }
        }
      }

      // HDFC: Look for the pattern: date followed by 2 amounts (take second)
      const hdfcMatch = text.match(
        /(\d{2}\/\d{2}\/\d{4})\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/
      );
      if (hdfcMatch && hdfcMatch[3]) {
        const amount = hdfcMatch[3].replace(/,/g, "");
        const num = Number.parseFloat(amount);
        if (!isNaN(num) && num > 0 && num < 10000000) {
          return hdfcMatch[3];
        }
      }

      // ICICI: "Minimum Amount due   73,110.00"
      const iciciMatch = text.match(/Minimum\s+Amount\s+due\s+([\d,]+\.?\d*)/i);
      if (iciciMatch && iciciMatch[1]) {
        const amount = iciciMatch[1].replace(/,/g, "");
        const num = Number.parseFloat(amount);
        if (!isNaN(num) && num > 0) {
          return iciciMatch[1];
        }
      }
    }

    if (label === "Available Credit Limit" || label === "Available Credit") {
      // Axis: "Available Credit Limit" followed by amount
      // "Credit Limit	Available Credit Limit	Available Cash Limit
      //  240,000.00	4,896.27"
      for (let i = 0; i < lines.length; i++) {
        if (
          /Credit\s+Limit\s+Available\s+Credit\s+Limit\s+Available\s+Cash\s+Limit/i.test(
            lines[i]
          )
        ) {
          // Next line should have amounts
          if (i + 1 < lines.length) {
            const amounts = lines[i + 1].match(/([\d,]+\.?\d*)/g);
            if (amounts && amounts.length >= 2) {
              // Second amount is Available Credit Limit
              const secondAmount = amounts[1];
              const num = Number.parseFloat(secondAmount.replace(/,/g, ""));
              if (!isNaN(num) && num >= 0) {
                console.log(
                  "[v0] Found Axis Available Credit (line):",
                  secondAmount
                );
                return secondAmount;
              }
            }
          }
        }
      }

      // HDFC: Look for: Credit Limit   Available Credit Limit   Available Cash Limit
      const hdfcMatch = text.match(
        /(\d{1,3}(?:,\d{2,3})*)\s+(\d{1,3}(?:,\d{2,3})*)\s+[\d,]+\.?\d*/
      );
      if (hdfcMatch && hdfcMatch[2]) {
        const amount = hdfcMatch[2].replace(/,/g, "");
        const num = Number.parseFloat(amount);
        if (!isNaN(num) && num > 10000) {
          return hdfcMatch[2];
        }
      }

      // ICICI: "Available Credit (including cash)   72,806.92"
      // Try multiple patterns
      const iciciPatterns = [
        /Available\s+Credit\s+[Ii]ncluding\s+cash\)\s+([\d,]+\.?\d*)/i,
        /Available\s+Credit\s+\([Ii]ncluding\s+cash\)\s+([\d,]+\.?\d*)/i,
        /Available\s+Credit\s+[Ii]ncluding\s+cash[^\d]+([\d,]+\.?\d*)/i,
      ];

      for (const pattern of iciciPatterns) {
        const iciciMatch = text.match(pattern);
        if (iciciMatch && iciciMatch[1]) {
          console.log("[v0] Found ICICI Available Credit:", iciciMatch[1]);
          return iciciMatch[1];
        }
      }

      // Scan line by line for ICICI format
      for (let i = 0; i < lines.length; i++) {
        if (/Available\s+Credit\s+[Ii]ncluding\s+cash/i.test(lines[i])) {
          // Check same line for amount after the label
          const amountMatch = lines[i].match(
            /Available\s+Credit\s+[Ii]ncluding\s+cash[^\d]+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/
          );
          if (amountMatch && amountMatch[1]) {
            console.log(
              "[v0] Found ICICI Available Credit (line):",
              amountMatch[1]
            );
            return amountMatch[1];
          }
        }
      }
    }

    if (
      label === "Credit Limit (Including cash)" ||
      label === "Credit Limit" ||
      label === "Total Credit Limit"
    ) {
      // Axis: "Credit Limit	Available Credit Limit	Available Cash Limit
      //       240,000.00	4,896.27"
      // Need to find the line with header, then get first amount on next line
      for (let i = 0; i < lines.length; i++) {
        if (
          /Credit\s+Limit\s+Available\s+Credit\s+Limit\s+Available\s+Cash\s+Limit/i.test(
            lines[i]
          )
        ) {
          // Next line should have amounts separated by tabs
          if (i + 1 < lines.length) {
            const amounts = lines[i + 1].match(/([\d,]+\.?\d*)/g);
            if (amounts && amounts.length >= 2) {
              // First amount is Credit Limit, skip if it looks like card number
              const firstAmount = amounts[0];
              const num = Number.parseFloat(firstAmount.replace(/,/g, ""));
              // Verify it's not a card number (6 digits with no comma/decimal) and is reasonable credit limit
              if (firstAmount.includes(",") || firstAmount.includes(".")) {
                if (!isNaN(num) && num >= 10000 && num <= 10000000) {
                  console.log(
                    "[v0] Found Axis Credit Limit (line):",
                    firstAmount
                  );
                  return firstAmount;
                }
              } else if (
                !isNaN(num) &&
                num >= 10000 &&
                num <= 10000000 &&
                firstAmount.length <= 7
              ) {
                console.log(
                  "[v0] Found Axis Credit Limit (line):",
                  firstAmount
                );
                return firstAmount;
              }
            }
          }
        }
      }

      // ICICI: "Credit Limit (Including cash)   265,000.00" in STATEMENT SUMMARY section
      // Look for it in the line with multiple amounts
      const iciciSummaryMatch = text.match(
        /Credit\s+Limit\s+[Ii]ncluding\s+cash\)\s+Available\s+Credit[^0-9]+([\d,]+\.?\d*)/i
      );
      if (iciciSummaryMatch && iciciSummaryMatch[1]) {
        console.log(
          "[v0] Found ICICI Credit Limit (summary):",
          iciciSummaryMatch[1]
        );
        return iciciSummaryMatch[1];
      }

      // ICICI: "Credit Limit (Including cash)   265,000.00" in CREDIT SUMMARY table
      const iciciTableMatch = text.match(
        /Credit\s+Limit\s+\([Ii]ncluding\s+cash\)\s+Available\s+Credit[^0-9]+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
      );
      if (iciciTableMatch && iciciTableMatch[1]) {
        console.log(
          "[v0] Found ICICI Credit Limit (table):",
          iciciTableMatch[1]
        );
        return iciciTableMatch[1];
      }

      // Try to find after "Credit Limit Including cash)"
      for (let i = 0; i < lines.length; i++) {
        if (/Credit\s+Limit\s+[Ii]ncluding\s+cash/i.test(lines[i])) {
          // Check this line and next line for amount
          for (let j = i; j < Math.min(i + 2, lines.length); j++) {
            // Look for first large amount (> 100,000)
            const amountMatch = lines[j].match(
              /(\d{1,3}(?:,\d{3})+(?:\.\d{2})?)/
            );
            if (amountMatch) {
              const num = Number.parseFloat(amountMatch[1].replace(/,/g, ""));
              if (num > 100000) {
                console.log(
                  "[v0] Found ICICI Credit Limit (line scan):",
                  amountMatch[1]
                );
                return amountMatch[1];
              }
            }
          }
        }
      }
    }

    // Special handling for HDFC table format
    if (label === "Total Dues") {
      // Look for the pattern: date followed by 2 amounts
      const match = text.match(
        /(\d{2}\/\d{2}\/\d{4})\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/
      );
      if (match && match[2]) {
        const amount = match[2].replace(/,/g, "");
        const num = Number.parseFloat(amount);
        if (!isNaN(num) && num > 0 && num < 10000000) {
          return match[2];
        }
      }
    }

    // Special handling for ICICI format
    if (label === "Total Amount due" || label === "Total Amount Due") {
      // ICICI: "Total Amount due   762,193.08"
      const iciciMatch = text.match(/Total\s+Amount\s+due\s+([\d,]+\.?\d*)/i);
      if (iciciMatch && iciciMatch[1]) {
        const amount = iciciMatch[1].replace(/,/g, "");
        const num = Number.parseFloat(amount);
        if (!isNaN(num) && num > 0) {
          return iciciMatch[1];
        }
      }
    }

    // Pattern 1: Label on one line, amount on next (table format)
    for (let i = 0; i < lines.length - 1; i++) {
      if (new RegExp(label, "i").test(lines[i])) {
        // Check next few lines for amount
        for (let j = i; j < Math.min(i + 3, lines.length); j++) {
          const amountMatch = lines[j].match(
            /(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/
          );
          if (amountMatch) {
            const amount = amountMatch[1].replace(/,/g, "");
            const num = Number.parseFloat(amount);
            if (!isNaN(num) && num > 0) {
              return amountMatch[1]; // Return with commas
            }
          }
        }
      }
    }

    // Pattern 2: Label and amount on same line
    const patterns = [
      new RegExp(
        label +
          String.raw`\s*[:\s]\s*(?:Rs\.?|INR|₹|¥|{)?\s*([\d,]+\.?\d*)\s*(?:Dr|Cr)?`,
        "i"
      ),
      new RegExp(label + String.raw`\s+([\d,]+\.?\d*)`, "i"),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = match[1].replace(/,/g, "");
        const num = Number.parseFloat(amount);
        if (!isNaN(num) && num > 0) {
          return match[1]; // Return with commas
        }
      }
    }
  }
  return null;
};

// Extract billing cycle
const extractBillingCycle = (text) => {
  const patterns = [
    /(?:Statement\s*Period|Billing\s*(?:Cycle|Period))\s*[:\s]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /(\d{2}\/\d{2}\/\d{4})\s*(?:to|-|–)\s*(\d{2}\/\d{2}\/\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[2]) {
      return `${match[1]} to ${match[2]}`;
    }
  }

  return null;
};

// Main extraction function
export const extractDataFromText = (text) => {
  console.log("[v0] === Starting Fresh Extraction ===");
  console.log("[v0] Text length:", text.length);
  console.log("[v0] First 500 chars:", text.substring(0, 500));

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
  };

  // Detect card issuer
  for (const { pattern, name } of ISSUER_PATTERNS) {
    if (pattern.test(text)) {
      data.cardIssuer = name;
      console.log("[v0] ✓ Card Issuer:", name);
      break;
    }
  }

  // Detect currency
  const currency = detectCurrency(text);
  console.log("[v0] Currency:", currency);

  // Extract customer name
  const name = extractCustomerName(text);
  if (name) {
    data.customerName = name;
    console.log("[v0] ✓ Customer Name:", name);
  } else {
    console.log("[v0] ✗ Customer Name: Not found");
  }

  // Extract card last 4
  const last4 = extractCardLast4(text);
  if (last4) {
    data.cardLast4 = last4;
    console.log("[v0] ✓ Card Last 4:", last4);
  } else {
    console.log("[v0] ✗ Card Last 4: Not found");
  }

  // Extract statement date
  const stmtDate = extractDate(text, [
    "STATEMENT DATE",
    "Statement Date",
    "Statement Generation Date",
  ]);
  if (stmtDate) {
    data.statementDate = stmtDate;
    console.log("[v0] ✓ Statement Date:", stmtDate);
  }

  // Extract payment due date
  const dueDate = extractDate(text, [
    "Payment Due Date",
    "PAYMENT DUE DATE",
    "Due Date",
    "Pay By",
  ]);
  if (dueDate) {
    data.dueDate = dueDate;
    console.log("[v0] ✓ Due Date:", dueDate);
  } else {
    console.log("[v0] ✗ Due Date: Not found");
    // Fallback for Axis: extract directly from payment summary
    const axisDueMatch = text.match(
      /Payment\s+Due\s+Date.*?(\d{2}\/\d{2}\/\d{4})/is
    );
    if (axisDueMatch && axisDueMatch[1]) {
      data.dueDate = axisDueMatch[1];
      console.log("[v0] ✓ Due Date (fallback):", axisDueMatch[1]);
    }
  }

  // Extract billing cycle
  const cycle = extractBillingCycle(text);
  if (cycle) {
    data.billingCycle = cycle;
    console.log("[v0] ✓ Billing Cycle:", cycle);
  } else {
    console.log("[v0] ✗ Billing Cycle: Not found");
  }

  // Extract total amount due
  const total = extractAmount(text, [
    "Total Payment Due",
    "Total Amount due",
    "Total Amount Due",
    "Total Dues",
    "Total Due",
  ]);
  if (total) {
    data.totalDue = `${currency}${total}`;
    console.log("[v0] ✓ Total Due:", data.totalDue);
  } else {
    console.log("[v0] ✗ Total Due: Not found");
  }

  // Extract minimum due
  const minimum = extractAmount(text, [
    "Minimum Payment Due",
    "Minimum Amount due",
    "Minimum Amount Due",
    "Minimum Due",
  ]);
  if (minimum) {
    data.minimumDue = `${currency}${minimum}`;
    console.log("[v0] ✓ Minimum Due:", data.minimumDue);
  } else {
    console.log("[v0] ✗ Minimum Due: Not found");
  }

  // Extract credit limit
  const limit = extractAmount(text, [
    "Credit Limit (Including cash)",
    "Credit Limit",
    "Total Credit Limit",
  ]);
  if (limit && Number.parseFloat(limit.replace(/,/g, "")) >= 10000) {
    data.creditLimit = `${currency}${limit}`;
    console.log("[v0] ✓ Credit Limit:", data.creditLimit);
  } else {
    console.log("[v0] ✗ Credit Limit: Not found or invalid");
  }

  // Extract available credit
  const available = extractAmount(text, [
    "Available Credit Limit",
    "Available Credit",
  ]);
  if (available) {
    data.availableCredit = `${currency}${available}`;
    console.log("[v0] ✓ Available Credit:", data.availableCredit);
  } else {
    console.log("[v0] ✗ Available Credit: Not found");
  }

  // Extract available cash limit
  const cashLimit = extractAmount(text, ["Available Cash Limit"]);
  if (cashLimit) {
    console.log("[v0] Available Cash Limit:", cashLimit);
  }

  // Extract opening balance
  const opening = extractAmount(text, ["Opening Balance", "Previous Balance"]);
  if (opening) {
    data.openingBalance = `${currency}${opening}`;
    console.log("[v0] ✓ Opening Balance:", data.openingBalance);
  }

  console.log("[v0] === Extraction Complete ===");
  return data;
};
