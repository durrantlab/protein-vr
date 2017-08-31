from .ParentPanel import ParentPanel
from .DurBlend import ButtonParentClass
from . import Utils
import bmesh
import bpy
import os
from collections import OrderedDict

obj_names = Utils.ObjNames()

class SetupPanel(ParentPanel):
    def draw_panel_if_needed(self):
        global obj_names

        msgs = OrderedDict()
        msgs["Missing Objects:"] = []
        msgs["Render Settings:"] = []

        # Are there missing objects?
        for name in ["Camera", "ProteinVR_ViewerSphere"]:  # "ProteinVR_ForwardSphere", "ProteinVR_BackwardsSphere"
            if not name in obj_names.obj_names():
                msgs["Missing Objects:"].append(name)

        # Is it in cycles render?
        if bpy.context.scene.render.engine != "CYCLES":
            msgs["Render Settings:"].append("Not CYCLES")
        
        if bpy.context.scene.cycles.min_bounces != 0:
            msgs["Render Settings:"].append("Min bounces > 0")

        if bpy.context.scene.cycles.max_bounces > 4:
            msgs["Render Settings:"].append("Max bounces > 4")

        if bpy.context.scene.cycles.caustics_reflective:
            msgs["Render Settings:"].append("Reflective caustics on")

        if bpy.context.scene.cycles.caustics_refractive:
            msgs["Render Settings:"].append("Refractive caustics on")

        if bpy.context.scene.cycles.sample_clamp_direct != 2.5:
            msgs["Render Settings:"].append("Clamp direct != 2.5")

        if bpy.context.scene.cycles.sample_clamp_indirect != 2.5:
            msgs["Render Settings:"].append("Clamp indirect != 2.5")
        
        if bpy.context.scene.cycles.blur_glossy < 2.0:
            msgs["Render Settings:"].append("Blur glossy < 2")

        # 2.79 has denoising option in Render Layers tab. Look into that...

        # Show messages
        if sum([len(msgs[k]) for k in msgs.keys()]) > 0:
            self.ui.use_layout_row()
            self.ui.label("Problems!")

            for key in msgs.keys():
                # self.ui.use_layout_row()
                if len(msgs[key]) > 0:
                    self.ui.use_box_row(key)
                    for m in msgs[key]:
                        self.ui.label(m)

            self.ui.use_layout_row()
            self.ui.ops_button(rel_data_path="proteinvr.fix", button_label="Fix Problems!")

            return True
        else:
            return False

class OBJECT_OT_FixProblems(ButtonParentClass):
    """
    Make sure required objects are present in the scene.
    """

    bl_idname = "proteinvr.fix"
    bl_label = "Fix"

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

        # Make sure cycles mode, other settings
        bpy.context.scene.render.engine = "CYCLES"
        bpy.context.scene.cycles.min_bounces = 0
        if bpy.context.scene.cycles.max_bounces > 4:
            bpy.context.scene.cycles.max_bounces = 4
        bpy.context.scene.cycles.caustics_reflective = False
        bpy.context.scene.cycles.caustics_refractive = False
        bpy.context.scene.cycles.sample_clamp_direct = 2.5
        bpy.context.scene.cycles.sample_clamp_indirect = 2.5
        if bpy.context.scene.cycles.blur_glossy < 2.0:
            bpy.context.scene.cycles.blur_glossy = 2.0

        # Go into Object mode
        Utils.switch_mode("OBJECT")

        if not "Camera" in obj_names.obj_names():
            bpy.ops.object.camera_add()

        for name in ["ProteinVR_ViewerSphere"]:  # "ProteinVR_ForwardSphere", "ProteinVR_BackwardsSphere"
            if not name in obj_names.obj_names():
                obj = self.append_from_template_file(name)

                # Move obj to camera location
                camera = bpy.data.objects["Camera"]
                obj.location = camera.location

                # Hide obj for now
                obj.hide = True

        return {'FINISHED'}

