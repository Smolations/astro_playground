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
end
