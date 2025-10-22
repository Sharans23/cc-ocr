export const preprocessImage = (context, canvas) => {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Apply grayscale conversion with enhanced contrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Convert to grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b

    // Apply contrast enhancement
    const contrast = 1.5
    const enhanced = (gray - 128) * contrast + 128

    // Clamp values
    const final = Math.max(0, Math.min(255, enhanced))

    data[i] = data[i + 1] = data[i + 2] = final
  }

  context.putImageData(imageData, 0, 0)
  return canvas
}
