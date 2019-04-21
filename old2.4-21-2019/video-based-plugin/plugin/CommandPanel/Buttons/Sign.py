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

from ...DurBlend import ButtonParentClass
import bpy
import os
import random

class OBJECT_OT_Sign(ButtonParentClass):
    """
    Mark a sign location.
    """

    bl_idname = "proteinvr.mark_sign_location"
    bl_label = "Mark Sign Location"

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.

        :returns: A dictionary indicating that the button has finished.
        :rtype: :class:`???`
        """

        # Add empty
        names = set([o.name for o in bpy.data.objects])
        bpy.ops.object.empty_add(type="PLAIN_AXES")
        new_obj = bpy.data.objects[list(set([o.name for o in bpy.data.objects]) - names)[0]]

        # Change empty name
        new_obj.name = "ProteinVRSign"

        # Select/active that new object
        bpy.ops.object.select_all(action='DESELECT')
        new_obj.select = True
        bpy.context.scene.objects.active = new_obj

        return {'FINISHED'}

