export default function shaderPark() {
  return `
    let pointerDown = input();
    
    setMaxIterations(5);
    
    let s = getSpace();
    let r = getRayDirection();
    
    let n1 = noise(r * 4 + vec3(0,0,time*.1));
    let n = noise(s+vec3(0,0,time*.1) + n1);
    
    metal(n*.5+.5);
    shine(n*.5+.5);
    
    displace(mouse.x*2, mouse.y*2, 0);
    color(normal * .1 + vec3(0,0,1));
    boxFrame(vec3(2),abs(n) * .1 + .4);
    mixGeo(pointerDown);
    sphere(n * .5  +  .8);`;
}
