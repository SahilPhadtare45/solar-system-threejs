const themeToggleBtn = document.getElementById('themeToggleBtn');
const controlsContainer = document.getElementById('controls');

let isDarkMode = false;

themeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;

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
  controlsContainer.classList.add('light');
};


// -------------------
// 🚀 SCENE SETUP
// -------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(50, 30, 100); // Angled view
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let isPaused = false;

const toggleBtn = document.getElementById('toggleBtn');
toggleBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  toggleBtn.textContent = isPaused ? "Resume" : "Pause";
});

// -------------------
// 🌀 ORBIT CONTROLS
// -------------------
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// -------------------
// 🌞 LIGHTING + SUN
// -------------------
const light = new THREE.PointLight(0xffffff, 2, 300);
light.position.set(0, 0, 0);
scene.add(light);

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

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

// -------------------
// 🪐 PLANET DATA
// -------------------
const planetsData = [
  { name: "Mercury", color: 0xaaaaaa, size: 0.5, radius: 8, speed: 0.02 },
  { name: "Venus",   color: 0xffcc99, size: 0.9, radius: 11, speed: 0.015 },
  { name: "Earth",   color: 0x0000ff, size: 1.0, radius: 15, speed: 0.012 },
  { name: "Mars",    color: 0xff3300, size: 0.8, radius: 18, speed: 0.010 },
  { name: "Jupiter", color: 0xff9933, size: 2.5, radius: 25, speed: 0.007 },
  { name: "Saturn",  color: 0xffff99, size: 2.0, radius: 32, speed: 0.005 },
  { name: "Uranus",  color: 0x66ffff, size: 1.5, radius: 38, speed: 0.004 },
  { name: "Neptune", color: 0x3366ff, size: 1.5, radius: 44, speed: 0.003 }
];

// -------------------
// 🧱 CREATE PLANETS
// -------------------
const controlsDiv = document.getElementById('controls');
const planets = [];

planetsData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

   // Create UI slider
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
  getSpeed: () => parseFloat(slider.value) // ✅ Always get current value
});
});

// -------------------
// 🔄 ANIMATION LOOP
// -------------------
function animate() {
  requestAnimationFrame(animate);
 
  if (!isPaused) {
  // Update planet positions
  planets.forEach((planet) => {
    planet.angle += planet.getSpeed();
    planet.mesh.position.x = planet.radius * Math.cos(planet.angle);
    planet.mesh.position.z = planet.radius * Math.sin(planet.angle);
  });
  }
  // Update camera controls
  controls.update();

  renderer.render(scene, camera);
}

animate();

// -------------------
// 📱 RESPONSIVE RESIZE
// -------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
