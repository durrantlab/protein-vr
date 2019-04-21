# ProteinVR is a Blender addon for making educational VR movies.
# Copyright (C) 2017  Jacob D. Durrant
#
# This program is free software: you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option)
# any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along with
# this program.  If not, see <http://www.gnu.org/licenses/>.

from ..DurBlend import ButtonParentClass
from .. import Utils
import bpy
import os

obj_names = Utils.ObjNames()

class OBJECT_OT_FixProblems(ButtonParentClass):
    """
    Make sure required objects are present in the scene.
    """

    bl_idname = "proteinvr.fix"
    bl_label = "Fix"

    def append_from_template_file(self, obj_name):
        """
        Load (append) an object from an external blend file.

        :param str obj_name: The name of the object to import.

        :returns: The appended object.
        :rtype: :class:`???`
        """
        
        global obj_names

        # Get the object path
        obj_names.save_object_names()
        blendfile = os.path.dirname(os.path.realpath(__file__)) + os.sep + "assets" + os.sep + "babylon.blend"
        section = "\\Object\\"
        object = obj_name

        # See https://blender.stackexchange.com/questions/38060/how-to-link-append-with-a-python-script
        filepath  = blendfile + section + object
        directory = blendfile + section
        filename  = object

        # Load in the object
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

        :returns: A dictionary indicating that the button has finished.
        :rtype: :class:`???`
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
        
        try:
            bpy.context.scene.render.layers[0].cycles.use_denoising = True
        except:
            # Because denoising not available in older versions of blender.
            pass

        # Go into Object mode
        Utils.switch_mode("OBJECT")

        if not "Camera" in obj_names.obj_names():
            bpy.ops.object.camera_add()
        
        for camera in bpy.data.cameras:
            camera.type = "PANO"
            camera.cycles.panorama_type = "EQUIRECTANGULAR"

        return {'FINISHED'}

