import * as THREE from "three";
import * as dat from "dat.gui";
import { ssam } from "ssam";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import particlesVert from "./shaders/particlesystem.vert";
import particlesFrag from "./shaders/particlesystem.frag";
import metallicVert from "./shaders/metallic.vert";
import metallicFrag from "./shaders/metallic.frag";

const sketch = ({ wrap, canvas, width, height, pixelRatio }) => {
  // RENDERER
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0xffffff, 0);
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

  // LIGHTS
  //   const ambient = new THREE.AmbientLight(0x8c6239, 3);
  //   scene.add(ambient);

  //   const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  //   directionalLight.position.set(-1, 1, 1).normalize();
  //   scene.add(directionalLight);

  const sound = new THREE.Audio(listener);
  const audioPlayer = document.getElementById("audioPlayer");
  sound.setMediaElementSource(audioPlayer);
  audioPlayer.play();

  const oscillator = listener.context.createOscillator();

  const audioLoader = new THREE.AudioLoader();

  // create an AudioAnalyser, passing in the sound and desired fftSize
  const analyser = new THREE.AudioAnalyser(sound, 32);

  // get the average frequency of the sound
  const data = analyser.getAverageFrequency();

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
    blendEquation: THREE.MaxEquation,
    // blendDst: THREE.OneFactor,
  });
  const meshSphere = new THREE.Mesh(sphereGeo, silkMat);
  scene.add(meshSphere);

  meshSphere.add(sound);

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
      pointSize: { value: 0.8 },
      attractor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: TWEAKS.time },
      colorFactor: { value: TWEAKS.colorFactor }, // Initial value for colorFactor
      decay: { value: TWEAKS.decay }, // Add decay here
      modulationFactor: { value: TWEAKS.modulationFactor }, // New uniform
    },
    vertexShader: particlesVert,
    fragmentShader: particlesFrag,
    blending: THREE.SubtractiveBlending,
    depthTest: false,
    transparent: true,
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

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
    const anim = playhead * Math.PI * 0.05;
    const anim2 = Math.sin(Math.sqrt(9 ^ (2 - playhead) ^ 2)) * playhead;
    material.uniforms.time.value += 0.05;
    silkMat.uniforms.time.value += anim;
    material.uniforms.decay.value = TWEAKS.decay;
    material.uniforms.colorFactor.value = TWEAKS.colorFactor;
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.velocity.needsUpdate = true;
    geometry.attributes.acolor.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    silkMat.uniforms.time.value += 0.005;
    silkMat.uniformsNeedUpdate = true;
    // material.uniformsNseedUpdat = true;

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
