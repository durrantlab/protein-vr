import bpy
from math import sqrt, pi

# Set a unique_id for this run
uniq_id = "tmp_sphere_mirror154"
inital_sphere_size = 0.1
max_allowed_num_triangles_in_environ_mesh = 2000
bake_img_size = 2048, 2048

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

def first_make_environ_mesh(uniq_id, uv_sphere_subdivisions=6):
    # Get the objects that are visible and have mesh data
    objects_with_mesh_data = [o for o in bpy.data.objects if o.type == "MESH" and o.hide == False]

    # Get a list of all object names
    start_names = set([o.name for o in bpy.data.objects])

    # First add a sphere to project onto, at the origin
    sphere_center_world = bpy.context.scene.cursor_location
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=uv_sphere_subdivisions, size=inital_sphere_size, calc_uvs=True, 
        location=sphere_center_world
    )

    # Get the sphere just added as a variable
    new_sphere_name = list(set([m.name for m in bpy.data.objects]) - start_names)[0]
    new_sphere = bpy.data.objects[new_sphere_name]
    new_sphere.name = uniq_id + "_sphere"

    # The new sphere must be smooth
    bpy.ops.object.shade_smooth()

    return objects_with_mesh_data, new_sphere, sphere_center_world

def _setup_material(uniq_id):
    # Now make the material of the sphere perfectly glossy (a mirror). See
    # https://blender.stackexchange.com/questions/23433/how-to-assign-a-new-material-to-an-object-in-the-scene-from-python
    # Also include a texture node to bake to.
    # mat = bpy.data.materials.get(uniq_id)  # Get material
    # if mat is None:
    # New material
    mat = bpy.data.materials.new(name=uniq_id)  # create material, because not previously created.
    mat.use_nodes = True

    return mat

def _finalize_material(obj, mat):
    # Assign the material to the new sphere object.
    if obj.data.materials:
        obj.data.materials[0] = mat  # assign to 1st material slot
    else:
        obj.data.materials.append(mat)  # no slots

def second_setup_combined_bake_material(uniq_id):
    global bake_img_size

    mat = _setup_material(uniq_id)

    # Create a texture where we can bake the sphere's surface
    texture = bpy.data.images.new(uniq_id + "_img", width=bake_img_size[0], height=bake_img_size[1], alpha = True)

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
    bake_texture_node.image = texture

    _finalize_material(new_sphere, mat)
    
    return texture

def third_bake_environ_texture(new_sphere):
    # Only the new sphere is selected and active (for baking).
    bpy.ops.object.select_all(action = 'DESELECT')
    new_sphere.select = True
    bpy.context.scene.objects.active = new_sphere

    # Bake the image
    bpy.ops.object.bake(type='COMBINED', use_selected_to_active=False)

# def forth_add_shadeless_material(uniq_id, new_sphere, texture):
#     mat = bpy.data.materials.new(name=uniq_id + "_shadeless")  # create material, because not previously created.
#     mat.use_nodes = True

#     # Shadeless node shown here:
#     # https://nixart.files.wordpress.com/2012/04/shadelessnodesetup.png
#     # https://nixart.wordpress.com/2012/04/10/blender-cycles-shadeless-material-node-setup/

#     mix_shader_node = mat.node_tree.nodes.new(type="ShaderNodeMixShader")
#     transparent_shader_node = mat.node_tree.nodes.new(type="ShaderNodeBsdfTransparent")
#     emission_shader_node = mat.node_tree.nodes.new(type="ShaderNodeEmission")
#     light_path_node = mat.node_tree.nodes.new(type="ShaderNodeLightPath")
#     tex_coord_node = mat.node_tree.nodes.new(type="ShaderNodeTexCoord")

#     image_texture_node = mat.node_tree.nodes.new(type="ShaderNodeTexImage")
#     image_texture_node.image = texture

#     # Now connect these nodes
#     mat.node_tree.links.new(
#         mat.node_tree.nodes["Material Output"].inputs["Surface"],
#         mix_shader_node.outputs["Shader"]
#     )
#     mat.node_tree.links.new(mix_shader_node.inputs["Fac"], light_path_node.outputs["Is Camera Ray"])
#     mat.node_tree.links.new(mix_shader_node.inputs[1], transparent_shader_node.outputs["BSDF"])  # First Shader input
#     mat.node_tree.links.new(mix_shader_node.inputs[2], emission_shader_node.outputs["Emission"])  # Second Shader input
#     mat.node_tree.links.new(emission_shader_node.inputs["Color"], image_texture_node.outputs["Color"])
#     mat.node_tree.links.new(image_texture_node.inputs["Vector"], tex_coord_node.outputs["UV"])

