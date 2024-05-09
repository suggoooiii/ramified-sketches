precision highp float;
precision highp int;

attribute float index;
attribute vec3 position;
attribute vec2 uv;

uniform float time;
uniform float r1;
uniform float r2;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;

void main() {
    vUv = uv;

    float roll = time / 2.0;
    float div = index / 360.0;
    float angle = div * 3.14159265359 * 2.0 - time - time / 4.0;

    float r = r1 - r2;
    float dx = r * sin(roll) + r2 * sin(angle);
    float dy = r * cos(roll) + r2 * cos(angle);

    vec3 pos = position;
    pos.x += dx;
    pos.y += dy;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}