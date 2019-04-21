import bpy
from math import sqrt, pi

BAKE_IMG_SIZE = 2048, 2048
INITIAL_SPHERE_SIZE = 0.1
CYCLES_SAMPLES = 32
HIDDEN_BLOCKER_START_STRING = "hidden_blocker"

def cleanup_previous_runs():
    switch_mode("OBJECT")
    for obj in bpy.data.objects:
        if obj.name.startswith("tmp_sphere_"):
            select_only_by_name(obj.name)
            bpy.ops.object.delete() 
    for img in bpy.data.images:
        if img.name.startswith("tmp_sphere_"):
            img.user_clear()
    for img in bpy.data.images: 
        if not img.users and img.name.startswith("tmp_sphere_"): 
            bpy.data.images.remove(img)

def to_world_coor(obj, obj_coor):
    return obj.matrix_world * obj_coor

def to_obj_coor(obj, world_coor):
    return obj.matrix_world.inverted() * world_coor

def dist(pt1, pt2):
    return sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2 + (pt1[2] - pt2[2])**2)

def switch_mode(mode):  # Mode can be "EDIT", "OBJECT", etc.
    try:
        bpy.ops.object.mode_set(mode = mode)
    except:
        # Must already be in this mode.
        pass

def select_only_by_name(obj_name):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.data.objects[obj_name].select = True

# def setup_generic_cycles_material(uniq_id):
#     # Now make the material of the sphere perfectly glossy (a mirror). See
#     # https://blender.stackexchange.com/questions/23433/how-to-assign-a-new-material-to-an-object-in-the-scene-from-python
#     # Also include a texture node to bake to.
#     # mat = bpy.data.materials.get(uniq_id)  # Get material
#     # if mat is None:
#     # New material
#     mat = bpy.data.materials.new(name=uniq_id)  # create material, because not previously created.
#     mat.use_nodes = True

#     return mat

class EnvironmentTexRenderer:
    def __init__(self, expanding_sphere):
        self.expanding_sphere = expanding_sphere
        self.sphere_obj = expanding_sphere.sphere_obj
        self.uniq_id = expanding_sphere.uniq_id

        self.setup_mirror_material()
        self.bake_environ_texture()
        self.add_environ_tex_as_emit_mat()

    def setup_mirror_material(self):
        # Make the material
        mat = bpy.data.materials.new(name=self.uniq_id)  # create material, because not previously created.
        mat.use_nodes = True

        # Create a texture where we can bake the sphere's surface
        self.texture = bpy.data.images.new(self.uniq_id + "_img", width=BAKE_IMG_SIZE[0], height=BAKE_IMG_SIZE[1], alpha = True)

        # For a list of nodes, see
        # https://docs.blender.org/api/blender_python_api_2_77_0/bpy.types.html.

        # Make a perfectly glossy node.
        glossy_node = mat.node_tree.nodes.new(type="ShaderNodeBsdfGlossy")
        glossy_node.inputs[1].default_value = 0

        # Hook it into Material Output
        mat.node_tree.links.new(
            mat.node_tree.nodes["Material Output"].inputs["Surface"],
            glossy_node.outputs["BSDF"]
        )

        # Make a texture node, set it to the new bake texture.
        bake_texture_node = mat.node_tree.nodes.new(type="ShaderNodeTexImage")
        bake_texture_node.image = self.texture

        # Assign the material to the new sphere object.
        if self.sphere_obj.data.materials:
            self.sphere_obj.data.materials[0] = mat  # assign to 1st material slot
        else:
            self.sphere_obj.data.materials.append(mat)  # no slots

    def bake_environ_texture(self):
        # Only the new sphere is selected and active (for baking).
        bpy.ops.object.select_all(action = 'DESELECT')
        self.sphere_obj.select = True
        bpy.context.scene.objects.active = self.sphere_obj

        # Hide all the hidden blockers.
        for obj in bpy.data.objects:
            if obj.name.startswith(HIDDEN_BLOCKER_START_STRING):
                obj.hide = True
                obj.hide_render = True

        # Bake the image
        print("    Start baking environmental texture.")
        bpy.context.scene.cycles.samples = CYCLES_SAMPLES
        bpy.ops.object.bake(type='COMBINED', use_selected_to_active=False)

    def add_environ_tex_as_emit_mat(self):
        mat = bpy.data.materials.new(name=self.uniq_id + "emit")  # create material, because not previously created.
        mat.use_nodes = True

        # Shadeless node shown here:
        # https://nixart.files.wordpress.com/2012/04/shadelessnodesetup.png
        # https://nixart.wordpress.com/2012/04/10/blender-cycles-shadeless-material-node-setup/

        emission_shader_node = mat.node_tree.nodes.new(type="ShaderNodeEmission")
        tex_coord_node = mat.node_tree.nodes.new(type="ShaderNodeTexCoord")

        image_texture_node = mat.node_tree.nodes.new(type="ShaderNodeTexImage")
        image_texture_node.image = self.texture

        # Now connect these nodes
        mat.node_tree.links.new(
            mat.node_tree.nodes["Material Output"].inputs["Surface"],
            emission_shader_node.outputs["Emission"]
        )
        mat.node_tree.links.new(emission_shader_node.inputs["Color"], image_texture_node.outputs["Color"])
        mat.node_tree.links.new(image_texture_node.inputs["Vector"], tex_coord_node.outputs["UV"])

        # Assign the material to the new sphere object.
        if self.sphere_obj.data.materials:
            self.sphere_obj.data.materials[0] = mat  # assign to 1st material slot
        else:
            self.sphere_obj.data.materials.append(mat)  # no slots

