// Download data as JSON file
export const downloadJSON = (data, fileName) => {
  if (!data) return

  const dataStr = JSON.stringify(data, null, 2)
  const blob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `statement-${fileName.replace(".pdf", "")}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Download raw text file
export const downloadRawText = (rawText, fileName) => {
  if (!rawText) return

  const blob = new Blob([rawText], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `statement-${fileName.replace(".pdf", "")}-raw.txt`
  link.click()
  URL.revokeObjectURL(url)
}

// Download CSV file
export const downloadCSV = (data, fileName) => {
  if (!data) return

  const headers = [
    "Customer Name",
    "Card Issuer",
    "Card Last 4",
    "Billing Cycle",
    "Payment Due",
    "Total Amount Due",
    "Credit Limit",
    "Available Credit",
  ]

  const values = [
    data.customerName || "Not Detected",
    data.cardIssuer || "Not Detected",
    data.cardLast4 || "Not Detected",
    data.billingCycle || "Not Detected",
    data.dueDate || "Not Detected",
    data.totalDue || "Not Detected",
    data.creditLimit || "Not Detected",
    data.availableCredit || "Not Detected",
  ]

  const csvContent = [headers.join(","), values.map((v) => `"${v}"`).join(",")].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `statement-${fileName.replace(".pdf", "")}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Download batch CSV file for multiple statements
export const downloadBatchCSV = (dataArray, fileName = "batch-statements") => {
  if (!dataArray || dataArray.length === 0) return

  const headers = [
    "File Name",
    "Customer Name",
    "Card Issuer",
    "Card Last 4",
    "Billing Cycle",
    "Payment Due",
    "Total Amount Due",
    "Credit Limit",
    "Available Credit",
  ]

  const rows = dataArray.map((item) => {
    const values = [
      item.fileName || "Unknown",
      item.customerName || "Not Detected",
      item.cardIssuer || "Not Detected",
      item.cardLast4 || "Not Detected",
      item.billingCycle || "Not Detected",
      item.dueDate || "Not Detected",
      item.totalDue || "Not Detected",
      item.creditLimit || "Not Detected",
      item.availableCredit || "Not Detected",
    ]
    return values.map((v) => `"${v}"`).join(",")
  })

  const csvContent = [headers.join(","), ...rows].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${fileName}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
