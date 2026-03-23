const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(60);

// --- 1. ESTRELLAS ---
const starGeo = new THREE.BufferGeometry();
const starCount = 5000;
const posArray = new Float32Array(starCount * 3);
for(let i=0; i < starCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 400;
starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.1, color: 0xffffff })));

// --- 2. SATURNO ---
const saturnGroup = new THREE.Group();
scene.add(saturnGroup);
const planet = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), new THREE.MeshPhongMaterial({ color: 0xdfd3a2, shininess: 10 }));
saturnGroup.add(planet);
const ring = new THREE.Mesh(new THREE.RingGeometry(14, 22, 64), new THREE.MeshPhongMaterial({ color: 0xc2b280, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }));
ring.rotation.x = Math.PI / 2.2;
saturnGroup.add(ring);

const light = new THREE.PointLight(0xffffff, 1.5, 200);
light.position.set(50, 50, 50);
scene.add(light, new THREE.AmbientLight(0x404040));

// --- 3. FRASES BLANCAS (Courier New) ---
const phrases = [
    "Entre galaxias, te elijo a ti", 
    "Perdidos en la misma órbita", 
    "En este universo te encontré", 
    "Sonríe siempre", 
    "Luz en mi vida", 
    "Gravedad que nos une",
    "Amor sin límites"
];
const textGroup = new THREE.Group();
scene.add(textGroup);

phrases.forEach((txt, i) => {
    const can = document.createElement('canvas');
    const ctx = can.getContext('2d');
    can.width = 512; can.height = 128;
    ctx.font = 'Bold 36px "Courier New", Courier, monospace'; 
    ctx.fillStyle = '#ffffff'; 
    ctx.shadowBlur = 10; ctx.shadowColor = "rgba(255, 255, 255, 0.8)"; 
    ctx.fillText(txt, 10, 80);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(can) }));
    const angle = i * (Math.PI * 2 / phrases.length);
    sprite.position.set(Math.cos(angle) * 40, (Math.random() - 0.5) * 15, Math.sin(angle) * 40);
    sprite.scale.set(16, 4, 1);
    textGroup.add(sprite);
});

// --- 4. ESTRELLAS FUGACES ---
const meteors = [];
function createMeteor() {
    const geo = new THREE.BufferGeometry();
    geo.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(2,-2,-15)]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true }));
    line.position.set((Math.random()-0.5)*300, (Math.random()-0.5)*300, -200);
    scene.add(line);
    meteors.push({ mesh: line, speedX: (Math.random()-0.5)*4, speedY: (Math.random()-0.5)*4, speedZ: 6 + Math.random()*6, life: 1.0 });
}

// --- 5. CONTROL DUAL (PC Y TELÉFONO) ---
let mouseX = 0, mouseY = 0;
function handleMove(x, y) {
    mouseX = (x - window.innerWidth / 2) / 10; 
    mouseY = (y - window.innerHeight / 2) / 10;
}

// Evento para Mouse
document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

// Evento para Touch (Dedo)
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

// --- LÓGICA DE INICIO ---
const overlay = document.getElementById('overlay');
const musica = document.getElementById('musica-galaxia');

overlay.addEventListener('click', () => {
    overlay.style.display = 'none'; 
    if (musica) musica.play().catch(() => {});
    animate(); 
});

function animate() {
    requestAnimationFrame(animate);
    saturnGroup.rotation.y += 0.008;
    textGroup.rotation.y += 0.003;
    if(Math.random() < 0.12) createMeteor();
    for(let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        m.mesh.position.x += m.speedX; m.mesh.position.y += m.speedY; m.mesh.position.z += m.speedZ;
        m.life -= 0.015; m.mesh.material.opacity = m.life;
        if(m.life <= 0) { scene.remove(m.mesh); meteors.splice(i, 1); }
    }
    camera.position.x += (mouseX - camera.position.x) * 0.1;
    camera.position.y += (-mouseY - camera.position.y) * 0.1;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}