class BakeNormalMap:
    def __init__(self, expanding_sphere_high_res, expanding_sphere_low_res):
        self.expanding_sphere_high_res = expanding_sphere_high_res
        self.expanding_sphere_low_res = expanding_sphere_low_res

        self.uniq_id = self.expanding_sphere_low_res.uniq_id + "_nrml"

        self.setup_normal_make_mat()
        self.make_normals()

    def setup_normal_make_mat(self):
        # Make new texture for normals, and change it on the node
        switch_mode("OBJECT")

        # Make the material
        # mat = setup_generic_cycles_material(self.uniq_id)
        mat = bpy.data.materials.new(name=self.uniq_id)  # create material, because not previously created.
        mat.use_nodes = True

        # Create a texture where we can bake the sphere's surface
        self.texture = bpy.data.images.new(self.uniq_id + "_img", width=BAKE_IMG_SIZE[0], height=BAKE_IMG_SIZE[1], alpha = True)

        # For a list of nodes, see
        # https://docs.blender.org/api/blender_python_api_2_77_0/bpy.types.html.

        # Make a texture node, set it to the new bake texture.
        bake_texture_node = mat.node_tree.nodes.new(type="ShaderNodeTexImage")
        bake_texture_node.image = self.texture

        low_res_sphere = self.expanding_sphere_low_res.sphere_obj

        # Assign the material to the new sphere object.
        if low_res_sphere.data.materials:
            low_res_sphere.data.materials[0] = mat  # assign to 1st material slot
        else:
            low_res_sphere.data.materials.append(mat)  # no slots
    
    def make_normals(self):
        # Select high-res sphere
        select_only_by_name(self.expanding_sphere_high_res.sphere_obj.name)

        # Start baking
        bpy.context.scene.objects.active = self.expanding_sphere_low_res.sphere_obj
        bpy.ops.object.bake(type='NORMAL', use_selected_to_active=True)

        # Set up material with color and normal.
        # Do stuff here. But no normal on emission? Is it really necessary if you bake to the high-def? That's what I recommend.

