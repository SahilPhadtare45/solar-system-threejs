// === Scene Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 30, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Orbit Controls ===
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// === Lighting ===
const light = new THREE.PointLight(0xffffff, 2, 300);
light.position.set(0, 0, 0);
scene.add(light);

// === Texture Loader ===
const textureLoader = new THREE.TextureLoader();

// === Add Stars ===
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starPositions = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starPositions.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars();

// === Add Sun ===
const sunTexture = textureLoader.load("textures/sun.jpg");
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// === Planet Data ===
const planetsData = [
  { name: "Mercury", texture: "mercury.jpg", size: 0.5, radius: 8, speed: 0.02 },
  { name: "Venus",   texture: "venus.jpg",   size: 0.9, radius: 11, speed: 0.015 },
  { name: "Earth",   texture: "earth.jpg",   size: 1.0, radius: 15, speed: 0.012 },
  { name: "Mars",    texture: "mars.jpg",    size: 0.8, radius: 18, speed: 0.010 },
  { name: "Jupiter", texture: "jupiter.jpg", size: 2.5, radius: 25, speed: 0.007 },
  { name: "Saturn",  texture: "saturn.jpg",  size: 2.0, radius: 32, speed: 0.005 },
  { name: "Uranus",  texture: "uranus.jpg",  size: 1.5, radius: 38, speed: 0.004 },
  { name: "Neptune", texture: "neptune.jpg", size: 1.5, radius: 44, speed: 0.003 }
];

// === Create Planets + UI ===
const controlsDiv = document.getElementById('controls');
const planets = [];

planetsData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const texture = textureLoader.load(`textures/${data.texture}`);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // UI slider
  const label = document.createElement('label');
  label.innerText = `${data.name} Speed:`;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0.001';
  slider.max = '0.05';
  slider.step = '0.001';
  slider.value = data.speed;

  controlsDiv.appendChild(label);
  controlsDiv.appendChild(slider);

  planets.push({
    name: data.name,
    mesh: mesh,
    radius: data.radius,
    angle: Math.random() * Math.PI * 2,
    getSpeed: () => parseFloat(slider.value)
  });
});

// === Pause Button ===
let isPaused = false;
const toggleBtn = document.getElementById('toggleBtn');
toggleBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  toggleBtn.textContent = isPaused ? "Resume" : "Pause";
});

// === Theme Toggle ===
const themeToggleBtn = document.getElementById('themeToggleBtn');
const controlsContainer = document.getElementById('controls');
let isDarkMode = false;
themeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  tooltip.classList.toggle("dark", isDarkMode);
  tooltip.classList.toggle("light", !isDarkMode);

  if (isDarkMode) {
    controlsContainer.classList.remove('light');
    controlsContainer.classList.add('dark');
    document.body.style.backgroundColor = '#000';
  } else {
    controlsContainer.classList.remove('dark');
    controlsContainer.classList.add('light');
    document.body.style.backgroundColor = '#fff';
  }
});
window.onload = () => {
  controlsContainer.classList.add('dark');
  tooltip.classList.add('dark');
};


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");
const planetNameEl = document.getElementById("planetName");
const planetDetailsEl = document.getElementById("planetDetails");

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// === Animate ===
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach((planet) => {
      planet.angle += planet.getSpeed();
      planet.mesh.position.x = planet.radius * Math.cos(planet.angle);
      planet.mesh.position.z = planet.radius * Math.sin(planet.angle);
    });
  }

  controls.update();

  raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

if (intersects.length > 0) {
  const intersected = intersects[0].object;
  const planet = planets.find(p => p.mesh === intersected);

  if (planet) {
    // Update tooltip
    planetNameEl.textContent = planet.name;
    planetDetailsEl.innerHTML = `
      Radius: ${planet.radius} AU<br>
      Speed: ${planet.getSpeed().toFixed(3)}
    `;

    // Convert 3D position to 2D screen position
    const vector = planet.mesh.position.clone().project(camera);
    const screenX = (vector.x + 1) / 2 * window.innerWidth;
    const screenY = (-vector.y + 1) / 2 * window.innerHeight;

    tooltip.style.left = `${screenX - 50}px`; // shift left slightly for center alignment
    tooltip.style.top = `${screenY - 70}px`;  // move above the planet
    tooltip.classList.remove("hidden");
  }
} else {
  tooltip.classList.add("hidden");
}

  renderer.render(scene, camera);
}

animate();

// === Responsive ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
