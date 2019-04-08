# This script creates a version of a blend file with baked images.

import bpy
import os

def sel_obj(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select = True
    bpy.context.scene.objects.active = obj

# Switch to blender render
scene = bpy.context.scene
scene.render.engine = 'BLENDER_RENDER'

# Delete objects that have bake targets.
for o in bpy.data.objects:
    if o.name.endswith(".bake_target"):
        sel_obj(bpy.data.objects[o.name[:-12]])
        bpy.ops.object.delete()

# Go through all the objects that are visible.
for obj in bpy.data.objects:
    if not obj.hide and not obj.hide_render and obj.type == "MESH":
        # It's not hidden. Select the object.
        sel_obj(obj)

        # Remove all materials
        obj.active_material_index = 0
        for i in range(len(obj.material_slots)):
            bpy.ops.object.material_slot_remove({'object': obj})

        # Load the appropriate PNG file
        # os.getcwd() + os.sep + "output_imgs" + os.sep + obj.name + ".png",
        # img = bpy.data.images.load(
        #     os.getcwd() + os.sep + obj.name + ".png",
        #     check_existing=False
        # )
        filename = os.getcwd() + os.sep + obj.name + ".jpg"
        if not os.path.exists(filename):
            filename = filename.replace(".no_bake", "")
        if not os.path.exists(filename):
            filename = filename.replace(".bake_target", "")
        if not os.path.exists(filename):
            filename = filename.replace(".jpg", ".bake_target.jpg")

        img = bpy.data.images.load(
            filename,
            check_existing=False
        )

        # Make a texture
        tex = bpy.data.textures.new("tex_" + obj.name, type='IMAGE')
        tex.image = img

        # Make a material.
        mat = bpy.data.materials.new(name="mat_" + obj.name)
        mat.diffuse_intensity = 1.0
        mat.specular_intensity = 0.0
        mat.use_shadeless = True

        # Add the image texture to a texture slot.
        slot = mat.texture_slots.add()
        slot.texture = tex

        # Add the material.
        obj.data.materials.append(mat)

# Switch to Textured mode. See
# https://blender.stackexchange.com/questions/17745/changing-viewport-shading-with-python
area = next(area for area in bpy.context.screen.areas if area.type == 'VIEW_3D')
space = next(space for space in area.spaces if space.type == 'VIEW_3D')
space.viewport_shade = 'MATERIAL'  # set the viewport shading

# Rename objects that were bake targets.
for o in bpy.data.objects:
    if o.name.endswith(".bake_target"):
        o.name = o.name[:-12]

# Save it.
bpy.ops.wm.save_mainfile()
# os.getcwd() + os.sep + "output_imgs" + os.sep
