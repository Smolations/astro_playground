import os, sys
import spiceypy, meta_kernel

args = sys.argv

# args parsing
date = args[1]
state = args[2].split(',')
velocity = args[3].split(',')
mu = float(args[4])

# spiceypy method requires a 6-element array (e.g. returned by get_state.py)
state.extend(velocity)

# replace string elements with float equivalents
for num in state[:]:
    state.remove(num)
    state.append(float(num))


def orbital_elements():
    #
    # Local parameters
    #
    METAKR = meta_kernel.path()

    #
    # Load the kernels that this program requires.  We
    # will need:
    #
    spiceypy.furnsh( METAKR )

    #
    # Convert utctim to ET.
    #
    et = spiceypy.str2et( date )
    mu = spiceypy.bodvrd('EARTH', 'GM', 1)[1][0]
    print(mu)

    #
    # Compute the apparent state of target as seen from
    # observer in the J2000 frame.
    #
    elements = spiceypy.oscltx(state, et, mu)
    print(','.join(map(str, elements)))
    #
    # Display the results.
    #
    # print( '%{' )
    # print( ' x: {:19.6f},'.format(state[0]) )
    # print( ' y: {:19.6f},'.format(state[1]) )
    # print( ' z: {:19.6f},'.format(state[2]) )
    # print( 'dx: {:19.6f},'.format(state[3]) )
    # print( 'dy: {:19.6f},'.format(state[4]) )
    # print( 'dz: {:19.6f},'.format(state[5]) )
    # print( '}' )


    spiceypy.unload( METAKR )

if __name__ == '__main__':
    orbital_elements()
