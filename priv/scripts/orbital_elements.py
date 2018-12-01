import argparse
import spiceypy

import mod_dir
import naif
import elixir_format as fmt

from meta_kernel import load as load_mk, unload as unload_mk


epi = "\n".join([
    'Outputs an Elixir map with the following keys:',
    '  pa   Perifocal distance. (periapsis)',
    '  e    Eccentricity.',
    '  i    Inclination.',
    '  O    Longitude of the ascending node.',
    '  w    Argument of periapsis.',
    '  M    Mean anomaly at epoch.',
    '  t0   Epoch.',
    '  mu   Gravitational parameter.',
    '  nu   True anomaly at epoch.',
    '  a    Semi-major axis. A is set to zero if',
    '       it is not computable.',
    '  T    Orbital period. Applicable only for',
    '       elliptical orbits. Set to zero otherwise.',
    '',
    'The epoch of the elements is the epoch of the input',
    'state. Units are km, rad, rad/sec. The same elements',
    'are used to describe all three types (elliptic,',
    'hyperbolic, and parabolic) of conic orbits.',
])

parser = argparse.ArgumentParser(
    formatter_class=argparse.RawDescriptionHelpFormatter,
    description='Get orbital elements for given observer and target bodies.',
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


def orbital_elements():
    load_mk( meta_kernel_name )

    # get elements
    elements = naif.orbital_elements( args.date, args.obs, args.targ,
                                      args.frame, args.abcorr         )

    # grab output
    elements_map = fmt.orbital_elements_map( elements )

    #
    # Display the results.
    #
    print( elements_map )

    unload_mk( meta_kernel_name )


if __name__ == '__main__':
    orbital_elements()
