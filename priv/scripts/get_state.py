import os, sys
import spiceypy

args = sys.argv

date = args[1]
observer = args[2]
target = args[3]
frame = args[4]

file_abs_path = os.path.abspath(os.path.dirname(__file__))
kernels_path = os.path.join(file_abs_path, '..', 'kernels')

meta_kernel_name = 'meta_kernel.tm'


def get_state():
    #
    # Local parameters
    #
    # METAKR = '../kernels/meta_kernel.tm'
    METAKR = os.path.join(kernels_path, meta_kernel_name)

    #
    # Load the kernels that this program requires.  We
    # will need:
    #
    spiceypy.furnsh( METAKR )

    #
    # Convert utctim to ET.
    #
    et = spiceypy.str2et( date )

    #
    # Compute the apparent state of target as seen from
    # observer in the J2000 frame.
    #
    [state, ltime] = spiceypy.spkezr( target, et, frame,
                                      'LT+S', observer     )

    #
    # Display the results.
    #
    print( '%{' )
    print( ' x: {:19.6f},'.format(state[0]) )
    print( ' y: {:19.6f},'.format(state[1]) )
    print( ' z: {:19.6f},'.format(state[2]) )
    print( 'dx: {:19.6f},'.format(state[3]) )
    print( 'dy: {:19.6f},'.format(state[4]) )
    print( 'dz: {:19.6f},'.format(state[5]) )
    print( '}' )


    spiceypy.unload( METAKR )

if __name__ == '__main__':
    get_state()
