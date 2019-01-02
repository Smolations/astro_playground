import math
import spiceypy
from spiceypy.utils.support_types import SpiceyError



def get_tilt(body_id):
  # spiceypy.furnsh('./priv/kernels/meta_kernels/meta_kernel.tm')
  # import naif
  return True


# Translate a string containing a body name or ID code to an integer code.
def get_code(name):
  code = spiceypy.bodn2c(name)

  return code


# Translate a body ID code to either the corresponding name or if no
# name to ID code mapping exists, the string representation of the body
# ID value.
def get_name(code, lenout=256):
  name = spiceypy.bodc2n(code, lenout)

  return name


# Fetch from the kernel pool the double precision values of an item
# associated with a body, where the body is specified by an integer
# ID code.
# spiceypy.spiceypy.bodvcd(bodyid, item, maxn)
def get_orientation(body_id, date='2018-12-30T00:00:00'):
  data = []

  seconds = spiceypy.utc2et(date)
  data.append(seconds)

  d = seconds / spiceypy.spd()
  years = d / 365
  T = years / 100
  print(T)

  [dim, ra_terms] = spiceypy.bodvcd( body_id, "POLE_RA", 3 )
  [dim, dec_terms] = spiceypy.bodvcd( body_id, "POLE_DEC", 3 )
  [dim, pm_terms] = spiceypy.bodvcd( body_id, "PM", 3 )
  [dim, nut_angles] = spiceypy.bodvcd( 2, "NUT_PREC_ANGLES", 40 )
  print(dim)


  return data


def get_size_and_shape(body_id):
  data = []

  [dim, radii] = spiceypy.bodvcd( body_id, "RADII", 3 )
  data.extend(radii)

  [dim, mu] = spiceypy.bodvcd( body_id, "GM", 1 )
  data.extend(mu)

  return data


def get_state(date, observer, target, frame='J2000', abcorr='LT+S'):
  et = spiceypy.str2et( date )

  #
  # Compute the apparent state of target as seen from
  # observer in the J2000 frame.
  #
  # targ (str) – Target body name.
  # et (Union[float,Iterable[float]]) – Observer epoch.
  # ref (str) – Reference frame of output state vector.
  # abcorr (str) – Aberration correction flag.
  # obs (str) – Observing body name.
  #
  [state, ltime] = spiceypy.spkezr( target, et, frame, abcorr, observer )

  return state


# are equivalent conic elements describing the orbit
# of the body around its primary. The elements are,
# in order:

#   RP      Perifocal distance.
#   ECC     Eccentricity.
#   INC     Inclination.
#   LNODE   Longitude of the ascending node.
#   ARGP    Argument of periapsis.
#   M0      Mean anomaly at epoch.
#   T0      Epoch.
#   MU      Gravitational parameter.
#   NU      True anomaly at epoch.
#   A       Semi-major axis. A is set to zero if
#           it is not computable.
#   TAU     Orbital period. Applicable only for
#           elliptical orbits. Set to zero otherwise.

# The epoch of the elements is the epoch of the input
# state. Units are km, rad, rad/sec. The same elements
# are used to describe all three types (elliptic,
# hyperbolic, and parabolic) of conic orbits.
#
def orbital_elements(date, observer, target, frame='J2000', abcorr='LT+S'):
  state = get_state( date, observer, target, frame, abcorr )

  et = spiceypy.str2et( date )

  mu = spiceypy.bodvrd(observer, 'GM', 1)[1][0]

  #
  # Compute the orbital elements
  #
  elements = spiceypy.oscltx(state, et, mu)

  return elements
