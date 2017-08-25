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

def save_it(scene_data, manifest_id, params):
    # Show the sky now that you're done rendering shadows. Just in case failed
    # earlier.
    bpy.data.objects["sky"].hide = False
    bpy.data.objects["sky"].hide_render = False

    # Remove all materials before saving to babylon file (to prevent rendering
    # the textures!)
    remove_all_materials()

    # Save to a new blender file
    pwd = Utils.pwd(params)
    bpy.ops.wm.save_as_mainfile(filepath=pwd + 'fixed.blend', check_existing=False)

    # save the babylon file
    # bpy.ops.bjs.main(filepath=pwd + "scene.babylon") # 5.4.0
    bpy.ops.scene.babylon(filepath=pwd + "scene.babylon")


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

    # Save the morphTarget stuff separately. In the future, I expect babylon
    # will play nicer with the expoerter. But for now, you'll need to do this
    # by hand.
    morphTargetData = json.load(open(pwd + "scene.babylon", 'r'))
    morph_data = {}
    if "meshes" in morphTargetData.keys():
        for mesh in morphTargetData["meshes"]:
            # No need to do the animation if it's decimated.
            if not "Decimated" in mesh["name"]:
                if "MorphTargetManager" in mesh.keys():
                    targets = {}
                    for target in mesh["MorphTargetManager"]["targets"]:
                        targets[target["name"]] = target["position"]

                    morph_data[mesh["name"]] = targets
    json.dump(morph_data, open(pwd + "morph_data.json", 'w'))
   