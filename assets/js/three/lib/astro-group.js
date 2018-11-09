import * as THREE from 'three';
import _camelCase from 'lodash/camelCase';

import Specs from './specs';

const _specs = Symbol('specs');


export default class AstroGroup extends THREE.Group {
  get specs() { return this[_specs]; }

  constructor({ specs = new Specs() }) {
    super();

    if (!Specs.isPrototypeOf(specs)) {
      throw new SyntaxError('Given specs not an instance of Specs!');
    }

    this[_specs] = specs;
    this.name = specs.name || 'anonAstroGroup';
  }

  updatePosition() {}


  toString() {
    return this[_specs].toString();
  }
};
