import bpy
import os
import Utils

def save_sounds(scene_data, params):
    scene_data["sounds"] = []
    for obj in bpy.data.objects:
        if obj.name[-4:] == ".mp3":
            if not os.path.exists(obj.name):
                print("Error! MP3 file " + obj.name + " does not exist!")
            else:
                # Copy to working directory.
                os.system("cp " + obj.name + " " + Utils.pwd(params) + os.path.basename(obj.name))
                scene_data["sounds"].append((os.path.basename(obj.name), obj.location[:]))
    
    return scene_data

                