class ExpandingSphere:
    def __init__(self, uniq_id, uv_sphere_subdivisions=6, bake_environment_tex=False, simplify_geometry=False):
        self.uniq_id = "tmp_sphere_" + uniq_id
        self.uv_sphere_subdivisions = uv_sphere_subdivisions

        self.objects_with_mesh_data = None
        self.sphere_obj = None
        self.sphere_center_world = None

        self.make_initial_sphere()
        if bake_environment_tex:
            self.renderer = EnvironmentTexRenderer(self)

        self.project_sphere_to_environment()

        if simplify_geometry:
            self.simplify_sphere_geometry()

    def make_initial_sphere(self):
        # Show all the hidden blockers.
        for obj in bpy.data.objects:
            if obj.name.startswith(HIDDEN_BLOCKER_START_STRING):
                obj.hide = False

        # Get the objects that are visible and have mesh data
        self.objects_with_mesh_data = [o for o in bpy.data.objects if o.type == "MESH" and o.hide == False]

        # Get a list of all object names
        start_names = set([o.name for o in bpy.data.objects])

        # First add a sphere to project onto, at the origin
        self.sphere_center_world = bpy.context.scene.camera.location  # bpy.context.scene.cursor_location
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=self.uv_sphere_subdivisions, size=INITIAL_SPHERE_SIZE, calc_uvs=True, 
            location=self.sphere_center_world
        )

        # Get the sphere just added as a variable
        sphere_obj_name = list(set([m.name for m in bpy.data.objects]) - start_names)[0]
        self.sphere_obj = bpy.data.objects[sphere_obj_name]
        self.sphere_obj.name = self.uniq_id + "_sphere"

        # The new sphere must be smooth
        bpy.ops.object.shade_smooth()

    def project_sphere_to_environment(self):
        # Loop through each vertex of that sphere, project out to surrounding
        # shapes. Keep track of max distance to any projected point.
        max_dist_to_any_projected_pt = 0
        idx_of_pts_with_no_hit = []
        for i, vert_sphere_obj in enumerate(self.sphere_obj.data.vertices):
            vert_coor_world = to_world_coor(self.sphere_obj, vert_sphere_obj.co)

            # Cast a ray and find the hit point. Must do from all visible
            # objects
            hit_pts_to_consider = []
            for o in self.objects_with_mesh_data:
                vert_coor_obj = to_obj_coor(o, vert_coor_world)
                sphere_center_obj = to_obj_coor(o, self.sphere_center_world)
                direc = vert_coor_obj - sphere_center_obj
                hit_data = o.ray_cast(sphere_center_obj, direc)
                
                if hit_data[0]:
                    # It hit something. Record that.
                    hit_pt_world = to_world_coor(o, hit_data[1]) - self.sphere_center_world
                    hit_pts_to_consider.append(hit_pt_world)

                    # Also update max_dist_to_any_projected_pt if this is the
                    # furthest point out so far.
                    this_dist = dist(hit_pt_world, self.sphere_center_world)
                    if this_dist > max_dist_to_any_projected_pt:
                        max_dist_to_any_projected_pt = this_dist
            
            if len(hit_pts_to_consider) == 0:
                # It never hit anything. Just record this point for future
                # processing.
                idx_of_pts_with_no_hit.append(i)
            elif len(hit_pts_to_consider) == 1:
                # If it's just one hit point, set the vertex to that point.
                vert_sphere_obj.co = hit_pts_to_consider[0]
            elif len(hit_pts_to_consider) > 1:
                # More than one point? Get the closest one.
                dists = [dist(pt, self.sphere_center_world) for pt in hit_pts_to_consider]
                data = list(zip(dists, hit_pts_to_consider))
                data.sort()
                vert_sphere_obj.co = data[0][1]

        # Now you need to go through and project the ones that pointed out
        # into the open air. Set those at the max distance of any found hit
        # point.
        for i in idx_of_pts_with_no_hit:
            pt_coor_obj = self.sphere_obj.data.vertices[i].co
            pt_coor_obj = max_dist_to_any_projected_pt * pt_coor_obj / INITIAL_SPHERE_SIZE
            self.sphere_obj.data.vertices[i].co = pt_coor_obj
        
        # Update normals too
        switch_mode("EDIT")
        bpy.ops.mesh.normals_make_consistent()
        bpy.ops.mesh.flip_normals()
        switch_mode("OBJECT")
    
    def simplify_sphere_geometry(self):
        # Simplify the geometry of the environmental projection sphere
        # Decimate by dissolving coplanar triangles. Doesn't change shape much.
        mod = self.sphere_obj.modifiers.new("Decimate", type="DECIMATE")
        mod.decimate_type = "DISSOLVE"
        mod.angle_limit = 0.02 * pi / 180  # Really gets only planar ones.
        mod.delimit = {"UV"}
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Decimate")
    
    def apply_normal_tex(self):
        self.renderer.add_environ_tex_as_emit_mat()
        print("NORMAL NOT IMPLEMENTED, BECAUSE EMIT!")


print("Clean up previous run.")
cleanup_previous_runs()

print("Make low-resolution sphere. Also texture.")
low_res = ExpandingSphere(
    "try1", 
    uv_sphere_subdivisions=5, 
    bake_environment_tex=True, 
    simplify_geometry=False
)

# Below is pointless because you're using an emit material, which doesn't
# allow for normals.

# print("Create high-resolution sphere.")
# high_res = ExpandingSphere("try2", 8)

# print("Bake normals.")
# BakeNormalMap(high_res, low_res)

# print("Apply normals and emit (final mat).")
# low_res.apply_normal_tex()

print("Done")