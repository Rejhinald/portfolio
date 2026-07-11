import * as THREE from "three";
import { PALETTE } from "./palette";

function std(color: number, roughness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: true });
}

/** A vermillion torii gate (two posts + kasagi + nuki beams). */
export function createToriiModel(): THREE.Group {
  const g = new THREE.Group();
  const mat = std(PALETTE.shu, 0.6);
  const h = 1.2;
  const w = 1.0;
  const postR = 0.06;

  const left = new THREE.Mesh(
    new THREE.CylinderGeometry(postR, postR * 1.2, h, 8),
    mat,
  );
  left.position.set(-w / 2, h / 2, 0);
  const right = left.clone();
  right.position.x = w / 2;
  g.add(left, right);

  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(w * 1.4, 0.1, 0.14), mat);
  kasagi.position.y = h + 0.02;
  kasagi.rotation.z = 0.02;
  g.add(kasagi);

  const nuki = new THREE.Mesh(new THREE.BoxGeometry(w * 1.12, 0.07, 0.1), mat);
  nuki.position.y = h * 0.74;
  g.add(nuki);

  return g;
}

/** A stone lantern (tōrō) with a warm emissive core. */
export function createLanternModel(): THREE.Group {
  const g = new THREE.Group();
  const stone = std(PALETTE.stone, 0.95);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.1, 6), stone);
  base.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.36, 6), stone);
  post.position.y = 0.29;
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), stone);
  box.position.y = 0.57;
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.13, 0.11),
    new THREE.MeshStandardMaterial({
      color: 0xffe6b0,
      emissive: 0xffcf80,
      emissiveIntensity: 0.9,
    }),
  );
  core.position.y = 0.57;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.13, 6), stone);
  cap.position.y = 0.74;

  g.add(base, post, box, core, cap);
  return g;
}
