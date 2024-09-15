import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// Créer la scène
const scene = new THREE.Scene();

// Créer la caméra
const camera = new THREE.PerspectiveCamera(
    70, // FOV (Field of View)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near
    500 // Far
);

camera.position.z = 131; // Positionner la caméra
camera.position.y = 0;
camera.position.x = 20;

// Créer le renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajouter un éclairage de base
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
scene.add(light);

// Déclarer un parent pour le groupe
let group = new THREE.Group();
let pivot = new THREE.Group(); // Pivot qui restera à (0,0,0) pour la rotation
scene.add(pivot);
pivot.add(group); // Ajouter le groupe dans le pivot

// Créer un loader pour SVG
const loader = new SVGLoader();

// Charger un fichier SVG
loader.load(
    's.svg',  // <-- Remplace par ton vrai chemin
    (data) => {
        const paths = data.paths;

        // Vider le groupe avant d'ajouter de nouveaux objets
        group.clear();

        // Paramètres d'extrusion
        const extrudeSettings = {
            depth: 5,        // Profondeur de l'extrusion (3D)
            bevelEnabled: true,  // Ajouter un biseau
            bevelThickness: 5, // Épaisseur du biseau
            bevelSize: 2,      // Taille du biseau
            bevelSegments: 10     // Nombre de segments dans le biseau
        };

        paths.forEach((path) => {
            const material = new THREE.MeshPhongMaterial({
                color: path.color ? new THREE.Color(path.color) : new THREE.Color(0xffffff),
                side: THREE.DoubleSide,
                shininess: 20 // Pour un effet 3D brillant
            });

            const shapes = SVGLoader.createShapes(path);

            shapes.forEach((shape) => {
                // Utiliser ExtrudeGeometry pour donner de la profondeur à la forme SVG
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            });
        });

        // Centrer le groupe par rapport à son propre volume
        centerGroup(group);
    },
    (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
    (error) => console.log('Erreur de chargement SVG', error)
);

// Fonction pour centrer le groupe
function centerGroup(group) {
    const box = new THREE.Box3().setFromObject(group); // Calculer la bounding box
    const center = box.getCenter(new THREE.Vector3()); // Calculer le centre

    // Déplacer le groupe pour que son centre soit à (0, 0, 0)
    group.position.y -= center.y;
    group.position.x -= center.x;
    group.position.z -= center.z;
}

// Ajouter une fonction de redimensionnement
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Fonction d'animation
function animate() {
    requestAnimationFrame(animate);

    // Rotation autour du pivot (centré sur le groupe)
    pivot.rotation.y += 0.005;

    renderer.render(scene, camera);
}

animate();
