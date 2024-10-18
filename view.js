// FileName:       view.js
// Programmer:     Anmol Singh
// Date:           07/28/2024
// Purpose:        This file defines the code for our view.
//                 The "view" is our graphics area (i.e. the "canvas").

/* The View class handles the rendering of the game objects and the display of the timer */

class View {
    // Constructor for the View class
    constructor(model, canvas, ctx, vsSource, fsSource) {
        this.model = model;           // The game model
        this.gl = canvas.getContext('webgl2');      // WebGL2 context for rendering
        this.ctx = ctx; // 2D context for drawing the timer

        if (!this.gl) {
            alert('WebGL 2.0 is not available');
            return;
        }
     // Initialize the shaders used for rendering
        this.vsSource = vsSource;    // Vertex shader source code
        this.fsSource = fsSource;    // Fragment shader source code
        this.canvas = canvas;
        this.initGL();               // Initialize the WebGL
    }
    // Initialize WebGL context, shaders, and buffers
    initGL() {
        const shaderProgram = this.initShaderProgram(this.vsSource, this.fsSource);
        this.gl.useProgram(shaderProgram);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),    // Attribute location for vertex positions
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),  // Uniform location for projection matrix
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),    // Uniform location for model-view matrix
                vertexColor: this.gl.getUniformLocation(shaderProgram, 'uVertexColor'),            // Uniform location for vertex color
            },
        };
        
        this.triangleBuffer = this.initTriangleBuffer();  // Buffer for drawing stars (triangles)
        this.starBuffer = this.initStarBuffer();          // Buffer for drawing obstacles (stars)
        this.playerBuffer = this.initPlayerBuffer();      // Buffer for drawing the player

        // The projection matrix for orthographic projection
        this.projectionMatrix = mat4.create();
        mat4.ortho(this.projectionMatrix, -1, 1, -1, 1, 0.1, 100);
        // To clear the color (background color) to light gray
        this.gl.clearColor(0.9, 0.9, 0.9, 1.0); 
    }
    // To initialize and compile shader program
    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);   // Load vertex shader
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);  // Load fragment shader

        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }
     // Load and compile a shader
    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
    // Initialize buffer for stars (triangles)
    initTriangleBuffer() {
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            0.0,  1.0,
           -1.0, -1.0,
            1.0, -1.0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        return positionBuffer;
    }
    // Initialize buffer for obstacles (stars)
    initStarBuffer() {
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [];
        const numPoints = 10;  // Number of points in the star (triangle)
        const outerRadius = 1;
        const innerRadius = 0.5;
        for (let i = 0; i < numPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / numPoints) * Math.PI * 2;  // Complete circle
            positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        return positionBuffer;
    }
    // Initialize buffer for the player (triangle with tail)
    initPlayerBuffer() {
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            0.0,  1.0,
           -1.0, -1.0,
            1.0, -1.0,
            0.0, -0.5,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        return positionBuffer;
    }
    // Draw the entire scene
    drawScene() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  // Clear the canvas

        this.drawPlayer();   // Draw the player
        this.drawStars();    // Draw the stars (triangles)
        this.drawObstacles();  // Draw the obstacles (stars)
        
        // Draw the timer using 2D context
        this.drawTimer(this.model.timeLeft);
    }
        // Draw the player
    drawPlayer() {
        this.drawShape(this.model.player, this.model.player.color, this.playerBuffer, 4);
    }
        // Draw the stars (triangles)
    drawStars() {
        for (let star of this.model.stars) {
            this.drawShape(star, star.color, this.triangleBuffer, 3);
        }
    }
        // Draw the obstacles (stars)
    drawObstacles() {
        for (let obstacle of this.model.obstacles) {
            this.drawShape(obstacle, obstacle.color, this.starBuffer, 10);  // Adjust vertexCount if needed
        }
    }
        // Draw the shape for player, star (triangle) and obstacle (star)
    drawShape(object, color, buffer, vertexCount) {
        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [object.x, object.y, -1.0]);  // Translate shape
        mat4.scale(modelViewMatrix, modelViewMatrix, [object.size, object.size, 1.0]);  // Scale shape

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        this.gl.useProgram(this.programInfo.program);

        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        // Set color
        this.gl.uniform4fv(this.programInfo.uniformLocations.vertexColor, color);
        // Draw the shape
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, vertexCount);
    }
        // Draw the timer using 2D context
    drawTimer(timeLeft) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the 2D context
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Time Left: ${Math.max(Math.floor(timeLeft), 0)}s`, 10, 10); // Draw the timer text
    }
}