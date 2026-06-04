import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const DEFAULT_MODEL_URL = "./assets/WorkshopLayout_Draft_Ver1.fbx";
const DEFAULT_MODEL_NAME = "WorkshopLayout_Draft_Ver1.fbx";

const canvas = document.querySelector("#viewer");
const loadingOverlay = document.querySelector("#loadingOverlay");
const loadingTitle = document.querySelector("#loadingTitle");
const loadingProgress = document.querySelector("#loadingProgress");
const dropOverlay = document.querySelector("#dropOverlay");
const fileInput = document.querySelector("#fileInput");

const modelName = document.querySelector("#modelName");
const meshCount = document.querySelector("#meshCount");
const triangleCount = document.querySelector("#triangleCount");
const dimensions = document.querySelector("#dimensions");
const fileSize = document.querySelector("#fileSize");
const modelStatus = document.querySelector("#modelStatus");

const resetViewButton = document.querySelector("#resetView");
const toggleGridButton = document.querySelector("#toggleGrid");
const toggleWireframeButton = document.querySelector("#toggleWireframe");
const toggleRotateButton = document.querySelector("#toggleRotate");
const saveImageButton = document.querySelector("#saveImage");
const fullscreenButton = document.querySelector("#fullscreen");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50000);
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();
const loader = new FBXLoader();

let currentModel = null;
let currentObjectUrl = null;
let modelBounds = null;
let baseGrid = null;
let lastCameraFrame = null;
let dragDepth = 0;

const state = {
  grid: true,
  wireframe: false,
  rotate: false,
};

setupScene();
setupEvents();
resize();
loadDefaultModel();
animate();

function setupScene() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.setClearColor(0xf5f2ea, 1);

  camera.position.set(12, 9, 12);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.screenSpacePanning = true;
  controls.autoRotateSpeed = 0.9;

  const ambient = new THREE.HemisphereLight(0xffffff, 0xded6c7, 2.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(24, 32, 18);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xeef8ff, 1.65);
  fill.position.set(-18, 14, -26);
  scene.add(fill);

  const front = new THREE.DirectionalLight(0xffffff, 1.1);
  front.position.set(0, 12, 24);
  scene.add(front);
}

function setupEvents() {
  window.addEventListener("resize", resize);

  resetViewButton.addEventListener("click", () => {
    if (lastCameraFrame) {
      applyCameraFrame(lastCameraFrame);
    }
  });

  toggleGridButton.addEventListener("click", () => {
    state.grid = !state.grid;
    toggleGridButton.classList.toggle("is-active", state.grid);
    if (baseGrid) {
      baseGrid.visible = state.grid;
    }
  });

  toggleWireframeButton.addEventListener("click", () => {
    state.wireframe = !state.wireframe;
    toggleWireframeButton.classList.toggle("is-active", state.wireframe);
    setWireframe(state.wireframe);
  });

  toggleRotateButton.addEventListener("click", () => {
    state.rotate = !state.rotate;
    controls.autoRotate = state.rotate;
    toggleRotateButton.classList.toggle("is-active", state.rotate);
  });

  saveImageButton.addEventListener("click", saveSnapshot);
  fullscreenButton.addEventListener("click", toggleFullscreen);

  fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      loadModelFromFile(file);
    }
    event.target.value = "";
  });

  window.addEventListener("dragenter", (event) => {
    if (!hasDraggedFiles(event)) {
      return;
    }
    event.preventDefault();
    dragDepth += 1;
    dropOverlay.hidden = false;
  });

  window.addEventListener("dragover", (event) => {
    if (!hasDraggedFiles(event)) {
      return;
    }
    event.preventDefault();
  });

  window.addEventListener("dragleave", (event) => {
    if (!hasDraggedFiles(event)) {
      return;
    }
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      dropOverlay.hidden = true;
    }
  });

  window.addEventListener("drop", (event) => {
    if (!hasDraggedFiles(event)) {
      return;
    }
    event.preventDefault();
    dragDepth = 0;
    dropOverlay.hidden = true;
    const [file] = event.dataTransfer.files;
    if (file) {
      loadModelFromFile(file);
    }
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function hasDraggedFiles(event) {
  return Array.from(event.dataTransfer?.types || []).includes("Files");
}

function loadDefaultModel() {
  setLoading(true, "Loading model", "0%");
  setStatus("Loading");
  modelName.textContent = DEFAULT_MODEL_NAME;

  loader.load(
    DEFAULT_MODEL_URL,
    (object) => {
      setModel(object, {
        name: DEFAULT_MODEL_NAME,
        bytes: null,
        status: "Ready",
      });
      setLoading(false);
    },
    (xhr) => {
      if (xhr.total > 0) {
        const progress = Math.round((xhr.loaded / xhr.total) * 100);
        loadingProgress.textContent = `${progress}%`;
        fileSize.textContent = formatBytes(xhr.total);
      }
    },
    (error) => {
      showLoadError(error);
    },
  );
}

async function loadModelFromFile(file) {
  if (!file.name.toLowerCase().endsWith(".fbx")) {
    setStatus("Use an FBX file", true);
    return;
  }

  try {
    setLoading(true, "Opening model", formatBytes(file.size));
    setStatus("Loading");
    const buffer = await file.arrayBuffer();
    const object = loader.parse(buffer, "");
    setModel(object, {
      name: file.name,
      bytes: file.size,
      status: "Ready",
    });
    setLoading(false);
  } catch (error) {
    showLoadError(error);
  }
}

function setModel(object, info) {
  disposeCurrentModel();
  currentModel = object;
  currentModel.name = info.name;
  scene.add(currentModel);

  prepareMaterials(currentModel);
  centerModel(currentModel);
  modelBounds = new THREE.Box3().setFromObject(currentModel);
  updateGrid(modelBounds);
  updateMetrics(currentModel, modelBounds, info);
  fitCameraToObject(modelBounds);
  setWireframe(state.wireframe);
  setStatus(info.status);
}

function centerModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
}

function prepareMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = true;

    if (!child.material) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xd8d2c4,
        roughness: 0.88,
        metalness: 0.05,
      });
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.side = THREE.DoubleSide;
      material.wireframe = state.wireframe;
      if (child.geometry?.hasAttribute("color")) {
        material.vertexColors = true;
      }
      if (material.emissive) {
        material.emissive.set(0x202020);
        material.emissiveIntensity = 0.22;
      }
      material.needsUpdate = true;
    });
  });
}

