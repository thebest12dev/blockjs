

import { Block } from "./block";
import { Output } from "./logger";

    
    const assetsDirt = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAIVBMVEW1tbWmpqaIh4h6j1VzhVJubW1ieUFabUFhYWFSXTlSUlICJfMUAAAAkElEQVR42gVAMQrCMBR9ujlaxNkGfyV7LiCUiGtA2qxWWrMqiBntYjs20sSsQu8pMEsbxHWzwjDnd8lbhVeqZaMjoSO7Iy8jpt69u23eYCHS8rfObkh8QtbRABadzo1qoT/SZ/I5IRzqE3sEA6ptHAu/Bw+hOvZpgiC0uJRMoTpzqSgStkQjK52B64r4bWfZH4v7LTO2BwrJAAAAAElFTkSuQmCC"
    declare const glMatrix: any;
    var paused = false
declare const vec4: any;
declare const vec3: any;
declare const mat4: any;
var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
var gl = canvas.getContext('webgl2',{ depth:true }) as any
    export class Renderer{
        private static renderer: Renderer = undefined;
        public static getRenderer() {
            if (this.renderer == undefined) {
                this.renderer = new Renderer()
                return this.renderer;
            } else {
                return this.renderer
            }
        }
        public camera = {
            position: [0, 2, 2],
            front: [0, 0, -1],
            up: [0, 1, 0],
            yaw: -90.0,
            pitch: 0.0
        };
        collision = false;
    collisionThreshold = 2.0; // Distance at which collision will be detected
   
   
   loadTexture(url: string) {
    function isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Placeholder pixel for the texture
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 0, 0, 255]);  // Red color
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    // Load the actual texture image
    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    };
    
    image.onerror = function() {
        console.error(`Failed to load texture: ${url}`);
    };
    
    image.src = url;
    return texture;
}

   // Function for occlusion culling
    isOccluded(block: { position: number[]; size: number[]; modelMatrix: any; }, viewProjectionMatrix: any,t: WebGLUniformLocation) {
       // Create the bounding box of the block
       const min = [
           block.position[0] - block.size[0] / 2,
           block.position[1] - block.size[1] / 2,
           block.position[2] - block.size[2] / 2
       ];
       const max = [
           block.position[0] + block.size[0] / 2,
           block.position[1] + block.size[1] / 2,
           block.position[2] + block.size[2] / 2
       ];
   
       // Define the eight corners of the bounding box
       const corners = [
           [min[0], min[1], min[2]],
           [max[0], min[1], min[2]],
           [min[0], max[1], min[2]],
           [max[0], max[1], min[2]],
           [min[0], min[1], max[2]],
           [max[0], min[1], max[2]],
           [min[0], max[1], max[2]],
           [max[0], max[1], max[2]]
       ];
   
       // Create an occlusion query
       const query = gl.createQuery();
       
       gl.beginQuery(gl.ANY_SAMPLES_PASSED, query);
   
       // Set up the transformation matrix
       const matrix = mat4.create();
       mat4.multiply(matrix, viewProjectionMatrix, block.modelMatrix);
   
       // Render the bounding box corners to check occlusion
       const positionBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners.flat()), gl.STATIC_DRAW);
       gl.enableVertexAttribArray(0);
       gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
       gl.uniformMatrix4fv(t, false, matrix);
       gl.drawArrays(gl.POINTS, 0, corners.length);
   
       // End the occlusion query
       gl.endQuery(gl.ANY_SAMPLES_PASSED);
   
       // Poll for query result
       function checkQueryResult() {
           if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
               const isOccluded = !gl.getQueryParameter(query, gl.QUERY_RESULT);
               // Clean up
               gl.deleteQuery(query);
               return isOccluded;
           } else {
               // Query is not yet available, retry
               requestAnimationFrame(checkQueryResult);
           }
       }
   
       return checkQueryResult();
   }
      
       startRendering() {
    
    function extractFrustumPlanes(projViewMatrix: any) {
        const planes = Array(6).fill(null).map(() => new Float32Array(4));
    
        // Left plane
        planes[0][0] = projViewMatrix[3] + projViewMatrix[0];
        planes[0][1] = projViewMatrix[7] + projViewMatrix[4];
        planes[0][2] = projViewMatrix[11] + projViewMatrix[8];
        planes[0][3] = projViewMatrix[15] + projViewMatrix[12];
    
        // Right plane
        planes[1][0] = projViewMatrix[3] - projViewMatrix[0];
        planes[1][1] = projViewMatrix[7] - projViewMatrix[4];
        planes[1][2] = projViewMatrix[11] - projViewMatrix[8];
        planes[1][3] = projViewMatrix[15] - projViewMatrix[12];
    
        // Bottom plane
        planes[2][0] = projViewMatrix[3] + projViewMatrix[1];
        planes[2][1] = projViewMatrix[7] + projViewMatrix[5];
        planes[2][2] = projViewMatrix[11] + projViewMatrix[9];
        planes[2][3] = projViewMatrix[15] + projViewMatrix[13];
    
        // Top plane
        planes[3][0] = projViewMatrix[3] - projViewMatrix[1];
        planes[3][1] = projViewMatrix[7] - projViewMatrix[5];
        planes[3][2] = projViewMatrix[11] - projViewMatrix[9];
        planes[3][3] = projViewMatrix[15] - projViewMatrix[13];
    
        // Near plane
        planes[4][0] = projViewMatrix[3] + projViewMatrix[2];
        planes[4][1] = projViewMatrix[7] + projViewMatrix[6];
        planes[4][2] = projViewMatrix[11] + projViewMatrix[10];
        planes[4][3] = projViewMatrix[15] + projViewMatrix[14];
    
        // Far plane
        planes[5][0] = projViewMatrix[3] - projViewMatrix[2];
        planes[5][1] = projViewMatrix[7] - projViewMatrix[6];
        planes[5][2] = projViewMatrix[11] - projViewMatrix[10];
        planes[5][3] = projViewMatrix[15] - projViewMatrix[14];
    
        // Normalize the planes
        for (let i = 0; i < 6; i++) {
            const length = Math.hypot(planes[i][0], planes[i][1], planes[i][2]);
            planes[i][0] /= length;
            planes[i][1] /= length;
            planes[i][2] /= length;
            planes[i][3] /= length;
        }
    
        return planes;
    }
    
    
    
    function isAABBInsideFrustum(aabb: { max: any[]; min: any[]; }, planes: Float32Array[]) {
        for (const plane of planes) {
            const [a, b, c, d] = plane;
            const positiveVertex = [
                a >= 0 ? aabb.max[0] : aabb.min[0],
                b >= 0 ? aabb.max[1] : aabb.min[1],
                c >= 0 ? aabb.max[2] : aabb.min[2]
            ];
    
            if (a * positiveVertex[0] + b * positiveVertex[1] + c * positiveVertex[2] + d < 0) {
                return false;
            }
        }
        return true;
    }
    
    // AABB calculation for Block class
    

            Output.log("Initializing WebGL renderer...", "BlockJS Renderer");
            
            
           
           function  isInViewport(block: { position: number[]; size: number[]; }, viewProjectionMatrix: any) {
               // Create the bounding box of the block
               const min = [
                   block.position[0] - block.size[0] / 2,
                   block.position[1] - block.size[1] / 2,
                   block.position[2] - block.size[2] / 2
               ];
               const max = [
                   block.position[0] + block.size[0] / 2,
                   block.position[1] + block.size[1] / 2,
                   block.position[2] + block.size[2] / 2
               ];
           
               // Define the eight corners of the bounding box
               const corners = [
                   [min[0], min[1], min[2]],
                   [max[0], min[1], min[2]],
                   [min[0], max[1], min[2]],
                   [max[0], max[1], min[2]],
                   [min[0], min[1], max[2]],
                   [max[0], min[1], max[2]],
                   [min[0], max[1], max[2]],
                   [max[0], max[1], max[2]]
               ];
           
               // Check if any of the corners are inside the frustum
               for (const corner of corners) {
                   const clipSpacePos = vec4.create();
                   vec4.transformMat4(clipSpacePos, [...corner, 1.0], viewProjectionMatrix);
                   
                   // Perform perspective divide
                   const w = clipSpacePos[3];
                   if (w !== 0) {
                       clipSpacePos[0] /= w;
                       clipSpacePos[1] /= w;
                       clipSpacePos[2] /= w;
                   }
           
                   // Check if the corner is inside the normalized device coordinates
                   if (clipSpacePos[0] >= -1 && clipSpacePos[0] <= 1 &&
                       clipSpacePos[1] >= -1 && clipSpacePos[1] <= 1 &&
                       clipSpacePos[2] >= -1 && clipSpacePos[2] <= 1) {
                       return true;
                   }
               }
           
               // If no corners are inside the frustum, the block is culled
               return false;
           }
        //    function checkCollision(camera: { position: number[]; }, element: { position: number[]; size: number[]; }, threshold: number) {
        //        // Calculate the bounding box of the element
        //        const elementMin = [
        //            element.position[0] - element.size[0] / 2,
        //            element.position[1] - element.size[1] / 2,
        //            element.position[2] - element.size[2] / 2,
        //        ];
        //        const elementMax = [
        //            element.position[0] + element.size[0] / 2,
        //            element.position[1] + element.size[1] / 2,
        //            element.position[2] + element.size[2] / 2,
        //        ];
           
        //        // Check if the Renderer.getRenderer().camera is within the bounding box + threshold
        //        if (
        //            Renderer.getRenderer().camera.position[0] >= elementMin[0] - threshold &&
        //            Renderer.getRenderer().camera.position[0] <= elementMax[0] + threshold &&
        //            Renderer.getRenderer().camera.position[2] >= elementMin[2] - threshold &&
        //            Renderer.getRenderer().camera.position[2] <= elementMax[2] + threshold
        //        ) {
        //            // Check if the Renderer.getRenderer().camera is within 2 units vertically from the object
        //            const verticalDistance = Math.abs(Renderer.getRenderer().camera.position[1] - element.position[1]);
        //            if (verticalDistance <= threshold) {
        //                return true; // Collision detected, halt gravity
        //            }
        //        }
           
        //        return false; // No collision detected
        //    }
           
        //    function checkIfInMidair(Renderer.getRenderer().camera: any, threshold: any) {
        //        for (const element of (window as any).objects) {
        //            if (checkCollision(Renderer.getRenderer().camera, element, threshold)) {
        //                return false; // Renderer.getRenderer().camera is on the ground
        //            }
        //        }
        //        return true; // Renderer.getRenderer().camera is in midair
        //    }
        
          
           if (!gl) {
            alert('Your browser does not support WebGL');
           }
           
           canvas.width = window.innerWidth;
           canvas.height = window.innerHeight;
           gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        
           gl.enable(gl.DEPTH_TEST);
           gl.enable(gl.CULL_FACE);
           gl.cullFace(gl.BACK);
           gl.frontFace(gl.CCW)
   
           // Vertex shader source code
           const vertexShaderSource = `#version 300 es

// Vertex Shader
in float vShowBorder;  
in float vBorderWidth;
in vec3 vertPosition;
in float aTextureIndex;
in vec2 aTextureCoord;
in vec3 instancePosition;
in vec3 instanceScale;
 

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
out float fShowBorder;  // Output to fragment shader
out float fBorderWidth;  // Output to fragment shader
out highp vec2 vTextureCoord;
flat out int vTextureIndex;
in float aShowBorder; // Unused but used in fragment shader

void main() {
    // Apply instance scale and position
    vec3 scaledPosition = vertPosition * instanceScale;
    vec4 worldPosition = vec4(scaledPosition + instancePosition, 1.0);

    // Transform to clip space
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    
    // Pass texture coordinates to the fragment shader
    vTextureCoord = aTextureCoord;
    vTextureIndex = int(aTextureIndex); // Pass the texture index to the fragment shader
    fShowBorder = vShowBorder;
}
`
   
           const fragmentShaderSource = `#version 300 es
precision mediump float;

in highp vec2 vTextureCoord;
in float fShowBorder;
flat in int vTextureIndex; // Assuming this is an integer
const int MAX_TEXTURES = 2;
uniform sampler2D uSamplers[MAX_TEXTURES];
uniform vec3 uFogColor;
uniform float uFogStart;
uniform float uFogEnd;

out vec4 outColor;

vec4 applyFog(vec4 color, float depth) {
    float fogFactor = clamp((depth - uFogStart) / (uFogEnd - uFogStart), 0.0, 1.0);
    return mix(color, vec4(uFogColor, 1.0), fogFactor);
}

void main() {
    // for now
    vec4 texColor = texture(uSamplers[0], vTextureCoord); // Cast textureIndex to float
    if (vTextureIndex == 1) {
        texColor = texture(uSamplers[1], vTextureCoord);
    }
    

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    vec4 finalColor = applyFog(texColor, depth);

    if (fShowBorder == 1.0f) {
        ivec2 texSize = textureSize(uSamplers[0],0); // Use uSamplerArray here as well
        if (vTextureIndex == 1) {
             texSize = textureSize(uSamplers[1],0); // Use uSamplerArray here as well
        }
        vec2 distToEdge = min(vTextureCoord, 1.0 - vTextureCoord) * vec2(texSize);
        if (any(lessThan(distToEdge, vec2(0.25)))) {
            finalColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    outColor = finalColor;
}
           `;
  
   
           // Compile vertex shader
           const vertexShader = gl.createShader(gl.VERTEX_SHADER);
           gl.shaderSource(vertexShader, vertexShaderSource);
           gl.compileShader(vertexShader);
           if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
               console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
               ;
           }
   
           // Compile fragment shader
           const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
           gl.shaderSource(fragmentShader, fragmentShaderSource);
           gl.compileShader(fragmentShader);
           
           if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
               console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
               ;
           }
   
           // Create shader program
           const shaderProgram = gl.createProgram();
           gl.attachShader(shaderProgram, vertexShader);
           gl.attachShader(shaderProgram, fragmentShader);
           gl.linkProgram(shaderProgram);
           if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
               console.error('ERROR linking program!', gl.getProgramInfoLog(shaderProgram));
               ;
           }
           gl.useProgram(shaderProgram);
           
        //    const vertexShaderS = gl.createShader(gl.VERTEX_SHADER);
        //    gl.shaderSource(vertexShaderS, skyboxVsource);
        //    gl.compileShader(vertexShaderS);
        //    if (!gl.getShaderParameter(vertexShaderS, gl.COMPILE_STATUS)) {
        //        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShaderS));
        //        ;
        //    }
   
        //    // Compile fragment shader
        //    const fragmentShaderS = gl.createShader(gl.FRAGMENT_SHADER);
        //    gl.shaderSource(fragmentShaderS, skyboxFsource);
        //    gl.compileShader(fragmentShaderS);
           
        //    if (!gl.getShaderParameter(fragmentShaderS, gl.COMPILE_STATUS)) {
        //        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShaderS));
        //        ;
        //    }
   
        //    // Create shader program
        //    const shaderProgramS = gl.createProgram();
        //    gl.attachShader(shaderProgramS, vertexShaderS);
        //    gl.attachShader(shaderProgramS, fragmentShaderS);
        //    gl.linkProgram(shaderProgramS);
        //    if (!gl.getProgramParameter(shaderProgramS, gl.LINK_STATUS)) {
        //        console.error('ERROR linking program!', gl.getProgramInfoLog(shaderProgramS));
        //        ;
         //  }
           
         
   
           // Set up the Renderer.getRenderer().camera
           
           // ... Get uniform block index and binding point
