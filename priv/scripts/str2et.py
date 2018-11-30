import os, sys
import spiceypy

args = sys.argv
date = args[1]

file_abs_path = os.path.abspath(os.path.dirname(__file__))
kernels_path = os.path.join(file_abs_path, '..', 'kernels')
meta_kernel_name = 'meta_kernel.tm'


def str2et():
    #
    # Local parameters
    #
    METAKR = os.path.join(kernels_path, meta_kernel_name)

    #
    # Load the kernels that this program requires.
    #
    spiceypy.furnsh( METAKR )

    #
    # Convert utctim to ET.
    #
    et = spiceypy.str2et( date )

    print( '{:16.3f}'.format(et) )

    spiceypy.unload( METAKR )

if __name__ == '__main__':
    str2et()
