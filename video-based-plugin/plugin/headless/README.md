Introduction
============

Though placed in the plugin's directory, the code in this directory is not
part of the plugin. It allows one to run the plugin in "headless mode,"
meaning that the Blender GUI need not be loaded. It's ideal for rendering
scenes remotely.

Step 1: Prepare the Blend File
==============================

Open up your scene in Blender and make sure everything is set up. 

1. Set the ProteinVR parameters, but don't but press the "XXX" button. 
2. Make sure any objects that will be rendered as meshes are a) UV unwrapped
   and b) have baked textures.
3. Pack all images.
4. Make sure the PNGQUANT path is that on the remote system, if you want to
   use it.
5. Save the `blend` file.

Step 2: Copy to Remote Computer
===============================

Good to use `rsync` or `scp`. Copy both your `blend` file and the
`render_proteinvr_headless.py` script.

Step 3: Run Blender in Headless Mode
====================================

`/path/to/exec/blender -b myfile.blend -P render_proteinvr_headless.py -t 12`

1. `-b` means run in the background.
2. `myfile.blend` is your saved `blend` file.
3. `-P render_proteinvr_headless.py` means run the provided python file.
4. `-t 12` means use 12 processors.

Note that ProteinVR must also be installed and active on the remote computer.
[This
link](https://blender.stackexchange.com/questions/73759/install-addons-in-headless-blender)
shows how to do that from the command line.

Step 4: Copy Files Back To Your Computer
========================================

The output will be placed in the `proteinvr_output` directory, regardless of
what you specified in the `blend` file.