// const uboIndex = gl.getUniformBlockIndex(shaderProgram, "uboTextureUnits");
// const bindingPoint = 0; // Choose a binding point
// gl.uniformBlockBinding(shaderProgram, uboIndex, bindingPoint);

// // ... Create the UBO buffer
// const uboBuffer = gl.createBuffer();
// gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer);
// gl.bufferData(gl.UNIFORM_BUFFER, new Int32Array([0, 1]), gl.DYNAMIC_DRAW); // Fill with data

// // ... Bind the UBO to the binding point
// gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, uboBuffer);

// ... In your rendering loop, update the UBO if needed:
// gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer);
// gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Int32Array([/* ... new indices ... */]));

// ... Set the vTextureUnitIndex attribute for each vertex
// (This depends on how you're managing your vertex data)

// ... Draw your geometry
   
           let keys: any = {};
           let lastX = canvas.width / 2;
           let lastY = canvas.height / 2;
       
           let firstMouse = true;
           window.addEventListener('keydown', (event) => {
               
               
               keys[event.key] = true;
               
           });
           
           window.addEventListener('keyup', (event) => {
               keys[event.key] = false;
           });
   
           canvas.requestPointerLock = canvas.requestPointerLock
           canvas.addEventListener('click', () => {
               canvas.requestPointerLock();
           });
   
           document.addEventListener('pointerlockchange', pointerLockChange, false);
           document.addEventListener('mozpointerlockchange', pointerLockChange, false);
           document.getElementById("9a").addEventListener("mousedown",async(e) => {
             await canvas.requestPointerLock();
             document.getElementById("pauseButtons").setAttribute("_2","");
             paused = false
           })
           function pointerLockChange() {
               if (document.pointerLockElement === canvas) {
                   paused = false
                   document.addEventListener("mousemove", handleMouseMove, false);
                   document.getElementById("pauseButtons").setAttribute("_2","");

               } else {
                   paused = true
                   document.removeEventListener("mousemove", handleMouseMove, false);
                   document.getElementById("pauseButtons").removeAttribute("_2")
               }
           }
   
           function handleMouseMove(event: { clientX: number; clientY: number; movementX: any; movementY: number; }) {
               if (firstMouse) {
                   lastX = event.clientX;
                   lastY = event.clientY;
                   firstMouse = false;
               }
   
               let xOffset = event.movementX;
               let yOffset = -event.movementY;
   
               const sensitivity = 0.1;
               xOffset *= sensitivity;
               yOffset *= sensitivity;
   
               Renderer.getRenderer().camera.yaw += xOffset;
               Renderer.getRenderer().camera.pitch += yOffset;
   
               if (Renderer.getRenderer().camera.pitch > 89.0) Renderer.getRenderer().camera.pitch = 89.0;
               if (Renderer.getRenderer().camera.pitch < -89.0) Renderer.getRenderer().camera.pitch = -89.0;
   
               const front = [
                   Math.cos(glMatrix.toRadian(Renderer.getRenderer().camera.yaw)) * Math.cos(glMatrix.toRadian(Renderer.getRenderer().camera.pitch)),
                   Math.sin(glMatrix.toRadian(Renderer.getRenderer().camera.pitch)),
                   Math.sin(glMatrix.toRadian(Renderer.getRenderer().camera.yaw)) * Math.cos(glMatrix.toRadian(Renderer.getRenderer().camera.pitch))
               ];
               vec3.normalize(Renderer.getRenderer().camera.front, front); // Correcting the function call
           }
           
           
           function updateCamera(self: Renderer) {
            
               const cameraSpeed = 0.25;
               if (keys["t"] || keys["T"]) {
                   paused = true
                   if (document.getElementById('titleScreen').getAttribute("_2") == "") {
                       document.getElementById('chatInput').removeAttribute("_2")
                       document.getElementById('chatInput').focus()
                   }
                  
               }
               // if (keys['w']) {
               //     vec3.scaleAndAdd(Renderer.getRenderer().camera.position, Renderer.getRenderer().camera.position, Renderer.getRenderer().camera.front, this.cameraSpeed);
               // }
            
               if (!paused) {
                
                   if (keys['w']) {
                       // Calculate the forward direction with y fixed to 0
                       let forward = vec3.clone(self.camera.front);
                       forward[1] = 0; // Zero out the y component
                       vec3.normalize(forward, forward); // Normalize to maintain unit direction
                   
                       // Move the Renderer.getRenderer().camera position forward along the x and z axes
                       vec3.scaleAndAdd(self.camera.position, self.camera.position, forward, cameraSpeed);
                   }
                   
                   if (keys['s']) {
                       // Calculate the forward direction with y fixed to 0
                       let forward = vec3.clone(self.camera.front);
                       forward[1] = 0; // Zero out the y component
                       vec3.normalize(forward, forward); // Normalize to maintain unit direction
                   
                       // Move the Renderer.getRenderer().camera position forward along the x and z axes
                       vec3.scaleAndAdd(self.camera.position, self.camera.position, forward, -cameraSpeed);
                   }
                   if (keys['a']) {
                       const right = vec3.create();
                       vec3.cross(right,self.camera.front, self.camera.up);
                       vec3.normalize(right, right);
                       vec3.scaleAndAdd(self.camera.position, self.camera.position, right, -cameraSpeed);
                   }
                   if (keys['d']) {
                       const right = vec3.create();
                       vec3.cross(right, self.camera.front, self.camera.up);
                       vec3.normalize(right, right);
                       vec3.scaleAndAdd(self.camera.position, self.camera.position, right, cameraSpeed);
                   }
                   if (keys['Shift']) {
                    self.camera.position[1] -= cameraSpeed
                }
                if (keys[' ']) {
                    self.camera.position[1] += cameraSpeed
                }
               }
            
            
               const viewMatrix = mat4.create();
               mat4.lookAt(viewMatrix, Renderer.getRenderer().camera.position, [
                   Renderer.getRenderer().camera.position[0] + Renderer.getRenderer().camera.front[0],
                   Renderer.getRenderer().camera.position[1] + Renderer.getRenderer().camera.front[1],
                   Renderer.getRenderer().camera.position[2] + Renderer.getRenderer().camera.front[2]
               ], Renderer.getRenderer().camera.up);
   
               const viewMatrixLocation = gl.getUniformLocation(shaderProgram, 'viewMatrix');
               gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
           }
   
           let collision = true;
           function getDayNightColor(time: number, dayDuration: number) {
               // Normalize time to a value between 0 and 1
               const normalizedTime = (time % dayDuration) / dayDuration;
               // Calculate blend factor
               const blendFactor = 0.5 + 0.5 * Math.cos(normalizedTime * Math.PI * 2.0);
               // Define day and night colors (in RGBA format)
               const dayColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 }; // Blue for day
               const nightColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }; // Black for night
               // Interpolate between day and night colors
               const color = {
                 r: nightColor.r + blendFactor * (dayColor.r - nightColor.r),
                 g: nightColor.g + blendFactor * (dayColor.g - nightColor.g),
                 b: nightColor.b + blendFactor * (dayColor.b - nightColor.b),
                 a: nightColor.a + blendFactor * (dayColor.a - nightColor.a)
               };
               return color;
             }
             
             
             
             const dayDuration = 240000; // 30 seconds for a full cycle
         
           // Define fog parameters
   const fogColor = [0.7, 0.7, 0.7]; // Light grey fog color
   const fogDistance = 16.0; // Fog starts after 16 units
  // Get the attribute location (do this during initialization)
