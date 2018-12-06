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
  description='Get position and state vectors for given observer and target bodies.',
  epilog=epi
)
parser.add_argument('date', metavar='date',
                    help='a utc date')
parser.add_argument('obs', metavar='observer',
                    help='name of primary (observing) body/barycenter')
parser.add_argument('targ', metavar='target',
                    help='name of orbiting (target) body/barycenter')
parser.add_argument('--frame', default='J2000',
                    help='frame of reference')
parser.add_argument('--abcorr', default='LT+S',
                    choices=['NONE', 'LT', 'LT+S', 'CN', 'CN+S', 'XLT', 'XLT+S', 'XCN', 'XCN+S'],
                    help='aberrational correction method')

args = parser.parse_args()


meta_kernel_name = 'meta_kernel'


def get_state():
    #
    # Load the kernels that this program requires.  We
    # will need:
    #
    load_mk( meta_kernel_name )

    # get state
    state = naif.get_state( args.date, args.obs, args.targ )

    #
    # Display the results.
    #
    print( fmt.state_map(state) )


    unload_mk( meta_kernel_name )


if __name__ == '__main__':
    get_state()
