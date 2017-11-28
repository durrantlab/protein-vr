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
            Messages.display_message("NODE_ERROR", self)

        # Commands
        self.ui.use_box_row("Commands")
        self.ui.ops_button(rel_data_path="proteinvr.mark_sign_location", button_label="Mark Sign Location")

        # Garden Path Commands
        self.ui.use_box_row("Garden Paths")
        frame_data, frames_that_connect_back_to_main_path = Utils.garden_path_string_to_data()
        if frame_data is None:
            self.ui.label("Formatting error!")
        else:
            for i, d in enumerate(frame_data):
                frame1, frame2 = d
                self.ui.label("Path " + str(i+1) + ": Frame " + str(frame1) + " to frame " + str(frame2))
            for frame in frames_that_connect_back_to_main_path:
                self.ui.label("Frame " + str(frame) + " reaches Path 1")

        # try:
        #     paths = [p.strip() for p in bpy.context.scene.proteinvr_garden_paths.split(";")]
        #     for i, path in enumerate(paths):
        #         frames = [str(int(f)).strip() for f in path.split("-")]
        #         self.ui.label("Path " + str(i+1) + ": Frame " + frames[0] + " to frame " + frames[1])
        # except:
        #     

        self.ui.scene_property("proteinvr_garden_paths")

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
            self.ui.scene_property("proteinvr_pngquant_path")
            Messages.display_message("PNGQUANT_ERROR", self)
        
        self.ui.ops_button(rel_data_path="proteinvr.create_scene", button_label="Create Scene")
        self.ui.ops_button(rel_data_path="proteinvr.render_scene_remotely", button_label="Render Scene Remotely")        
        


