precision highp float;

uniform vec3 silkColor;
uniform float metalness;
uniform float roughness;
uniform float noiseStrength;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Calculate the normal vector
    vec3 normal = normalize(vNormal);

    // Calculate the view direction
    vec3 viewDir = normalize(cameraPosition - vPosition);

    // Calculate the reflection vector
    vec3 reflectDir = reflect(-viewDir, -normal);

    // Calculate the specular highlight
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    // Calculate the final color
    vec3 color = silkColor + spec * vec3(1.0, 1.0, 1.0);

    // Apply metalness and roughness
    vec3 F0 = mix(vec3(0.04), color, metalness);
    float alpha = roughness * roughness;
    vec3 specularColor = F0 + (max(vec3(1.0 - alpha), F0) - F0) * pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);

    gl_FragColor = vec4(color * (1.0 - specularColor) + specularColor, 1.0);
}