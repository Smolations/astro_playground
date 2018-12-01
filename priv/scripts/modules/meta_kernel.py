import os, spiceypy


file_abs_path = os.path.abspath(os.path.dirname(__file__))
meta_kernels_path = os.path.join(file_abs_path, '..', '..', 'kernels', 'meta_kernels')


def path(file_name):
    return os.path.join( meta_kernels_path, file_name + ".tm" )


def load(file_name):
  mk_path = path( file_name )
  spiceypy.furnsh( mk_path )


def unload(file_name):
  mk_path = path( file_name )
  spiceypy.unload( mk_path )
