import os

file_abs_path = os.path.abspath(os.path.dirname(__file__))
kernels_path = os.path.join(file_abs_path, '..', 'kernels')
meta_kernel_name = 'meta_kernel.tm'


def path():
    return os.path.join(kernels_path, meta_kernel_name)

