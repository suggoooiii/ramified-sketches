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

    // Modify particle position based on audio data
  vec3 modifiedPosition = position + normal + vel * modulationFactor;

  // vec3 newPos = position + vel;
  float dynamicColor = sin((time + length(modifiedPosition) * colorFactor) * modulationFactor); // Adjust sin calculation
  vColor = vec3(vel.x + 0.5, vel.y + 0.5, vel.z + 0.5) + vec3(dynamicColor, 0.5, 1.0 - dynamicColor);

    // Set the point size from the size attribute

  gl_Position = projectionMatrix * modelViewMatrix * vec4(modifiedPosition, 1.0);
  gl_PointSize = pointSize;
}