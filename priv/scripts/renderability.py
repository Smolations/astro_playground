import argparse
import json

import mod_dir
import spiceypy
from meta_kernel import load as load_mk, unload as unload_mk
from spiceypy.utils.support_types import SpiceyError

epi = '\n'.join([
  'Batch renderability probe for (observer, target) pairs. Reads a JSON file',
  '[{"observer": "6", "target": "699"}, ...] and, at a single epoch, reports per',
  'pair: ephemeris_ok (spkezr resolves), dist_km (target distance from observer,',
  'used to detect a body coincident with its barycenter), and has_radii (a real',
  'RADII triple in the PCK). One furnsh for the whole batch.',
  '',
  'Outputs JSON: [{ observer, target, ephemeris_ok, dist_km, has_radii, error? }].',
])

parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Probe whether (observer, target) pairs are renderable in the system view.',
  epilog=epi,
)
parser.add_argument('pairs_json', help='path to a JSON file of {observer, target} pairs')
parser.add_argument('--date', default='2026-01-01T00:00:00', help='UTC epoch for the probe')

args = parser.parse_args()

meta_kernel_name = 'meta_kernel'


def _first_line(err):
    for line in str(err).splitlines():
        line = line.strip()
        if line:
            return line[:160]
    return 'unknown SPICE error'


def probe(observer, target, et):
    rec = {'observer': observer, 'target': target}

    try:
        [state, _ltime] = spiceypy.spkezr(target, et, 'ECLIPJ2000', 'NONE', observer)
        rec['ephemeris_ok'] = True
        rec['dist_km'] = (state[0] ** 2 + state[1] ** 2 + state[2] ** 2) ** 0.5
    except SpiceyError as e:
        # A missing kernel leaves an error latched; reset before the next probe.
        spiceypy.reset()
        rec['ephemeris_ok'] = False
        rec['dist_km'] = None
        rec['error'] = 'SPKINSUFFDATA' if 'SPKINSUFFDATA' in str(e) else _first_line(e)

    try:
        spiceypy.bodvrd(target, 'RADII', 3)
        rec['has_radii'] = True
    except SpiceyError:
        spiceypy.reset()
        rec['has_radii'] = False

    return rec


def renderability():
    load_mk(meta_kernel_name)

    with open(args.pairs_json) as f:
        pairs = json.load(f)

    et = spiceypy.str2et(args.date)
    out = [probe(str(p['observer']), str(p['target']), et) for p in pairs]

    print(json.dumps(out))

    unload_mk(meta_kernel_name)


if __name__ == '__main__':
    renderability()
