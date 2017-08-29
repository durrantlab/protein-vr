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

obj_names = Utils.ObjNames()

def object_is_clickable(obj):
    return (
        "hide" in dir(obj) and 
        obj.hide == False and 
        "vertices" in dir(obj.data) and 
        not "ProteinVR_tmp_" in obj.name
    )

class CommandPanel(ParentPanel):
    def draw_panel_if_needed(self):
        activeObj = bpy.context.scene.objects.active

        if object_is_clickable(activeObj):
            self.ui.use_box_row(activeObj.name + " Properties")
            self.ui.object_property("clickable")

        # Set up UI
        # self.ui.use_layout_row()
        self.ui.use_box_row("Make Scene")
        # self.ui.label("Make Scene")

        # self.ui.use_box_row("Options")
        self.ui.scene_property("output_dir")
        self.ui.scene_property("use_existing_video")
        Messages.display_message("VIDEO_EXISTS", self)

        if bpy.context.scene.use_existing_video == False:
            self.ui.scene_property("bake_texture_size")
            self.ui.scene_property("num_cycles")
        
        # self.ui.use_layout_row()
        self.ui.scene_property("viewer_sphere_size")
        self.ui.ops_button(rel_data_path="proteinvr.create_scene", button_label="Create Scene")
        
class OBJECT_OT_CreateScene(ButtonParentClass):
    """
    Button for creating the ProteinVR scene.
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

        # Get output_dir
        self.output_dir = self.scene.output_dir
        if not self.output_dir.endswith(os.sep):
            self.output_dir = self.output_dir + os.sep
            self.scene.output_dir = self.output_dir

        if self.scene.use_existing_video == False and os.path.exists(self.output_dir + "proteinvr_baked.mp4"):
            Messages.send_message(
                "VIDEO_EXISTS", 
                "Video already exists!",
                operator=self
            )
            return False

        if self.scene.use_existing_video == True and not os.path.exists(self.output_dir + "proteinvr_baked.mp4"):
            Messages.send_message(
                "VIDEO_EXISTS", 
                "Video does not exist!",
                operator=self
            )
            return False

        # Make sure self.output_dir exists
        if not os.path.exists(self.output_dir):
            os.mkdir(self.output_dir)
        
        # Make sure scratch exists... delete if already existing
        self.scratch_dir = self.output_dir + ".tmp" + os.sep
        if os.path.exists(self.scratch_dir):
            shutil.rmtree(self.scratch_dir)
        os.mkdir(self.scratch_dir)

        # Copy some files
        shutil.copyfile(self.plugin_asset_dir + os.sep + "babylon.babylon", self.output_dir + "babylon.babylon")
        
        for path in glob.glob(self.plugin_asset_dir + "babylon_html_files" + os.sep + "*"):
            target_path = self.output_dir + os.path.basename(path)
            print(path, target_path)
            if not os.path.exists(target_path):
                if os.path.isdir(path):
                    shutil.copytree(path, target_path)
                else:
                    shutil.copyfile(path, target_path)

        return True

    def _step_1_setup(self):
        # Variables for the spheres
        self.forward_sphere = bpy.data.objects["ProteinVR_ForwardSphere"]
        self.backwards_sphere = bpy.data.objects["ProteinVR_BackwardsSphere"]
        self.view_sphere = bpy.data.objects["ProteinVR_ViewerSphere"]

        # Make sure viewer sphere appropriate size
        self.view_sphere.scale = Vector([self.scene.viewer_sphere_size, self.scene.viewer_sphere_size, self.scene.viewer_sphere_size])

        # Make the view sphere visible
        self.view_sphere.hide = False

        self.camera = bpy.data.objects["Camera"]
        self.frame_start = self.scene.frame_start
        self.frame_end = self.scene.frame_end

        self.extra_data = {
            "cameraPos": [],
            "clickableFiles": [],
            "viewer_sphere_size": self.scene.viewer_sphere_size
        }

    def _step_2_get_camerea_positions(self):
        for this_frame in range(self.frame_start, self.frame_end + 1):
            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.extra_data["cameraPos"].append([this_frame, round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)])

    def _step_3_render_baked_frames(self, debug=False):
        # Setup cycles samples
        self.scene.render.resolution_percentage = 100.0
        self.scene.cycles.samples = self.scene.num_cycles
        self.scene.cycles.preview_samples = self.scene.num_cycles
        
        for this_frame in range(self.frame_start, self.frame_end + 1):
            print("Frame", this_frame)

            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            # self.extra_data["cameraPos"][this_frame] = [round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)]

            if not debug:
                self.view_sphere.location = this_camera_pos

                # position forward sphere
                self.forward_sphere.hide = True
                for future_frame in range(this_frame + 1, self.frame_end + 1):
                    self.set_frame(future_frame)
                    future_camera_pos = self.camera.location.copy()
                    if future_camera_pos != this_camera_pos:
                        # print(this_frame, this_camera_pos, future_camera_pos)
                        direc = future_camera_pos - this_camera_pos
                        direc.normalize()
                        direc = 5 * direc
                        self.forward_sphere.location = this_camera_pos + direc
                        self.forward_sphere.hide = False
                        break
                
                # position the backwards sphere
                self.backwards_sphere.hide = True
                for past_frame in range(this_frame - 1, self.frame_start, -1):
                    self.set_frame(past_frame)
                    past_camera_pos = self.camera.location.copy()
                    if past_camera_pos != this_camera_pos:
                        direc = past_camera_pos - this_camera_pos
                        direc.normalize()
                        direc = 5 * direc
                        self.backwards_sphere.location = this_camera_pos + direc
                        self.backwards_sphere.hide = False
                        break
                
                # Bake the view-sphere image
                # See https://blender.stackexchange.com/questions/10860/baking-textures-on-headless-machine-batch-baking
                # Utils.select_and_active(self.view_sphere)
                bpy.ops.object.select_all(action='DESELECT')
                self.view_sphere.select = True

                bpy.context.scene.objects.active = self.view_sphere
                
                # Create the image
                size = self.scene.bake_texture_size
                image = bpy.data.images.new("ProteinVRImage" + str(this_frame), size, size)
                image.file_format = 'PNG'
                image.filepath_raw = self.scratch_dir + "proteinvr_baked_texture" + str(this_frame) + ".png"

                # Select which texture you want to bake to. Find the node of
                # the texture, select it. Set its image.
                material = bpy.data.objects["ProteinVR_ViewerSphere"].material_slots[0].material
                node_tree = material.node_tree
                for node in node_tree.nodes:
                    node.select = False
                for tex_node in node_tree.nodes:
                    if tex_node.type == "TEX_IMAGE":
                        # Select/active node
                        tex_node.select = True
                        node_tree.nodes.active = tex_node

                        # Set image
                        tex_node.image = image

                        # Bake to that image
                        bpy.ops.object.bake(type='COMBINED')

                        # Save the image
                        # image = bpy.data.images[tex_node_name]
                        image.save()

                        break

        # Delete the image.
        # See https://blender.stackexchange.com/questions/32301/how-can-i-unlink-all-images-from-a-project
        for img in bpy.data.images:
            if img.name.startswith("ProteinVRImage"):
                img.user_clear()
        for img in bpy.data.images:
            if not img.users:
                if img.name.startswith("ProteinVRImage"):
                    bpy.data.images.remove(img)

    def _step_4_compile_baked_images_into_video(self, debug=False):
        if not debug:
            # Having rendered all the images, load them into the video sequencer.
            # see https://blender.stackexchange.com/questions/8107/how-to-automate-blender-video-sequencer
            files = [os.path.basename(f) for f in glob.glob(self.scratch_dir + "proteinvr_baked_texture*.png")]
            def get_key(a): return int(a.replace("proteinvr_baked_texture", "").replace(".png", ""))
            files.sort(key=get_key)

            bpy.context.scene.sequence_editor_create()
            seq = bpy.context.scene.sequence_editor.sequences.new_image(
                    name="MyStrip",
                    filepath=os.path.join(self.scratch_dir, files[0]),
                    channel=1, frame_start=self.frame_start)
                
            # add the rest of the images.
            files.pop(0)
            for f in files:
                seq.elements.append(f)

            # Save those images to a mp4 video (comaptible with all browsers)
            render = self.scene.render
            render.resolution_x = self.scene.bake_texture_size
            render.resolution_y = self.scene.bake_texture_size

            render.image_settings.file_format = "H264"
            render.ffmpeg.format = "MPEG4"
            render.filepath = self.output_dir + "proteinvr_baked.mp4"
            bpy.ops.render.render(animation=True)

            # Remove rendered frames... keep just the video
            # for filename in glob.glob(self.output_dir + "proteinvr_baked_texture*.png"):
            #     os.unlink(filename)
        else:
            # Debugging, so just copy a pre-compiled video
            tmp_video_file = self.plugin_asset_dir + "proteinvr_baked.mp4"
            shutil.copyfile(tmp_video_file, self.output_dir + "proteinvr_baked.mp4")


    def _step_5_make_clickable_meshes(self):
        # Now go through visible objects and get encompassing spheres
        for obj in bpy.data.objects:
            if object_is_clickable(obj) and obj.clickable == True:
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

        # Export the shrinkwrapped clickable objects
        for obj in [o for o in bpy.data.objects if o.name.startswith("ProteinVR_tmp_")]:
            # Utils.select_and_active(obj)
            bpy.ops.object.select_all(action='DESELECT')
            obj.select = True
            bpy.context.scene.objects.active = obj

            if obj.type == 'MESH':
                filepath = self.output_dir + obj.name.replace("ProteinVR_tmp_", "clickable_") + ".obj"
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
            
            # Remove the clickable mesh now that it's saved
            bpy.ops.object.delete()

    def _step_6_cleanup(self):
        # Hide some spheres... cleaning up.
        self.forward_sphere.hide = True
        self.backwards_sphere.hide = True
        self.view_sphere.hide = True

        


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

        if not os.path.exists(self.output_dir + "proteinvr_baked.mp4"):
            self._step_3_render_baked_frames(debug)
            self._step_4_compile_baked_images_into_video(debug)
        self._step_5_make_clickable_meshes()

        json.dump(
            self.extra_data, 
            open(self.output_dir + "data.json", 'w')
        )

        self._step_6_cleanup()
        print(self.extra_data)

        return {'FINISHED'}
