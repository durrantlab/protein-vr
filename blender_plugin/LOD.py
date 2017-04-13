import bpy
import Utils

def make_LOD(LOD_decimation_ratio, min_verts_to_decimate):
    # Make LOD (low poly) version of every mesh with >
    # min_verts_requiring_decimation verticies
    print("Setting up LOD for large meshes...")
    for obj in Utils.decimatable_objs(min_verts_to_decimate):
        if obj.name != "sky":
            print("\tMaking LOD version of " + obj.name)
            Utils.select(obj)
            bpy.ops.object.duplicate()
            obj2 = bpy.context.scene.objects.active
            obj2.name = obj.name + "Decimated"
            Utils.decimate_obj(obj2, LOD_decimation_ratio)
            
            # Hide the decimated object. So it doesn't interfere with shadow
            # baking later.
            # obj2.select = False  # unselect doesn't work once hidden.
            # obj2.hide = True
            # obj2.hide_render = True