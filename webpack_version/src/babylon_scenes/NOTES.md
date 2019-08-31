How to Make a New Scene
=======================

Blender File
------------

The Blender file should contain these elements:

* `ShadowCatcher`: A mesh to accept the shadows from the molecules.
* `ShadowLight_Sun`: The light to has molecule shadows. Can also look like
  this to control shadow properties: `ShadowLight_Sun_dark_0.95_blur_64_ambient_0.15`.
  * `dark`: How dark the shadow should be. Smaller number is darker. See
    `getBlurDarknessAmbientFromLightName()`.
  * `blur`: How much the shadow should be blurred. Many not work. See
    `getBlurDarknessAmbientFromLightName()`.
  * `ambient`: How much to light the protein independent of the light (so
    backside is still somewhat illuminated). See
    `getBlurDarknessAmbientFromLightName()`.
* `ground`: The mesh the user can walk on.
* `protein_box`: The box in which the protein will be placed.
* `Camera`: The camera, already at the starting position and angle.

To set a mesh to shadeless, just assign it an emissive texture. All emissives
will be converted to shadeless.

scene.babylon
-------------

Regardless of what you name your Blender file, the exported babylon file must
be named `scene.babylon`.

scene_info.json
---------------

Each scene directory must also contain a json file named `scene_info.json`. It
looks like this:

```json
{
    "transparentGround": false,
    "positionOnFloor": true
}
```

* If `transparentGround` is true, then the ground mesh will be rendered as
  slightly transparent. Otherwise it will be entirely invisible.
* If `positionOnFloor` is true, then the molecular mesh will always touch the
  bottom of the protein_box. Otherwise, it will be centered around the middle
  of the protein_box. (Note, for example, that rotation about the middle, the
  default, might be ideal for positioning a protein in a lipid bilayer.)

environments_list.json
----------------------

Be sure to update this file if you add any new scenes.
