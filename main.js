// 1. Setup 3D Scene
const container = document.getElementById('game-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 2. Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

// 3. Ground (Battle Arena)
const groundGeo = new THREE.PlaneGeometry(150, 150);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x3b7a57 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 4. Obstacles (Roblox-style Blocks)
function addBlock(x, z, w, h, d, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color: color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  scene.add(mesh);
}
addBlock(-8, -8, 6, 4, 6, 0x8b5a2b);
addBlock(12, -15, 8, 6, 8, 0x4a69bd);
addBlock(0, -25, 10, 3, 4, 0x78e08f);

// 5. Player Box
const playerGeo = new THREE.BoxGeometry(1.2, 2.4, 1.2);
const playerMat = new THREE.MeshStandardMaterial({ color: 0xe55039 });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 1.2, 0);
scene.add(player);

// 6. Touch Joystick Movement
let moveX = 0;
let moveZ = 0;
const joystickZone = document.getElementById('joystick-zone');
const joystickHandle = document.getElementById('joystick-handle');
const maxDistance = 35;

joystickZone.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const rect = joystickZone.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let deltaX = touch.clientX - centerX;
  let deltaY = touch.clientY - centerY;
  const dist = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
  const angle = Math.atan2(deltaY, deltaX);

  const posX = Math.cos(angle) * dist;
  const posY = Math.sin(angle) * dist;

  joystickHandle.style.transform = `translate(${posX}px, ${posY}px)`;
  moveX = posX / maxDistance;
  moveZ = posY / maxDistance;
});

joystickZone.addEventListener('touchend', () => {
  joystickHandle.style.transform = `translate(0px, 0px)`;
  moveX = 0;
  moveZ = 0;
});

// 7. Game Loop
function animate() {
  requestAnimationFrame(animate);

  player.position.x += moveX * 0.15;
  player.position.z += moveZ * 0.15;

  camera.position.x = player.position.x;
  camera.position.y = player.position.y + 6;
  camera.position.z = player.position.z + 10;
  camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
