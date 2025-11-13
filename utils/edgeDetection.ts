/**
 * Edge Detection Utilities
 * Implements Canny Edge Detection algorithm using Canvas API
 * This simulates the OpenCV C++ processing that would happen in native Android code
 */

/**
 * Apply Gaussian blur to reduce noise
 */
function gaussianBlur(imageData: ImageData, radius: number = 2): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data
  const output = new ImageData(width, height)
  
  // Simple box blur as approximation of Gaussian
  const kernelSize = radius * 2 + 1
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1)
          const py = Math.min(Math.max(y + ky, 0), height - 1)
          const idx = (py * width + px) * 4
          
          r += data[idx]
          g += data[idx + 1]
          b += data[idx + 2]
          count++
        }
      }
      
      const idx = (y * width + x) * 4
      output.data[idx] = r / count
      output.data[idx + 1] = g / count
      output.data[idx + 2] = b / count
      output.data[idx + 3] = 255
    }
  }
  
  return output
}

/**
 * Convert to grayscale
 */
function toGrayscale(imageData: ImageData): Uint8ClampedArray {
  const data = imageData.data
  const gray = new Uint8ClampedArray(imageData.width * imageData.height)
  
  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  
  return gray
}

/**
 * Calculate gradient magnitude and direction using Sobel operator
 */
function sobelGradient(gray: Uint8ClampedArray, width: number, height: number): {
  magnitude: Float32Array
  direction: Float32Array
} {
  const magnitude = new Float32Array(width * height)
  const direction = new Float32Array(width * height)
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx)
          const kidx = (ky + 1) * 3 + (kx + 1)
          
          gx += gray[idx] * sobelX[kidx]
          gy += gray[idx] * sobelY[kidx]
        }
      }
      
      const idx = y * width + x
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy)
      direction[idx] = Math.atan2(gy, gx)
    }
  }
  
  return { magnitude, direction }
}

/**
 * Non-maximum suppression
 */
function nonMaxSuppression(
  magnitude: Float32Array,
  direction: Float32Array,
  width: number,
  height: number
): Float32Array {
  const output = new Float32Array(width * height)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const angle = direction[idx] * (180 / Math.PI)
      const mag = magnitude[idx]
      
      // Determine neighbors based on gradient direction
      let mag1 = 0, mag2 = 0
      
      if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 || angle < -157.5)) {
        mag1 = magnitude[idx - 1]
        mag2 = magnitude[idx + 1]
      } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
        mag1 = magnitude[idx - width + 1]
        mag2 = magnitude[idx + width - 1]
      } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
        mag1 = magnitude[idx - width]
        mag2 = magnitude[idx + width]
      } else {
        mag1 = magnitude[idx - width - 1]
        mag2 = magnitude[idx + width + 1]
      }
      
      // Suppress if not local maximum
      output[idx] = (mag >= mag1 && mag >= mag2) ? mag : 0
    }
  }
  
  return output
}

/**
 * Double threshold and edge tracking by hysteresis
 */
function hysteresis(
  magnitude: Float32Array,
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number
): Uint8ClampedArray {
  const edges = new Uint8ClampedArray(width * height)
  const strong = 255
  const weak = 128
  
  // Apply double threshold
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] >= highThreshold) {
      edges[i] = strong
    } else if (magnitude[i] >= lowThreshold) {
      edges[i] = weak
    }
  }
  
  // Edge tracking by hysteresis
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      
      if (edges[idx] === weak) {
        // Check if connected to strong edge
        let hasStrongNeighbor = false
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (kx === 0 && ky === 0) continue
            const nidx = (y + ky) * width + (x + kx)
            if (edges[nidx] === strong) {
              hasStrongNeighbor = true
              break
            }
          }
          if (hasStrongNeighbor) break
        }
        
        edges[idx] = hasStrongNeighbor ? strong : 0
      }
    }
  }
  
  return edges
}

/**
 * Main Canny Edge Detection function
 * This mimics what would happen in OpenCV C++ code via JNI
 */
export function applyCannyEdgeDetection(
  canvas: HTMLCanvasElement,
  lowThreshold: number = 50,
  highThreshold: number = 150
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Cannot get canvas context")
  
  const width = canvas.width
  const height = canvas.height
  
  // Step 1: Get image data
  const imageData = ctx.getImageData(0, 0, width, height)
  
  // Step 2: Apply Gaussian blur to reduce noise
  const blurred = gaussianBlur(imageData, 2)
  
  // Step 3: Convert to grayscale
  const gray = toGrayscale(blurred)
  
  // Step 4: Calculate gradients using Sobel operator
  const { magnitude, direction } = sobelGradient(gray, width, height)
  
  // Step 5: Non-maximum suppression
  const suppressed = nonMaxSuppression(magnitude, direction, width, height)
  
  // Step 6: Double threshold and hysteresis
  const edges = hysteresis(suppressed, width, height, lowThreshold, highThreshold)
  
  // Create output canvas
  const outputCanvas = document.createElement("canvas")
  outputCanvas.width = width
  outputCanvas.height = height
  const outputCtx = outputCanvas.getContext("2d")
  if (!outputCtx) throw new Error("Cannot get output canvas context")
  
  const outputImageData = outputCtx.createImageData(width, height)
  
  // Convert edge map to RGBA (white edges on black background)
  for (let i = 0; i < edges.length; i++) {
    const value = edges[i]
    outputImageData.data[i * 4] = value
    outputImageData.data[i * 4 + 1] = value
    outputImageData.data[i * 4 + 2] = value
    outputImageData.data[i * 4 + 3] = 255
  }
  
  outputCtx.putImageData(outputImageData, 0, 0)
  
  return outputCanvas
}

/**
 * Alternative: Simple Sobel edge detection (faster but less accurate)
 */
export function applySobelEdgeDetection(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Cannot get canvas context")
  
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  
  const gray = toGrayscale(imageData)
  const { magnitude } = sobelGradient(gray, width, height)
  
  // Normalize magnitude
  let maxMag = 0
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] > maxMag) maxMag = magnitude[i]
  }
  
  const outputCanvas = document.createElement("canvas")
  outputCanvas.width = width
  outputCanvas.height = height
  const outputCtx = outputCanvas.getContext("2d")
  if (!outputCtx) throw new Error("Cannot get output canvas context")
  
  const outputImageData = outputCtx.createImageData(width, height)
  
  for (let i = 0; i < magnitude.length; i++) {
    const value = Math.min(255, (magnitude[i] / maxMag) * 255)
    outputImageData.data[i * 4] = value
    outputImageData.data[i * 4 + 1] = value
    outputImageData.data[i * 4 + 2] = value
    outputImageData.data[i * 4 + 3] = 255
  }
  
  outputCtx.putImageData(outputImageData, 0, 0)
  
  return outputCanvas
}
