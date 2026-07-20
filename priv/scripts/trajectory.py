import argparse
import json

import mod_dir
import naif
from meta_kernel import load as load_mk, unload as unload_mk

epi = '\n'.join([
  'Outputs JSON: { observer, target, frame, abcorr, units, count, samples }',
  'where each sample is { et, x, y, z, vx, vy, vz }.',
  '',
  'Positions are km and velocities km/s, in the given frame, relative to the',
  'observer. Use a barycenter as the observer for physically correct orbits.',
])

parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Sample a body trajectory (state vectors) over a time window.',
  epilog=epi,
)
parser.add_argument('observer', help='observing body/barycenter (name or NAIF id)')
parser.add_argument('target', help='orbiting body (name or NAIF id)')
parser.add_argument('start', help='UTC start date')
parser.add_argument('stop', help='UTC stop date')
parser.add_argument('--steps', type=int, default=200, help='number of samples')
parser.add_argument('--frame', default='J2000', help='reference frame')
parser.add_argument('--abcorr', default='NONE', help='aberration correction')
parser.add_argument('--close', action='store_true',
                    help='trim to exactly one revolution for a seamless loop')

args = parser.parse_args()

meta_kernel_name = 'meta_kernel'


def trajectory():
    load_mk( meta_kernel_name )

    data = naif.trajectory(
      args.observer, args.target, args.start, args.stop,
      args.steps, args.frame, args.abcorr, args.close,
    )

    print( json.dumps(data) )

    unload_mk( meta_kernel_name )


if __name__ == '__main__':
    trajectory()
