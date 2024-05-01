precision highp float;

uniform float time;
uniform float noiseScale;
uniform float noiseStrength;

varying vec3 vNormal;
varying vec3 vPosition;

#include "../../lygia/generative/snoise.glsl"

void main() {
  vNormal = normal;
  vPosition = position;

  // Calculate noise value
  float noise = snoise(vPosition * noiseScale + time * 0.1);

  // Displace vertices along normal vectors
  vec3 displacedPosition = vPosition + vNormal * noise * noiseStrength;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}