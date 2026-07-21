import sys, argparse

from spiceypy.utils.support_types import SpiceyError

import mod_dir
import meta_kernel
import naif


parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Get the name of a body from a given integer code.',
)
parser.add_argument('code', metavar='code',
                    type=int,
                    help='a numeric body code')

args = parser.parse_args()

# See code_from_name.py: repointed from the stale 'codes_and_names' meta-kernel
# (hardcoded absolute path) to the working main meta-kernel.
meta_kernel_name = 'meta_kernel'


def name_from_code():
    #
    # Load the kernels that this program requires.
    #
    meta_kernel.load(meta_kernel_name)

    try:
      print( naif.get_name( args.code ) )

    except SpiceyError as err:
      print( 'ERROR:', err )


    meta_kernel.unload(meta_kernel_name)


if __name__ == '__main__':
    name_from_code()
