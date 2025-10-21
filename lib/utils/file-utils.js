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
