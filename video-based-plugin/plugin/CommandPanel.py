from .ParentPanel import ParentPanel
from .DurBlend import ButtonParentClass
from mathutils import Vector
from . import Utils
import bpy
import os
import glob
from bpy import context
import numpy

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

        extra_data = {
            "cameraPos": {}
        }

        baked_image_size = [0, 0]
        for this_frame in range(frame_start, frame_end + 1):
            print("Frame", this_frame)
            self.set_frame(this_frame)
            this_camera_pos = camera.location.copy()
            extra_data["cameraPos"][this_frame] = [round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)]
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
            # bpy.ops.object.bake(type='COMBINED')
            image = bpy.data.images["baked_image"]
            baked_image_size = image.size
            # image.file_format = 'PNG'
            # image.filepath_raw = bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked_texture" + str(this_frame) + ".png"
            # image.save()

        # Having rendered all the images, load them into the video sequencer.
        # see https://blender.stackexchange.com/questions/8107/how-to-automate-blender-video-sequencer
        path = bpy.data.scenes["Scene"].scratch_dir + os.sep
        files = [os.path.basename(f) for f in glob.glob(bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked_texture*.png")]
        def get_key(a): return int(a.replace("proteinvr_baked_texture", "").replace(".png", ""))
        files.sort(key=get_key)

        scene = context.scene
        scene.sequence_editor_create()
        seq = scene.sequence_editor.sequences.new_image(
                name="MyStrip",
                filepath=os.path.join(path, files[0]),
                channel=1, frame_start=frame_start)
            
        # add the rest of the images.
        files.pop(0)
        for f in files:
            seq.elements.append(f)

        # Save those images to a mp4 video (comaptible with all browsers)
        bpy.data.scenes["Scene"].render.resolution_x = baked_image_size[0]
        bpy.data.scenes["Scene"].render.resolution_y = baked_image_size[1]
        bpy.data.scenes["Scene"].render.resolution_percentage = 100.0
        bpy.data.scenes["Scene"].render.image_settings.file_format = "H264"
        bpy.data.scenes["Scene"].render.ffmpeg.format = "MPEG4"
        bpy.data.scenes["Scene"].render.filepath = bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked.mp4"
        bpy.ops.render.render(animation=True)

        # Remove rendered frames... keep just the video
        # for filename in glob.glob(bpy.data.scenes["Scene"].scratch_dir + os.sep + "proteinvr_baked_texture*.png"):
        #     os.unlink(filename)

        # Hide some spheres... cleaning up.
        forward_sphere.hide = True
        backwards_sphere.hide = True
        view_sphere.hide = True
        
        # Now go through visible objects and get encompassing spheres
        for obj in bpy.data.objects:
            if obj.hide == False and "vertices" in dir(obj.data):
                # Get the vert coordintes
                vert_coors = [(obj.matrix_world * v.co) for v in obj.data.vertices]
                vert_coors = numpy.array([[v.x, v.y, v.z] for v in vert_coors])
                center = numpy.mean(vert_coors, axis=0)
                radius = numpy.max(numpy.linalg.norm(vert_coors - center, axis=1))

                import pdb; pdb.set_trace()

                # Get the verts that are farthest from each other
                max_dist = 0.0
                max_dist_v1 = None
                max_dist_v2 = None
                # i1_to_del = -1
                # i2_to_del = -1
                for i1 in range(len(vert_coors) - 1):
                    v1 = vert_coors[i1]
                    for i2 in range(i1+1, len(vert_coors)):
                        v2 = vert_coors[i2]
                        # l = numpy.linalg.norm(v1 - v2)
                        l = (v1 - v2).length
                        if l > max_dist:
                            max_dist = l
                            max_dist_v1 = v1
                            max_dist_v2 = v2
                            # i1_to_del = i1
                            # i2_to_del = i2
                max_dist = 0.5 * max_dist  # Must be a radius

                # is_to_keep = list(range(len(vert_coors)))
                # is_to_keep.remove(i1)
                # is_to_keep.remove(i2)
                # vert_coors = vert_coors[is_to_keep]
                
                # Get the vert that is the farthest from the line defined by
                # max_dist_v1 - max_dist_v2
                max_d1 = 0.0
                max_v_dir1 = None
                for v in vert_coors:
                    d = (v - max_dist_v1).cross(v - max_dist_v2).length / (max_dist_v2 - max_dist_v1).length
                    if d > max_d1:
                        max_d1 = d
                        max_v_dir1 = v
                
                # Get the vert that is farthest from the plane defined by
                # max_dist_v1, max_dist_v2, max_v_dir1
                x1 = max_dist_v1
                x2 = max_dist_v2
                x3 = max_v_dir1

                nrm = (x2 - x1).cross(x3 - x1) / (x2 - x1).cross(x3 - x1).length
                max_d2 = 0.0
                max_v_dir2 = None
                for v in vert_coors:
                    d = nrm.dot(v  - x1)
                    if d > max_d2:
                        max_d2 = d
                        max_v_dir2 = v

                print(max_dist, max_dist_v1, max_dist_v2)
                print(max_d1, max_v_dir1)
                print(max_d2, max_v_dir2)
                # sdf

                # # Calculate the geometric center
                # center = vert_coors[0].copy()
                # for v in vert_coors[1:]:
                #     center = center + v
                # center = center / len(vert_coors)

                # # Calculate the radius
                # radius = 0.0
                # for v in vert_coors:
                #     r = (center - v).length
                #     if r > radius:
                #         radius = r

                # Add a sphere
                bpy.ops.mesh.primitive_uv_sphere_add(
                    segments=16, 
                    ring_count=16, 
                    size=1.0, # Radius
                    view_align=False, 
                    enter_editmode=False, 
                    location=0.5 * (max_dist_v1 + max_dist_v2), 
                    rotation=(0.0, 0.0, 0.0)
                )

                # print(vert_coors)
                # print(center)
                # print(radius)
                # import pdb; pdb.set_trace()
            
        return {'FINISHED'}
