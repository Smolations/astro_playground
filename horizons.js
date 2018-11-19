const fs = require('fs');
const et = require('expect-telnet');

const host = 'horizons.jpl.nasa.gov';
const port = 6775;
const hostAndPort = `${host}:${port}`;

const bodiesData = { bodies: [] };


class JPL {
  async getOrbitalElements(hId, hIdCenter) {
    const colonPatt = /\:\s*$/;

    return new Promise((resolve, reject) => {
      et(hostAndPort, [
        { expect: /Horizons> $/, send: `${hId}\n` },
        { expect: colonPatt, send: 'E\n' }, // Select ... [E]phemeris, [F]tp, [M]ail, [R]edisplay, ?, <cr>:
        { expect: colonPatt, send: 'e\n' }, // Observe, Elements, Vectors  [o,e,v,?] :
        { expect: colonPatt, send: `${hIdCenter}\n` }, // Coordinate system center   [ ###, ? ] :
        { expect: colonPatt, send: 'eclip\n' }, // Reference plane [eclip, frame, body ] :
        { expect: colonPatt, send: '2018-Nov-14 00:00\n' }, // Starting TDB [>= 9999BC-Mar-20 00:00] :
        { expect: colonPatt, send: '2018-Nov-14 00:01\n' }, // Ending   TDB [<=   9999-Dec-31 12:00] :
        { expect: colonPatt, send: '1d\n' }, // Output interval [ex: 10m, 1h, 1d, ? ] :
        // { expect: colonPatt, send: '\n' }, // Accept default output [ cr=(y), n, ?] :
        { expect: colonPatt, send: 'n\n' }, // Accept default output [ cr=(y), n, ?] :
        { expect: colonPatt, send: 'J2000\n' }, // Output reference frame [J2000, B1950] :
        { expect: colonPatt, send: '1\n' }, // Output units [1=KM-S, 2=AU-D, 3=KM-D] :
        { expect: colonPatt, send: 'YES\n' }, // Spreadsheet CSV format    [ YES, NO ] :
        { expect: colonPatt, send: 'YES\n' }, // Label osculating elements [ YES, NO ] :
        { expect: colonPatt, send: 'ABS\n' }, // Type of periapsis time   [ ABS, REL ] :
        { expect: colonPatt, out: (output) => {
          // console.log(`Fetched orbital elements for ${hId}`);
          // console.log(output)
          const params = this.parseElements(output);
          resolve(params);
        }, send: 'x\r' },
      ], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          reject('Something went terribly awry...');
        }
      });
    });
  }

  // $$SOE
  // 2458436.500000000, A.D. 2018-Nov-14 00:00:00.0000 TDB, EC= 6.319796616101976E-02 ...
  // $$EOE
  //
  // JDTDB    Julian Day Number, Barycentric Dynamical Time
  //   EC     Eccentricity, e
  //   QR     Periapsis distance, q (km)
  //   IN     Inclination w.r.t XY-plane, i (degrees)
  //   OM     Longitude of Ascending Node, OMEGA, (degrees)
  //   W      Argument of Perifocus, w (degrees)
  //   Tp     Time of periapsis (Julian Day Number)
  //   N      Mean motion, n (degrees/day)
  //   MA     Mean anomaly, M (degrees)
  //   TA     True anomaly, nu (degrees)
  //   A      Semi-major axis, a (km)
  //   AD     Apoapsis distance (km)
  //   PR     Sidereal orbit period (day)
  parseElements(data) {
    const paramsPatt = /\$\$SOE\n([^\$]+)\n\$\$EOE/m;
    const [,params] = paramsPatt.exec(data);

    // get rid of JDTDB (Julian Day Number, Barycentric Dynamical Time)
    const paramsList = params.split(/,/).slice(2).map(val => Number(val.trim()));

    const [EC, QR, IN, OM, W, Tp, N, MA, TA, A, AD, PR] = paramsList;

    return { EC, QR, IN, OM, W, Tp, N, MA, TA, A, AD, PR };
  }
};


const jpl = new JPL();
const bodyList = [
  { name: 'Mercury', hId: 199, hIdCenter: 'Sun' },
  { name: 'Venus', hId: 299, hIdCenter: 'Sun' },

  { name: 'Earth', hId: 399, hIdCenter: 'Sun' },
  { name: 'Luna', hId: 301, hIdCenter: 'Earth' },

  { name: 'Mars', hId: 499, hIdCenter: 'Sun' },
  { name: 'Phobos', hId: 401, hIdCenter: 'Mars' },
  { name: 'Deimos', hId: 402, hIdCenter: 'Mars' },

  { name: 'Jupiter', hId: 599, hIdCenter: 'Sun' },
  { name: 'Io', hId: 501, hIdCenter: 'Jupiter' },
  { name: 'Europa', hId: 502, hIdCenter: 'Jupiter' },
  { name: 'Ganymede', hId: 503, hIdCenter: 'Jupiter' },
  { name: 'Callisto', hId: 504, hIdCenter: 'Jupiter' },
  { name: 'Amalthea', hId: 505, hIdCenter: 'Jupiter' },
  { name: 'Thebe', hId: 514, hIdCenter: 'Jupiter' },
  { name: 'Adrastea', hId: 515, hIdCenter: 'Jupiter' },
  { name: 'Metis', hId: 516, hIdCenter: 'Jupiter' },

  { name: 'Saturn', hId: 699, hIdCenter: 'Sun' },
  { name: 'Uranus', hId: 799, hIdCenter: 'Sun' },
  { name: 'Neptune', hId: 899, hIdCenter: 'Sun' },
  { name: 'Pluto', hId: 999, hIdCenter: 'Sun' },
];

const promises = bodyList.map(async (spec, ndx) => {
  spec.elements = await jpl.getOrbitalElements(spec.hId, spec.hIdCenter);
  bodiesData.bodies.push(spec);
});

Promise.all(promises)
  .then(() => {
    const json = JSON.stringify(bodiesData);

    fs.writeFile('elements.json', json, (err) => {
      if (err) throw err;
      console.log('Created elements.json');
    });
  });

