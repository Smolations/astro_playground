import os, sys
import spiceypy

import mod_dir
import meta_kernel

args = sys.argv
date = args[1]

meta_kernel_name = 'meta_kernel'


def foo():
    #
    # Load the kernels that this program requires.
    #
    meta_kernel.load(meta_kernel_name)

    # str2et.str2et(date)

    meta_kernel.unload(meta_kernel_name)


if __name__ == '__main__':
    foo()
