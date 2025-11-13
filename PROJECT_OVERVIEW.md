

# Edge Detection Viewer – Web Version

A lightweight web application that performs real-time edge detection using a webcam. The project runs fully in the browser and uses both Canvas (CPU) and WebGL (GPU) for processing. It covers camera capture, frame processing, GPU rendering, and a simple viewer interface.

GitHub: [https://github.com/akash15072004](https://github.com/akash15072004)

---

## Tech Used

React with TypeScript
Vite
Tailwind CSS
Canvas API for CPU processing
WebGL with basic GLSL shaders
MediaStream API (getUserMedia)
Canny edge detection and Sobel operator

---

## Project Structure

```
/src
  /components
    ImageUploader.tsx        // Upload image + webcam input
    EdgeDetectionViewer.tsx  // Processing and render modes
    StatsPanel.tsx           // FPS and processing time
  /utils
    edgeDetection.ts         // Canny algorithm (CPU)
    webglRenderer.ts         // WebGL processing
  App.tsx
  main.tsx
  index.css
  /lib
```

---

## Main Features

Webcam input with getUserMedia
Canny edge detection implemented in TypeScript
GPU rendering using WebGL shaders
Viewer with Original, Processed, and Split modes
CPU/GPU mode switch
Threshold sliders
Live stats for FPS and processing time

---

## Limitations

Browser-only with no backend
Performance depends on browser and GPU
Large images may process slower on CPU
No support for video file uploads
No Android/OpenCV native integration

---

## How It Works

Camera:
MediaStream → Video → Canvas → frame buffer

CPU path:
Canvas → Canny steps (blur, grayscale, Sobel, NMS, hysteresis)

GPU path:
Texture upload → WebGL shader → output

State:
Handled entirely with React hooks

---

## Comparison With Android

Camera2 API → MediaStream
OpenCV C++ → Canvas + TypeScript
OpenGL ES → WebGL
System.nanoTime → performance.now

---

## Future Improvements

WebSocket support for external frame streaming
Higher FPS with Web Workers
Additional shader effects
Video upload and processing
Export options for images or recordings
Profiling charts for CPU and GPU
Multi-camera selection
PWA support
Testing setup for components and logic


