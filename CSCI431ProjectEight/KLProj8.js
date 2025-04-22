let gl;

window.onload = function () {
    const canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Set up the triangles to be drawn
    const vertices = [
        vec4(-1, -1, 0, 1), vec4(1, -1, 0, 1), vec4(-1, 1, 0, 1), // First triangle
        vec4(1, -1, 0, 1), vec4(1, 1, 0, 1), vec4(-1, 1, 0, 1)  // Second triangle
    ];

    // Define colors for the vertices
    const colors = [
        vec4(1, 0, 0, 1), vec4(1, 1, 0, 0), vec4(0, 1, 0, 1), // Gradient: Red -> Yellow -> Green
        vec4(1, 1, 0, 0), vec4(0, 0, 1, 1), vec4(0, 1, 0, 1)  // Gradient: Yellow -> Blue -> Green
    ];

    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load vertex positions
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Set up the position attribute
    const positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Load vertex colors
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Set up the color attribute
    const colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // Set up the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    canvas.addEventListener("click", function (e) {
        const x = e.offsetX;
        const y = canvas.height - e.offsetY;

        // Ensure the framebuffer is properly cleared before reading pixels
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

        // Read the pixel color at the clicked position
        const pixels = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        
        // Display the color information in the output div
        document.getElementById("color-output").textContent =
            `Color at (${x}, ${y}): R=${pixels[0]}, G=${pixels[1]}, B=${pixels[2]}, A=${pixels[3]}`;
    });
};
