import bpy
import os

# Utilities required by many modules.
def unselect_all():
    for item in bpy.context.selectable_objects:  
            item.select = False

def select(obj):
    # Actually selects and makes active
    unselect_all()
    bpy.context.scene.objects.active = obj
    obj.select = True

def object_mode():
    try:
        bpy.ops.object.mode_set(mode='OBJECT')
    except:
        print("Already in object mode!")

def editing_mode(obj):
    object_mode()
    select(obj)
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        return True
    except:
        # Some objects, such as camera, don't have an edit mode...
        return False

def num_verts(obj):
    try:
        return len(obj.data.vertices)
    except:
        return 0

def decimate_obj(obj, ratio):
    select(obj)
    bpy.ops.object.modifier_add(type='DECIMATE')
    obj.modifiers["Decimate"].ratio = ratio
    apply_all_modifiers(obj)

def decimatable_objs(min_verts_to_decimate):
    objs = []
    for obj in bpy.data.objects:
        if num_verts(obj) > min_verts_to_decimate:
            objs.append(obj)
    return objs

def apply_all_modifiers(obj):
    for mod in obj.modifiers:
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError as ex:
            # print the error incase its important... but continue
            print(ex)
def pwd():
    basedir = "proteinvr_scene_prepped"
    return "/var/tmp/" + basedir + os.sep if bpy.data.filepath == '' else os.path.dirname(bpy.data.filepath) + os.sep + basedir + os.sep