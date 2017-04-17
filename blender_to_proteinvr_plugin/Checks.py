import bpy
import Utils
import sys
import json

def preliminary_checks(scene_data):
    # There always needs to be a few objects.
    obj_names = bpy.data.objects.keys()
    print("Checking if key objects exist in the scene...")
    if not "cmra" in obj_names:
        print('\tError. You need a camera in the scene named "cmra".')
        sys.exit(0)

    if not "sky" in obj_names:
        print('\tError. You need a sky sphere in the scene named "sky".')
        sys.exit(0)

    if not "grnd" in obj_names:
        print('\tError. You need a mesh named "grnd" for the ground.')
        sys.exit(0)

    # Only cycles scenes are supported.
    print("Making sure CYCLES is being used...")
    if bpy.context.scene.render.engine != "CYCLES":
        print("\tError. You must develop your scene in cycles.")
        sys.exit(0)

    # All objects with verticies must have UV maps. Required for shadows.
    scene_data["materials"] = {}
    textureNameMappings = {}
    for obj in bpy.data.objects:
        Utils.select(obj)

        # If object isn't visible, remove it.
        if obj.hide == True or obj.hide_render == True:
            print('"' + obj.name + '" isn\'t visible, so deleteing.')
            bpy.ops.object.delete()

        # Check if has uv
        try:
            has_uv_layers = bpy.context.object.data.uv_layers
        except:
            # Some object's can't have uvs
            continue

        if len(has_uv_layers) == 1:
            pass
        elif len(has_uv_layers) > 1:
            print(obj.name + " has " + str(has_uv_layers) + " uv layers. Only one is allowed.")
            sys.exit(0)
        else:
            print(obj.name + " has no UV. You need to unwrap it before proceeding.")
            sys.exit(0)
    
        # Check if has material. In the same look because everything that can
        # have a uv can have a material.
        num_mats = len(obj.material_slots)
        if num_mats != 1:
            print(obj.name + " has " + str(num_mats) + " associated material(s). It must have 1.")
            sys.exit(0)
        
        # Check if that material has a ProteinVR node group (required). Also,
        # all these can have UV. Nice coincidence.
        # material_of_active = obj.material_slots[0].material
        # hasProteinVR = False

        mat = obj.data.materials[0]
        nodes = mat.node_tree.nodes
        for node in nodes:
            if hasattr(node, 'node_tree') and node.node_tree.name == "ProteinVR":
                scene_data["materials"][obj.name] = {}

                # So ProteinVR does exist... Get the color and glossiness
                protein_vr = nodes.get(node.name)
                color_input = protein_vr.inputs[0]
                color = color_input.default_value[:]
                glossiness = protein_vr.inputs[1].default_value
                scene_data["materials"][obj.name]["glossiness"] = glossiness

                # Now check if it's attached to a image node. If so, use that.
                # See http://blender.stackexchange.com/questions/77365/getting-the-image-of-a-texture-node-that-feeds-into-a-node-group?noredirect=1#comment135993_77365
                try:
                    # Get the link that input to 'dif' and 'socket'
                    link = next( link for link in mat.node_tree.links if link.to_node == protein_vr and link.to_socket == color_input )
                    imageNode = link.from_node # The node this link is coming from

                    if imageNode.type == 'TEX_IMAGE': # Check if it is an image texture node
                        image = imageNode.image # Get the image
                        image_name = image.name

                        if not image_name in textureNameMappings.keys():
                            textureNameMappings[image_name] = "Image" + str(len(textureNameMappings.keys()) + 1) + ".png"

                        # Save the texture
                        scene = bpy.context.scene
                        scene.render.image_settings.file_format='PNG'
                        image.file_format = "PNG"
                        base_filename = textureNameMappings[image_name] # obj.name + "_tex.png"
                        filename = Utils.pwd() + base_filename
                        image.save_render(filename, scene)

                        scene_data["materials"][obj.name]["color"] = base_filename
                        #print( "result", image.name, image.filepath )
                    else:
                        scene_data["materials"][obj.name]["color"] = color[:3]
                except:
                    scene_data["materials"][obj.name]["color"] = color[:3]

                break
        
    return scene_data
