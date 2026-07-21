import sys, argparse

from spiceypy.utils.support_types import SpiceyError

import mod_dir
import meta_kernel
import naif


parser = argparse.ArgumentParser(
  formatter_class=argparse.RawDescriptionHelpFormatter,
  description='Get the integer code of a body from a given name.',
)
parser.add_argument('name', metavar='name',
                    help='the name of a body')

args = parser.parse_args()

# The main meta-kernel (correct relative paths). SPICE's built-in name<->code
# mappings cover standard bodies even without it, but loading it also picks up
# any names defined by the seeded kernels. (Was 'codes_and_names', whose .tm had
# a hardcoded absolute path from the original author's machine and 404'd.)
meta_kernel_name = 'meta_kernel'


def code_from_name():
    #
    # Load the kernels that this program requires.
    #
    meta_kernel.load(meta_kernel_name)

    try:
      print( naif.get_code( args.name ) )

    except SpiceyError as err:
      print( 'ERROR:', err )


    meta_kernel.unload(meta_kernel_name)


if __name__ == '__main__':
    code_from_name()
