# ProteinVR 1.0.5 #

## Introduction ##

ProteinVR is a web-based application that allows users to view protein/ligand
structures in virtual reality (VR) from their mobile, desktop, or
VR-headset-based web browsers. The molecular structures are displayed within
3D environments that give useful biological context and allow users to situate
themselves in 3D space.

ProteinVR is released under the terms of the open-source BSD-3-Clause license.

Most users will wish to simply access the already compiled, publicly available
ProteinVR web app at [http://durrantlab.com/pvr/](http://durrantlab.com/pvr/).
This code repository is designed to help developers.

## Repository Contents ##

* `src/`: The ProteinVR source files. You cannot use these files directly.
  They must be compiled.
* `utils/`, `package.json`, `package-lock.json`, `tsconfig.json`: Files used
  to compile the contents of the `src/` directory to the `dist/` directory.
* `CHANGES.md`, `CONTRIBUTORS.md`, `README.md`: Documentation files.

If you wish to run ProteinVR on your own web server, simply download the
latest `proteinvr_web_app.zip` file from the [Releases
page](http://git.durrantlab.com/jdurrant/protein-vr/-/releases).

## Description of Use ##

### Loading Screen ###

![Figure
1](https://git.durrantlab.pitt.edu/jdurrant/protein-vr/-/blob/1.0.4/src/components/UI/OpenPopup/pages/imgs/environment.jpg
"Figure 1")

_Figure 1: An illustration of a ProteinVR scene with the default NanoKid
molecule visualized. Several buttons are available from the main screen. A)
Load a new molecule and environment. B) Provide help. C) Enter
follow-the-leader mode. D) View in full screen. E) Enter VR mode._

When users first open ProteinVR, the application displays the default molecule
(NanoKid, Figure 1). After a few seconds, a simple popup form appears where
users can type the PDB ID or URL of the molecular model they wish to
visualize. The same form also allows users to indicate the 3D environment in
which to place the molecular model, as well as whether the molecule should
cast shadows. After clicking the "Load Molecule" button, NanoKid is replaced
with the desired molecular structure.

### 2D Menu ###

Several buttons appear on the right of the screen that are only accessible
when not in VR mode (Figure 1A-E). The first allows users to load a new
molecule and environment; the second opens this help system; the third
generates a sharable URL that others can use to mirror the ProteinVR scene on
their own devices (see "Leader Mode" below); and the fourth and fifth put
ProteinVR into full-screen and VR mode, respectively.

### 3D Menu ###

All other ProteinVR functionality is accessible through the in-world 3D menu
system (Figure 2). ProteinVR places a simple button at the user's feet with
the text "Show Menu" (Figure 2A). Users on laptop/desktop computers can click
this button using a mouse or keyboard (space bar); users on mobile devices
without VR headsets can simply tap their screens; and users with VR headsets
can pull the VR-headset or VR-controller trigger button.

Once clicked, a hierarchical 3D menu appears, embedded in the 3D scene itself.
At the top-most level, this menu is divided into two broad categories (Figure
2B-C). The "Rotate" submenu allows users to rotate the molecule about the X,
Y, or Z axis. The "Styles" submenu contains further submenus that allow users
to change how the molecule is displayed, both in terms of the molecular
representation (e.g., cartoon, sphere, stick, surface) and the color (e.g.,
white, color by element, etc.) (Figure 2D-F). "Styles > Components" applies
these changes to common, pre-defined molecular components (e.g., proteins,
ligands, nucleic acids, water molecules). "Styles > Selections" applies
changes to the model using characteristics specific to the loaded molecule
itself (e.g., specific residues, elements, chains, etc.). And "Styles > Remove
Existing" allows users to remove previously specified representations/colors
(Figure 2G).

![Figure
2](https://git.durrantlab.pitt.edu/jdurrant/protein-vr/-/blob/1.0.4/src/components/UI/OpenPopup/pages/imgs/3d_buttons.png
"Figure 2")

_Figure 2: A schematic of the menu buttons available from within the 3D
environment. A) Open the menu system (located at the user's feet). B) Access
the "Rotate" submenu. C) Access the "Styles" submenu. D) Change the style of
common, pre-defined molecular components. E) Change the style of selected
atoms specific to the loaded molecule itself. F) Remove previously specified
styles. G) Change the representation and/or color of the selected
atoms/components._

### URL Tracking ###

