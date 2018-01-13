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

def switch_mode(mode):
    """
    Switch to the specified mode.

    :param str mode: The mode to switch to.
    """

    try:
        bpy.ops.object.mode_set(mode=mode, toggle=False)
    except:
        pass

def select_and_active(obj):
    """
    Uniquely select an object and make it active.

    :param ??? obj: The object.
    """

    for obj in bpy.data.objects:
        obj.select = False
    obj.select = True
    bpy.context.scene.objects.active = obj

class ObjNames():
    """
    A class to organize object names.
    """

    def save_object_names(self):
        """
        Save object names to a class variable.
        """

        self.existing_object_names = self.obj_names()

    def object_names_different(self):
        """
        Get a list of all object names that have changed.

        :returns: A list of object names
        :rtype: :class:`[str]`
        """

        return list(self.obj_names() - self.existing_object_names)

    def obj_names(self):
        """
        Get set of all object names.

        :returns: A set of object names
        :rtype: :class:`set([str])`
        """

        return set([obj.name for obj in bpy.data.objects])

def object_is_proteinvr_clickable(obj):
    """
    Determine if an objec is clickable.

    :param ??? obj: The object to test.

    :returns: A set of object names
    :rtype: :class:`set([str])`
    """

    return (
        "hide" in dir(obj) and 
        obj.hide == False and 
        "vertices" in dir(obj.data) and 
        not "ProteinVR_tmp_" in obj.name
    )

def garden_path_string_to_data():
    data = []  # [[start_frame1, end_frame1], [start_frame2, end_frame2], ...]
    frames_that_connect_back_to_main_path = []
    try:
        # Paths are separated by ;
        paths = [p.strip() for p in bpy.context.scene.proteinvr_garden_paths.split(";")]

        if len(bpy.data.scenes) != 1:
            print("More than one scene!")
            sdfsdf

        scene = bpy.data.scenes[0] # ["Scene"]
        scene_frame_start = scene.frame_start
        scene_frame_end = scene.frame_end

        # Go through each path
        for i, path in enumerate(paths):
            # First path is main path. It can't loop back on itself.
            if i == 0 and "*" in path:
                return None, None

            # Frames are separated by -
            frames = [f.strip() for f in path.split("-")]

            # If a frame as "*" in it, mark it to be connected back to the
            # main path.
            for frame in frames:
                if "*" in frame:
                    frames_that_connect_back_to_main_path.append(
                        int(frame.replace("*", ""))
                    )
            
            # Remove any "*" and make int
            frames = [int(f.replace("*", "")) for f in frames]

            # Second frame in path must be greater than first.
            if frames[0] > frames[1]:
                return None, None
            
            # No frame can be less than scene_frame_start
            if scene_frame_start > frames[0]:
                return None, None
            
            # No frame can be more than scene_frame_end
            if scene_frame_end < frames[1]:
                return None, None
            
            # Save frames to data variable
            data.append(frames)
    except:
        data = None
    
    return data, list(set(frames_that_connect_back_to_main_path))