#     # Assign the material to the new sphere object.
#     if new_sphere.data.materials:
#         new_sphere.data.materials[0] = mat  # assign to 1st material slot
#     else:
#         new_sphere.data.materials.append(mat)  # no slots

def forth_add_emit_material(uniq_id, new_sphere, texture):
    mat = bpy.data.materials.new(name=uniq_id + "emit")  # create material, because not previously created.
    mat.use_nodes = True

    # Shadeless node shown here:
    # https://nixart.files.wordpress.com/2012/04/shadelessnodesetup.png
    # https://nixart.wordpress.com/2012/04/10/blender-cycles-shadeless-material-node-setup/

    emission_shader_node = mat.node_tree.nodes.new(type="ShaderNodeEmission")
    tex_coord_node = mat.node_tree.nodes.new(type="ShaderNodeTexCoord")

    image_texture_node = mat.node_tree.nodes.new(type="ShaderNodeTexImage")
    image_texture_node.image = texture

    # Now connect these nodes
    mat.node_tree.links.new(
        mat.node_tree.nodes["Material Output"].inputs["Surface"],
        emission_shader_node.outputs["Emission"]
    )
    mat.node_tree.links.new(emission_shader_node.inputs["Color"], image_texture_node.outputs["Color"])
    mat.node_tree.links.new(image_texture_node.inputs["Vector"], tex_coord_node.outputs["UV"])

    # Assign the material to the new sphere object.
    if new_sphere.data.materials:
        new_sphere.data.materials[0] = mat  # assign to 1st material slot
    else:
        new_sphere.data.materials.append(mat)  # no slots

def fifth_project_sphere_to_environment(objects_with_mesh_data, new_sphere, sphere_center_world):
    # Loop through each vertex of that sphere, project out to surrounding shapes.
    # Keep track of max distance to any projected point.
    max_dist_to_any_projected_pt = 0
    idx_of_pts_with_no_hit = []
    for i, vert_new_sphere in enumerate(new_sphere.data.vertices):
        vert_coor_world = to_world_coor(new_sphere, vert_new_sphere.co)

        # Cast a ray and find the hit point. Must do from all visible objects
        hit_pts_to_consider = []
        for o in objects_with_mesh_data:
            vert_coor_obj = to_obj_coor(o, vert_coor_world)
            sphere_center_obj = to_obj_coor(o, sphere_center_world)
            direc = vert_coor_obj - sphere_center_obj
            hit_data = o.ray_cast(sphere_center_obj, direc)
            
            if hit_data[0]:
                # It hit something. Record that.
                hit_pt_world = to_world_coor(o, hit_data[1]) - sphere_center_world
                hit_pts_to_consider.append(hit_pt_world)

                # Also update max_dist_to_any_projected_pt if this is the furthest
                # point out so far.
                this_dist = dist(hit_pt_world, sphere_center_world)
                if this_dist > max_dist_to_any_projected_pt:
                    max_dist_to_any_projected_pt = this_dist
        
        if len(hit_pts_to_consider) == 0:
            # It never hit anything. Just record this point for future
            # processing.
            idx_of_pts_with_no_hit.append(i)
        elif len(hit_pts_to_consider) == 1:
            # If it's just one hit point, set the vertex to that point.
            vert_new_sphere.co = hit_pts_to_consider[0]
        elif len(hit_pts_to_consider) > 1:
            # More than one point? Get the closest one.
            dists = [dist(pt, sphere_center_world) for pt in hit_pts_to_consider]
            data = list(zip(dists, hit_pts_to_consider))
            data.sort()
            vert_new_sphere.co = data[0][1]

    # Now you need to go through and project the ones that pointed out into the
    # open air. Set those at the max distance of any found hit point.
    for i in idx_of_pts_with_no_hit:
        pt_coor_obj = new_sphere.data.vertices[i].co
        pt_coor_obj = max_dist_to_any_projected_pt * pt_coor_obj / inital_sphere_size
        new_sphere.data.vertices[i].co = pt_coor_obj
    
    # Update normals too
    switch_mode("EDIT")
    bpy.ops.mesh.normals_make_consistent()
    bpy.ops.mesh.flip_normals()
    switch_mode("OBJECT")

