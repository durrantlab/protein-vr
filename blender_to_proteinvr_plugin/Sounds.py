import bpy
import os
import Utils
import sys

def save_sounds(scene_data, params):
    scene_data["sounds"] = []
    for obj in bpy.data.objects:
        if obj.name[-4:] == ".mp3":
            # To allow the mp3 file to be relative to the blend file, we need
            # to do some shenanigans

            sound_filename = obj.name
            if sound_filename.startswith("."):
                # It's a relative path
                sound_filename = os.path.abspath(
                    os.path.dirname(sys.argv[2]) + os.sep + sound_filename
                )

            if not os.path.exists(sound_filename):
                print("Error! MP3 file " + sound_filename + " does not exist!")
            else:
                # Copy to working directory.
                os.system("cp " + sound_filename + " " + Utils.pwd(params) + os.path.basename(sound_filename))
                scene_data["sounds"].append((os.path.basename(sound_filename), obj.location[:]))
    
    return scene_data

                
