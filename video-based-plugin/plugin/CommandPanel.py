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
            # self.ui.scene_property("jpeg_quality")
        
        # self.ui.use_layout_row()
        # self.ui.scene_property("proteinvr_viewer_sphere_size")
        self.ui.scene_property("proteinvr_min_guide_sphere_spread")
        
        self.ui.ops_button(rel_data_path="proteinvr.create_scene", button_label="Create Scene")
        self.ui.ops_button(rel_data_path="proteinvr.render_scene_remotely", button_label="Render Scene Remotely")        
        
class OBJECT_OT_CreateScene(ButtonParentClass):
    """
    Create the ProteinVR scene.
    """

    bl_idname = "proteinvr.create_scene"
    bl_label = "Create Scene"

    def set_frame(self, frame):
        # self.scene.frame_current = frame
        bpy.context.scene.frame_set(frame)
        bpy.context.scene.update()
        # bpy.ops.object.paths_calculate()

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
        # self.forward_sphere = bpy.data.objects["ProteinVR_ForwardSphere"]
        # self.backwards_sphere = bpy.data.objects["ProteinVR_BackwardsSphere"]
        # self.view_sphere = bpy.data.objects["ProteinVR_ViewerSphere"]

        # Make sure viewer sphere appropriate size
        # self.view_sphere.scale = Vector([self.scene.proteinvr_viewer_sphere_size, self.scene.proteinvr_viewer_sphere_size, self.scene.proteinvr_viewer_sphere_size])

        # Make the view sphere visible
        # self.view_sphere.hide = False

        self.camera = bpy.data.objects["Camera"]
        self.frame_start = self.scene.frame_start
        self.frame_end = self.scene.frame_end

        self.extra_data = {
            "cameraPositionsAndTextures": [],
            "clickableFiles": [],
            # "viewerSphereSize": self.scene.proteinvr_viewer_sphere_size,
            "guideSphereLocations": None
        }

    def _step_2_get_camerea_positions(self):
        for this_frame in range(self.frame_start, self.frame_end + 1):
            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            # self.extra_data["cameraPos"].append([this_frame, round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)])
            self.extra_data["cameraPositionsAndTextures"].append([round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)])

    def _compress_png(self, filename):
        cmd = self.scene.pngquant_path + ' --speed 1 --quality="0-50" ' + filename + ' -o ' + filename + '.tmp.png'  # --strip 
        # print("RUN: " + cmd)
        
        os.system(cmd)
        os.rename(filename + '.tmp.png', filename)

    def _step_3_render_baked_frames(self, debug=False):
        print("This def currently does a lot more than bake frames... separate it out...")
        # Get all the objects that are currently visible, but have animations.
        objs_that_move = []
        animation_data = {}
        for obj in [o for o in bpy.data.objects if not "Camera" in o.name]:
            if obj.hide == False and obj.hide_render == False:
                pos_loc_data = []
                for f in range(self.frame_start, self.frame_end + 1):
                    self.set_frame(f)
                    loc = obj.location
                    rot = obj.rotation_euler
                    # pos_loc_data.append(str(loc.x) + "_" + str(loc.y) + "_" + str(loc.z) + "_" + str(rot.x) + "_" + str(rot.y) + "_" + str(rot.z))
                    pos_loc_data.append((round(loc.x, 2), round(loc.y, 2), round(loc.z, 2), round(rot.x, 2), round(rot.y, 2), round(rot.z, 2)))
                
                keys = ["_".join([str(i) for i in l]) for l in pos_loc_data]

                keys = set(keys)
                num_keyframes = len(keys)
                if num_keyframes > 1:
                    objs_that_move.append(obj)
                    animation_data[obj.name] = pos_loc_data
        
        # Hide the moving objects (not rendered to sphere)
        for obj in objs_that_move:
            obj.hide = True
            obj.hide_render = True
        
        # Get the environment texture and save that.
        # print(self.scene.background_environment_image, "FFF")
        # import pdb; pdb.set_trace()
        src_background_environment_image = bpy.path.abspath(self.scene.background_environment_image)
        if os.path.exists(src_background_environment_image):
            shutil.copyfile(src_background_environment_image, self.proteinvr_output_dir + "environment.png")
        else:
            print("WARNING: Environmental texture file does not exist!")

        # world = bpy.data.worlds['World']
        # world.use_nodes = True
        # environmental_textures = [node for node in world.node_tree.nodes if node.type == "TEX_ENVIRONMENT"]
        # if len(environmental_textures) > 1:
        #     print("WARNING: More than one environmental texture. Using the first one...")
        # environmental_image = environmental_textures[0].image
        # import pdb; pdb.set_trace()
        # # environmental_image.alpha_mode = 'STRAIGHT'
        # environmental_image.filepath_raw = self.proteinvr_output_dir + "environment.png"
        # # environmental_image.file_format = 'PNG'
        # environmental_image.save()
        # # environmental_image.save_render(self.proteinvr_output_dir + "environment.png")
        # import pdb; pdb.set_trace();

        # Setup cycles samples
        self.scene.render.resolution_percentage = 100.0
        self.scene.cycles.samples = self.scene.proteinvr_num_cycles
        self.scene.cycles.preview_samples = self.scene.proteinvr_num_cycles
        self.scene.cycles.film_transparent = True  # Because you're saving the background separately.

        frame_file_names = []

        self.camera.rotation_mode = 'XYZ'

        for this_frame in range(self.frame_start, self.frame_end + 1):
            print("Frame", this_frame)

            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.camera.rotation_euler.x = 1.5707963267948966
            self.camera.rotation_euler.y = 0.0
            self.camera.rotation_euler.z = 0.0
            self.camera.keyframe_insert(data_path="rotation_euler", frame=this_frame) #20.0, index=2)

            if not debug:
                # Create the image
                self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png"
                # self.scene.render.image_settings.file_format = 'JPEG'
                self.scene.render.image_settings.file_format = 'PNG'
                self.scene.render.image_settings.color_mode = "RGBA"
                self.scene.render.image_settings.compression = 100
                self.scene.render.image_settings.quality = self.scene.jpeg_quality
                self.scene.render.resolution_x = self.scene.proteinvr_bake_texture_size
                self.scene.render.resolution_y = self.scene.proteinvr_bake_texture_size
                self.scene.render.resolution_percentage = 100
                bpy.ops.render.render(write_still=True)
                self._compress_png(self.scene.render.filepath)

                # size = self.scene.proteinvr_bake_texture_size
                # image = bpy.data.images.new("ProteinVRImage" + str(this_frame), size, size)
               
                frame_file_names.append("proteinvr_baked_texture" + str(this_frame) + ".png")

                # Now render at 1/4 size. But note that I'm rerendering here,
                # not resizing. So can be computationally intensive. I chose
                # this because I believe it gives better results, but I'm not
                # sure.
                
                self.scene.render.resolution_percentage = int(100.0 * self.scene.proteinvr_mobile_bake_texture_size / self.scene.proteinvr_bake_texture_size)
                self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png.small.png"
                bpy.ops.render.render(write_still=True)
                self._compress_png(self.scene.render.filepath)
                
        # Save list of all rendered frames
        json.dump(frame_file_names, open(self.frame_dir + "filenames.json",'w'))

        # Reshow moving objects
        for obj in objs_that_move:
            obj.hide = False
            obj.hide_render = False

        # Save the animations
        # json.dump(animation_data, open(self.proteinvr_output_dir + "animations.json", 'w'))
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
        
        self.scene.cycles.film_transparent = False  # Time to restore the environment lighting

    # def _step_4_compile_baked_images_into_video(self, debug=False):
    #     # I've decided this is no good. I don't think I can reliably pull data
    #     # from the video on mobile. So we'll do it based on images instead.
    #     return

    #     if not debug:
    #         # Having rendered all the images, load them into the video sequencer.
    #         # see https://blender.stackexchange.com/questions/8107/how-to-automate-blender-video-sequencer
    #         files = [os.path.basename(f) for f in glob.glob(self.frame_dir + "proteinvr_baked_texture*.jpg")]
    #         def get_key(a): return int(a.replace("proteinvr_baked_texture", "").replace(".jpg", ""))
    #         files.sort(key=get_key)

    #         bpy.context.scene.sequence_editor_create()
    #         seq = bpy.context.scene.sequence_editor.sequences.new_image(
    #                 name="MyStrip",
    #                 filepath=os.path.join(self.frame_dir, files[0]),
    #                 channel=1, frame_start=self.frame_start)
                
    #         # add the rest of the images.
    #         files.pop(0)
    #         for f in files:
    #             seq.elements.append(f)

    #         # Save those images to a mp4 video (comaptible with all browsers)
    #         render = self.scene.render
    #         render.resolution_x = self.scene.proteinvr_bake_texture_size
    #         render.resolution_y = self.scene.proteinvr_bake_texture_size

    #         render.image_settings.file_format = "H264"
    #         render.ffmpeg.format = "MPEG4"
    #         render.filepath = self.proteinvr_output_dir + "proteinvr_baked.mp4"
    #         bpy.ops.render.render(animation=True)

    #         # Remove rendered frames... keep just the video
    #         # for filename in glob.glob(self.proteinvr_output_dir + "proteinvr_baked_texture*.jpg"):
    #         #     os.unlink(filename)
    #     else:
    #         # Debugging, so just copy a pre-compiled video
    #         tmp_video_file = self.plugin_asset_dir + "proteinvr_baked.mp4"
    #         shutil.copyfile(tmp_video_file, self.proteinvr_output_dir + "proteinvr_baked.mp4")


    def _step_5_make_proteinvr_clickable_meshes(self):
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
            # Utils.select_and_active(obj)
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

    def _step_6_calculate_guide_spheres(self):
        # First, get all the camera locations
        camera_positions = []
        for this_frame in range(self.frame_start, self.frame_end + 1):
            self.set_frame(this_frame)
            camera_positions.append(self.camera.location.copy())
        
        # Keep ones that are far enough away from others
        guide_sphere_locations = [camera_positions[0]]

        for camera_position in camera_positions[1:]:
            keep_it = True
            for guide_sphere_location in guide_sphere_locations:
                dist = (camera_position - guide_sphere_location).length
                if (dist < bpy.context.scene.proteinvr_min_guide_sphere_spread):
                    keep_it = False
                    break
            if keep_it:
                guide_sphere_locations.append(camera_position)
        
        self.extra_data["guideSphereLocations"] = []
        for v in guide_sphere_locations:
            self.extra_data["guideSphereLocations"].append([round(v.x, 3), round(v.y, 3), round(v.z, 3)])

    def _step_7_cleanup(self):
        pass
        # Hide some spheres... cleaning up.
        # self.forward_sphere.hide = True
        # self.backwards_sphere.hide = True
        # self.view_sphere.hide = True

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

        # if not os.path.exists(self.proteinvr_output_dir + "proteinvr_baked.mp4"):
        if len(glob.glob(self.proteinvr_output_dir + "frames/*.png")) == 0:
            self._step_3_render_baked_frames(debug)
            # self._step_4_compile_baked_images_into_video(debug)
        self._step_5_make_proteinvr_clickable_meshes()
        self._step_6_calculate_guide_spheres()

        json.dump(
            self.extra_data, 
            open(self.proteinvr_output_dir + "data.json", 'w')
        )

        self._step_7_cleanup()
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
        # print('ssh ' + beefy_computer_for_rendering + ' "mkdir -p ' + remote_dir + '"')

        # Copy the blend file to that directory.
        blend_file = os.path.abspath(bpy.data.filepath)
        self.copy_to_remote(blend_file, remote_dir)
        # print('scp ' + blend_file + ' ' + beefy_computer_for_rendering + ':' + remote_dir)

        # Copy the runit script.
        runitpy_path = os.path.dirname(os.path.abspath(__file__)) + os.sep + "RenderRemote" + os.sep + "runit.py"
        self.copy_to_remote(runitpy_path, remote_dir)
        # print('scp ' + runitpy_path + ' ' + beefy_computer_for_rendering + ':' + remote_dir)

        # Run things remotely now.
        cmds = [
            'cd ' + remote_dir,
            self.remote_blender_location_with_proteinvr_installed + ' ' + os.path.basename(blend_file) + ' --background --python runit.py'
        ]
        self.run_remote("; ".join(cmds))

        # Copy files back from remote machine.
        remote_cmd = "rsync -rv --remove-source-files " + self.beefy_computer_for_rendering + ":" + remote_dir + os.sep + "output" + os.sep + "* " + bpy.context.scene.proteinvr_output_dir + os.sep
        print(remote_cmd)
        print()
        os.system(remote_cmd)

        # Remote remote directory.
        self.run_remote("rm -r " + remote_dir)

        print()
        # print(bpy.path.abspath("//"))

        return {'FINISHED'}

