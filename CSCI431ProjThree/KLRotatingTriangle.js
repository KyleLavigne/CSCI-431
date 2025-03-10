"use strict";

var gl;

var theta = 0.0;
var thetaLoc;
var colorLoc;
var currentColor = [1.0, 0.0, 0.0, 1.0]; // Initial color red

var speed = 100;
var direction = true;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    var vertices = [
        vec2(0,  Math.sqrt(3)/3),
        vec2(-0.5, -Math.sqrt(3)/6),
        vec2(0.5, -Math.sqrt(3)/6)
    ];

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    colorLoc = gl.getUniformLocation(program, "uColor");

    // Initialize event handlers

    document.getElementById("slider").onchange = function(event) {
        speed = 100 - event.target.value;
    };
    document.getElementById("Direction").onclick = function (event) {
        direction = !direction;
    };

    document.getElementById("Controls").onclick = function( event) {
        switch(event.target.index) {
          case 0:
            direction = !direction;
            break;

         case 1:
            speed /= 2.0;
            break;

         case 2:
            speed *= 2.0;
            break;

         case 3:
            currentColor = [1.0, 0.0, 0.0, 1.0]; // Red
            break;

         case 4:
            currentColor = [0.0, 1.0, 0.0, 1.0]; // Green
            break;

         case 5:
            currentColor = [0.0, 0.0, 1.0, 1.0]; // Blue
            break;

         case 6:
            currentColor = [0.0, 0.0, 0.0, 1.0]; // Black
            break;
       }
    };

    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case '1':
            direction = !direction;
            break;

          case '2':
            speed /= 2.0;
            break;

          case '3':
            speed *= 2.0;
            break;

          case 'R':
            currentColor = [1.0, 0.0, 0.0, 1.0]; // Red
            break;

          case 'G':
            currentColor = [0.0, 1.0, 0.0, 1.0]; // Green
            break;

          case 'B':
            currentColor = [0.0, 0.0, 1.0, 1.0]; // Blue
            break;

          case 'K':
            currentColor = [0.0, 0.0, 0.0, 1.0]; // Black
            break;
        }
    };

    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);
    gl.uniform4fv(colorLoc, currentColor);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    setTimeout(
        function () {requestAnimationFrame(render);},
        speed
    );
}
