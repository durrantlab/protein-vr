import bpy
import Shadows
import Utils
import json

def remove_all_materials():
    for obj in bpy.data.objects:
        print("Removing materials from object \"" + obj.name + '"')

        Utils.select(obj)

        try:
            bpy.ops.object.material_slot_remove()
        except:
            print("\tCould not remove materials for object \"" + obj.name + '"')
            pass

def save_it(scene_data, manifest_id):
    # Show the sky now that you're done rendering shadows. Just in case failed
    # earlier.
    bpy.data.objects["sky"].hide = False
    bpy.data.objects["sky"].hide_render = False

    # Remove all materials before saving to babylon file (to prevent rendering
    # the textures!)
    remove_all_materials()

    # Save to a new blender file
    pwd = Utils.pwd()
    bpy.ops.wm.save_as_mainfile(filepath=pwd + 'fixed.blend', check_existing=False)

    # save the babylon file
    bpy.ops.bjs.main(filepath=pwd + "scene.babylon")

    # Save scene info
    json.dump(scene_data, open(pwd + "proteinvr.json", 'w'))

    # Save a manifest
    json.dump(
        {
            "version" : manifest_id, 
            "enableSceneOffline" : True, # In the future, reenable this for faster load.
            "enableTexturesOffline" : True
        }, 
        open(pwd + "scene.babylon.manifest", 'w')
    )
