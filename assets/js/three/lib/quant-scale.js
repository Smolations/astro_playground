const _domain = Symbol('domain');
const _range = Symbol('range');
const _f = Symbol('f');
const _quants = Symbol('quants');
const _xQuantIndices = Symbol('xQuantIndices');
const _yQuantIndices = Symbol('yQuantIndices');


export default class QuantScale {
  get domain() { return this[_domain]; }
  get range() { return this[_range]; }


  constructor({
    domain = [0, 1],
    range = [0, 1],
    f = (x) => { return x; },
    quantiles = 5,
  } = {}) {
    this[_domain] = domain;
    this[_range] = range;
    this[_f] = f;
    this[_quants] = [];
    this[_xQuantIndices] = [];

    const [xMin, xMax] = domain;
    const [yMin, yMax] = range;
    const xQuantSize = (xMax - xMin) / quantiles;
    const yQuantSize = (yMax - yMin) / quantiles;

    // this[_quants].push({
    //   domain: [xMin, xMin + xQuantSize],
    //   range: [yMin, yMin + yQuantSize],
    // });

    // for (let i = 1; i < quantiles - 1; i++) {
    //   this[_quants].push({
    //     domain: [xMin + ],
    //     range: [yMin, yMin + yQuantSize],
    //   });
    // }

    const domainMag = xMax - xMin;
    const rangeMag = yMax - yMin;
    const domainLinearFunc = (x) => { return x; }
    const rangeLinearFunc = (pt) => { return pt * rangeMag + yMin; }

    // (xMin, yMin), (xMax, yMax)
    const quantFn = (x) => {
      // determine which quant x falls in
      // get appropriate transform function

      const xDiff = x - xMin;
      const pts = xDiff / (domainMag || xDiff || 1);

      // console.log(`pts(${pts}) = ((${x - xMin}) / ${domainMag}) || 1`);

      return rangeLinearFunc(pts);
    };

    quantFn.domain = domain;
    quantFn.range = range;

    return quantFn;
  }

  getQuantIndex(x) {

  }
};