const showBorderLocation = gl.getUniformLocation(shaderProgram, 'vShowBorder');
const borderWidthLocation = gl.getAttribLocation(shaderProgram, "vBorderWidth");
const uSamplersLocation = gl.getUniformLocation(shaderProgram, 'uSamplers'); // Set each sampler to the corresponding texture unit gl.uniform1iv(uTexturesLocation, [0, 1, 2]);

        // Store shader program and uniform locations
        const projectionMatrix = mat4.create();
           mat4.perspective(projectionMatrix, glMatrix.toRadian(70), canvas.width / canvas.height, 0.1, 1000.0);
           const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
           
           gl.uniformMatrix4fv(projectionMatrixLocation, gl.FALSE, projectionMatrix);
   
   
           const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
           gl.vertexAttribPointer(
               positionAttribLocation,
               3, gl.FLOAT, gl.FALSE,
               3 * Float32Array.BYTES_PER_ELEMENT,
               0
           );
           gl.enableVertexAttribArray(positionAttribLocation);
const viewMatrixLocation = gl.getUniformLocation(shaderProgram, 'viewMatrix');
// const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
// Create and bind buffers once
const cubeVBO = gl.createBuffer();
const cubeIBO = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);

// Setup attribute pointers once
// const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
gl.vertexAttribPointer(
    positionAttribLocation,
    3, gl.FLOAT, gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
);
gl.enableVertexAttribArray(positionAttribLocation);

