precision highp float;

uniform float time;
varying vec2 vUv;
#include "../../lygia/generative/snoise.glsl"

// void main(){
//   vUv=uv;
//   vec3 pos=position;
  
//   // Calculate the flow field based on noise
//   vec2 noiseCoord=vUv*5.;
//   vec2 flow=vec2(snoise(vec3(noiseCoord,time*.1)),snoise(vec3(noiseCoord+vec2(100.,100.),time*.1)));
  
//   // Move the vertex along the flow field
//   pos.xy+=flow*.1;
  
//   gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
// }

void main() {
  vNormal = normal;
  vPosition = position;
//   vUv=uv;
  
  // Calculate noise value
  float noise = snoise(vPosition * noiseScale + time * 0.1);
  
  // Displace vertices along normal vectors
  vec3 displacedPosition = vPosition + vNormal * noise * noiseStrength;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}