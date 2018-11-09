import _camelCase from 'lodash/camelCase';
import _defaults from 'lodash/defaults';
import _isNumber from 'lodash/isNumber';

const _groupScalars = Symbol('groupScalars');
const _specs = Symbol('specs');
const _specsMap = Symbol('specsMap');
const _toStringColumnWidth = Symbol('toStringColumnWidth');


const proxyHandler = {
  getPrototypeOf(target) {
    return Specs;
  },

  get(target, prop, receiver) {
    // console.log('prop: %o target: %o, receiver: %o', prop, target, receiver);
    if (!target[prop]) {
      // console.log('BodyProxy: !target.hasOwnProperty(%o)', prop);
      if (target[_specsMap].hasOwnProperty(prop)) {
        // console.log('BodyProxy: target[_specsMap].hasOwnProperty(%o)', prop);
        return target[_specsMap][prop].value;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
};


export default class Specs {
  constructor(specs = {}, opts = {}) {
    const { groupScalars = [], ...otherOpts } = opts;

    this[_groupScalars] = groupScalars;
    this[_toStringColumnWidth] = 0;

    this[_specs] = specs;
    this[_specsMap] = this.getSpecMap(otherOpts);

    return new Proxy(this, proxyHandler);
  }


  camelCaseKeys(obj = {}) {
    const newObj = {};
    const objEntries = Object.entries(obj);

    // should there be an option to omit entries?
    for (let [key, val] of objEntries) {
      newObj[_camelCase(key)] = val;
    }

    return newObj;
  }

  getSpecMap(partialMap = {}) {
    const specMap = {};
    const camelSpecs = this.camelCaseKeys(this[_specs]);
    const camelPartial = this.camelCaseKeys(partialMap);
    const specsEntries = Object.entries(camelSpecs);
    let groupScalar;

    for (let [key, val] of specsEntries) {
      if (key.length > this[_toStringColumnWidth]) {
        this[_toStringColumnWidth] = key.length;
      }

      groupScalar = this[_groupScalars].find(gs => gs.keys.includes(key));

      specMap[key] = _defaults(
        {
          rawValue: camelSpecs[key],
          get value() {
            return _isNumber(this.rawValue)
              ? this.groupScalar * (this.scalar * this.rawValue)
              : this.rawValue;
          },
        },
        camelPartial[key],
        {
          required: false,
          scalar: 1,
          groupScalar: groupScalar ? groupScalar.scalar : 1,
          units: '',
        }
      );
    }

    return specMap;
  }

  toDeg(key) {
    return this[_specsMap][key].value * 180 / Math.PI;
  }

  toRad(key) {
    return this[_specsMap][key].value * Math.PI / 180;
  }

  toString() {
    const specMapEntries = Object.entries(this[_specsMap]);
    const rows = [];
    let keyCol, desc;

    for (let [key, spec] of specMapEntries) {
      desc = spec.desc ? ` (${spec.desc})` : '';
      keyCol = `${key}:${' '.repeat(this[_toStringColumnWidth] - key.length)}`;
      rows.push(`${keyCol} ${spec.value} ${spec.units}${desc}`);
    }

    return rows.join("\n");
  }
};
