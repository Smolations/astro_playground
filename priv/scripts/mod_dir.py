import os, sys

this_dir = os.path.abspath(os.path.dirname(__file__))
mod_path = os.path.join(this_dir, 'modules')

sys.path.append(mod_path)