const textureCoordAttribLocation = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
gl.vertexAttribPointer(
    textureCoordAttribLocation,
    2, gl.FLOAT, gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
);
gl.enableVertexAttribArray(textureCoordAttribLocation);

let dirtTexture = this.loadTexture("src/assets/core/textures/dirt.png")
let testTexture = this.loadTexture("src/assets/core/textures/snow_or_grass.png")
// Bind texture once
gl.activeTexture(gl.TEXTURE0+1);
gl.bindTexture(gl.TEXTURE_2D, dirtTexture);
gl.activeTexture(gl.TEXTURE0+0);
gl.bindTexture(gl.TEXTURE_2D, testTexture);
gl.uniform1iv(uSamplersLocation, [0, 1])
// gl.activeTexture(gl.TEXTURE0);
// gl.bindTexture(gl.TEXTURE_2D, testTexture);

function optimizeCubes(vertices:any, indices:any) {
    const uniqueVertices = new Map();
    const optimizedVertices = [];
    const optimizedIndices = [];
    let nextIndex = 0;

    function vertexKey(vx: any, vy: any, vz: any, u: any, v: any) {
        return `${vx},${vy},${vz},${u},${v}`;
    }

    for (let i = 0; i < vertices.length; i += 5) {
        const vx = vertices[i];
        const vy = vertices[i + 1];
        const vz = vertices[i + 2];
        const u = vertices[i + 3];
        const v = vertices[i + 4];

        const key = vertexKey(vx, vy, vz, u, v);
        if (!uniqueVertices.has(key)) {
            uniqueVertices.set(key, nextIndex);
            optimizedVertices.push(vx, vy, vz, u, v);
            nextIndex++;
        }
        optimizedIndices.push(uniqueVertices.get(key));
    }

    return {
        vertices: new Float32Array(optimizedVertices),
        indices: new Uint16Array(optimizedIndices),
    };
}

