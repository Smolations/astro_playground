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


def pole_orientation(body, date='2026-01-01T00:00:00', frame='ECLIPJ2000'):
  # Real body orientation from the IAU body-fixed frame. Returns direction
  # vectors in `frame` (not a quaternion) to sidestep every quaternion-
  # convention pitfall: `pole` is the spin axis, `prime_meridian` fixes the
  # rotational phase, and `rotation_deg_per_day`'s sign encodes prograde vs
  # retrograde. Verified: Earth's pole is 23.44 deg off the ecliptic normal.
  et = spiceypy.str2et( date )
  code = int(body) if str(body).lstrip('-').isdigit() else spiceypy.bodn2c( body )

  [_frcode, frname] = spiceypy.cidfrm( code )        # e.g. IAU_EARTH
  rot = spiceypy.pxform( frname, frame, et )         # body-fixed -> frame

  pole = spiceypy.mxv( rot, [0.0, 0.0, 1.0] )        # north pole (spin axis)
  prime = spiceypy.mxv( rot, [1.0, 0.0, 0.0] )       # prime meridian direction

  [_dim, pm] = spiceypy.bodvcd( code, 'PM', 3 )
  wdot = pm[1]                                        # deg/day; sign = spin sense

  obliquity = math.degrees( math.acos( max(-1.0, min(1.0, pole[2])) ) )

  return {
    'body': code,
    'frame': frame,
    'epoch': date,
    'pole': { 'x': pole[0], 'y': pole[1], 'z': pole[2] },
    'prime_meridian': { 'x': prime[0], 'y': prime[1], 'z': prime[2] },
    'rotation_deg_per_day': wdot,
    'obliquity_to_frame_deg': obliquity,
  }


FALLBACK_RADIUS_KM = 10.0


def get_size_and_shape(body_id):
  # Some tiny/unresolved bodies (inner moons) have no RADII (and often no GM) in
  # the loaded PCK. Fall back to a nominal size and flag it, so the body still
  # renders and the app can note the size is a placeholder rather than 500ing.
  try:
    [_dim, radii] = spiceypy.bodvcd( body_id, "RADII", 3 )
    a, b, c = float(radii[0]), float(radii[1]), float(radii[2])
    measured = True
  except Exception:
    spiceypy.reset()
    a = b = c = FALLBACK_RADIUS_KM
    measured = False

  try:
    [_dim, mu] = spiceypy.bodvcd( body_id, "GM", 1 )
    gm = float(mu[0])
  except Exception:
    spiceypy.reset()
    gm = 0.0

  return {
    'equatorial_radius_large': a,
    'equatorial_radius_small': b,
    'polar_radius': c,
    'mu': gm,
    'radii_measured': measured,
  }


def _position(target, et, frame, abcorr, observer):
  [state, _ltime] = spiceypy.spkezr( target, et, frame, abcorr, observer )
  return state[:3]


def _dist3(a, b):
  return math.sqrt(sum((a[i] - b[i]) ** 2 for i in range(3)))


def _return_epoch(target, et0, et1, frame, abcorr, observer):
  # Find the epoch in the second half of [et0, et1] where the body is closest
  # to its start position -- i.e. has completed one revolution. Distance-to-
  # start is a smooth valley near the return, so a coarse scan then a ternary
  # refine pins it precisely, without needing to know the orbital period.
  p0 = _position(target, et0, frame, abcorr, observer)
  span = et1 - et0

  n = 400
  best_et, best_d = et1, None
  for i in range(n // 2, n + 1):
    et = et0 + span * i / n
    d = _dist3(_position(target, et, frame, abcorr, observer), p0)
    if best_d is None or d < best_d:
      best_d, best_et = d, et

  lo, hi = best_et - span / n, best_et + span / n
  for _ in range(50):
    m1 = lo + (hi - lo) / 3
    m2 = hi - (hi - lo) / 3
    d1 = _dist3(_position(target, m1, frame, abcorr, observer), p0)
    d2 = _dist3(_position(target, m2, frame, abcorr, observer), p0)
    if d1 < d2:
      hi = m2
    else:
      lo = m1

  return (lo + hi) / 2


def trajectory(observer, target, start, stop, steps=200, frame='J2000', abcorr='NONE', close=False):
  # Sample the geometric state of `target` relative to `observer` at evenly
  # spaced epochs across [start, stop]. abcorr defaults to NONE: we want the
  # true geometric orbit path, not the apparent (light-time-corrected) position.
  #
  # close=True trims the window to exactly one revolution so the orbit path is a
  # seamless closed loop (pass a window longer than one period as the bound).
  et0 = spiceypy.str2et( start )
  et1 = spiceypy.str2et( stop )

  if close:
    et1 = _return_epoch( target, et0, et1, frame, abcorr, observer )

  steps = max(2, int(steps))
  dt = (et1 - et0) / (steps - 1)
  ets = [et0 + i * dt for i in range(steps)]

  samples = []
  for et in ets:
    [state, _ltime] = spiceypy.spkezr( target, et, frame, abcorr, observer )
    samples.append({
      'et': et,
      'x': state[0], 'y': state[1], 'z': state[2],
      'vx': state[3], 'vy': state[4], 'vz': state[5],
    })

  return {
    'observer': observer,
    'target': target,
    'frame': frame,
    'abcorr': abcorr,
    'units': { 'position': 'km', 'velocity': 'km/s' },
    'count': len(samples),
    'samples': samples,
  }


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
