import bpy
import numpy
from scipy.optimize import minimize
import glob
import os
import json
from mathutils import Vector

# To get pip for blender python:
# Might be better: https://github.com/pypa/pip/issues/5236
# cd /Applications/blender-2.79-macOS-10.6/blender.app/Contents/Resources/2.79/python
# curl https://bootstrap.pypa.io/get-pip.py | bin/python3.5m
# bin/pip3.5 install --target lib/python3.5 scipy

# obj_names = [
    # "Cube",
    # "Suzanne"
# ]
# bottom_pt = [1.0, -7.99161, 1.0]  # On cube
# front_pt = [4.85976, 1.6298, 0.207429]  # Left ear
# dimens = [15.0, 15.0, 15.0]
obj_dir = "/Users/jdurrant/Documents/Work/durrant_git/protein-vr/process_mol/tmp/"
json_path = "/Users/jdurrant/Documents/Work/durrant_git/protein-vr/process_mol/sample.json"
new_origin = [1.264508, -6.312316, 0.052804]  # This will depend on the scene.

def selective_active(obj_name):
    bpy.ops.object.select_all(action='DESELECT')
    obj = bpy.data.objects[obj_name]
    obj.select = True
    bpy.context.scene.objects.active = obj

def add_plane(loc, name):
    names = set([o.name for o in bpy.data.objects])
    bpy.ops.mesh.primitive_plane_add(location=loc)
    obj_name = list(set([o.name for o in bpy.data.objects]) - names)[0]
    obj = bpy.data.objects[obj_name]
    obj.name = name
    return obj

def apply_all_transforms():
    for obj_name in obj_names:
        selective_active(obj_name)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

def get_all_verts():
    verts = []
    for obj_name in obj_names:
        obj = bpy.data.objects[obj_name]
        for v in obj.data.vertices:
            v = obj.matrix_world * v.co  # Note that matrix_world is an identity matrix.
            verts.append(list(v))
    verts = numpy.array(verts)
    return verts

def rotate_obj(rots):
    angle_x = rots[0] * numpy.pi / 180
    angle_y = rots[1] * numpy.pi / 180
    angle_z = rots[2] * numpy.pi / 180
    for obj_name in obj_names:
        obj = bpy.data.objects[obj_name]
        obj.rotation_euler[0] = angle_x
        obj.rotation_euler[1] = angle_y
        obj.rotation_euler[2] = angle_z

def get_obj_pt(rots, name):
    rotate_obj(rots)
    bpy.context.scene.update()
    obj = bpy.data.objects[name]
    v = obj.data.vertices[0]
    v = obj.matrix_world * v.co
    return v

def get_bottom_pt_z_val(rots):
    return get_obj_pt(rots, "bottom_pt")[2]

def get_front_pt_y_val(x):
    global first_two_rots
    rots = [first_two_rots[0], first_two_rots[1], x[0]]
    return get_obj_pt(rots, "front_pt")[1]

def get_front_pt_dist_to_camera(x):
    global first_two_rots
    rots = [first_two_rots[0], first_two_rots[1], x[0]]
    print(rots)
    fp = get_obj_pt(rots, "front_pt")
    cam_loc = bpy.context.scene.camera.location
    return (cam_loc - fp).length

def switch_to_mode(mode):
    try:
        bpy.ops.object.mode_set(mode = 'OBJECT')
    except:
        pass

    try:
        bpy.ops.object.mode_set(mode=mode)
    except:
        pass

