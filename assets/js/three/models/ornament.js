import * as THREE from 'three';
import util from '../util';


export default class Ornament extends THREE.Group {
  constructor() {
    super();

    this.rotationSpeed = Math.random() * 0.01 + 0.003;
    this.rotationPosition = Math.random();

    this.addBauble();
    this.addAttachment();
    this.addAttachmentHook();

    const scale = Math.random() * 0.2 + 0.4;
    this.scale.set(scale, scale, scale);
  }

  addBauble() {
    // A random color assignment
    const colors = ['#ff0051', '#f56762','#a53c6c','#f19fa0','#72bdbf','#47689b'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const geometry = util.addNoise(new THREE.OctahedronGeometry(12, 1), 2);

    // The main bauble is an Octahedron
    const bauble = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color,
        flatShading: true,
        metalness: 0,
        roughness: 0.8,
        refractionRatio: 0.25,
      })
    );

    bauble.castShadow = true;
    bauble.receiveShadow = true;
    bauble.rotateZ(Math.random() * Math.PI * 2);
    bauble.rotateY(Math.random() * Math.PI * 2);

    this.add(bauble);
  }

  addAttachment() {
    const geometry = util.addNoise(new THREE.CylinderGeometry(4, 6, 10, 6, 1), 0.5);

    // A cylinder to represent the top attachment
    const attachment = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial( {
        color: 0xf8db08,
        flatShading: true,
        metalness: 0,
        roughness: 0.8,
        refractionRatio: 0.25,
      })
    );

    attachment.position.y += 8;
    attachment.castShadow = true;
    attachment.receiveShadow = true;

    this.add(attachment);
  }

  addAttachmentHook() {
    const geometry = util.addNoise(new THREE.TorusGeometry(2, 1, 6, 4, Math.PI), 0.2);

    // A Torus to represent the top hook
    const hook = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0xf8db08,
        flatShading: true,
        metalness: 0,
        roughness: 0.8,
        refractionRatio: 0.25
      })
    );

    hook.position.y += 12.5;
    hook.castShadow = true;
    hook.receiveShadow = true;

    this.add(hook);
  }

  updatePosition() {
    this.rotationPosition += this.rotationSpeed;
    this.rotation.y = (Math.sin(this.rotationPosition));
  }
}
