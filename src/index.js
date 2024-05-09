import * as THREE from "three";
import * as dat from "dat.gui";
import { ssam } from "ssam";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createSculptureWithGeometry } from "shader-park-core";
import shaderPark from "./sp-code";
import particlesVert from "./shaders/particlesystem.vert";
import particlesFrag from "./shaders/particlesystem.frag";
import metallicVert from "./shaders/metallic.vert";
import metallicFrag from "./shaders/metallic.frag";
import bufferfrag from "./shaders/bufferMat.frag";
import buffervert from "./shaders/bufferMat.vert";

const sketch = ({ wrap, canvas, width, height, pixelRatio }) => {
  // RENDERER
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(width, height);

  document.body.appendChild(renderer.domElement);

  // SCENE AND CAMERA
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.add(new THREE.PolarGridHelper(30, 0));

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 10);

  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const listener = new THREE.AudioListener();
  camera.add(listener);

  scene.add(camera);

  // clock
  const clock = new THREE.Clock();

  const sound = new THREE.Audio(listener);
  const audioPlayer = document.getElementById("audioPlayer");
  sound.setMediaElementSource(audioPlayer);
  audioPlayer.play();

  const oscillator = listener.context.createOscillator();

  const audioLoader = new THREE.AudioLoader();

  // create an AudioAnalyser, passing in the sound and desired fftSize
  const analyser = new THREE.AudioAnalyser(sound, 32);

  // get the average frequency of the sound

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
  const sphereGeo = new THREE.SphereGeometry(5, 32, 32);

  // Create a shader material
  const silkMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.5 },
      noiseScale: { value: 1 },
      noiseStrength: { value: 0.1 },
      silkColor: { value: new THREE.Color("red").convertLinearToSRGB() },
      metalness: { value: 0.8 },
      roughness: { value: 0.2 },
    },
    vertexShader: metallicVert,
    fragmentShader: metallicFrag,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    // transparent: true,
    // blendDst: THREE.OneFactor,
  });
  const meshSphere = new THREE.Mesh(sphereGeo, silkMat);
  // scene.add(meshSphere);
  // meshSphere.add(sound);

  // Particle geometry and material using a shader
  const particles = 10000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const velocities = new Float32Array(particles * 2);
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
  geometry.setAttribute("acolor", new THREE.BufferAttribute(colors, 3, true));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1, true));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      pointSize: { value: 2.8 },
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
    transparent: true,
  });

  const particleSystem = new THREE.Points(geometry, material);
  // scene.add(particleSystem);

  const buffergeo = new THREE.BufferGeometry();

  const numPoints = 10000; // Number of points in the geometry

  const points = new Float32Array(numPoints * 3);
  const indices = new Float32Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const z = 0;

    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;

    indices[i] = i;
  }

  buffergeo.setAttribute("position", new THREE.BufferAttribute(points, 3));
  buffergeo.setAttribute("index", new THREE.BufferAttribute(indices, 1));

  const buffermat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      r1: { value: 700 },
      r2: { value: 813 },
      color: { value: new THREE.Color(0, 0, 0) },
      vertexShader: buffervert,
      fragmentShader: bufferfrag,
    },
  });

  // const mesh = new THREE.Mesh(buffergeo, buffermat);
  const geometryy = new THREE.SphereGeometry(1, 32, 32);

  // sp code mat
  let spmesh = createSculptureWithGeometry(geometryy, shaderPark(), () => {
    return {
      time: clock.getElapsedTime(),
      mouse: mouse,
      size: 0.5,
    };
  });

  // Create a new Three.js mouse vector
  const mouse = new THREE.Vector2();

  // Add an event listener for mouse movement
  window.addEventListener("mousemove", onMouseMove, false);

  // Update the mouse vector based on the mouse position
  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  // Create a Three.js geometry

  // Create the Shader Park mesh using the geometry
  const mesh = createSculptureWithGeometry(
    new THREE.SphereGeometry(1, 32, 32),
    spCode(),
    () => {
      return {
        time: clock.getElapsedTime(),
        mouse: mouse,
      };
    },
  );

  // Add the mesh to your Three.js scene
  scene.add(mesh);
  mesh.position.set(2, 2, 0);

  scene.add(spmesh);

  function spCode() {
    return `
    setMaxIterations(5);
    let pointerDown = input();
    
    let s = getSpace();
    let r = getRayDirection();
    
    let n = noise(s + vec3(0, 0, time*.1));
    let n1 = noise(r * 4 + vec3(0, 0, time*.1));
    
    metal(n*.5+.5 + n1);
    shine(n1*.5+.5 * n1);
    
    color(normal * .1 + vec3(n1, n, 1));
    boxFrame(vec3(2), abs(n) * .1 + .04 * abs(n1));
    sphere(n1 * n1);
    mixGeo(pointerDown);
    sphere(n * .5  +  .8);
  `;
  }

  // gui
  const settings = gui.addFolder("GUI Settings");
  const volumeFolder = gui.addFolder("Sound Volume");
  const soundControlsFolder = gui.addFolder("Sound Controls");

  const audioSettings = gui.addFolder("Audio Settings");

  const AUDIO_TWEAKS = {
    volume: 1.0,
    playbackRate: 1.0,
    loop: false,
    autoplay: true,
    muted: false,
    sampleRate: 48000,
    outputLatency: 0.04,
  };

  audioSettings
    .add(AUDIO_TWEAKS, "sampleRate", [8000, 16000, 24000, 44100, 48000])
    .onChange((value) => {
      console.log("🚀 ~ .onChange ~ value:", value);
      console.log(
        "🚀 ~ .onChange ~ listener.context.sampleRate:",
        listener.context.sampleRate,
      );
      // Update the sample rate of the AudioContext
      listener.context.sampleRate = value;
    });

  audioSettings
    .add(AUDIO_TWEAKS, "outputLatency", 0.01, 1.0)
    .step(0.01)
    .onChange((value) => {
      // Update the output latency of the AudioContext
      listener.context.outputLatency = value;
    });

  // GUI for point size
  settings.add(TWEAKS, "pointSize", 0.0, 100.0).onChange((value) => {
    material.uniforms.pointSize.value = value;
  });

  // settings for attractor position
  settings.add(TWEAKS, "attractorX", -5, 5).onChange((value) => {
    material.uniforms.attractor.value.x = value;
  });
  settings.add(TWEAKS, "attractorY", -5, 5).onChange((value) => {
    material.uniforms.attractor.value.y = value;
  });

  settings.add(TWEAKS, "metalness", -5, 5).onChange((value) => {
    silkMat.uniforms.noiseScale.value = value;
  });
  settings.add(TWEAKS, "noiseScale", -5, 5).onChange((value) => {
    silkMat.uniforms.noiseStrength.value = value;
  });
  settings.add(TWEAKS, "noiseStrength", -5, 5).onChange((value) => {
    silkMat.uniforms.noiseStrength.value = value;
  });

  settings.add(TWEAKS, "roughness", -5, 5).onChange((value) => {
    silkMat.uniforms.roughness.value = value;
  });

  settings
    .add(TWEAKS, "decay", -1.0, 200.0)
    .step(0.01)
    .onChange((value) => {
      material.uniforms.decay.value = value;
    });
  // settings control for colorFactor
  settings
    .add(TWEAKS, "colorFactor", -1.0, 20.0)
    .step(0.1)
    .onChange((value) => {
      material.uniforms.colorFactor.value = value;
    });
  settings
    .add(TWEAKS, "modulationFactor", -1.0, 20.0)
    .step(0.1)
    .onChange((value) => {
      material.uniforms.modulationFactor.value = value;
    });
  settings
    .add(TWEAKS, "time", 0.1, 1000.0)
    .step(0.1)
    .onChange((value) => {
      material.uniforms.time.value = value;
    });

  wrap.render = ({ playhead }) => {
    // const data = analyser.getAverageFrequency();

    // const hue = data / 256; // Normalize data to 0-1 range
    // const color = new THREE.Color().setHSL(hue, 1, 0.5);

    // // silk mat
    // silkMat.uniforms.noiseStrength.value = data / 256; // Adjust range as needed
    // silkMat.uniforms.silkColor.value = color;
    // silkMat.uniforms.time.value += data / 512;
    // silkMat.uniforms.metalness.value = data / 512;

    // // particle mat
    // material.uniforms.decay.value = data / 256;
    // material.uniforms.colorFactor.value = data / 256;
    // material.uniforms.time.value += data / 512;
    // material.uniforms.modulationFactor.value = data / 256; // Normalize data to 0-1 range

    // // attribute update
    // geometry.attributes.position.needsUpdate = true;
    // geometry.attributes.velocity.needsUpdate = true;
    // geometry.attributes.acolor.needsUpdate = true;
    // geometry.attributes.size.needsUpdate = true;

    // buffermat.uniforms.time.value += playhead;
    // buffermat.uniforms.r1.value = playhead;
    // buffermat.uniforms.r2.value = playhead;

    // // uniforms needupdate
    // material.uniformsNeedUpdate = true;
    // silkMat.uniformsNeedUpdate = true;

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
