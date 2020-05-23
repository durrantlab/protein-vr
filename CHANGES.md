CHANGES
=======

WIP
---

* Upgraded to Bootstrap v4.3.1.
* When reloading a saved ProteinVR URL, the molecular representations are now
  loaded in the same, original order (in modern browsers).
* Added proper citation (PLoS Comp Bio).
* Improved error handling (e.g., warns when trying to load HTTP content over
  HTTPS).
* Created plugin architecture for loading/saving scenes internally.

TODO:
Infinite loop when in follower mode? Not sure if happens in production.

Need to get rid of .vue files, vue-loader, etc. Just doesn't work with closure
compiler. Use a class-based, typescript solution instead.

1.0.4
-----

* Upgraded the BabylonJS engine from 4.1.0-alpha.19 to v4.1.0.
* Switched from WebVR to WebXR (using a WebXR polyfill for browsers that don't
  support WebXR yet).
* Improved Gamepad/VR-controller support.
* The teleportation sphere now blinks so that it is easily visible in both
  light and dark environments.
* 2D buttons automatically resize on narrow-height devices (e.g., phones).
* On systems that require the user to explicitly authorize access to the
  device orientation sensors (e.g., iPhones), a splash screen now appears in
  order to request access.
* Fixed a minor menu bug.
* Internally, ProteinVR now often uses Promises instead of callback functions.
  This change makes the codebase more maintainable and will make it easier to
  implement a plugin system (planned for the future).

1.0.3
-----

* The 3D menu no longer closes after executing a given function. The user must
  now explicitly close it using the "Close Menu" or "Hide Menu" (floor)
  buttons. So it is now possible to change multiple styles without having to
  reopen the menu every time.
* The "Hide Menu" (floor) button is no longer directly below the camera. The
  location of the 3D menu depends on the orientation of this button when it is
  pressed. It was difficult to control the orientation of the button when it
  was directly below the user's feet. It is now easier to control that
  orientation because the button location is offset.
* There is now a 2D menu with the same options as the in-game 3D menu. In many
  circumstances, it will be easier to setup your molecular visualizations
  outside of VR.
* A small arrow at the player's feet now points in the direction of the
  protein, to help the user avoid getting lost in the 3D scene.
* Added an "Exit VR" item to the menu.
* Added a how-to-use video to the help system.

1.0.2
-----

* Removed support for the WebGL Multiview extension in VR mode. This
  optimization has the potential to speed render times, but it appears to be
  broken on the latest version of FireFox (Windows). Future versions of
  ProteinVR may revisit the Multiview extension.
* Fixed a bug that caused an error when rendering large molecular surfaces.

1.0.1
-----

* Hydrogens are now displayed on PDB files, just like SDF files.
* Improved license visibility in source and compiled code.

1.0.0
-----

The original published version.
