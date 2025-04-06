"use strict";

var canvas;
var gl;

var program;

var numPositions = 12;
var positionsArray = [];
var texCoordsArray = [];
var faceIdArray = []; // Stores which face each triangle belongs to for texture selection

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
    vec4(0.5, -0.2722,  0.2886, 1.0),
    vec4(0.0,  -0.2722, -0.5773, 1.0),
    vec4(-0.5, -0.2722,  0.2886, 1.0),
    vec4(0.0, 0.5443,  0.0, 1.0)
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = vec3(45.0, 45.0, 45.0);
var thetaLoc;
var flag = true;

var faceIndex = 0;

function triple(a, b, c) {
    // Push vertex positions, texture coordinates, and the current face index
    positionsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    faceIdArray.push(faceIndex);

    positionsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);
    faceIdArray.push(faceIndex);

    positionsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    faceIdArray.push(faceIndex);

    faceIndex++; // Increment to assign a new texture to the next face
}

function colorPyramid() {
    triple(0, 1, 2); // Base
    triple(1, 3, 0); // Side 1
    triple(2, 3, 1); // Side 2
    triple(3, 2, 0); // Side 3
}

function configureTexture(imageURLs) {
    // Load and bind four different images as textures
    imageURLs.forEach((url, i) => {
        const texture = gl.createTexture();
        const image = new Image();
        image.onload = function () {
            gl.activeTexture(gl.TEXTURE0 + i); // Select texture unit
            gl.bindTexture(gl.TEXTURE_2D, texture); // Bind texture object
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // Upload image
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.uniform1i(gl.getUniformLocation(program, `uTex${i}`), i); // Assign to sampler
        };
        image.src = url; // Trigger image loading
    });
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorPyramid();

    // Position buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Texture coordinate buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    // Face ID buffer (used to select the texture in the fragment shader)
    var fBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int32Array(faceIdArray), gl.STATIC_DRAW);
    var faceIdLoc = gl.getAttribLocation(program, "aFaceId");
    gl.vertexAttribIPointer(faceIdLoc, 1, gl.INT, 0, 0);
    gl.enableVertexAttribArray(faceIdLoc);

    // Load textures for each face
    configureTexture(["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"]);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    document.getElementById("ButtonX").onclick = function() { axis = xAxis; };
    document.getElementById("ButtonY").onclick = function() { axis = yAxis; };
    document.getElementById("ButtonZ").onclick = function() { axis = zAxis; };
    document.getElementById("ButtonT").onclick = function() { flag = !flag; };

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
    requestAnimationFrame(render);
}
