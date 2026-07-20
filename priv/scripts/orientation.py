import argparse
import json

import mod_dir
import naif
from meta_kernel import load as load_mk, unload as unload_mk

epi = '\n'.join([
  'Outputs JSON with the body orientation in the given frame:',
  '  pole            north/spin-axis direction (unit vector)',
  '  prime_meridian  reference direction fixing rotational phase',
  '  rotation_deg_per_day   spin rate; sign is prograde(+)/retrograde(-)',
  '  obliquity_to_frame_deg axial tilt vs the frame normal',
])

parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Get real body orientation (axial tilt + rotation) via SPICE.',
  epilog=epi,
)
parser.add_argument('id', help='the SPICE id (or name) of the target body')
parser.add_argument('--date', default='2026-01-01T00:00:00', help='UTC epoch')
parser.add_argument('--frame', default='ECLIPJ2000', help='reference frame')

args = parser.parse_args()

meta_kernel_name = 'meta_kernel'


def orientation():
    load_mk( meta_kernel_name )

    data = naif.pole_orientation( args.id, args.date, args.frame )
    print( json.dumps(data) )

    unload_mk( meta_kernel_name )


if __name__ == '__main__':
    orientation()
