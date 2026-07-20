import argparse
import json

import mod_dir
import naif
from meta_kernel import load as load_mk, unload as unload_mk

epi = '\n'.join([
  'Outputs JSON: equatorial_radius_large / _small, polar_radius, mu, and',
  'radii_measured (false when the body has no radii in the PCK and a nominal',
  'fallback size was used). Radii in km, mu in km^3/s^2.',
])

parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Get size and shape constants for a given spice object.',
  epilog=epi,
)
parser.add_argument('id', metavar='id', help='the spice id of the target object')

args = parser.parse_args()

meta_kernel_name = 'meta_kernel'


def size_and_shape():
    load_mk( meta_kernel_name )

    data = naif.get_size_and_shape( int(args.id) )
    print( json.dumps(data) )

    unload_mk( meta_kernel_name )


if __name__ == '__main__':
    size_and_shape()