ProteinVR makes it easy to save molecular scenes with custom visualizations
such as these. Every time a molecular representation is loaded, rotated, or
otherwise altered, ProteinVR updates the browser URL to track the change.
Copying the URL at any point into a new browser tab--even on a different
device--recreates the exact same ProteinVR scene.

## Display Modes ##

To accommodate a broad range of devices, ProteinVR runs in four modes: VR
mode, device-orientation mode, desktop mode, and leader mode. In all four,
ProteinVR uses video-game-style navigation. Objects reside at fixed positions
in a 3D environment, and the camera moves (or teleports) to different
locations in the scene.

### VR Mode ###

#### Description and Navigation ####

Users who wish to view ProteinVR scenes through a VR headset (e.g., an Oculus
Rift, Oculus Go, HTC Vive, or Google-Cardboard compatible viewer) must
navigate to the ProteinVR web app via a browser that supports the WebVR api.
VR mode provides a fully immersive experience wherein users can view their
molecular structures in stereoscopic 3D. The 3D environments are particularly
useful in VR mode, as they improve the sense of realism and immersion. By
allowing viewers to orient themselves spatially, 3D environments may also
reduce VR sickness, which occurs when users perceive a disconnect between the
3D scene presented to the eyes and the movement/orientation of the head. To
enter VR mode, users must first attach a VR headset as well as any hand
controllers. They then click the VR button in the main ProteinVR screen.

In VR mode, users can look about the scene by physically moving their heads.
Some VR headsets also allow users to navigate to nearby locations by
physically moving about the room. Teleportation navigation enables movement to
distant points in the virtual world. A simple navigation sphere indicates the
current teleport destination. When using a VR headset that lacks hand
controllers (e.g., Google Cardboard), this sphere appears on the object
immediately in front of the user's gaze. When using a headset with hand
controllers (e.g., the HTC Vive, Oculus Rift, or Oculus Go), the sphere
appears at the location where the user is pointing. To teleport to the
location of the sphere, the user simply presses the VR-headset button, the
VR-controller trigger (Figure 3A), the keyboard space bar, or the mouse click
button.

VR controllers with trackpads enable more fine-grained movements (Figure 3B).
To slowly move forward or backward in the direction of the navigation sphere,
users can simply press the top or bottom of the trackpad. To rotate left or
right without having to rotate the head (e.g., to reset the view), users can
press the left and right side of the trackpad, respectively.

![Figure
3](https://git.durrantlab.pitt.edu/jdurrant/protein-vr/-/blob/1.0.4/src/components/UI/OpenPopup/pages/imgs/controller.png
"Figure 3")

_Figure 3: An illustration of the VR-controller buttons that enable navigation
in VR mode._

#### Caveats ####

We have tested VR-mode on multiple operating-system, web-browser, and
VR-headset setups. In some cases, it is necessary to explicitly enable the
WebVR application programming interface (API) and/or browser access to the
device-orientation sensors. We have also found that WebVR access to the VR
controllers can be finicky. We recommend turning on the controllers before
entering VR. On VR systems that have multiple controllers (e.g., one for each
hand), we also recommend turning on all controllers, even though teleportation
navigation requires only one. VR technology is rapidly evolving; a web search
can reveal the steps necessary (if any) to fully enable VR in a given browser
of choice.

#### Windows ####

We have verified that VR mode works well on Windows 10. We currently recommend
the Firefox web browser, which provides a stable WebVR implementation that is
enabled by default.

#### macOS ####

VR support in macOS is currently limited.

#### Mobile ####

VR mode also works well on most mobile devices. The WebVR API on Android is
easy to access. In contrast, WebVR access on iOS is currently challenging. iOS
mobile Safari does not allow webpages to hide the browser address bar, as
required for VR visualization using mobile (e.g., Google Cardboard) headsets.
Additionally, iOS does not allow the mobile Safari browser to access the
device's orientation sensors by default, making it impossible for ProteinVR to
respond to head movements. Apple requires all third-party browsers on iOS
(e.g., Chrome, Firefox) to use the same WebKit framework and JavaScript engine
that Safari does, so it is not possible to overcome these challenges by
switching to another browser.

