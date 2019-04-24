Instructions
============

Blender
-------

To export your blender scene as a babylon file, download and install [this
plugin](https://doc.babylonjs.com/resources/blender#blender-to-babylonjs-exporter).

You won't have access to my baking scripts (hard to set up, though we can
revisit that), but you can still test the scenes for things like scale.

Export your scene to `kevin_testing/web/scene/scene.babylon`

To export quickly (without having to wait), turn down the settings on the
Babylon.js exporter. Click on each object, then click on the `Object data` tab
(three dots connected into a triangle), scroll down to the `Babylon.js ver
5.6.X subpanel`, then the `Procedural Texture/Cycles Baking` sub-subpanel.

Browser Testing
---------------

You'll need to run this from within an Ubuntu subsystem. Could probably get it
working with Windows, but I don't actively use that OS.

Note to Jacob: Need to install Ubuntu subsystem on VR computer.

Just run: `./test.sh`