function updateGrid(box) {
  if (baseGrid) {
    scene.remove(baseGrid);
    baseGrid.geometry.dispose();
    disposeMaterial(baseGrid.material);
  }

  const size = box.getSize(new THREE.Vector3());
  const maxSide = Math.max(size.x, size.z, 10);
  const gridSize = Math.ceil(maxSide * 1.25);
  const divisions = Math.min(80, Math.max(20, Math.round(gridSize / 2)));

  baseGrid = new THREE.GridHelper(gridSize, divisions, 0x108f7d, 0xb8b2a5);
  baseGrid.position.y = box.min.y;
  baseGrid.visible = state.grid;
  forEachMaterial(baseGrid.material, (material) => {
    material.transparent = true;
    material.opacity = 0.58;
  });
  scene.add(baseGrid);
}

function updateMetrics(object, box, info) {
  let meshes = 0;
  let triangles = 0;

  object.traverse((child) => {
    if (!child.isMesh || !child.geometry) {
      return;
    }
    meshes += 1;
    const position = child.geometry.getAttribute("position");
    if (position) {
      triangles += child.geometry.index ? child.geometry.index.count / 3 : position.count / 3;
    }
  });

  const size = box.getSize(new THREE.Vector3());
  modelName.textContent = info.name;
  meshCount.textContent = formatNumber(meshes);
  triangleCount.textContent = formatNumber(Math.round(triangles));
  dimensions.textContent = `${formatLength(size.x)} x ${formatLength(size.y)} x ${formatLength(size.z)}`;
  if (info.bytes) {
    fileSize.textContent = formatBytes(info.bytes);
  }
}

function fitCameraToObject(box) {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 1);
  const fitHeightDistance = maxSize / (2 * Math.tan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.35;
  const angle = Math.PI / 5;
  const height = Math.max(size.y * 0.42, maxSize * 0.24);

  const position = new THREE.Vector3(
    center.x + Math.sin(angle) * distance,
    center.y + height,
    center.z + Math.cos(angle) * distance,
  );

  lastCameraFrame = {
    position: position.clone(),
    target: center.clone(),
    near: Math.max(distance / 1000, 0.01),
    far: Math.max(distance * 12, 1000),
  };

  applyCameraFrame(lastCameraFrame);
}

function applyCameraFrame(frame) {
  camera.near = frame.near;
  camera.far = frame.far;
  camera.position.copy(frame.position);
  camera.updateProjectionMatrix();
  controls.target.copy(frame.target);
  controls.update();
}

function setWireframe(enabled) {
  if (!currentModel) {
    return;
  }

  currentModel.traverse((child) => {
    if (!child.isMesh || !child.material) {
      return;
    }
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.wireframe = enabled;
      material.needsUpdate = true;
    });
  });
}

function disposeCurrentModel() {
  if (!currentModel) {
    return;
  }

  scene.remove(currentModel);
  currentModel.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    disposeMaterial(child.material);
  });
  currentModel = null;

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function forEachMaterial(material, callback) {
  const materials = Array.isArray(material) ? material : [material];
  materials.filter(Boolean).forEach(callback);
}

function disposeMaterial(material) {
  forEachMaterial(material, (item) => {
    Object.values(item).forEach((value) => {
      if (value?.isTexture) {
        value.dispose();
      }
    });
    item.dispose();
  });
}

function resize() {
  const { clientWidth, clientHeight } = canvas.parentElement;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
}

function saveSnapshot() {
  renderer.render(scene, camera);
  const link = document.createElement("a");
  link.download = `${(currentModel?.name || "fbx-viewer").replace(/\.fbx$/i, "")}.png`;
  link.href = renderer.domElement.toDataURL("image/png");
  link.click();
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
  resize();
}

function setLoading(visible, title = "", progress = "") {
  loadingOverlay.classList.toggle("is-hidden", !visible);
  if (title) {
    loadingTitle.textContent = title;
  }
  if (progress) {
    loadingProgress.textContent = progress;
  }
}

function setStatus(text, warning = false) {
  modelStatus.textContent = text;
  modelStatus.classList.toggle("is-warning", warning);
}

function showLoadError(error) {
  console.error(error);
  setLoading(false);
  setStatus("Could not load model", true);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "-";
  }
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatLength(value) {
  const absolute = Math.abs(value);
  if (absolute >= 100) {
    return value.toFixed(0);
  }
  if (absolute >= 10) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
}
