Note that all objects should use ProteinVR node group in the material.

Setting an empty's name to the abs of a mp3 file will do 3D sound.

All scenes must have grnd, cmra, and sky objects. Everything else is optional.

Everything must be UV unwrapped to proceed.

Note, if there are two many verticies, the babylon exporter will divide the
mesh. This causes problems. You want to keep the vertex count small anyway, so
don't use huge meshes.

Try UV projecting proteins with Smart UV project, angle cutoff of 89, island margin of 0.1