function calculateDistanceSquared(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return dx * dx + dy * dy + dz * dz;
}


(window as any).loadedObjects = []


function cullObjects(objects: any,planes:any) {


        // if (!isAABBInsideFrustum(chunk.getAABB(), planes)) {
        //     continue;
        // }
        const culled = [];
        for (let j = 0; j < objects.length; j++) {
            const block = objects[j];

            if (!isAABBInsideFrustum(block.getAABB(), planes)) {
                
                continue;
            }
            
           
            culled.push(block)
            // let vertices, indices;
            // vertices = block.getVertices();
            // indices = block.getIndices().map((index: number) => index + offset);

            // combinedVertices.push(...vertices);
            // combinedIndices.push(...indices);
            // offset += vertices.length / 5; // Update the offset for the next object
            // triangles += indices.length / 3;
        }
        return culled
}


function mergeBlocks(blocks: Block[]): { vertices: number[]; indices: number[] } {
    const combinedVertices: number[] = [];
    const combinedIndices: number[] = [];
    let offset = 0;

    blocks.forEach((block: Block, blockIndex) => {
        const vertices = block.getVertices();
        const indices = block.getIndices();
        
        // Ensure the number of elements per vertex is correct
        const elementsPerVertex = 5; // Assuming each vertex has 6 elements (x, y, z, u, v, w)
        const vertexCount = vertices.length / elementsPerVertex;
        // Add vertices to the combined array
        combinedVertices.push(...vertices);

        // Add indices to the combined array, adjusting for the current offset
        for (let i = 0; i < indices.length; i++) {
            combinedIndices.push(indices[i] + offset);
        }

        // Update the offset by the number of vertices added
        offset += vertexCount;
    });


    return {
        vertices: combinedVertices,
        indices: combinedIndices
    };
}

