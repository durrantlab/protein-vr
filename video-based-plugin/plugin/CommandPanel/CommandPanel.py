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

# This is the main class that controls what the user sees after they have set
# the appropriate Blender settings.

from ..ParentPanel import ParentPanel
from ..DurBlend import ButtonParentClass
from ..DurBlend import Messages
from mathutils import Vector
from .. import Utils
from ..Utils import object_is_proteinvr_clickable

# from .Buttons import OBJECT_OT_CreateScene
# from .Buttons import OBJECT_OT_RenderRemote

import bpy
import os
from bpy import context

obj_names = Utils.ObjNames()

class CommandPanel(ParentPanel):
    """
    Class to display the command panel. 
    """

    def draw_panel_if_needed(self):
        """
        Check if the setup panel should be displayed. Display it if necessary.

        :param ??? ui: The user-interface object passed to all panels.

        :returns: true if it was displayed, false otherwise.
        :rtype: :class:`boolean`
        """

        activeObj = bpy.context.scene.objects.active

        if object_is_proteinvr_clickable(activeObj):
            self.ui.use_box_row(activeObj.name + " Properties")
            self.ui.object_property("proteinvr_clickable")

        self.ui.object_property("proteinvr_category")
        self.ui.ops_button(rel_data_path="proteinvr.set_background", button_label="Set As Background")



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
        


