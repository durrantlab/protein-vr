from .ParentPanel import ParentPanel
from .DurBlend import ButtonParentClass
from .DurBlend import Messages
from mathutils import Vector
from . import Utils
import bpy
import os
import glob
from bpy import context
import numpy
import shutil
import json
import random

obj_names = Utils.ObjNames()

def object_is_proteinvr_clickable(obj):
    return (
        "hide" in dir(obj) and 
        obj.hide == False and 
        "vertices" in dir(obj.data) and 
        not "ProteinVR_tmp_" in obj.name
    )

class CommandPanel(ParentPanel):
    def draw_panel_if_needed(self):
        activeObj = bpy.context.scene.objects.active

        if object_is_proteinvr_clickable(activeObj):
            self.ui.use_box_row(activeObj.name + " Properties")
            self.ui.object_property("proteinvr_clickable")

        # Set up UI
        # self.ui.use_layout_row()
        self.ui.use_box_row("Make Scene")
        # self.ui.label("Make Scene")

        # self.ui.use_box_row("Options")
        self.ui.scene_property("proteinvr_output_dir")
        self.ui.scene_property("proteinvr_use_existing_frames")
        Messages.display_message("FRAMES_EXIST", self)

        if bpy.context.scene.proteinvr_use_existing_frames == False:
            self.ui.scene_property("proteinvr_bake_texture_size")
            self.ui.scene_property("proteinvr_mobile_bake_texture_size")
            self.ui.scene_property("proteinvr_num_cycles")
            self.ui.scene_property("background_environment_image")
            self.ui.scene_property("pngquant_path")
        
        self.ui.ops_button(rel_data_path="proteinvr.create_scene", button_label="Create Scene")
        self.ui.ops_button(rel_data_path="proteinvr.render_scene_remotely", button_label="Render Scene Remotely")        
        