let skyBlock = new Block(0,0,0,100,100,100)


const fpsArray: number[] = [];
const sampleSize = 60;
let lastTime = Date.now();
let animationFrameId;

// Store mesh data for instanced rendering
const meshes: any = {};

// Function to add a new mesh for instanced rendering
function addInstancedMesh(name: string, vertices: any | Float32Array<ArrayBuffer>, indices: any | Uint16Array<ArrayBuffer>, textureCoord: boolean) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const instancePositionBuffer = gl.createBuffer();
    const instanceScaleBuffer = gl.createBuffer();

    meshes[name] = {
        vertexBuffer: vertexBuffer,
        indexBuffer: indexBuffer,
        instancePositionBuffer: instancePositionBuffer,
        instanceScaleBuffer: instanceScaleBuffer,
        indicesLength: indices.length,
        vertexSize: vertices.length / (vertices.length / (textureCoord ? 5 : 3)) // Calculate vertex size dynamically
    };
}



addInstancedMesh("block", Block.baseVertices, Block.baseIndices, true); // Assuming Block.baseVertices includes texture coordinates
// addInstancedMesh("otherMesh", otherMeshVertices, otherMeshIndices); // Add more meshes as needed
(window as any).finalObjects = []

const positionLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
const textureCoordLocation = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
const textureIndexLocation = gl.getAttribLocation(shaderProgram, 'aTextureIndex');
const instancePositionLocation = gl.getAttribLocation(shaderProgram, 'instancePosition');
const instanceScaleLocation = gl.getAttribLocation(shaderProgram, 'instanceScale');
const fogColorLocation = gl.getUniformLocation(shaderProgram, 'uFogColor');
const fogStartLocation = gl.getUniformLocation(shaderProgram, 'uFogStart');
const fogEndLocation = gl.getUniformLocation(shaderProgram, 'uFogEnd');
const viewMatrix = mat4.create();

function raycast(origin: any, direction: any, maxDistance: number): { intersectedBlock: Block | null, normal: any | null } {
    let closestBlock: Block | null = null;
    let closestDistance = Infinity;
    let closestNormal: any | null = null;

    for (const block of (window as any).finalObjects) {
        const aabb = block.getAABB();
        const intersection = intersectRayAABB(origin, direction, aabb);

        if (intersection) {
            const distance = vec3.distance(origin, intersection.point);
            if (distance < closestDistance && distance <= maxDistance) {
                closestDistance = distance;
                closestBlock = block;
                closestNormal = intersection.normal;
            }
        }
    }

    return { intersectedBlock: closestBlock, normal: closestNormal };
}

function intersectRayAABB(origin: any, direction: any, aabb: { min: number[]; max: number[]; }): { point: any, normal: any } | null {
    let tmin = 0.0; // Start at 0 to consider intersection from the start
    let tmax = 10; // Maximum distance for intersection
    let normal: any = null;

    for (let i = 0; i < 3; i++) {
        if (Math.abs(direction[i]) < 1e-6) {
            if (origin[i] < aabb.min[i] || origin[i] > aabb.max[i]) {
                return null; // Ray is parallel to the slab and outside
            }
        } else {
            const invD = 1.0 / direction[i];
            let t1 = (aabb.min[i] - origin[i]) * invD;
            let t2 = (aabb.max[i] - origin[i]) * invD;

            if (t1 > t2) [t1, t2] = [t2, t1]; // Swap if necessary

            if (t1 > tmin) {
                tmin = t1;
                normal = vec3.create();
                normal[i] = direction[i] < 0 ? 1 : -1;
            }
            tmax = Math.min(tmax, t2);
            if (tmin > tmax) {
                return null; // No intersection
            }
        }
    }

    if (tmax < 0) {
        return null; // No intersection, behind the ray
    }

    const intersectionPoint = vec3.create();
    vec3.scaleAndAdd(intersectionPoint, origin, direction, tmin);

    if (normal) {
        vec3.normalize(normal, normal);
    }

    return { point: intersectionPoint, normal: normal };
}

function processObjects(culledObjects: any[], intersectedBlock: Block) {
    return culledObjects
}



