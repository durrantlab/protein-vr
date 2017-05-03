Note that all objects should use ProteinVR node group in the material.

Everything must be UV unwrapped to proceed.

Note, if there are two many verticies, the babylon exporter will divide the
mesh. This causes problems. You want to keep the vertex count small anyway, so
don't use huge meshes.

Try UV projecting proteins with Smart UV project, angle cutoff of 89, island
margin of 0.1. But it's often necessary to unwrap tubes (protein
representation) by hand. :(

Controlling Output through Object Names
=======================================
* All scenes must have `grnd`, `cmra`, and `sky` objects. These objects are treated
  specially.
* Setting an empty's name to the abs of a `mp3 file` will do 3D sound.
* Objects with names containing the string "`light`" are treated as lights. They
  are kept visible for shadow rendering, but don't get exported to the
  .babylon file.
* Sometimes one mesh is contained within another. The inner mesh is only
  revealed when the outer mesh disappears. Creating the shadow maps in this
  case is complicated. To simplify, the name of the inner mesh must contain
  the substring "`inner`" and the name of the outer mesh must contain the
  substring "`outer`".

To be Implemented in the Future
===============================
* For meshes with the substring "`make_collider`" in their names, the decimate
  modifier will be used to create a second, simplified mesh that has the
  substring "collidable" its name. For simple globular meshes, let your conversion code takes care of this automatically.
* Meshes with the substring "`collidable`" in their names will not be visible in
  the final scene, but will be used for collision detection. You can just use
  this substring directly if you're trying to enforce collision with a complex
  mesh, or with a whole region of the scene.