def sixth_copy_and_simplify_projected_sphere(new_sphere):
    switch_mode("OBJECT")

    # Make a copy of the sphere to make low-def.
    low_res_new_sphere = new_sphere.copy()
    low_res_new_sphere.data = new_sphere.data.copy()
    bpy.context.scene.objects.link(low_res_new_sphere)
    bpy.context.scene.objects.active = low_res_new_sphere
    bpy.ops.object.select_all(action = 'DESELECT')
    low_res_new_sphere.select = True

    # Simplify the geometry of the environmental projection sphere
    # Decimate by dissolving coplanar triangles. Doesn't change shape much.
    # mod = low_res_new_sphere.modifiers.new("Decimate", type="DECIMATE")
    # mod.decimate_type = "DISSOLVE"
    # mod.angle_limit = 1 * pi / 180
    # mod.delimit = {"UV"}
    # bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Decimate")

    # Now decimate further, to get to target number of verticies (1000). This is
    # more aggressive. Can change the shape some.
    mod = low_res_new_sphere.modifiers.new("Decimate2", type="DECIMATE")
    mod.decimate_type = "COLLAPSE"
    for ratio in [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 
                0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05]:
        mod.ratio = ratio
        bpy.context.scene.update() # update in order to read
        if mod.face_count < max_allowed_num_triangles_in_environ_mesh:
            break
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Decimate2")

    # Decimate by dissolving coplanar triangles A SECOND TIME. Doesn't change
    # shape much.
    # mod = low_res_new_sphere.modifiers.new("Decimate", type="DECIMATE")
    # mod.decimate_type = "DISSOLVE"
    # mod.angle_limit = 1 * pi / 180
    # bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Decimate")

    # Recalculate UVs, to prepare for normal baking.
    switch_mode("EDIT")
    # bpy.ops.uv.sphere_project()
    bpy.ops.mesh.select_all(action="SELECT")
    # bpy.ops.uv.smart_project(island_margin=0.3)
    bpy.ops.uv.lightmap_pack()
    bpy.ops.uv.select_all(action='SELECT')
    # bpy.ops.uv.pack_islands()

    # Update normals too
    bpy.ops.mesh.normals_make_consistent()
    bpy.ops.mesh.flip_normals()

    return low_res_new_sphere

def seventh_setup_normal_bake_material(uniq_id, obj):
    global bake_img_size

    # Make new texture for normals, and change it on the node
    switch_mode("OBJECT")

    # bpy.ops.object.material_slot_remove()

    mat = _setup_material(uniq_id)

    # Create a texture where we can bake the sphere's surface
    texture = bpy.data.images.new(uniq_id + "_img", width=bake_img_size[0], height=bake_img_size[1], alpha = True)

    # For a list of nodes, see
    # https://docs.blender.org/api/blender_python_api_2_77_0/bpy.types.html.

    # Make a texture node, set it to the new bake texture.
    bake_texture_node = mat.node_tree.nodes.new(type="ShaderNodeTexImage")
    bake_texture_node.image = texture

    _finalize_material(obj, mat)
    
    return texture

switch_mode("OBJECT")

new_spheres = []
for i, payload in enumerate([(3, uniq_id), (8, uniq_id + "_high_res")]):
    uv_sphere_subdivisions, uid = payload
    objects_with_mesh_data, new_sphere, sphere_center_world = first_make_environ_mesh(uid, uv_sphere_subdivisions)
    if i == 0:
        texture = second_setup_combined_bake_material(uid)
        third_bake_environ_texture(new_sphere)
        # forth_add_shadeless_material(uid, new_sphere, texture)
        forth_add_emit_material(uid, new_sphere, texture)
    fifth_project_sphere_to_environment(objects_with_mesh_data, new_sphere, sphere_center_world)

    # Keep track of the new spheres.
    new_spheres.append(new_sphere)


# Unpack new_spheres
low_res_new_sphere, new_sphere = new_spheres

# low_res_new_sphere = sixth_copy_and_simplify_projected_sphere(new_sphere)
nrml_texture = seventh_setup_normal_bake_material(uid + "_nrml", low_res_new_sphere)

# Bake normal from high res to low res.
bpy.ops.object.select_all(action = 'DESELECT')

Do new sphere and low_res need to be reverse somehow? Not sure...

new_sphere.select = True
bpy.context.scene.objects.active = low_res_new_sphere
bpy.ops.object.bake(type='NORMAL', use_selected_to_active=True)

# Set up material with color and normal.
Do stuff here. But no normal on emission? Is it really necessary if you bake to the high-def? That's what I recommend.

### OLD STUFF ###

# color_texture = seventh_setup_normal_bake_material(uniq_id + "_color", low_res_new_sphere)

# Bake colors from high res to low res.
# bpy.ops.object.select_all(action = 'DESELECT')
# new_sphere.select = True
# bpy.context.scene.objects.active = low_res_new_sphere
# bpy.ops.object.bake(type='EMIT', use_selected_to_active=True)

# What if you just projected the colors onto the low res sphere from the beginning? But then used hirer res only to bake normals? So no transfer of colors, just normals.

# Perhaps these no need to ever UV unwrap. Or at least not to use decimation, which seems to cause more problems.