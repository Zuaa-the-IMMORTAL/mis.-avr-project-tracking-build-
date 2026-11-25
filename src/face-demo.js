// src/face-demo.js - Demonstrasi 2: face tracking (MindAR + Three.js) dengan Mahkota
import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar/mindar-face-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

// Konstanta posisi dan skala mahkota di atas kepala
const ANCHOR_INDEX = 168; // titik landmark di antara kedua mata
const CROWN_SCALE = 1.2;
const CROWN_OFFSET = { x: 0, y: 0.35, z: 0.05 }; 

function buildCrown() {
  const group = new THREE.Group();

  // Material emas untuk badan mahkota
  const goldMat = new THREE.MeshStandardMaterial({ 
    color: 0xffd700, 
    metalness: 0.8, 
    roughness: 0.2 
  });

  // Material permata untuk hiasan di ujung mahkota
  const gemMat = new THREE.MeshStandardMaterial({ 
    color: 0x14b8a6, 
    metalness: 0.5, 
    roughness: 0.1,
    emissive: 0x0d9488,
    emissiveIntensity: 0.3
  });

  // 1. Membuat Dasar Mahkota (Silinder melingkar)
  const baseGeo = new THREE.CylinderGeometry(0.25, 0.27, 0.08, 32);
  const base = new THREE.Mesh(baseGeo, goldMat);
  base.position.y = 0.04;
  group.add(base);

  // 2. Membuat Puncak Mahkota melingkar beserta permata di ujungnya
  const peakCount = 5;
  for (let i = 0; i < peakCount; i++) {
    const angle = (i / peakCount) * Math.PI * 2;
    const radius = 0.24;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    // Kerucut puncak mahkota
    const spikeGeo = new THREE.ConeGeometry(0.05, 0.18, 4);
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(x, 0.15, z);
    spike.rotation.y = angle;
    group.add(spike);

    // Permata kecil di atas puncak
    const gemGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(x, 0.25, z);
    group.add(gem);
  }

  // Mengatur skala dan posisi akhir mahkota
  group.scale.setScalar(CROWN_SCALE);
  group.position.set(CROWN_OFFSET.x, CROWN_OFFSET.y, CROWN_OFFSET.z);

  return group;
}

async function start() {
 const mindarThree = new MindARThree({ container: document.getElementById('container') });
 const { renderer, scene, camera } = mindarThree;
 const anchor = mindarThree.addAnchor(ANCHOR_INDEX);
 
 // Menempelkan mahkota ke anchor wajah
 anchor.group.add(buildCrown());

 scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.4));
 const dir = new THREE.DirectionalLight(0xffffff, 1.2);
 dir.position.set(0, 1, 2);
 scene.add(dir);

 await mindarThree.start(); 
 setStatus('Mencari wajah', 'searching');

 let hadFace = false, lostCount = 0;
 renderer.setAnimationLoop(() => {
 const hasFace = mindarThree.getLatestEstimate() !== null;
 if (hasFace !== hadFace) {
 hadFace = hasFace;
 if (hasFace) setStatus('Wajah terdeteksi', 'found');
 else { lostCount++; setStatus('Wajah tidak terdeteksi - mencari wajah', 'searching'); }
 document.getElementById('info').textContent = 'Wajah hilang ' + lostCount + ' kali.';
 }
 renderer.render(scene, camera);
 });
}

setupStartButton(start);