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

import bpy
from bpy import context
from mathutils import Vector
import os
import math
from bpy.props import *
import random

from .DurBlend import Properties
from .DurBlend import UI
from .DurBlend import PanelParentClass
from .DurBlend import ButtonParentClass


from . import SetupPanel
from . import CommandPanel
from . import SignPanel

bl_info = {
    "name": "ProteinVR",
    "author" : "Jacob Durrant <durrantj@pitt.edu>",
    "version" : (1, 0, 0),
    "blender" : (2, 7, 8),
    "location" : "View 3D > Tools Panel",
    "description" : "ProteinVR plugin",
    "warning" : "",
    "wiki_url" : "",
    "tracker_url" : "",
    "category": "3D View",
}

classes_used = []
classes_used.append(SetupPanel.OBJECT_OT_FixProblems)
classes_used.append(CommandPanel.OBJECT_OT_CreateScene)
classes_used.append(CommandPanel.OBJECT_OT_RenderRemote)
classes_used.append(CommandPanel.OBJECT_OT_Sign)
classes_used.append(CommandPanel.OBJECT_OT_AddTrigger)
classes_used.append(SignPanel.OBJECT_OT_DoneSignPanel)

###### Below specific to this plugin ######

class ProteinVR(PanelParentClass):
    """ProteinVR"""
    bl_label = "ProteinVR"
    bl_idname = "object.proteinvr"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'TOOLS'
    bl_category = "ProteinVR"

    # bl_space_type = 'PROPERTIES'
    # bl_region_type = 'WINDOW'
    # bl_category = "object"

    @classmethod
    def setup_properties(self):
        """
        Define all the scene and object properties for your panel. Every Panel
        class must have this function!
        """

        # Set up general scene properties.
        bpy.types.Scene.proteinvr_output_dir = self.prop_funcs.strProp("Output directory", "/tmp/proteinvr/", 'DIR_PATH', description="The output directory where the ProteinVR scene will be saved.")
        # bpy.types.Scene.proteinvr_pngquant_path = self.prop_funcs.strProp("PNGQUANT Path", os.path.dirname(__file__) + os.sep + "pngquant" + os.sep + "pngquant", 'FILE_PATH', description="The full path to the pngquant executable.")
        bpy.types.Scene.proteinvr_use_existing_frames = self.prop_funcs.boolProp("Use Existing Frames", False, description="Whether to use previously rendered (existing) frames.")
        bpy.types.Scene.proteinvr_bake_texture_size = self.prop_funcs.intProp("Texture Size", min=128, max=8192, default=4096, description="The size of the square texture to render. Higher means higher resolution. Good to use power of 2. Recommended: 4096 for final render.")
        bpy.types.Scene.proteinvr_mobile_bake_texture_size = self.prop_funcs.intProp("Mobile Texture Size", min=0, max=8192, default=1024, description="The size of the square texture to render for use on mobile. Higher means higher resolution. Good to use power of 2. Recommended: 1024 for final render.")
        bpy.types.Scene.proteinvr_transition_bake_texture_size = self.prop_funcs.intProp("Transition Texture Size", min=0, max=8192, default=512, description="The size of the square texture to render when moving from one location to another. Higher means higher resolution. Good to use power of 2. Recommended: 512 for final render.")
        bpy.types.Scene.proteinvr_num_samples = self.prop_funcs.intProp("Number of Samples", min=1, max=10000, default=16, description="The number of rendering cycles. Higher means better quality.")
        bpy.types.Scene.proteinvr_jpeg_quality = self.prop_funcs.intProp("JPEG Quality", min=0, max=100, default=50, description="JPEG quality.")

        bpy.types.Scene.proteinvr_uniq_id = self.prop_funcs.strProp("Unique Project ID", str(random.randrange(0,100000000)), description="A unique ID associated with this project. Different than any other project on the remote server.")


        # Garden Paths
        bpy.types.Scene.proteinvr_garden_paths = self.prop_funcs.strProp("Frames", "1-20; 21*-25*", description="The garden path segments. Format: path1_startframe-path1_endframe; path2_startframe-path2_endframe; etc.")

        # Triggers
        bpy.types.Scene.trigger_string = self.prop_funcs.strProp("(Source Data)", "[]", description="A string that describes all triggers.")
        bpy.types.Scene.add_trigger_cmd = self.prop_funcs.strProp("Trigger", "*.mp3, http://*.html, etc.", description="What is triggered (the action).", subtype="FILE_PATH")

        # Object-specific properties.
        bpy.types.Object.proteinvr_clickable = self.prop_funcs.boolProp("proteinvr_clickable", False, description="Whether this object is proteinvr_clickable.")
        bpy.types.Object.proteinvr_sign_text = self.prop_funcs.strProp("", "Put sign text here...", description="The text to display on this sign.")

        # Object categories
        bpy.types.Object.proteinvr_category = self.prop_funcs.enumProp("Object Category", items=[("static", "Static", "Static Category"), ("mesh", "Mesh", "Mesh Category"), ("skybox", "Skybox", "Skybox Category")], description="Assign object to categories.")

        # Setup the two panels.
        self.SetupPanel = SetupPanel.SetupPanel(self.ui)
        self.CommandPanel = CommandPanel.CommandPanel(self.ui)
        self.SignPanel = SignPanel.SignPanel(self.ui)
        
    def draw(self, context):
        """
        Every panel class must have a draw function. It gets called over and
        over again, constantly refreshing the Panel's appearance (and updating
        the displayed values in the process).

        THE DRAW FUNCTION MUST ALWAYS START WITH:
        self.set_class_variables(context)

        :param bpy_types.Context context: The context.
        """

        self.set_class_variables(context)

        # Check to see if critical scene elements have been set up.
        if self.SetupPanel.draw_panel_if_needed() == True:
            return
        elif self.SignPanel.draw_panel_if_needed() == True:
            return
        else:
            self.CommandPanel.draw_panel_if_needed()

def menu_func(self, context):
    """
    Adds ProteinVR to Blender's menu system.

    :param bpy_types.Context context: The context.
    """

    self.layout.operator(ProteinVR.bl_idname)

# Store keymaps here to access after registration.
addon_keymaps = []

##### Registration functions #####
def register():
    """
    Registers this addon.
    """
    ProteinVR.start()
    bpy.utils.register_class(ProteinVR)
    bpy.types.VIEW3D_MT_object.append(menu_func)

    global classes_used
    for c in classes_used:
        bpy.utils.register_class(c)

def unregister():
    """
    Good practice to make it possible to unregister addons.
    """

    bpy.utils.unregister_class(ProteinVR)
    bpy.types.VIEW3D_MT_object.remove(menu_func)

    global classes_used
    for c in classes_used:
        bpy.utils.unregister_class(c)

if __name__ == "__main__":
    """
    Start the addon!
    """

    register()