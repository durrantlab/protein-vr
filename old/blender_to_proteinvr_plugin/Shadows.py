import bpy
import Utils
import random
import os
import glob

def remove_material(obj):
    # Save that objects current material, and then remove it. This assumes one
    # material per object. That's enforced elsewhere.
    material_of_active = obj.material_slots[0].material

    # Remove that material.
    obj.active_material_index = 0
    bpy.ops.object.material_slot_remove()

    return material_of_active

def get_objs_to_consider(params):
    # Get a list of the objects to consider.
    objs = []
    for obj in bpy.data.objects:
        if "Decimate" in obj.name:
            continue
        
        if "light" in obj.name:
            continue

        if obj.name == "sky":
            # The sky has no shadows.
            continue

        try:
            tmp = obj.data.materials
        except:
            # Cameras and things don't count
            continue

        filepath =  Utils.pwd(params) + obj.name + "shadow.png"

        if os.path.exists(filepath):
            resp = input(filepath + " already exists. Overwrite? (y/N) ")
            if resp.upper() != "Y":
                continue
        
        objs.append(obj)

    return objs

def render_shadows(params, objs):
    # Save current materials and remove them. Everything is pure white.
    orig_mats = []
    img_filenames = []
    for obj in objs:
        # Get the original material and remove it
        Utils.select(obj)
        orig_mats.append(remove_material(obj))
    
        # Create a new material, pure white diffuse.
        mat_name = "tmptmp" + str(random.random())
        mat = bpy.data.materials.new(name=mat_name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        output = nodes['Material Output']
        diffuse = nodes['Diffuse BSDF']
        diffuse.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1.0)  # pure white

        # Add this material to the current object
        obj.data.materials.append(mat)

    # Now that everything is white, go through and render each image.
    for i, obj in enumerate(objs):
        print("\tBaking shadows for " + obj.name)

        filepath =  Utils.pwd(params) + obj.name + "shadow.png"
        Utils.select(obj)

        # Not enough just to select object... need to add texture node to
        # material and select that.
        # You need to add a texture node to render to

        # Create a new image to render the shadows to
        image_name = "tmptmp" + str(random.random())
        img_filenames.append(image_name)
        image = bpy.ops.image.new(
            name   = image_name,
            width  = params["shadow_maps_resolution"],
            height = params["shadow_maps_resolution"],
            color  = (1.0, 1.0, 1.0, 1.0),
            alpha  = False
        )
        
        mat = obj.data.materials[0]
        nodes = mat.node_tree.nodes
        texture_node = nodes.new(type='ShaderNodeTexImage') 
        texture_node.select = True
        texture_node.image = bpy.data.images[image_name]

        # Make sure that node is active/selected (only one)
        for node in mat.node_tree.nodes:
            node.select = False
        mat.node_tree.nodes.active = texture_node
        texture_node.select = True

        # Bake the shadow map
        oldCyclesSamples = bpy.context.scene.cycles.samples
        bpy.context.scene.cycles.samples = params["cycles_samples"] #200

        uv_textures = obj.data.uv_textures
        uv_textures.active = obj.data.uv_textures[0]  # Assuming just one uv map

        # try:
        bpy.ops.object.bake(type='COMBINED', use_selected_to_active=False)
        # except:
        #     pwd = Utils.pwd(parms)
        #     bpy.ops.wm.save_as_mainfile(filepath=pwd + 'fixed.blend', check_existing=False)
        #     import pdb; pdb.set_trace()
        #     hhgh

        bpy.context.scene.cycles.samples = oldCyclesSamples

        # Save that shadow map
        img = bpy.data.images[img_filenames[i]]
        img.filepath_raw = bpy.path.abspath(filepath)
        img.file_format = 'PNG'
        img.save()

        print("\t\tShadow map saved to " + filepath) # + ".\n\t\tNow blur the image and convert to black and white in a program like PhotoShop.")


def bake_maps(params):
    print("Baking shadows...")

    # Make sure sky isn't selected
    for obj in bpy.data.objects:
        obj.select = False

    # Hide the sky because it has no shadow.
    bpy.data.objects["sky"].hide = True
    bpy.data.objects["sky"].hide_render = True

    # Get the objects to consider
    objs = get_objs_to_consider(params)

    # Seaprate out the inner ones from the outer ones.
    inner_objs = [o for o in objs if "inner" in o.name.lower()]
    outer_objs = [o for o in objs if "outer" in o.name.lower()]
    not_inner_objs = [o for o in objs if "inner" not in o.name.lower()]

    # Hide the inner objs for now.
    for obj in inner_objs:
        obj.hide = True
        obj.hide_render = True

    # Render the objects that aren't hidden.
    render_shadows(params, not_inner_objs)

    # Now show the inner objects and hide the outer objects.
    for obj in inner_objs:
        obj.hide = False
        obj.hide_render = False

    for obj in outer_objs:
        obj.hide = True
        obj.hide_render = True
    
    # Now render the inner-object shadows
    render_shadows(params, inner_objs)

    # Show the outer objs.
    for obj in outer_objs:
        obj.hide = False
        obj.hide_render = False
    

    # Restore materials No more... material information is now stored to
    # proteinvr.json. Leaving these materials off will prevent babylon
    # exporter from doing bakes. 
    # for i, obj in enumerate(objs):
    #     Utils.select(obj)
    #     # Remove the temporary material
    #     remove_material(obj)
    #     obj.data.materials.append(orig_mats[i])

    # Remove any lights now that you're done rendering shadows.
    for obj in bpy.data.objects:
        if "light" in obj.name:
            print("Removing " + obj.name + " from scene...")
            Utils.select(obj)
            bpy.ops.object.delete()

    # Show the sky now that you're done rendering shadows.
    bpy.data.objects["sky"].hide = False
    bpy.data.objects["sky"].hide_render = False
