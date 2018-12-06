import _camelCase from 'lodash/camelCase';
import _defaults from 'lodash/defaults';
import _isFunction from 'lodash/isFunction';
import _isNumber from 'lodash/isNumber';
import _mapKeys from 'lodash/mapKeys';

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
    this[_toStringColumnWidth] = 0;

    this[_specs] = specs;
    this[_specsMap] = this.getSpecMap(opts);

    return new Proxy(this, proxyHandler);
  }


  getSpecMap(partialMap = {}) {
    const specMap = {};
    const camelSpecs = this._camelCaseKeys(this[_specs]);
    const camelPartial = this._camelCaseKeys(partialMap);
    const specsEntries = Object.entries(camelSpecs);

    for (let [key, val] of specsEntries) {
      if (key.length > this[_toStringColumnWidth]) {
        this[_toStringColumnWidth] = key.length;
      }

      camelPartial[key] || (camelPartial[key] = {});

      specMap[key] = _defaults(
        {
          get value() {
            return _isNumber(this.rawValue)
              ? this.scale(this.rawValue)
              : this.rawValue;
          },
          rawValue: camelSpecs[key],
          scalar: this._getScalarFn(camelPartial[key].scalar),
        },
        camelPartial[key],
        {
          required: false, // todo
          units: '',
          scale(x) { return this.scalar() * x; },
        }
      );

      if (!_isFunction(specMap[key].scalar)) {
        specMap[key].scalar = () => specMap[key].scalar;
      }
    }

    return specMap;
  }

  toDeg(key) {
    return this[_specsMap][key].value * 180 / Math.PI;
  }

  toRad(key) {
    return this[_specsMap][key].value * Math.PI / 180;
  }

  _camelCaseKeys(obj = {}) {
    return _mapKeys(obj, (val, key) => _camelCase(key));
  }

  _getScalarFn(scalar = 1) {
    const scalarFn = () => scalar;
    return _isFunction(scalar) ? scalar : scalarFn;
  }

  toString() {
    const specMapEntries = Object.entries(this[_specsMap]);
    const rows = [];
    let keyCol, desc;

    for (let [key, spec] of specMapEntries) {
      desc = spec.desc ? ` (${spec.desc})` : '';
      keyCol = `${key}:${' '.repeat(this[_toStringColumnWidth] - key.length)}`;
      rows.push(`${keyCol} ${spec.value}${spec.units}${desc}`);
    }

    return rows.join("\n");
  }
};
