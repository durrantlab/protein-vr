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
    #print(obj_filename)
    bpy.ops.import_scene.obj(filepath=obj_filename)
    bpy.data.objects[-1].name = os.path.basename(obj_filename)

# Go through each one and remove duplicates. Then UV unwrap. Then bake textures.
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    bpy.context.scene.objects.active = obj
    obj.select = True
    bpy.ops.object.mode_set(mode = 'EDIT')
    bpy.ops.mesh.select_all(action = 'SELECT')
    
    # Remove doubles
    bpy.ops.mesh.remove_doubles()

    # UV unwrap
    bpy.ops.uv.smart_project(angle_limit=89, island_margin=0.1)

    # Add image.
    image = bpy.data.images.new(
        name=obj.name + "-tex",
        width=4096, 
        height=4096, 
        alpha=False
    )

    bpy.data.screens['UV Editing'].areas[1].spaces[0].image = image

    # Bake the texture
    bpy.context.scene.render.bake_type = 'TEXTURE'
    image.filepath_raw = "//" + obj.name + "-tex.png"
    image.file_format = "PNG"
    bpy.ops.object.bake_image()
    image.save()

    bpy.ops.object.mode_set(mode = 'OBJECT')

# bpy.ops.file.pack_all()  # pack images so you don't have to save them separately.

# Scale 0.1. VMD output is huge.
for obj in bpy.data.objects:
    obj.scale = [0.1, 0.1, 0.1]

# Save a new blend file
bpy.ops.wm.save_as_mainfile(filepath="molecules.blend")
