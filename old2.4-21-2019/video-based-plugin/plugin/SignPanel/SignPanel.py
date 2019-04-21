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

class SignPanel(ParentPanel):
    """
    Class to display the sign panel. Allows the user to indicate sign text.
    """

    def draw_panel_if_needed(self):
        """
        Check if the sign panel should be displayed. Display it if necessary.

        :param ??? ui: The user-interface object passed to all panels.

        :returns: true if it was displayed, false otherwise.
        :rtype: :class:`boolean`
        """

        activeObj = bpy.context.scene.objects.active

        if activeObj is None:
            return False

        if not activeObj.name.startswith("ProteinVRSign"):
            return False

        # Show messages if anything is missing.
        self.ui.use_box_row("Sign Text")
        self.ui.object_property(property_name="proteinvr_sign_text")
        
        self.ui.use_layout_row()
        self.ui.ops_button(rel_data_path="proteinvr.done_sign_panel", button_label="Done")
        
        # self.ui.label("Problems!")
        # self.ui.use_layout_row()

        return True