class OBJECT_OT_CreateScene(ButtonParentClass):
    """
    Create the ProteinVR scene.
    """

    bl_idname = "proteinvr.create_scene"
    bl_label = "Create Scene"

    def set_frame(self, frame):
        bpy.context.scene.frame_set(frame)
        bpy.context.scene.update()

    def _step_0_existing_files_ok(self):
        # Save some things to variables
        self.scene = bpy.data.scenes["Scene"]
        self.plugin_dir = os.path.dirname(os.path.realpath(__file__)) + os.sep
        self.plugin_asset_dir = self.plugin_dir + "assets" + os.sep

        # Get proteinvr_output_dir
        self.proteinvr_output_dir = self.scene.proteinvr_output_dir
        if not self.proteinvr_output_dir.endswith(os.sep):
            self.proteinvr_output_dir = self.proteinvr_output_dir + os.sep
            self.scene.proteinvr_output_dir = self.proteinvr_output_dir

        if self.scene.proteinvr_use_existing_frames == False and os.path.exists(self.proteinvr_output_dir + "frames"):
            Messages.send_message(
                "FRAMES_EXIST", 
                "Frames already exist!",
                operator=self
            )
            return False

        if self.scene.proteinvr_use_existing_frames == True and not os.path.exists(self.proteinvr_output_dir + "frames"):
            Messages.send_message(
                "FRAMES_EXIST", 
                "Frames do not exist!",
                operator=self
            )
            return False

        # Make sure self.proteinvr_output_dir exists
        if not os.path.exists(self.proteinvr_output_dir):
            os.mkdir(self.proteinvr_output_dir)
        
        # Make sure frame dir exists...
        self.frame_dir = self.proteinvr_output_dir + "frames" + os.sep
        if not os.path.exists(self.frame_dir):
            #shutil.rmtree(self.frame_dir)
            os.mkdir(self.frame_dir)

        # Copy some files
        shutil.copyfile(self.plugin_asset_dir + os.sep + "babylon.babylon", self.proteinvr_output_dir + "babylon.babylon")
        
        for path in glob.glob(self.plugin_asset_dir + "babylon_html_files" + os.sep + "*"):
            target_path = self.proteinvr_output_dir + os.path.basename(path)
            print(path, target_path)
            if not os.path.exists(target_path):
                if os.path.isdir(path):
                    shutil.copytree(path, target_path)
                else:
                    shutil.copyfile(path, target_path)

        return True

    def _step_1_setup(self):
        # Variables for the spheres
        self.camera = bpy.data.objects["Camera"]
        self.frame_start = self.scene.frame_start
        self.frame_end = self.scene.frame_end

        self.extra_data = {
            "cameraPositions": [],
            "clickableFiles": [],
        }

    def _step_2_get_camerea_positions(self):
        for this_frame in range(self.frame_start, self.frame_end + 1):
            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.extra_data["cameraPositions"].append([round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)])

    def _compress_png(self, filename):
        if os.path.exists(self.scene.pngquant_path):
            cmd = self.scene.pngquant_path + ' --speed 1 --quality="0-50" ' + filename + ' -o ' + filename + '.tmp.png'  # --strip 
            # print("RUN: " + cmd)          
            os.system(cmd)
            os.rename(filename + '.tmp.png', filename)
        else:
            print("WARNING: pngquant path not valid: " + self.scene.pngquant_path)

    def _get_visible_objects_with_animations(self):
        # Get all the objects that are currently visible, but have animations.
        # Note that this also saves the animation data. This isn't necessary
        # for identifying the object, but we have to get it anyway, so why not
        # save it?
        objs_that_move = []
        animation_data = {}
        for obj in [o for o in bpy.data.objects if not "Camera" in o.name]:
            if obj.hide == False and obj.hide_render == False:
                pos_loc_data = []
                for f in range(self.frame_start, self.frame_end + 1):
                    self.set_frame(f)
                    loc = obj.location
                    rot = obj.rotation_euler
                    pos_loc_data.append((round(loc.x, 2), round(loc.y, 2), round(loc.z, 2), round(rot.x, 2), round(rot.y, 2), round(rot.z, 2)))
                
                keys = ["_".join([str(i) for i in l]) for l in pos_loc_data]

                keys = set(keys)
                num_keyframes = len(keys)
                if num_keyframes > 1:
                    objs_that_move.append(obj)
                    animation_data[obj.name] = pos_loc_data
        return objs_that_move, animation_data
        
    def _step_3_render_baked_frames(self, debug=False):
        print("This def currently does a lot more than bake frames... separate it out...")
        # Get all the objects that are currently visible, but have animations.
        objs_that_move, _ = self._get_visible_objects_with_animations()
        
        # Hide the moving objects (not rendered to sphere)
        for obj in objs_that_move:
            obj.hide = True
            obj.hide_render = True
        
        # Setup cycles samples
        self.scene.render.resolution_percentage = 100.0
        self.scene.cycles.samples = self.scene.proteinvr_num_cycles
        self.scene.cycles.preview_samples = self.scene.proteinvr_num_cycles
        self.scene.cycles.film_transparent = True  # Because you're saving the background separately.

        # frame_file_names = []

        self.camera.rotation_mode = 'XYZ'

        for this_frame in range(self.frame_start, self.frame_end + 1):
            print("Frame", this_frame)

            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.camera.rotation_euler.x = 1.5707963267948966
            self.camera.rotation_euler.y = 0.0
            self.camera.rotation_euler.z = 0.0
            self.camera.keyframe_insert(data_path="rotation_euler", frame=this_frame)

            if not debug:
                # Create the image
                self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png"
                self.scene.render.image_settings.file_format = 'PNG'
                self.scene.render.image_settings.color_mode = "RGBA"
                self.scene.render.image_settings.compression = 100
                self.scene.render.image_settings.quality = self.scene.jpeg_quality
                self.scene.render.resolution_x = self.scene.proteinvr_bake_texture_size
                self.scene.render.resolution_y = self.scene.proteinvr_bake_texture_size
                self.scene.render.resolution_percentage = 100
                bpy.ops.render.render(write_still=True)
                self._compress_png(self.scene.render.filepath)

                # frame_file_names.append("proteinvr_baked_texture" + str(this_frame) + ".png")

                # Now render at 1/4 size. But note that I'm rerendering here,
                # not resizing. So can be computationally intensive. I chose
                # this because I believe it gives better results, but I'm not
                # sure.
                if self.scene.proteinvr_mobile_bake_texture_size != 0:
                    self.scene.render.resolution_percentage = int(100.0 * self.scene.proteinvr_mobile_bake_texture_size / self.scene.proteinvr_bake_texture_size)
                    self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png.small.png"
                    bpy.ops.render.render(write_still=True)
                    self._compress_png(self.scene.render.filepath)
                else:
                    print("WARNING: Skipping the mobile textures...")
                
        # Reshow moving objects
        for obj in objs_that_move:
            obj.hide = False
            obj.hide_render = False

        self.scene.cycles.film_transparent = False  # Time to restore the environment lighting

    def _step_4_save_environmental_image(self):
        # Get the environment texture and save that.
        src_background_environment_image = bpy.path.abspath(self.scene.background_environment_image)
        if os.path.exists(src_background_environment_image):
            shutil.copyfile(src_background_environment_image, self.proteinvr_output_dir + "environment.png")
        else:
            print("WARNING: Environmental texture file does not exist!")

    def _step_5_save_animation_data(self):
        # Get all the objects that are currently visible, but have animations.
        objs_that_move, animation_data = self._get_visible_objects_with_animations()

        # Save the animations
        self.extra_data["animations"] = animation_data
        for obj_name in animation_data.keys():
            obj = bpy.data.objects[obj_name]

            # Save the obj file.
            filepath = self.proteinvr_output_dir + obj.name + "_animated.obj"
            bpy.ops.export_scene.obj(
                filepath=filepath,
                check_existing=False,
                use_selection=True,
                use_mesh_modifiers=True,
                use_normals=True,
                use_materials=False,
                global_scale=1.0,
                axis_up="Y",
                axis_forward="-Z"
            )

            # Search the node tree to find a texture
            texture_images = [n.image for n in bpy.data.objects["Cube"].active_material.node_tree.nodes if n.type == "TEX_IMAGE"]
            if len(texture_images) > 0:
                print("=" * 15)
                print("WARNING! More than one image node found in material for " + obj_name + ". Using " + str(texture_images[0]))
                print("=" * 15)

            # Save that texture
            image = texture_images[0]
            image.alpha_mode = 'STRAIGHT'
            image.filepath_raw = self.proteinvr_output_dir + obj.name + "_animated.png"
            image.file_format = 'PNG'
            image.save()

    def _step_6_save_filenames(self):
        # Save list of all rendered frames
        frame_file_names = [os.path.basename(f) for f in glob.glob(self.frame_dir + "proteinvr_baked_texture*.png") if not ".small.png" in f]
        def key(a): return int(a.replace("proteinvr_baked_texture", "").replace(".png", ""))
        frame_file_names.sort(key=key)

        # Also get the total size of the files.
        reg_file_size = 0
        small_file_size = 0
        for filename in glob.glob(self.frame_dir + "proteinvr_baked_texture*.png"):
            filesize = os.path.getsize(filename)
            if ".small.png" in filename:
                small_file_size = small_file_size + filesize
            else:
                reg_file_size = reg_file_size + filesize
            
        json.dump(frame_file_names, open(self.frame_dir + "filenames.json",'w'))
        json.dump({
            "regular": reg_file_size,
            "small": small_file_size
        }, open(self.frame_dir + "filesizes.json",'w'))

    def _step_7_make_proteinvr_clickable_meshes(self):
        # Now go through visible objects and get encompassing spheres
        for obj in bpy.data.objects:
            if object_is_proteinvr_clickable(obj) and obj.proteinvr_clickable == True:
                # Get the vert coordintes
                vert_coors = [(obj.matrix_world * v.co) for v in obj.data.vertices]
                vert_coors = numpy.array([[v.x, v.y, v.z] for v in vert_coors])
                center = numpy.mean(vert_coors, axis=0)
                radius = numpy.max(numpy.linalg.norm(vert_coors - center, axis=1))

                # Add a sphere
                obj_names.save_object_names()
                bpy.ops.mesh.primitive_ico_sphere_add(
                    size=radius, # Radius
                    subdivisions=2, 
                    view_align=False, 
                    enter_editmode=False, 
                    location=center,
                    rotation=(0.0, 0.0, 0.0)
                )
                new_obj_name = obj_names.object_names_different()[0]
                sphere = bpy.data.objects[new_obj_name]
                # Utils.select_and_active(sphere)

                mod = sphere.modifiers.new(name='Shrinkwrap',type='SHRINKWRAP')
                mod.target = obj
                bpy.context.scene.objects.active = sphere
                bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Shrinkwrap")
                sphere.name = "ProteinVR_tmp_" + obj.name
                bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

        # Export the shrinkwrapped proteinvr_clickable objects
        for obj in [o for o in bpy.data.objects if o.name.startswith("ProteinVR_tmp_")]:
            bpy.ops.object.select_all(action='DESELECT')
            obj.select = True
            bpy.context.scene.objects.active = obj

            if obj.type == 'MESH':
                filepath = self.proteinvr_output_dir + obj.name.replace("ProteinVR_tmp_", "proteinvr_clickable_") + ".obj"
                bpy.ops.export_scene.obj(
                    filepath=filepath,
                    check_existing=False,
                    use_selection=True,
                    use_mesh_modifiers=True,
                    use_normals=True,
                    use_materials=False,
                    global_scale=1.0,
                    axis_up="Y",
                    axis_forward="-Z"
                )
                self.extra_data["clickableFiles"].append(os.path.basename(filepath))
            
            # Remove the proteinvr_clickable mesh now that it's saved
            bpy.ops.object.delete()

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.
        """

        if self._step_0_existing_files_ok() == False:
            return {'FINISHED'}

        debug = False

        self._step_1_setup()
        self._step_2_get_camerea_positions()

        if len(glob.glob(self.proteinvr_output_dir + "frames/*.png")) == 0:
            self._step_3_render_baked_frames(debug)
        self._step_4_save_environmental_image()
        self._step_5_save_animation_data()
        self._step_6_save_filenames()
        self._step_7_make_proteinvr_clickable_meshes()

        json.dump(
            self.extra_data, 
            open(self.proteinvr_output_dir + "data.json", 'w')
        )

        print(self.extra_data)

        return {'FINISHED'}


class OBJECT_OT_RenderRemote(ButtonParentClass):
    """
    Render the scene remotely. For internal Durrantlab use.
    """

    bl_idname = "proteinvr.render_scene_remotely"
    bl_label = "Render Scene Remotely"

    # Hard code a few variables. This is ok, but this will only be used in
    # the Durrant lab.

    beefy_computer_for_rendering = "jdurrant@bob.bio.pitt.edu"
    remote_scratch_directory = "/tmp/"
    remote_blender_location_with_proteinvr_installed = "/home/jdurrant/DataB/spinel/programs/blender-2.78c-linux-glibc219-x86_64/blender"

    def run_remote(self, cmd):
        remote_cmd = 'ssh ' + self.beefy_computer_for_rendering + ' "' + cmd + '"'
        print()
        print(remote_cmd)
        os.system(remote_cmd)
    
    def copy_to_remote(self, file, remote_dir):
        remote_dir = remote_dir if remote_dir.endswith(os.sep) else remote_dir + os.sep
        remote_cmd = 'scp ' + file + ' ' + self.beefy_computer_for_rendering + ':' + remote_dir
        print()
        print(remote_cmd)
        os.system(remote_cmd)

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.
        """

        # I'm going to assume password-less authentication is enabled, because
        # I'm not putting my password in code!

        # Make sure internal data will be saved with blend file
        if bpy.data.use_autopack == False:
            bpy.ops.file.autopack_toggle()

        # Save this blend file.
        bpy.ops.wm.save_mainfile()

        # Get a random id
        dir_id = str(random.random()).replace(".", "")
        remote_dir = self.remote_scratch_directory + os.sep + dir_id + os.sep

        # Make a remote directory.
        self.run_remote('mkdir -p ' + remote_dir)

        # Copy the blend file to that directory.
        blend_file = os.path.abspath(bpy.data.filepath)
        self.copy_to_remote(blend_file, remote_dir)

        # Copy the runit script.
        runitpy_path = os.path.dirname(os.path.abspath(__file__)) + os.sep + "RenderRemote" + os.sep + "runit.py"
        self.copy_to_remote(runitpy_path, remote_dir)

        # Run things remotely now.
        cmds = [
            'cd ' + remote_dir,
            self.remote_blender_location_with_proteinvr_installed + ' ' + os.path.basename(blend_file) + ' --background --python runit.py'
        ]
        self.run_remote("; ".join(cmds))

        # Copy files back from remote machine. --remove-source-files 
        remote_cmd = "rsync -rv " + self.beefy_computer_for_rendering + ":" + remote_dir + os.sep + "output" + os.sep + "* " + bpy.context.scene.proteinvr_output_dir + os.sep
        print(remote_cmd)
        print()
        os.system(remote_cmd)

        # Remote remote directory.
        self.run_remote("rm -r " + remote_dir)

        print()

        return {'FINISHED'}

