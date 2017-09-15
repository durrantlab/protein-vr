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

from ..ParentPanel import ParentPanel
from .. import Utils
import bmesh
import bpy
import os
from collections import OrderedDict

obj_names = Utils.ObjNames()

class SetupPanel(ParentPanel):
    """
    Class to display the setup panel. Encourages the user to set the Blender
    parameters as required to use the plugin.
    """

    def draw_panel_if_needed(self):
        """
        Check if the setup panel should be displayed. Display it if necessary.

        :param ??? ui: The user-interface object passed to all panels.

        :returns: true if it was displayed, false otherwise.
        :rtype: :class:`boolean`
        """

        global obj_names

        # A list of the kinds of parameters that need to be set.
        msgs = OrderedDict()
        msgs["Missing Objects:"] = []
        msgs["Render Settings:"] = []
        msgs["3D Settings:"] = []
        # msgs["Missing UV Maps:"] = []

        # Are there missing objects (just Camera for now)?
        for name in ["Camera"]:  # "ProteinVR_ViewerSphere" "ProteinVR_ForwardSphere", "ProteinVR_BackwardsSphere"
            if not name in obj_names.obj_names():
                msgs["Missing Objects:"].append(name)

        # Is it in cycles render? And other settings are ok?
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
        
        if len(bpy.data.cameras.keys()) > 0:
            camera_key = bpy.data.cameras.keys()[0]
            if bpy.data.cameras[camera_key].type != "PANO":
                msgs["3D Settings:"].append("Camera not Panoramic")

            if bpy.data.cameras[camera_key].cycles.panorama_type != "EQUIRECTANGULAR":
                msgs["3D Settings:"].append("Camera not Equirectangular")

        # 2.79 has denoising option in Render Layers tab. Look into that...

        # Make sure everything is UV unwrapped
        # for obj in bpy.data.objects:
        #     if "uv_textures" in dir(obj.data) and len(obj.data.uv_textures) == 0:
        #         msgs["Missing UV Maps:"].append(obj.name)

        # Show messages if anything is missing.
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
            # No messages to display, so return False.
            return False

