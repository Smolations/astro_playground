defmodule AstroPlayground.EctoEnums do
  import EctoEnum

  defenum SpiceObjectTypeEnum, :spice_object_type, [
    :barycenter,
    :star,
    :planet,
    :dwarf_planet,
    :satellite,
    :asteroid,
    :comet,
    :spacecraft,
  ]

  # How trustworthy a texture is as a depiction of the real body. Several
  # widely-used planetary textures are artistic composites (Uranus, Saturn) or
  # contain interpolated fill (Triton), so the app should be able to say which
  # is which rather than presenting fiction as measurement.
  defenum TextureFidelityEnum, :texture_fidelity, [
    # Imagery-derived global mosaic with substantially complete coverage.
    :real,
    # Real mission data, but incomplete: hemisphere-only coverage, or gaps
    # interpolated/filled (e.g. Voyager 2's Uranian moons, Triton "GlobalFill").
    :partial,
    # Artistic/procedural composite, not measured surface data (e.g. the gas
    # giants' cloud tops, Uranus' fictional terrain).
    :synthetic,
  ]
end
