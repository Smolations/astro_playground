import sys, argparse

import spiceypy
from spiceypy.utils.support_types import SpiceyError

import mod_dir
import meta_kernel
import naif

epi = '\n'.join([
  'some epilog',
])

parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='some description',
  epilog=epi
)
parser.add_argument('code', metavar='code',
                    type=int,
                    help='a numeric body code')
# parser.add_argument('obs', metavar='observer',
#                     help='name of primary (observing) body/barycenter')
# parser.add_argument('--frame', default='J2000',
#                     help='frame of reference')
# parser.add_argument('--abcorr', default='LT+S',
#                     choices=['NONE', 'LT', 'LT+S', 'CN', 'CN+S', 'XLT', 'XLT+S', 'XCN', 'XCN+S'],
#                     help='aberrational correction method')

args = parser.parse_args()

meta_kernel_name = 'codes_and_names'


def foo():
    #
    # Load the kernels that this program requires.
    #
    meta_kernel.load(meta_kernel_name)

    try:
      # spiceypy.bodc2n(code, lenout=256)
      print( spiceypy.bodc2n( args.code ) )

    except SpiceyError as err:

      print( err )


    meta_kernel.unload(meta_kernel_name)


if __name__ == '__main__':
    foo()
