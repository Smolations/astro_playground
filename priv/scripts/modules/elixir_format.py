_map_open = '%{'
_map_close = '}'


def state_map(state_arr):
  pairs = [
    ' x: {:19.6f}'.format(state_arr[0]),
    ' y: {:19.6f}'.format(state_arr[1]),
    ' z: {:19.6f}'.format(state_arr[2]),
    'dx: {:19.6f}'.format(state_arr[3]),
    'dy: {:19.6f}'.format(state_arr[4]),
    'dz: {:19.6f}'.format(state_arr[5]),
  ]
  return _to_map(pairs)


def position_map(pos_arr):
  pairs = [
    'x: {:19.6f},'.format(pos_arr[0]),
    'y: {:19.6f},'.format(pos_arr[1]),
    'z: {:19.6f},'.format(pos_arr[2]),
  ]
  return _to_map(pairs)


def velocity_map(vel_arr):
  pairs = [
    'dx: {:19.6f},'.format(vel_arr[0]),
    'dy: {:19.6f},'.format(vel_arr[1]),
    'dz: {:19.6f},'.format(vel_arr[2]),
  ]
  return _to_map(pairs)


#   RP      Perifocal distance. (periapsis)
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
def orbital_elements_map(vel_arr):
  pairs = [
    'pa: {:19.6f}'.format(vel_arr[0]),
    'e: {:19.6f}'.format(vel_arr[1]),
    'i: {:19.6f}'.format(vel_arr[2]),
    'O: {:19.6f}'.format(vel_arr[3]),
    'w: {:19.6f}'.format(vel_arr[4]),
    'M: {:19.6f}'.format(vel_arr[5]),
    't0: {:19.6f}'.format(vel_arr[6]),
    'mu: {:19.6f}'.format(vel_arr[7]),
    'nu: {:19.6f}'.format(vel_arr[8]),
    'a: {:19.6f}'.format(vel_arr[9]),
    'T: {:19.6f}'.format(vel_arr[10]),
  ]
  return _to_map(pairs)


def _to_map(pairs):
  return '\n'.join([_map_open, ',\n'.join(pairs), _map_close])
