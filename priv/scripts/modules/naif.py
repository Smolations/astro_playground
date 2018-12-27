import spiceypy


# Fetch from the kernel pool the double precision values of an item
# associated with a body, where the body is specified by an integer
# ID code.
# spiceypy.spiceypy.bodvcd(bodyid, item, maxn)
def get_size_and_shape(body_id):
    data = []

    [dim, radii] = spiceypy.bodvcd( body_id, "RADII", 3 )
    data.extend(radii)

    [dim, mu] = spiceypy.bodvcd( body_id, "GM", 1 )
    data.extend(mu)


    return data
    return mu


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
