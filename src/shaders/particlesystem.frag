precision highp float;

varying vec3 vColor;
uniform float time; // For color animation

void main() {

    float dist = length(gl_PointCoord - vec2(0.5, 0.5));
    float intensity = smoothstep(0.5, 0.0, dist); // Smoother intensity fade

    vec3 dynamicColor = vColor * (0.5 + 0.5 * sin(time + length(vColor)));  // Example of dynamic color modulation
    gl_FragColor = vec4(dynamicColor * intensity, 1.0);
        // vec3 dynamicColor = vColor * (0.5 + 0.5 * sin(time + vColor)); // Dynamic color change
        // gl_FragColor = vec4(vColor * intensity, 1.0);
}