To eliminate the address bar on iOS, users should install ProteinVR as a
progressive web app (PWA). PWA installation places a ProteinVR icon on the
device's home screen and allows ProteinVR to run in full-screen mode. Simply
visit the ProteinVR website via mobile Safari and use the browser's "Share>
Add to Home Screen" menu item. Additionally, users must enable access to the
device-orientation sensors (even if running ProteinVR as a PWA) via Settings >
Safari > Motion & Orientation Access. We are hopeful that Apple will simplify
this process in the future as it expands its VR support.

### Device-Orientation Mode ###

Device-orientation mode is ideal when viewing ProteinVR scenes on mobile
devices with orientation sensors. If ProteinVR detects such sensors, it
automatically updates its viewport to match the orientation of the device
itself. Users can thus view their molecular structures from different angles
by physically reorienting their devices. ProteinVR also uses teleportation
navigation in device-orientation mode. A similar navigation sphere (placed in
the direction the mobile device is pointing) indicates the current teleport
destination. To teleport to the location of the sphere, the user simply taps
on the mobile-device screen.

In our experience, Google Chrome on Android provides the easiest
device-orientation experience. On iOS, users must explicitly enable access to
the device-orientation sensors via Settings > Safari > Motion & Orientation
Access.

### Desktop Mode ###

If neither a VR headset nor an orientation sensor is available, ProteinVR runs
in desktop mode. Desktop mode uses a standard keyboard-and-mouse navigation
system similar to that commonly used in video games. The arrow keys (or WASD
keys) move forward, backward, and sideways. Clicking and dragging with the
mouse changes the viewing angle. If the user clicks on the full-screen button
in the main window (Figure 1D), ProteinVR instead changes the viewing angle
whenever the mouse moves, without requiring an accompanying click.
Teleportation navigation is also available for those who wish to use it. To
teleport to the navigation sphere, the user need only press the space bar. As
desktop mode uses only well-established web technologies, it runs on virtually
any modern browser.

### Leader Mode ###

Finally, ProteinVR can run in "leader mode." This mode transforms the program
into a powerful presentation tool. In many scenarios, multiple users may wish
to visualize the same ProteinVR scene together. A technology called WebRTC
enables direct communication between leader and follower instances. When
running in "leader" mode, ProteinVR broadcasts the user's location in the 3D
scene, as well as information about how the molecule of interest is currently
represented. Broadcasting is available from VR headsets, Android phones,
laptops, and desktops. Safari and iOS are not currently supported. In
contrast, when running in "follower" mode, ProteinVR receives this information
from the designated leader and automatically updates the scene to match
whatever the leader is currently seeing. Only 2D (desktop-mode-style) viewing
is available in follower mode because VR viewing-angle updates independent of
head movements often cause VR sickness.

## Running ProteinVR on Your Own Computer ##

Most users will wish to simply access the already compiled, publicly available
ProteinVR web app at [http://durrantlab.com/pvr/](http://durrantlab.com/pvr/).
If you wish to instead run ProteinVR on your own UNIX-like computer (LINUX,
macOS, etc.), follow these instructions:

1. Download the latest `proteinvr_web_app.zip` file from the [Releases
   page](http://git.durrantlab.com/jdurrant/protein-vr/-/releases)
2. Uncompress the file: `unzip proteinvr_web_app.zip`
3. Change to the new `proteinvr/` directory: `cd proteinvr`
4. Start a local server. Python2 provides one out of the box: `python -m
   SimpleHTTPServer 8000`
5. Access the server from your web-browser: `http://localhost:8000/` or
   perhaps `http://0.0.0.0:8000/`

Running ProteinVR on other operating systems (e.g., Windows) should be
similar.

## Compiling ProteinVR ##

The vast majority of users will not need to compile ProteinVR on their own.
Simply use the already compiled files in the `proteinvr_web_app.zip` file,
available through the [Releases
page](http://git.durrantlab.com/jdurrant/protein-vr/-/releases). If you need
to make modifications to the source code, these instructions should help with
re-compiling on UNIX-like systems:

1. Clone or download the git repository: `git clone http://git.durrantlab.com/jdurrant/protein-vr.git`
2. Change into the new `protein-vr` directory: `cd protein-vr`
3. Install the required `npm` packages: `npm install`
4. Fix any vulnerabilities: `npm audit fix`
5. Make sure ImageMagick and Python are installed system wide, and that
   `convert` and `python` work from the command line
6. To deploy a dev server: `npm run start`
7. To compile the contents of `src/` to `dist/`: `npm run build`

## Dedication ##

ProteinVR is dedicated to the memory of Dr. Karen Curto.