canvas.addEventListener("mousedown", (e) => {
    const rayOrigin = vec3.fromValues(
        Renderer.getRenderer().camera.position[0],
        Renderer.getRenderer().camera.position[1],
        Renderer.getRenderer().camera.position[2]
    );
    const rayDirection = vec3.fromValues(
        Renderer.getRenderer().camera.front[0],
        Renderer.getRenderer().camera.front[1],
        Renderer.getRenderer().camera.front[2]
    );

    const { intersectedBlock, normal } = raycast(rayOrigin, rayDirection, 10);

    if (e.button === 0 && intersectedBlock) {
        (window as any).objects.splice((window as any).objects.indexOf(intersectedBlock), 1);
    }

    if (e.button === 2 && intersectedBlock && normal) { // Check for valid normal
        const placementOffset = vec3.create();
        vec3.scale(placementOffset, normal, 1); // Scale normal by block size (1 in this case)

        const newBlockPos = vec3.create();
        vec3.add(newBlockPos, intersectedBlock.position, placementOffset);


        let i = new Block(newBlockPos[0], newBlockPos[1], newBlockPos[2], 1, 1, 1);
        i.texture = "dirt";
    }
});

        // function render() {
        //     gl.useProgram(shaderProgram);
        //     const currentTime = Date.now();
        //     const deltaTime = currentTime - lastTime;
        //     lastTime = currentTime;

        //     const fps = 1000 / deltaTime;
        //     fpsArray.push(fps);
        //     if (fpsArray.length > sampleSize) {
        //         fpsArray.shift();
        //     }
        //     const averageFPS = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;
        //     document.getElementById("fpsCount").innerHTML = Math.floor(averageFPS) + "fps";

        //     const color = getDayNightColor(currentTime, dayDuration);
        //     gl.clearColor(color.r, color.g, color.b, 1);
        //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //     updateCamera(Renderer.getRenderer());
        //     if (!collision) {
        //         Renderer.getRenderer().camera.position[1] -= 9.81 / 60;
        //     }

        //     const rayOrigin = vec3.fromValues(Renderer.getRenderer().camera.position[0], Renderer.getRenderer().camera.position[1], Renderer.getRenderer().camera.position[2]);
        //     const rayDirection = vec3.fromValues(Renderer.getRenderer().camera.front[0], Renderer.getRenderer().camera.front[1], Renderer.getRenderer().camera.front[2]);

        //     const intersectedBlock = raycast(rayOrigin, rayDirection, 10); // Cast ray up to 10 units

        //     const viewMatrix = mat4.create();
        //     mat4.lookAt(viewMatrix, Renderer.getRenderer().camera.position, [
        //         Renderer.getRenderer().camera.position[0] + Renderer.getRenderer().camera.front[0],
        //         Renderer.getRenderer().camera.position[1] + Renderer.getRenderer().camera.front[1],
        //         Renderer.getRenderer().camera.position[2] + Renderer.getRenderer().camera.front[2]
        //     ], Renderer.getRenderer().camera.up);

        //     gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
        //     gl.uniformMatrix4fv(projectionMatrixLocation, gl.FALSE, projectionMatrix);

        //     gl.uniform3fv(fogColorLocation, [color.r, color.g, color.b]); // Grey fog
        //     gl.uniform1f(fogStartLocation, 60);             // Fog starts at 60 units
        //     gl.uniform1f(fogEndLocation, 90);               // Fog ends at 90 units

        //     const viewProjectionMatrix = mat4.create();
        //     mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
        //     const planes = extractFrustumPlanes(viewProjectionMatrix);
        //     const culledObjects = cullObjects((window as any).objects, planes);

        //     const finalObjects = processObjects(culledObjects, intersectedBlock);
        //     for (const meshName in meshes) {
        //         const mesh = meshes[meshName];

        //         // Filter objects based on mesh type
        //         const culledObjectsForMesh = finalObjects.filter((obj) => obj.meshType === meshName);

        //         const instancePositions = new Float32Array(culledObjectsForMesh.flatMap((block) => block.position));
        //         const instanceScales = new Float32Array(culledObjectsForMesh.flatMap((block) => block.size));
        //         const instanceBorders = new Float32Array(culledObjectsForMesh.map((block) => block === intersectedBlock ? 1.0 : 0.0));

        //         gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        //         gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, mesh.vertexSize * 4, 0);
        //         gl.enableVertexAttribArray(positionLocation);

        //         if (textureCoordLocation !== -1) {
        //             gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, mesh.vertexSize * 4, 12);
        //             gl.enableVertexAttribArray(textureCoordLocation);
        //         }

        //         // Setup instance buffers
        //         gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instancePositionBuffer);
        //         gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.DYNAMIC_DRAW);
        //         gl.vertexAttribPointer(instancePositionLocation, 3, gl.FLOAT, false, 0, 0);
        //         gl.enableVertexAttribArray(instancePositionLocation);
        //         gl.vertexAttribDivisor(instancePositionLocation, 1);

        //         gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceScaleBuffer);
        //         gl.bufferData(gl.ARRAY_BUFFER, instanceScales, gl.DYNAMIC_DRAW);
        //         gl.vertexAttribPointer(instanceScaleLocation, 3, gl.FLOAT, false, 0, 0);
        //         gl.enableVertexAttribArray(instanceScaleLocation);
        //         gl.vertexAttribDivisor(instanceScaleLocation, 1);

        //         const instanceBorderBuffer = gl.createBuffer();
        //         gl.bindBuffer(gl.ARRAY_BUFFER, instanceBorderBuffer);
        //         gl.bufferData(gl.ARRAY_BUFFER, instanceBorders, gl.DYNAMIC_DRAW);
        //         gl.vertexAttribPointer(instanceBorderLocation, 1, gl.FLOAT, false, 0, 0);
        //         gl.enableVertexAttribArray(instanceBorderLocation);
        //         gl.vertexAttribDivisor(instanceBorderLocation, 1);

        //         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        //         gl.drawElementsInstanced(gl.TRIANGLES, mesh.indicesLength, gl.UNSIGNED_SHORT, 0, instancePositions.length / 3);
        //     }

        //     animationFrameId = requestAnimationFrame(render);
        // }
