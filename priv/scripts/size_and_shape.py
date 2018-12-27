import sys, argparse

import mod_dir
import elixir_format as fmt
from meta_kernel import load as load_mk, unload as unload_mk
import naif

epi = '\n'.join([
  'Outputs an Elixir map with keys:  x, y, z, dx, dy, dz',
  '',
  'Units are km and km/sec.',
])

parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Get size and shape constants for a given spice object.',
  epilog=epi
)
parser.add_argument('id', metavar='id',
                    help='the spice id of the target object')

args = parser.parse_args()


meta_kernel_name = 'meta_kernel'


def size_and_shape():
    #
    # Load the kernels that this program requires.  We
    # will need:
    #
    load_mk( meta_kernel_name )

    # get data
    # args.id.isnumeric()
    data = naif.get_size_and_shape( int(args.id) )
    print( data )

    #
    # Display the results.
    #
    # print(equatorial_radius_lg)
    # print( fmt.attrs_map(data) )


    unload_mk( meta_kernel_name )


if __name__ == '__main__':
    size_and_shape()
