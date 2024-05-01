precision highp float;
uniform float time;
varying vec3 vNormal;
varying vec3 vColor;
void main(){
    vNormal=normal;
    float displacement=sin(position.x*3.+time*2.)*.1;
    
    vec3 newPosition=position+normal*displacement;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.);
}