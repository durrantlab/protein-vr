from .ParentPanel import ParentPanel
from .DurBlend import ButtonParentClass
from . import Utils
import bmesh
import bpy
import os

obj_names = Utils.ObjNames()

class SetupPanel(ParentPanel):
    def draw_panel_if_needed(self):
        global obj_names

        missing_objects = []

        for name in ["Camera", "ProteinVR_ViewerSphere", "ProteinVR_ForwardSphere", "ProteinVR_BackwardsSphere"]:
            if not name in obj_names.obj_names():
                missing_objects.append(name)

        if len(missing_objects) > 0 or bpy.context.scene.render.engine != "CYCLES":
            self.ui.use_layout_row()
            self.ui.label("Setup")

            self.ui.use_box_row("Problems!")
            
            # Messages.display_message("LOAD_TRAJ_PROGRESS", self)
            if len(missing_objects) > 0:
                # self.ui.label("Required object(s) missing:")
                for name in missing_objects:
                    self.ui.label("Missing: " + name)
            
            if bpy.context.scene.render.engine != "CYCLES":
                self.ui.label("Renderer: Not CYCLES")

            self.ui.use_layout_row()
            self.ui.ops_button(rel_data_path="add.required_objects", button_label="Add Required Objects")

            return True
        else:
            return False

class OBJECT_OT_AddRequiredObjects(ButtonParentClass):
    """
    Button for making sure required objects are present in scene.
    """

    bl_idname = "add.required_objects"
    bl_label = "Add Required Objects"

    def append_from_template_file(self, obj_name):
        global obj_names

        # Get the sphere from the template blend file.
        obj_names.save_object_names()
        blendfile = os.path.dirname(os.path.realpath(__file__)) + os.sep + "assets" + os.sep + "template.blend"
        section = "\\Object\\"
        object = obj_name

        # See https://blender.stackexchange.com/questions/38060/how-to-link-append-with-a-python-script
        filepath  = blendfile + section + object
        directory = blendfile + section
        filename  = object

        bpy.ops.wm.append(
            filepath=filepath, 
            filename=filename,
            directory=directory
        )

        # Make sure named correctly.
        new_obj_name = obj_names.object_names_different()[0]
        obj = bpy.data.objects[new_obj_name]
        obj.name = obj_name

        return obj

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.
        """

        global obj_names

        # Make sure cycles mode
        bpy.context.scene.render.engine = "CYCLES"

        # Go into Object mode
        Utils.switch_mode("OBJECT")

        if not "Camera" in obj_names.obj_names():
            bpy.ops.object.camera_add()

        for name in ["ProteinVR_ViewerSphere", "ProteinVR_ForwardSphere", "ProteinVR_BackwardsSphere"]:
            if not name in obj_names.obj_names():
                obj = self.append_from_template_file(name)

                # Move obj to camera location
                camera = bpy.data.objects["Camera"]
                obj.location = camera.location

                # if name == "ProteinVR_ViewerSphere":
                #     # Parent viewer sphere to camera
                #     camera.hide = False
                #     obj.select = True
                #     bpy.context.scene.objects.active = camera
                #     bpy.ops.object.parent_set(type="OBJECT")

                # Hide obj for now
                obj.hide = True

        return {'FINISHED'}

