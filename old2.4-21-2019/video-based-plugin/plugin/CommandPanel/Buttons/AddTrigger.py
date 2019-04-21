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
from ...DurBlend import Messages
from ... import Utils
from ...Utils import object_is_proteinvr_clickable
import bpy
import json
import os

obj_names = Utils.ObjNames()

class OBJECT_OT_AddTrigger(ButtonParentClass):
    """
    Add a trigger command.
    """

    bl_idname = "proteinvr.add_trigger"
    bl_label = "Add Trigger"

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.

        :returns: A dictionary indicating that the button has finished.
        :rtype: :class:`???`
        """
        
        cmd_upper_tripped = bpy.context.scene.add_trigger_cmd.strip().upper()

        if cmd_upper_tripped == "":
            # Do nothing if empty
            return {'FINISHED'}

        if not (cmd_upper_tripped.endswith(".MP3") or cmd_upper_tripped.startswith("HTTP")):
            # Here validate. Must end in mp3 or start with http. Throw error
            # otherwise.
            Messages.send_message(
                "TRIGGER_FILE_NO_EXIST", 
                'Warning: Trigger file must be an mp3 file or a proteinvr-scene url (http...)',
                operator=self
            )

        # If it's an audio file, and that file doesn't exist, let the user
        # know. Note that only mp3 files work, because that's the format
        # that's currently supported on all major browsers.
        if cmd_upper_tripped.endswith(".MP3") and not os.path.exists(bpy.context.scene.add_trigger_cmd):
            Messages.send_message(
                "TRIGGER_FILE_NO_EXIST", 
                'Warning: Audio file "' + os.path.basename(bpy.context.scene.add_trigger_cmd + '" doesn\'t exist!'),
                operator=self
            )
        
        trigger_data = json.loads(bpy.context.scene.trigger_string)
        trigger_data.append([bpy.context.scene.frame_current, bpy.context.scene.add_trigger_cmd])
        bpy.context.scene.trigger_string = json.dumps(trigger_data)

        bpy.context.scene.add_trigger_cmd = ""

        return {'FINISHED'}