def load_objs(dir_path):
    switch_to_mode("OBJECT")
    new_objs = []
    for obj_file in glob.glob(dir_path + "/*.obj"):
        prts = os.path.basename(obj_file).split(".")
        label = prts[-2]
        name = ".".join(prts[:-2])

        # Import the obj
        existing = set([o.name for o in bpy.data.objects])
        bpy.ops.import_scene.obj(filepath=obj_file)
        new_name = list(set([o.name for o in bpy.data.objects]) - existing)[0]
        new_obj = bpy.data.objects[new_name]

        # Rename the object
        new_obj.name = name + "." + label

        # If it contains no vertexes, remove it.
        if len(new_obj.data.vertices) == 0:
            selective_active(new_obj.name)
            bpy.ops.object.delete()
        else:
            # Simplify the geometry agressively.
            selective_active(new_obj.name)
            switch_to_mode("EDIT")
            bpy.ops.mesh.select_all(action = 'SELECT')

            if "Sticks" in label:
                threshold = 0.1
            elif "Surface" in label:
                threshold = 0.75
            elif "Ribbon" in label:
                threshold = 0.25
            else:
                threshold = 0.0001

            bpy.ops.mesh.remove_doubles(threshold=threshold)
            bpy.ops.mesh.normals_make_consistent()
            switch_to_mode("OBJECT")

            new_objs.append(new_obj)

    return new_objs

def position_new_objs(new_objs):
    global new_origin

    # Get some variables
    global obj_names
    obj_names = [o.name for o in new_objs]

    data = json.load(open(json_path))["info"]
    bottom_pt = data["bottom_pt"]
    front_pt = data["front_pt"]
    dimens = data["dimens"]

    # There can be no transforms on the meshes. Also, mesh origin set to coord
    # origin.
    apply_all_transforms()

    # Get the geometric center for all the objects taken together, and the verts.
    geo_center = numpy.average(get_all_verts(), axis=0)

    # Add planes at the positions of the bottom and front point.
    bottom_plane = add_plane(bottom_pt, "bottom_pt")
    front_plane = add_plane(front_pt, "front_pt")
    for obj in [bottom_plane, front_plane]:
        selective_active(obj.name)
        # obj.scale = [0.01, 0.01, 0.01]  # Transform moves to origin if scaled to 0?
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        obj_names.append(obj.name)

    # Set the pivot point to geo center
    bpy.context.scene.cursor_location = geo_center
    for obj_name in obj_names:
        selective_active(obj_name)
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")

    # Also make sure all the objects are in euler
    for obj_name in obj_names:
        bpy.data.objects[obj_name].rotation_mode = "XYZ"

    # Rotate everything so the bottom pt is maximally bottom most.
    global first_two_rots
    x0 = [45.0, 45.0, 45.0]
    res = minimize(get_bottom_pt_z_val, x0, method='Nelder-Mead') #, tol=1e-6)
    get_bottom_pt_z_val(res.x)
    first_two_rots = [res.x[0], res.x[1]]

    # Now rotate around the z axis so front_pt faces the +y direction.
    y0 = [45.0]
    res = minimize(get_front_pt_y_val, y0, method='Nelder-Mead') #, tol=1e-6)
    get_front_pt_y_val(res.x)

    # Move so that bottom point is at origin
    delta = -get_obj_pt([first_two_rots[0], first_two_rots[1], res.x[0]], "bottom_pt") # + Vector(new_origin)

    for obj_name in obj_names:
        obj = bpy.data.objects[obj_name]
        obj.location = obj.location + delta

    # Apply all transforms
    apply_all_transforms()

    # Now scale to fit within a bounding box.
    verts = get_all_verts()
    cur_dimens = numpy.max(verts, axis=0) - numpy.min(verts, axis=0)
    ratios = numpy.array(dimens) / cur_dimens
    min_ratio = numpy.min(ratios)
    for obj_name in obj_names:
        obj = bpy.data.objects[obj_name]
        obj.scale = [min_ratio, min_ratio, min_ratio]

    # Move translate so its at the user-specified location.
    for obj_name in obj_names:
        bpy.data.objects[obj_name].location += Vector(new_origin)

    # Rotate it about the Z axis until it faces the camera.
    first_two_rots = [0.0, 0.0]
    z0 = [45.0]
    res = minimize(get_front_pt_dist_to_camera, z0, method='Nelder-Mead') #, tol=1e-6)
    get_front_pt_dist_to_camera(res.x)

    # Clean up extra points
    obj_names.remove("bottom_pt")
    obj_names.remove("front_pt")
    selective_active("bottom_pt")
    bpy.ops.object.delete()
    selective_active("front_pt")
    bpy.ops.object.delete()

    # Not apply everything.
    apply_all_transforms()


# new_objs = load_objs(obj_dir)
# position_new_objs(new_objs)
