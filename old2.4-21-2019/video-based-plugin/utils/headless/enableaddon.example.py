import bpy
bpy.ops.wm.addon_install(filepath='/ihome/jdurrant/durrantj/programs/blender-2.79-linux-glibc219-x86_64/2.79/scripts/addons/proteinvr/')
bpy.ops.wm.addon_enable(module='proteinvr')
bpy.ops.wm.save_userpref()

# blender -b -P enableaddon.example.py
