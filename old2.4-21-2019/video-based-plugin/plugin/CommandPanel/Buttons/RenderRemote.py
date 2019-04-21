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

class OBJECT_OT_RenderRemote(ButtonParentClass):
    """
    Render the scene remotely. For internal Durrantlab use.
    """

    bl_idname = "proteinvr.render_scene_remotely"
    bl_label = "Render Scene Remotely"

    # Hard code a few variables. This is ok, but this will only be used in
    # the Durrant lab.

    beefy_computer_for_rendering = "jdurrant@bob.bio.pitt.edu"
    remote_scratch_directory = "/tmp/"
    remote_blender_location_with_proteinvr_installed = "/home/jdurrant/DataB/spinel/programs/blender-2.78c-linux-glibc219-x86_64/blender"

    def run_remote(self, cmd):
        """
        Run a command remotely.

        :param str cmd: The command to run remotely.
        """

        remote_cmd = 'ssh ' + self.beefy_computer_for_rendering + ' "' + cmd + '"'
        print()
        print(remote_cmd)
        os.system(remote_cmd)
    
    def copy_to_remote(self, file, remote_dir):
        """
        Copy files to a remote directory.

        :param str file: The file to copy.
        :param str remote_dir: The remote directory.
        """

        remote_dir = remote_dir if remote_dir.endswith(os.sep) else remote_dir + os.sep
        remote_cmd = 'scp ' + file + ' ' + self.beefy_computer_for_rendering + ':' + remote_dir
        print()
        print(remote_cmd)
        os.system(remote_cmd)

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.

        :returns: A dictionary indicating that the button has finished.
        :rtype: :class:`???`
        """

        # I'm going to assume password-less authentication is enabled, because
        # I'm not putting my password in code!

        # Make sure internal data will be saved with blend file
        if bpy.data.use_autopack == False:
            bpy.ops.file.autopack_toggle()

        # Save this blend file.
        bpy.ops.wm.save_mainfile()

        # Get a random id
        dir_id = str(random.random()).replace(".", "")
        remote_dir = self.remote_scratch_directory + os.sep + dir_id + os.sep

        # Make a remote directory.
        self.run_remote('mkdir -p ' + remote_dir)

        # Copy the blend file to that directory.
        blend_file = os.path.abspath(bpy.data.filepath)
        self.copy_to_remote(blend_file, remote_dir)

        # Copy the runit script.
        runitpy_path = os.path.dirname(os.path.abspath(__file__)) + os.sep + ".." + os.sep + ".." + os.sep + "RenderRemote" + os.sep + "runit.py"
        self.copy_to_remote(runitpy_path, remote_dir)

        # Run things remotely now.
        cmds = [
            'cd ' + remote_dir,
            self.remote_blender_location_with_proteinvr_installed + ' ' + os.path.basename(blend_file) + ' --background --python runit.py'
        ]
        self.run_remote("; ".join(cmds))

        # Copy files back from remote machine. --remove-source-files 
        remote_cmd = "rsync -rv " + self.beefy_computer_for_rendering + ":" + remote_dir + os.sep + "output" + os.sep + "* " + bpy.context.scene.proteinvr_output_dir + os.sep
        print(remote_cmd)
        print()
        os.system(remote_cmd)

        # Remote remote directory.
        self.run_remote("rm -r " + remote_dir)

        print()

        return {'FINISHED'}

