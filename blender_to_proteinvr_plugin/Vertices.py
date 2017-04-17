import bpy
import Utils

# The purpose of this module is to reduce the number of verticies in the scene

def remove_duplicate_vertices():
    # Merge all overlapping verticies. Do this before decimation
    print("Making sure duplicate vertices merged...")
    for obj in bpy.data.objects:
        if Utils.editing_mode(obj):
            bpy.ops.mesh.remove_doubles()
    Utils.object_mode()

def simplify_big_meshes(max_obj_verts_allowed):
    # Go through and make sure no object has more than max_obj_verts_allowed verticies
    print("Checking for meshes that are too big...")
    for obj in bpy.data.objects:
        num_verts_in_obj = Utils.num_verts(obj)
        if num_verts_in_obj > max_obj_verts_allowed:
            print("\t" + obj.name + " has " + str(num_verts_in_obj) + " verticies! The maximum allowed is " + str(max_obj_verts_allowed) + ". Decimating...")
            ratio = max_obj_verts_allowed/num_verts_in_obj
            Utils.decimate_obj(obj, ratio)

def simplify_meshes_until_scene_vert_count_ok(max_scene_verts_allowed, min_verts_to_decimate):
    # You need to cap the total number of verticies that can be in a scene. Keep
    # decimating until that goal is achieved.
    tot_num_verts = sum([Utils.num_verts(o) for o in bpy.data.objects])
    while tot_num_verts > max_scene_verts_allowed:
        for obj in Utils.decimatable_objs(min_verts_to_decimate):
            Utils.decimate_obj(obj, 0.95)
        tot_num_verts = sum([Utils.num_verts(o) for o in bpy.data.objects])