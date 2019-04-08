import bpy
import bmesh
import os
import random
import sys
import re

def run():
    # Get user variables
    debug_in_blender = False
    if debug_in_blender:
        crc_multi_bakes_per_mesh = 1
        crc_multi_bake_dimen = 512
        crc_multi_bake_samples = 32
        cwd = "/var/tmp/"
    else:
        argv = sys.argv
        argv = argv[argv.index("--") + 1:]  # get all args after "--"
        crc_multi_bakes_per_mesh = int(argv[0])
        crc_multi_bake_dimen = int(argv[1])
        crc_multi_bake_samples = int(argv[2])
        cwd = os.getcwd()

    scene = bpy.context.scene

    # Make sure in cycles mode.
    scene.render.engine = 'CYCLES'

    # Make sure object mode.
    switch_mode("OBJECT")

    # Use all processors
    scene.render.threads_mode = "AUTO"

    # Figure out which ones should be baked in their own right and which ones
    # should be baked onto another object.
    all_objs = {
        o.name: o for o in bpy.data.objects
        if o.type == "MESH"
    }

    objs_to_consider = {
        name: all_objs[name] for name in all_objs
        if not all_objs[name].hide and not all_objs[name].hide_render
        and not "no_bake" in all_objs[name].name
    }

    bake_targets = [
        (bpy.data.objects[o.name], bpy.data.objects[o.name[:-12]])
        for o in bpy.data.objects
        if o.name.endswith(".bake_target")
        and o.name in objs_to_consider
        and o.name[:-12] in objs_to_consider
    ]

    objs_without_bake_targets = [
        (bpy.data.objects[name], None) for name in objs_to_consider
        if not name.endswith(".bake_target")
        and not name + ".bake_target" in all_objs
    ]

    # Repeat the baking process a user-specified number of times.
    for i in range(crc_multi_bakes_per_mesh):

        # Delete previously baked images
        for image in bpy.data.images:
            if image.name.startswith("bake_img_"):
                bpy.data.images.remove(image)

        remove_old_bake_tex_nodes()

        # Go through objects.
        for obj, obj_not_bake_target in objs_without_bake_targets + bake_targets:
            print("Working on " + obj.name + "...")

            # It's not hidden. Select the object.
            print("    Selecting object...")
            sel_obj(obj)

            # Make an image to bake to.
            print("    Making image to bake...")
            rand_id = random.randint(0, 10000000)
            output_dir = cwd + os.sep + obj.name + ".img_dir" + os.sep
            if not os.path.exists(output_dir):
                os.mkdir(output_dir)

            # Determine which dimension to use
            dimen_to_use = crc_multi_bake_dimen
            candidate_dimens = [int(i) for i in re.findall(r"d(\d+)", obj.name)]
            if len(candidate_dimens) > 0:
                dimen_to_use = candidate_dimens[0]
                print("    Using alternate image dimension: " + str(dimen_to_use))

            # Make the image to bake to.
            img =  bpy.data.images.new(
                output_dir + "bake_img_" + obj.name + "_img." + str(rand_id),
                width=dimen_to_use, height=dimen_to_use
            )
            img.use_alpha = True
            img.alpha_mode = 'STRAIGHT'
            img.filepath_raw = output_dir + str(rand_id) + ".png"
            img.file_format = 'PNG'

            # If there is no material, create one.
            print("    Creating material if absent...")
            if len(obj.material_slots) == 0:
                mat = bpy.data.materials.new(name=obj.name + "_material")
                obj.data.materials.append(mat)

            # Go through all the material slots of this object.
            for slot in obj.material_slots:
                print("    Adding texture node to a slot...")
                # Get the material and nodes.
                mat = slot.material
                mat.use_nodes = True
                matnodes = mat.node_tree.nodes

                # Add a texture node
                tex_node = matnodes.new('ShaderNodeTexImage')
                tex_node.image = img
                tex_node.name = "bake_tex_node_" + obj.name

                # Make sure only the texture node is selected/active.
                for node in matnodes:
                    node.select = False
                tex_node.select = True
                matnodes.active = tex_node

            # Now make sure the object has UV. If not, give it UV.
            if not obj.data.uv_layers:
                print("    No UV, so adding...")
                # No UV layers, so make one
                switch_mode("EDIT")

                # Select all vertexes
                mesh = bmesh.from_edit_mesh(obj.data)
                for v in mesh.verts:
                    v.select = True

                # trigger viewport update
                scene.objects.active = scene.objects.active

                # Smart project
                bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.1, user_area_weight=0.0)
                switch_mode("OBJECT")

            # Bake the image
            print("    Baking image...")
            scene.cycles.samples = crc_multi_bake_samples
            scene.cycles.seed = rand_id
            if obj in [i[0] for i in objs_without_bake_targets]:
                # A straight forward bake
                bpy.ops.object.bake(type='COMBINED', use_selected_to_active=False, use_cage=False)
            else:
                # Need to bake to bake target
                sel_obj(obj_not_bake_target)
                bpy.context.scene.objects.active = obj
                bpy.ops.object.bake(type='COMBINED', use_selected_to_active=True, use_cage=True, cage_extrusion=0.01)

            # Save the image
            print("    Saving image...")
            img.save()


            # try: bpy.ops.cycles.use_shading_nodes()
            # except: continue  # It's a camera or something.

    # Save the blend file. Includes the UVs.
    scene_baked_blend = cwd + os.sep + "scene.with_uvs.blend"
    if not os.path.exists(scene_baked_blend):
        bpy.ops.wm.save_as_mainfile(
            filepath=scene_baked_blend,
            check_existing=False, copy=True
        )

def remove_old_bake_tex_nodes():
    for obj in bpy.data.objects:
        for slot in obj.material_slots:
            mat = slot.material
            mat.use_nodes = True
            matnodes = mat.node_tree.nodes
            for node in matnodes:
                if node.name.startswith("bake_tex_node_"):
                    matnodes.remove(node)

def switch_mode(mode):
    try: bpy.ops.object.mode_set(mode=mode)
    except: pass

def sel_obj(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select = True
    bpy.context.scene.objects.active = obj


run()
