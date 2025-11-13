/**
 * WebGL Rendering Utilities
 * Implements GPU-accelerated rendering using WebGL
 * This simulates the OpenGL ES rendering that would happen in Android native code
 */

/**
 * Create and compile WebGL shader
 */
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  
  return shader
}

/**
 * Create and link WebGL program
 */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null
  
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  
  return program
}

/**
 * Vertex shader - positions texture on quad
 */
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`

/**
 * Fragment shader - grayscale effect
 */
const grayscaleFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(vec3(gray), color.a);
  }
`

/**
 * Fragment shader - edge detection effect
 */
const edgeFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;
  
  void main() {
    vec2 pixel = 1.0 / u_resolution;
    
    // Sobel operator
    float tl = texture2D(u_image, v_texCoord + vec2(-pixel.x, -pixel.y)).r;
    float tm = texture2D(u_image, v_texCoord + vec2(0.0, -pixel.y)).r;
    float tr = texture2D(u_image, v_texCoord + vec2(pixel.x, -pixel.y)).r;
    float ml = texture2D(u_image, v_texCoord + vec2(-pixel.x, 0.0)).r;
    float mr = texture2D(u_image, v_texCoord + vec2(pixel.x, 0.0)).r;
    float bl = texture2D(u_image, v_texCoord + vec2(-pixel.x, pixel.y)).r;
    float bm = texture2D(u_image, v_texCoord + vec2(0.0, pixel.y)).r;
    float br = texture2D(u_image, v_texCoord + vec2(pixel.x, pixel.y)).r;
    
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;
    
    float edge = sqrt(gx*gx + gy*gy);
    gl_FragColor = vec4(vec3(edge), 1.0);
  }
`

/**
 * Fragment shader - invert colors effect
 */
const invertFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = vec4(1.0 - color.rgb, color.a);
  }
`

/**
 * WebGL Renderer class
 * This mimics OpenGL ES rendering in Android
 */
export class WebGLRenderer {
  private gl: WebGLRenderingContext
  private programs: Map<string, WebGLProgram> = new Map()
  private textures: Map<string, WebGLTexture> = new Map()
  private currentProgram: WebGLProgram | null = null
  
  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext
    if (!gl) {
      throw new Error("WebGL not supported")
    }
    this.gl = gl
    this.initializeShaders()
  }
  
  /**
   * Initialize all shader programs
   */
  private initializeShaders(): void {
    const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource)
    if (!vertexShader) throw new Error("Failed to create vertex shader")
    
    // Create grayscale program
    const grayscaleFragShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, grayscaleFragmentShader)
    if (grayscaleFragShader) {
      const program = createProgram(this.gl, vertexShader, grayscaleFragShader)
      if (program) this.programs.set("grayscale", program)
    }
    
    // Create edge detection program
    const edgeFragShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, edgeFragmentShader)
    if (edgeFragShader) {
      const program = createProgram(this.gl, vertexShader, edgeFragShader)
      if (program) this.programs.set("edge", program)
    }
    
    // Create invert program
    const invertFragShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, invertFragmentShader)
    if (invertFragShader) {
      const program = createProgram(this.gl, vertexShader, invertFragShader)
      if (program) this.programs.set("invert", program)
    }
  }
  
  /**
   * Load image as WebGL texture
   */
  loadTexture(image: HTMLImageElement | HTMLCanvasElement, name: string = "main"): void {
    const gl = this.gl
    const texture = gl.createTexture()
    if (!texture) throw new Error("Failed to create texture")
    
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    
    this.textures.set(name, texture)
  }
  
  /**
   * Render with specified shader effect
   */
  render(effect: "grayscale" | "edge" | "invert" | "original" = "original"): void {
    const gl = this.gl
    
    if (effect === "original") {
      // Simple texture render without shader effects
      gl.clear(gl.COLOR_BUFFER_BIT)
      return
    }
    
    const program = this.programs.get(effect)
    if (!program) {
      console.error(`Shader program '${effect}' not found`)
      return
    }
    
    gl.useProgram(program)
    this.currentProgram = program
    
    // Set up vertex positions
    const positions = new Float32Array([
      -1, -1,  // bottom left
       1, -1,  // bottom right
      -1,  1,  // top left
       1,  1   // top right
    ])
    
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    
    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    
    // Set up texture coordinates
    const texCoords = new Float32Array([
      0, 1,  // bottom left
      1, 1,  // bottom right
      0, 0,  // top left
      1, 0   // top right
    ])
    
    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
    
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord")
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)
    
    // Set resolution uniform (for edge detection)
    if (effect === "edge") {
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
    }
    
    // Bind texture
    const texture = this.textures.get("main")
    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      const imageLocation = gl.getUniformLocation(program, "u_image")
      gl.uniform1i(imageLocation, 0)
    }
    
    // Clear and draw
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  
  /**
   * Resize canvas and viewport
   */
  resize(width: number, height: number): void {
    this.gl.canvas.width = width
    this.gl.canvas.height = height
    this.gl.viewport(0, 0, width, height)
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.textures.forEach(texture => this.gl.deleteTexture(texture))
    this.programs.forEach(program => this.gl.deleteProgram(program))
    this.textures.clear()
    this.programs.clear()
  }
}

/**
 * Helper function to render image with WebGL effect
 */
export function renderWithWebGL(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLCanvasElement,
  effect: "grayscale" | "edge" | "invert" | "original" = "original"
): void {
  const renderer = new WebGLRenderer(canvas)
  canvas.width = image.width
  canvas.height = image.height
  renderer.resize(image.width, image.height)
  renderer.loadTexture(image)
  renderer.render(effect)
}
