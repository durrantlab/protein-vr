CHANGES
=======

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
