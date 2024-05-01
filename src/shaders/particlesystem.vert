precision highp float;

attribute vec3 velocity;
attribute float size;  // Add this line to access each particle's size attribute
varying vec3 vColor;

uniform vec3 attractor;
uniform float pointSize;
uniform float time;
uniform float decay;  // Declare decay
uniform float colorFactor; // Declare colorFactor
uniform float modulationFactor; // Declare modulationFactor

void main() {
  vec3 acc = attractor - position;
  vec3 vel = velocity + 0.05 * acc; // Attraction strength
  vel += decay; // Damping  

  vec3 newPos = position + vel;
  float dynamicColor = sin((time + length(newPos) * colorFactor) * modulationFactor); // Adjust sin calculation
  vColor = vec3(vel.x + 0.5, vel.y + 0.5, vel.z + 0.5) + vec3(dynamicColor, 0.5, 1.0 - dynamicColor);

      // Remap size from [-1, 1] to [0, 1]
    // size += (size + 1.0) / 2.0;

    // Set the point size from the size attribute

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

  gl_PointSize = pointSize;
}