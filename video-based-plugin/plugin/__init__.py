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

from .DurBlend import Properties
from .DurBlend import UI
from .DurBlend import PanelParentClass
from .DurBlend import ButtonParentClass

from . import SetupPanel
from . import CommandPanel

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
        bpy.types.Scene.pngquant_path = self.prop_funcs.strProp("PNGQUANT Path", os.path.dirname(__file__) + os.sep + "pngquant" + os.sep + "pngquant", 'FILE_PATH', description="The full path to the pngquant executable.")
        bpy.types.Scene.background_environment_image = self.prop_funcs.strProp("Environment Image", "", 'FILE_PATH', description="The path to the environment texture. Should be already resized and compressed Recommend high-resolution.")
        bpy.types.Scene.proteinvr_use_existing_frames = self.prop_funcs.boolProp("Existing frames", False, description="Whether to use a previously rendered (existing) frames.")
        bpy.types.Scene.proteinvr_bake_texture_size = self.prop_funcs.intProp("Texture Size", min=128, max=8192, default=4096, description="The size of the square texture to render. Higher means higher resolution. Good to use power of 2. Recommended: 4096 for final render.")
        bpy.types.Scene.proteinvr_mobile_bake_texture_size = self.prop_funcs.intProp("Mobile Texture Size", min=0, max=8192, default=1024, description="The size of the square texture to render fore use on mobile. Higher means higher resolution. Good to use power of 2. Recommended: 1024 for final render.")
        bpy.types.Scene.proteinvr_num_cycles = self.prop_funcs.intProp("Number of Cycles", min=1, max=10000, default=16, description="The number of rendering cycles. Higher means better quality.")
        bpy.types.Scene.jpeg_quality = self.prop_funcs.intProp("JPEG Quality", min=0, max=100, default=50, description="JPEG quality.")

        # Object-specific properties.
        bpy.types.Object.proteinvr_clickable = self.prop_funcs.boolProp("proteinvr_clickable", False, description="Whether this object is proteinvr_clickable.")

        # WHERE DO I MAKE THE BUTTONS FOR THESE VARIABLES? AND IS THERE A WAY FOR ONLY ONE TO BE PRESSED TO BE MADE TRUE? WILL HELP SIMPLYFY CODE LATER ON
        # Boolean variables for the three object categories.
        bpy.types.Object.background = self.prop_funcs.boolProp("background_image", False, description="Assigning image to be the background")
        bpy.types.Object.static = self.prop_funcs.boolProp("static", False, description="Assigning 3-D objects that are static/low quality, they are NOT animated")
        bpy.types.Object.mesh = self.prop_funcs.boolProp("mesh", False, description="Assigning 3-D objects that will be animated/High quality objects")

        # Setup the two panels.
        self.SetupPanel = SetupPanel.SetupPanel(self.ui)
        self.CommandPanel = CommandPanel.CommandPanel(self.ui)
        
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
