import * as THREE from "three";
import * as dat from "dat.gui";
import { ssam } from "ssam";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import furrVert from "./shaders/furrrmat.vert";
import furrFrag from "./shaders/furrrmat.frag";
import particlesVert from "./shaders/particlesystem.vert";
import particlesFrag from "./shaders/particlesystem.frag";
import metallicVert from "./shaders/metallic.vert";
import metallicFrag from "./shaders/metallic.frag";

const sketch = ({ wrap, canvas, width, height, pixelRatio }) => {
  // SCENE AND CAMERA
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("black");
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 10);

  // RENDERER
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });

  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(width, height);

  document.body.appendChild(renderer.domElement);

  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Create a GUI instance
  const gui = new dat.GUI();
  const TWEAKS = {
    pointSize: 0.0,
    time: 0.0,
    attractorX: 0,
    attractorY: 0,
    attractorZ: 0,
    decay: -0.3,
    colorFactor: 1.0, // Initial value for colorFactor
    modulationFactor: 1.0, // Initial value
    noiseScale: 1,
    noiseStrength: 0.1,
    silkColor: new THREE.Color(0x8c6239),
    metalness: 0.8,
    roughness: 0.2,
  };

  // Fur Shader
  const furrgeometry = new THREE.SphereGeometry(5, 32, 32);

  const furMaterial = new THREE.ShaderMaterial({
    vertexShader: furrVert,
    fragmentShader: furrFrag,
    uniforms: {
      time: { value: 0.0 },
    },
    // blending: THREE.MultiplyBlending,
    // side: THREE.BackSide,
    // depthTest: false,
    // transparent: true,
  });

  // Create a shader material
  const metallicMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.5 },
      noiseScale: { value: 1 },
      noiseStrength: { value: 0.1 },
      silkColor: { value: new THREE.Color("blue") },
      metalness: { value: 0.8 },
      roughness: { value: 0.2 },
    },
    vertexShader: metallicVert,
    fragmentShader: metallicFrag,
    side: THREE.BackSide,
    // blending: THREE.MultiplyBlending,
    depthTest: false,
    // transparent: true,
    // blendEquation: THREE.AddEquation,
    // blendSrc: THREE.OneFactor,
    // blendDst: THREE.OneFactor,
  });
  const furrsphere = new THREE.Mesh(furrgeometry, metallicMat);
  scene.add(furrsphere);

  // Particle geometry and material using a shader
  const particles = 10000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const velocities = new Float32Array(particles * 1);
  const colors = new Float32Array(particles * 3);
  const sizes = new Float32Array(particles);

  for (let i = 0; i < particles * 3; i++) {
    positions[i] = (Math.random() * 2 - 1) * 5;
    velocities[i] = (Math.random() * 2 - 1) * 0.2;
    colors[i * 3 + 0] = (Math.random() * 4 - 1) * 1; // Red
    colors[i * 3 + 1] = (Math.random() * 4 - 1) * 6; // Green
    colors[i * 3 + 2] = (Math.random() * 4 - 1) * 8; // Blue
    sizes[i] = Math.random() * 10 + 2; // Size between 5 and 25
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute("acolor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      pointSize: { value: 0.2 },
      attractor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: TWEAKS.time },
      colorFactor: { value: TWEAKS.colorFactor }, // Initial value for colorFactor
      decay: { value: TWEAKS.decay }, // Add decay here
      modulationFactor: { value: TWEAKS.modulationFactor }, // New uniform
    },
    vertexShader: particlesVert,
    fragmentShader: particlesFrag,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    // transparent: true,
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Create a render target to hold trail effects
  const renderTarget = new THREE.WebGLRenderTarget(512, 512, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
  });

  // const trailMaterial = new THREE.ShaderMaterial({
  //   uniforms: {
  //     texture: { value: renderTarget.texture },
  //     resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  //     decay: { value: TWEAKS.decay }, // Controls how fast the trails fade; closer to 1 is slower
  //   },
  //   vertexShader: `
  //   precision highp float;
  //   varying vec2 vUv;

  //       void main() {
  //           vUv = uv;
  //           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //       }
  //   `,
  //   fragmentShader: `
  //       precision highp float;

  //       uniform sampler2D texture;
  //       uniform vec2 resolution;
  //       uniform float decay;
  //       varying vec2 vUv;

  //       void main() {
  //         vec4 color = texture2D(texture, vUv) * decay;
  //         gl_FragColor = vec4(color.rgb * decay,1.0);  // Apply decay to fade the trail
  //       }
  //   `,
  //   blending: THREE.SubtractiveBlending,
  //   // blendEquation: THREE.AddEquation,
  //   depthTest: false,
  //   // transparent: true,
  // });

  // GUI for particle point size

  gui.add(TWEAKS, "pointSize", 0.0, 100.0).onChange((value) => {
    material.uniforms.pointSize.value = value;
  });

  // GUI for attractor position
  gui.add(TWEAKS, "attractorX", -5, 5).onChange((value) => {
    material.uniforms.attractor.value.x = value;
  });
  gui.add(TWEAKS, "attractorY", -5, 5).onChange((value) => {
    material.uniforms.attractor.value.y = value;
  });

  gui.add(TWEAKS, "metalness", -5, 5).onChange((value) => {
    metallicMat.uniforms.noiseScale.value = value;
  });
  gui.add(TWEAKS, "noiseScale", -5, 5).onChange((value) => {
    metallicMat.uniforms.noiseStrength.value = value;
  });
  gui.add(TWEAKS, "noiseStrength", -5, 5).onChange((value) => {
    metallicMat.uniforms.noiseStrength.value = value;
  });

  gui.add(TWEAKS, "roughness", -5, 5).onChange((value) => {
    metallicMat.uniforms.roughness.value = value;
  });

  gui
    .add(TWEAKS, "decay", -1.0, 200.0)
    .step(0.01)
    .onChange((value) => {
      material.uniforms.decay.value = value;
    });
  // GUI control for colorFactor
  gui
    .add(TWEAKS, "colorFactor", -1.0, 20.0)
    .step(0.1)
    .onChange((value) => {
      material.uniforms.colorFactor.value = value;
    });
  gui
    .add(TWEAKS, "modulationFactor", -1.0, 20.0)
    .step(0.1)
    .onChange((value) => {
      material.uniforms.modulationFactor.value = value;
    });
  gui
    .add(TWEAKS, "time", 0.1, 1000.0)
    .step(0.1)
    .onChange((value) => {
      material.uniforms.time.value = value;
    });

  wrap.render = ({ playhead }) => {
    const anim = playhead * Math.PI * 0.05;
    const anim2 = Math.sin(Math.sqrt(9 ^ (2 - playhead) ^ 2)) * playhead;
    material.uniforms.time.value += 0.05;
    metallicMat.uniforms.time.value += 0.05;
    material.uniforms.decay.value = TWEAKS.decay;
    material.uniforms.colorFactor.value = TWEAKS.colorFactor;
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.velocity.needsUpdate = true;
    geometry.attributes.acolor.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    furMaterial.uniforms.time.value += 0.005;
    metallicMat.uniformsNeedUpdate = true;

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = trueDSA
    renderer.render(scene, camera);
  };

  wrap.resize = ({ width, height }) => {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  wrap.unload = () => {
    renderer.dispose();
    renderer.forceContextLoss();
  };
};

const settings = {
  mode: "webgl2",
  pixelRatio: window.devicePixelRatio,
  animate: true,
  duration: 20_000,
  playFps: 120,
  exportFps: 60,
  framesFormat: ["webm"],
  attributes: {
    preserveDrawingBuffer: true,
  },
};

ssam(sketch, settings);
