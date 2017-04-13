import bpy
import glob
import os

curdir = os.path.dirname(os.path.abspath(__file__)) + os.sep

def select_all_objs():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        obj.select = True

# Delete everything there now
select_all_objs()
bpy.ops.object.delete() 

# Load in all obj files
for obj_filename in glob.glob(curdir + "*.obj"):
    print(obj_filename)
    bpy.ops.import_scene.obj(filepath=obj_filename)
    bpy.data.objects[-1].name = os.path.basename(obj_filename)

# Go through each one and remove duplicates
for obj in bpy.data.objects:
    bpy.context.scene.objects.active = obj
    bpy.ops.object.mode_set(mode = 'EDIT')
    bpy.ops.mesh.select_all(action = 'SELECT')
    bpy.ops.mesh.remove_doubles()
    bpy.ops.object.mode_set(mode = 'OBJECT')

# Scale 0.1. VMD output is huge.
for obj in bpy.data.objects:
    obj.scale = [0.1, 0.1, 0.1]

# Save a new blend file
bpy.ops.wm.save_as_mainfile(filepath="molecules.blend")
