from .ParentPanel import ParentPanel
from .DurBlend import ButtonParentClass
from mathutils import Vector
from . import Utils
import bpy
import os
import glob
from bpy import context

class CommandPanel(ParentPanel):
    def draw_panel_if_needed(self):
        # Set up UI
        self.ui.use_layout_row()
        self.ui.label("Make Scene")

        self.ui.use_box_row("Options")
        self.ui.scene_property("rough_draft_render")
        self.ui.scene_property("scratch_dir")

        self.ui.use_layout_row()
        self.ui.ops_button(rel_data_path="add.create_scene", button_label="Create ProteinVR Scene")
        
class OBJECT_OT_CreateScene(ButtonParentClass):
    """
    Button for creating the ProteinVR scene.
    """

    bl_idname = "add.create_scene"
    bl_label = "Create ProteinVR Scene"

    def set_frame(self, frame):
        # bpy.data.scenes["Scene"].frame_current = frame
        bpy.context.scene.frame_set(frame)
        bpy.context.scene.update()
        # bpy.ops.object.paths_calculate()

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.
        """

        # Variables for the spheres
        forward_sphere = bpy.data.objects["ProteinVR_ForwardSphere"]
        backwards_sphere = bpy.data.objects["ProteinVR_BackwardsSphere"]
        view_sphere = bpy.data.objects["ProteinVR_ViewerSphere"]

        # Make the view sphere visible
        view_sphere.hide = False

        camera = bpy.data.objects["Camera"]
        frame_start = bpy.data.scenes["Scene"].frame_start
        frame_end = bpy.data.scenes["Scene"].frame_end

        for this_frame in range(frame_start, frame_end + 1):
            print("Frame", this_frame)
            self.set_frame(this_frame)
            this_camera_pos = camera.location.copy()
            view_sphere.location = this_camera_pos
            # camera_positions.append([camera.location.x, camera.location.y, camera.location.z])

            # position forward sphere
            forward_sphere.hide = True
            for future_frame in range(this_frame + 1, frame_end + 1):
                self.set_frame(future_frame)
                future_camera_pos = camera.location.copy()
                if future_camera_pos != this_camera_pos:
                    # print(this_frame, this_camera_pos, future_camera_pos)
                    direc = future_camera_pos - this_camera_pos
                    direc.normalize()
                    direc = 5 * direc
                    forward_sphere.location = this_camera_pos + direc
                    forward_sphere.hide = False
                    break
            
            # position the backwards sphere
            backwards_sphere.hide = True
            for past_frame in range(this_frame - 1, frame_start, -1):
                self.set_frame(past_frame)
                past_camera_pos = camera.location.copy()
                if past_camera_pos != this_camera_pos:
                    direc = past_camera_pos - this_camera_pos
                    direc.normalize()
                    direc = 5 * direc
                    backwards_sphere.location = this_camera_pos + direc
                    backwards_sphere.hide = False
                    break
            
            # Bake the view-sphere image
            Utils.select_and_active(view_sphere)

            # See https://blender.stackexchange.com/questions/10860/baking-textures-on-headless-machine-batch-baking
            bpy.ops.object.bake(type='COMBINED')
            image = bpy.data.images["baked_image"]
            image.file_format = 'PNG'
            image.filepath_raw = bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked_texture" + str(this_frame) + ".png"
            image.save()

        # Having rendered all the images, load them into the video sequencer.
        # see https://blender.stackexchange.com/questions/8107/how-to-automate-blender-video-sequencer
        scene = context.scene

        path = bpy.data.scenes["Scene"].scratch_dir + os.sep
        files = [os.path.basename(f) for f in glob.glob(bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked_texture*.png")]

        def get_key(a):
            return int(a.replace("proteinvr_baked_texture", "").replace(".png", ""))

        files.sort(key=get_key)

        scene.sequence_editor_create()
        seq = scene.sequence_editor.sequences.new_image(
                name="MyStrip",
                filepath=os.path.join(path, files[0]),
                channel=1, frame_start=frame_start)
            
        # add the rest of the images.
        files.pop(0)
        for f in files:
            seq.elements.append(f)
        
        # seq
        # import pdb; pdb.set_trace()

        # Save those images to a mp4 video (comaptible with all browsers)
        bpy.data.scenes["Scene"].render.resolution_x = 2048
        bpy.data.scenes["Scene"].render.resolution_y = 2048
        bpy.data.scenes["Scene"].render.resolution_percentage = 100.0
        bpy.data.scenes["Scene"].render.image_settings.file_format = "H264"
        bpy.data.scenes["Scene"].render.ffmpeg.format = "MPEG4"
        bpy.data.scenes["Scene"].render.filepath = bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked.mp4"
        bpy.ops.render.render(animation=True)

        # Remove rendered frames
        # for filename in glob.glob(bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked_texture*.png"):
        #     os.unlink(filename)
            
        return {'FINISHED'}