const textureBuffer = gl.createBuffer()
let lastPosition: any;
function render() {
    
    
    gl.useProgram(shaderProgram);
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const fps = 1000 / deltaTime;
    fpsArray.push(fps);
    if (fpsArray.length > sampleSize) {
        fpsArray.shift();
    }
    const averageFPS = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;
    document.getElementById("fpsCount").innerHTML = Math.floor(averageFPS) + "fps";

    const color = getDayNightColor(currentTime, dayDuration);
    gl.clearColor(color.r,color.g,color.b,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    updateCamera(Renderer.getRenderer());
    if (!collision) {
        Renderer.getRenderer().camera.position[1] -= 9.81 / 60;
    }
    if (lastPosition !== Renderer.getRenderer().camera) {
        (window as any).loadedObjects = []
        for (let j = 0; j < (window as any).objects.length; j++) {
            const block = (window as any).objects[j];
            if (calculateDistanceSquared(Renderer.getRenderer().camera.position[0],Renderer.getRenderer().camera.position[1],Renderer.getRenderer().camera.position[2],block.position[0],block.position[1],block.position[2]) > 1024) {
                continue;
            }
            (window as any).loadedObjects.push(block)
        }
    }
    const rayOrigin = vec3.fromValues(Renderer.getRenderer().camera.position[0], Renderer.getRenderer().camera.position[1], Renderer.getRenderer().camera.position[2]);
    const rayDirection = vec3.fromValues(Renderer.getRenderer().camera.front[0], Renderer.getRenderer().camera.front[1], Renderer.getRenderer().camera.front[2]);
    
    const {intersectedBlock} = raycast(rayOrigin, rayDirection, 10); // Cast ray up to 10 units

    mat4.lookAt(viewMatrix,Renderer.getRenderer().camera.position, [
        Renderer.getRenderer().camera.position[0] + Renderer.getRenderer().camera.front[0],
        Renderer.getRenderer().camera.position[1] + Renderer.getRenderer().camera.front[1],
        Renderer.getRenderer().camera.position[2] + Renderer.getRenderer().camera.front[2]
    ], Renderer.getRenderer().camera.up);

    gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, gl.FALSE, projectionMatrix);

    gl.uniform3fv(fogColorLocation, [color.r,color.g,color.b]); // Grey fog
    gl.uniform1f(fogStartLocation, 20);             // Fog starts at 2 units
    gl.uniform1f(fogEndLocation, 40);
    
    const viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
    const planes = extractFrustumPlanes(viewProjectionMatrix);
    const culledObjects = cullObjects((window as any).loadedObjects, planes);
    const finalObjects = processObjects(culledObjects,intersectedBlock);
    
    (window as any).finalObjects = finalObjects
    // Iterate over each registered mesh and draw instances
    for (const meshName in meshes) {
        const mesh = meshes[meshName];
        
        // Filter objects based on mesh type (you'll need to add a "meshType" property to your objects)
        const culledObjectsForMesh = finalObjects.filter((obj: { meshType: string; }) => obj.meshType === meshName);
        const textureIndexes = new Float32Array(culledObjectsForMesh.length).fill(0.0);
        const instancePositions = new Float32Array(culledObjectsForMesh.flatMap((block: { position: any; }) => block.position));
        const instanceScales = new Float32Array(culledObjectsForMesh.flatMap((block: { size: any; }) => block.size));
        for (const block of culledObjectsForMesh) {
            if (block.texture == "dirt") {
                const index = culledObjectsForMesh.findIndex(obj => {
                    return obj === block; // Assuming intersectedBlock is a direct reference to the object
                });
                textureIndexes[index] = 1.0;
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, mesh.vertexSize * 4 , 0); // Dynamic stride
        gl.enableVertexAttribArray(positionLocation);

        
      
        // gl.vertexAttribPointer(textureIndexLocation, 3, gl.FLOAT, false, 0, 0); // Dynamic stride
        // gl.enableVertexAttribArray(textureIndexLocation);
        // gl.vertexAttribDivisor(textureIndexLocation, 1);
        if (textureCoordLocation !== -1) { // Only enable if the attribute exists in the shader
            gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, mesh.vertexSize * 4, 12); // Offset for texture coords
            gl.enableVertexAttribArray(textureCoordLocation);
        }


        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instancePositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(instancePositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(instancePositionLocation);
        gl.vertexAttribDivisor(instancePositionLocation, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceScaleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, instanceScales, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(instanceScaleLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(instanceScaleLocation);
        gl.vertexAttribDivisor(instanceScaleLocation, 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);


        if (intersectedBlock) {
            if (!mesh.showBorderBuffer) {
                mesh.showBorderBuffer = gl.createBuffer();
            }
    
            // Create an array filled with 0.0 (no border)
            const showBorderValues = new Float32Array(culledObjectsForMesh.length).fill(0.0);
    
            // Find the index of the intersected block in culledObjectsForMesh
            const intersectedBlockIndex = culledObjectsForMesh.findIndex(obj => {
                return obj === intersectedBlock; // Assuming intersectedBlock is a direct reference to the object
            });
            // Set showBorder to 1.0 ONLY for the intersected block
            if (intersectedBlockIndex !== -1) {
                showBorderValues[intersectedBlockIndex] = 1.0;
                
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.showBorderBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, showBorderValues, gl.DYNAMIC_DRAW);
    
            gl.vertexAttribPointer(showBorderLocation, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(showBorderLocation);
            gl.vertexAttribDivisor(showBorderLocation, 1);
            }   else {
            // ... (set showBorderLocation to 0.0 similarly) ...
    
            if (!mesh.showBorderBuffer) {
                mesh.showBorderBuffer = gl.createBuffer();
            }
            const showBorderValues = new Float32Array(culledObjectsForMesh.length).fill(0.0); 
    
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.showBorderBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, showBorderValues, gl.DYNAMIC_DRAW);
    
            gl.vertexAttribPointer(showBorderLocation, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(showBorderLocation);
            gl.vertexAttribDivisor(showBorderLocation, 1);
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureIndexes, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
            gl.vertexAttribPointer(textureIndexLocation, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(textureIndexLocation);
            gl.vertexAttribDivisor(textureIndexLocation, 1);
        gl.drawElementsInstanced(gl.TRIANGLES, mesh.indicesLength, gl.UNSIGNED_SHORT, 0, instancePositions.length / 3);
    }

    lastPosition = Renderer.getRenderer().camera.position
    animationFrameId = requestAnimationFrame(render);
}



           // Set up perspective matrix
           
           
           if (!animationFrameId) { animationFrameId = requestAnimationFrame(render) };
           Output.log("Render started!", "BlockJS Renderer");
       }
   }

