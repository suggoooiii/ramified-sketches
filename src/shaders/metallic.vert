precision highp float;

uniform float time;
uniform float noiseScale;
uniform float noiseStrength;
uniform vec3 silkColor;
uniform float metalness;
uniform float roughness;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

#include "../../lygia/generative/snoise.glsl"

void main() {
  vUv = uv;

  vec3 pos = position;
  vPosition = pos;
  vNormal = normal;

  // Calculate the noise
    // vec2 noiseCoord = vUv * noiseScale;
  float noise = snoise(vPosition * noiseScale + time * 1.0);

  // Calculate the metallic and roughness values
  float metallic = clamp(metalness + noise, 0.0, 1.0);
  float roughness = clamp(roughness + noise, 0.0, 1.0);

  // Calculate the final color
  vec3 finalColor = mix(silkColor, vec3(1.0), metallic);
  finalColor = mix(finalColor, vec3(1.0), roughness);

  vec3 displacedPosition = vPosition + vNormal * noise * noiseStrength;

  // Set the final color
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
