precision highp float;
varying vec3 vNormal;
void main(){
    vec3 lightDirection=normalize(vec3(1,1,1));
    float lightIntensity=max(dot(vNormal,lightDirection),0.);
    vec3 viewDirection=normalize(cameraPosition-gl_FragCoord.xyz);
    float specularity=pow(max(dot(reflect(-lightDirection,vNormal),viewDirection),0.),32.);
    
    float intensity=dot(vNormal,vec3(0.,0.,1.));
    gl_FragColor=vec4(vec3(1.,1.,1.)*intensity,1.);
}