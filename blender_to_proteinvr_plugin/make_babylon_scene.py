import sys
sys.path.append("/Users/jdurrant/Documents/Work/durrant_git/protein-vr/blender_plugin/")
import bpy
import sys
import Utils
import Vertices
import LOD
import Checks
import Shadows
import os
import random
import bmesh
import Sounds
import Save

# Objects with fewer than this will never be decimated
min_verts_to_decimate = 100

# Any mesh with more than this will be decimated to match it.
max_obj_verts_allowed = 15000

# Large meshes will be decimated until the scene has no more than this many
# verts.
max_scene_verts_allowed = 25000

# How much to decimate for LOD version
LOD_decimation_ratio = 0.2

print("\n")

# Make sure output directory exists
if not os.path.exists(Utils.pwd()):
    os.mkdir(Utils.pwd())

# Make sure you're in object mode
Utils.object_mode()

# Pick random id
manifest_id = random.randrange(0, 10000000)
scene_data = {
    "file_id": manifest_id,
}

# Do some preliminary checks (exists if fails...)
scene_data = Checks.preliminary_checks(scene_data)

print("Applying basic changes to meshes...")
for obj in bpy.data.objects:
    # Make sure all rotations, locations, scales are applied.
    Utils.select(obj)
    # if obj.location[0] != 0 or obj.location[1] != 0 or obj.location[2] != 0 or obj.rotation_euler[0] != 0 or obj.rotation_euler[1] != 0 or obj.rotation_euler[2] != 0 or obj.scale[0] != 1 or obj.scale[1] != 1 or obj.scale[2] != 1:
    print("\tApplying " + obj.name + " location/rotation/scaling")
    if obj.name[-4:] not in [".mp3"]:
        # Don't apply transforms to useful empties (ones that include sounds)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # Make sure smooth rendering turned on
    bpy.ops.object.shade_smooth()

# Reduce verticies in scene.
Vertices.remove_duplicate_vertices()
Vertices.simplify_big_meshes(max_obj_verts_allowed)
Vertices.simplify_meshes_until_scene_vert_count_ok(max_scene_verts_allowed, min_verts_to_decimate)

# Make shadow maps
Shadows.bake_maps()

# Make LOD (low poly) version of every mesh with >
# min_verts_requiring_decimation verticies
LOD.make_LOD(LOD_decimation_ratio, min_verts_to_decimate)

# The normals on the sky should point inward.
for obj in bpy.data.objects:
    if obj.name == "sky":
        Utils.select(obj)
        Utils.editing_mode(obj)

        mesh = bmesh.from_edit_mesh(bpy.context.object.data)

        for v in mesh.verts:
            v.select = True
        
        for f in mesh.faces:
            f.select = True

        for e in mesh.edges:
            e.select = True

        bpy.context.scene.objects.active = bpy.context.scene.objects.active

        bpy.ops.mesh.normals_make_consistent()
        bpy.ops.mesh.flip_normals()
        Utils.object_mode()
        break

# SavSete any specified sounds
scene_data = Sounds.save_sounds(scene_data)

Save.save_it(scene_data, manifest_id)