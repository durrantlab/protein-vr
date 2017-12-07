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
import os
import shutil
import glob
import json
import numpy
import random
import subprocess
from collections import OrderedDict

obj_names = Utils.ObjNames()

class OBJECT_OT_CreateScene(ButtonParentClass):
    """
    Create the ProteinVR scene.
    """

    bl_idname = "proteinvr.create_scene"
    bl_label = "Create Scene"

    def set_frame(self, frame):
        """
        Set the scene to a specific frame.

        :param int frame: The frame number.
        """
        bpy.context.scene.frame_set(frame)
        bpy.context.scene.update()

    def show_objects(self, category):
        """
        Iterate through dictionary to hide all objects in specified category

        :param str category: name of category
        """

        for obj in self.object_categories[category]:
            obj.hide = False
            obj.hide_render = False
    
    def hide_objects(self, category):
        """
        Iterate through dictionary to show all objects in specified category

        :param str category: name of category
        """

        for obj in self.object_categories[category]:
            obj.hide = True
            obj.hide_render = True

    def save_ui_state(self):
        """
        Saves the hide and hide_render properties of all objects. Also other
        properties.
        """
        self.scene = bpy.data.scenes["Scene"]

        self.visibility_states = {}
        for obj in bpy.data.objects:
            name = obj.name
            self.visibility_states[name] = {
                "hide": obj.hide,
                "hide_render": obj.hide_render
            }
        self.orig_film_transparent = self.scene.cycles.film_transparent
    
    def restore_ui_state(self):
        """
        Restores the initial hide and hide_render properties of all objects.
        """

        for obj in bpy.data.objects:
            name = obj.name
            obj.hide = self.visibility_states[name]["hide"]
            obj.hide_render = self.visibility_states[name]["hide_render"]
        self.scene.cycles.film_transparent = self.orig_film_transparent

    def _compress_png(self, filename):
        """
        Compress a png file. Uses pngquant.

        :param str filename: The filename of the png to compress.
        """

        if self.scene.proteinvr_pngquant_path == "":
            return

        if os.path.exists(self.scene.proteinvr_pngquant_path):
            cmd = self.scene.proteinvr_pngquant_path + ' --speed 1 --quality="0-50" ' + filename + ' -o ' + filename + '.tmp.png'  # --strip 
            # print("RUN: " + cmd)
            os.system(cmd)
            os.rename(filename + '.tmp.png', filename)
        else:
            print("WARNING: pngquant path not valid: " + self.scene.proteinvr_pngquant_path)        

    def _step_0_existing_files_check_ok_and_copy(self):
        """
        Check to make sure the user-specified files exist. If so, start
        copying some files.
        
        :returns: True if files are ok and copied. False otherwise.
        :rtype: :class:`???`
        """

        # Save some things to variables
        self.plugin_dir = os.path.abspath(os.path.dirname(os.path.realpath(__file__)) + os.sep + ".." + os.sep + "..") + os.sep
        self.plugin_asset_dir = self.plugin_dir + "assets" + os.sep

        # Get proteinvr_output_dir
        self.proteinvr_output_dir = self.scene.proteinvr_output_dir
        if not self.proteinvr_output_dir.endswith(os.sep):
            self.proteinvr_output_dir = self.proteinvr_output_dir + os.sep
            self.scene.proteinvr_output_dir = self.proteinvr_output_dir

        if self.scene.proteinvr_use_existing_frames == False and os.path.exists(self.proteinvr_output_dir + "frames"):
            Messages.send_message(
                "FRAMES_EXIST", 
                "Frames already exist!",
                operator=self
            )
            return False

        if self.scene.proteinvr_use_existing_frames == True and not os.path.exists(self.proteinvr_output_dir + "frames"):
            Messages.send_message(
                "FRAMES_EXIST", 
                "Frames do not exist!",
                operator=self
            )
            return False

        # Make sure self.proteinvr_output_dir exists
        if not os.path.exists(self.proteinvr_output_dir):
            os.mkdir(self.proteinvr_output_dir)
        
        # Make sure frame dir exists...
        self.frame_dir = self.proteinvr_output_dir + "frames" + os.sep
        if not os.path.exists(self.frame_dir):
            #shutil.rmtree(self.frame_dir)
            os.mkdir(self.frame_dir)

        # Copy some files
        shutil.copyfile(self.plugin_asset_dir + os.sep + "babylon.babylon", self.proteinvr_output_dir + "babylon.babylon")
        
        for path in glob.glob(self.plugin_asset_dir + "babylon_html_files" + os.sep + "*"):
            target_path = self.proteinvr_output_dir + os.path.basename(path)
            print(path, target_path)
            if not os.path.exists(target_path):
                if os.path.isdir(path):
                    shutil.copytree(path, target_path)
                else:
                    shutil.copyfile(path, target_path)

        return True

    def _step_1_initialize_variables(self):
        """
        Initialize some variables.
        """

        # Variables for the spheres
        self.camera = bpy.data.objects["Camera"]
        self.frame_start = self.scene.frame_start
        self.frame_end = self.scene.frame_end

        self.extra_data = {
            "spheres": [],
            "clickableFiles": [],
            "signs": []
        }
        
        # Put objects into "render layer" categories.
        self.object_categories = {
            "SKYBOX": [],
            "STATIC": [],
            "MESH": []  # Includes onces marked meshed, and any ones that have animations.
        }

        self.objects_to_consider = [o for o in bpy.data.objects if o.type not in ["CAMERA", "LAMP"] and o.hide == False and o.hide_render == False]

        # Seperates the objects into their respective categories as specified by the user
        # for obj in [o for o in bpy.data.objects if not "Camera" in o.name]:
        for obj in self.objects_to_consider:
            if(obj.proteinvr_category == "skybox"): #Capitalize
                self.object_categories["SKYBOX"].append(obj) # skybox = an eventual PNG file that will be the skybox image. NOT MOVING
            elif(obj.proteinvr_category == "static"):
                self.object_categories["STATIC"].append(obj) # Static = low quality non moving images, this based on user preference
            elif(obj.proteinvr_category == "mesh"):
                self.object_categories["MESH"].append(obj) # Meshed = high quality objects, ALL ANIMATED objects are here, but some non animated can be in there if use wants high quality

        # Make sure self.scene.proteinvr_pngquant_path contains executable file
        if self.scene.proteinvr_pngquant_path != "":
            try:
                subprocess.Popen(self.scene.proteinvr_pngquant_path, stderr=subprocess.PIPE)
            except:
                Messages.send_message(
                    "PNGQUANT_ERROR", 
                    'Error trying to execute ' + self.scene.proteinvr_pngquant_path,
                    operator=self
                )
                return False

        return True                

    def _step_2_get_camerea_positions(self):
        """
        Get the locations of the camera along the aniamted camera path.
        """

        for this_frame in range(self.frame_start, self.frame_end + 1):
            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.extra_data["spheres"].append({
                "position": [
                    round(this_camera_pos.x, 3), 
                    round(this_camera_pos.y, 3), 
                    round(this_camera_pos.z, 3)
                ],
                "mesh": None  # For now...
            })

    def _get_animation_keyframes(self, obj):
        pos_loc_data = OrderedDict()
        last_pos_hash = ""
        for f in range(self.frame_start, self.frame_end + 1):  # Looping through each frame
            self.set_frame(f)
            loc = obj.location
            rot = obj.rotation_euler
            pos = (round(loc.x, 2), round(loc.y, 2), round(loc.z, 2), round(rot.x, 2), round(rot.y, 2), round(rot.z, 2)) # Storing location data
            new_pos_hash = self._list_of_nums_to_key(pos)
            if new_pos_hash != last_pos_hash:
                pos_loc_data[f] = pos
            last_pos_hash = new_pos_hash
            
        return pos_loc_data

    def _list_of_nums_to_key(self, list_of_nums):
        return "_".join([str(i) for i in list_of_nums])

    def _step_3_store_animation_data_of_obj_in_mesh_list(self):
        """
        Get all the objects that are currently visible, but have animations.

        :param list,list meshed_objs,animation_data: meshed_objs is a
                         list of objects. animation_data is a dictionary that
                         records the animation of the objects.
        """
        
        # animation_data is a dictionary to hold location data of animated
        # objects that are assigned MESH.
        animation_data = {}

        # Get the animation data for all animated MESH objects.
        for obj in self.objects_to_consider:
            if obj.hide == False and obj.hide_render == False and obj in self.object_categories["MESH"]: 
                animation_data[obj.name] = self._get_animation_keyframes(obj) # Add location data to animation_data dictionary with key of object name

        # Add in "animation data" of meshes that are not animted. Why? Because
        # when you export them, you'll export at the origin. You need to be
        # able to move them to the correct location.
        for obj in self.object_categories["MESH"]:
            if not obj.name in animation_data.keys():
                animation_data[obj.name] = self._get_animation_keyframes(obj)        

        # Save the animation data
        self.extra_data["animations"] = animation_data
        self.extra_data["firstFrameIndex"] = self.frame_start
        self.extra_data["lastFrameIndex"] = self.frame_end

    def _render_whatever_is_visible(self, filename):
        # TODO: Some of these variables are not called after this.....
        self.scene.render.resolution_percentage = 100.0
        self.scene.cycles.samples = self.scene.proteinvr_num_samples
        self.scene.cycles.preview_samples = self.scene.proteinvr_num_samples
        # self.scene.cycles.film_transparent = True  # Because you're saving the skybox separately.

        self.scene.render.filepath = filename
        self.scene.render.image_settings.file_format = 'PNG'
        self.scene.render.image_settings.color_mode = "RGBA"
        self.scene.render.image_settings.compression = 100
        self.scene.render.image_settings.quality = self.scene.proteinvr_jpeg_quality
        self.scene.render.resolution_x = self.scene.proteinvr_bake_texture_size
        self.scene.render.resolution_y = self.scene.proteinvr_bake_texture_size
        self.scene.render.resolution_percentage = 100
        bpy.ops.render.render(write_still=True)
        self._compress_png(self.scene.render.filepath)

        if self.scene.proteinvr_mobile_bake_texture_size != 0:
            self.scene.render.resolution_percentage = int(100.0 * self.scene.proteinvr_mobile_bake_texture_size / self.scene.proteinvr_bake_texture_size)
            self.scene.render.filepath = filename + ".small.png"
            bpy.ops.render.render(write_still=True)
            self._compress_png(self.scene.render.filepath)                    
        else:
            print("WARNING: Skipping the mobile textures...")

        # self.scene.cycles.film_transparent = False

    def _step_4_render_static_frames(self, debug=False):
        """
        Render the frames, both mobile and full resolution.

        :param bool debug: Whether to run in debug
        """

        # Hide all objects in Skybox and meshed category. Show objects in
        # static category. For through each. For each frame, render a png file
        # of the static images.

        print("SKYBOX:", self.object_categories["SKYBOX"])
        print("MESH:", self.object_categories["MESH"])
        print("STATICS:", self.object_categories["STATIC"])

        #Hiding objects in Skybox and Mesh category
        self.hide_objects("SKYBOX")
        self.hide_objects("MESH")

        # Hide any environmental HDR texture
        self.scene.cycles.film_transparent = True

        # Showing objects in Static category
        self.show_objects("STATIC")

        self.camera.rotation_mode = 'XYZ'

        for this_frame in range(self.frame_start, self.frame_end + 1):
            print("Frame", this_frame)

            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.camera.rotation_euler.x = 1.5707963267948966
            self.camera.rotation_euler.y = 0.0
            self.camera.rotation_euler.z = 0.0
            self.camera.keyframe_insert(data_path="rotation_euler", frame=this_frame)

            if not debug:
                filename = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png"
                print("FILENAME:", filename)
                self._render_whatever_is_visible(filename)

    def _step_5_render_skybox_image(self):
        """
        Get the environment texture and save that.
        """
        #  Next, render the skybox (only once)
        #   Change to frame 1
        #   Hide all objects in Static and meshed categories
        #   Render skybox.png, using code like that below.

        self.set_frame = self.frame_start

        self.hide_objects("MESH")
        self.hide_objects("STATIC")
        self.show_objects("SKYBOX")

        # Show any environmental HDR texture
        self.scene.cycles.film_transparent = False

        self._render_whatever_is_visible(self.proteinvr_output_dir + "skybox.png")  # TODO: Rename to skybox.png later...

    def _save_as_obj(self, obj, filepath):
        """
        Save a given obj as an obj file.
        """

        # Make sure visible
        last_hide = obj.hide
        last_hide_render = obj.hide_render
        obj.hide = False
        obj.hide_render = False

        # Select the Object.
        bpy.ops.object.select_all(action='DESELECT')
        obj.select = True
        bpy.context.scene.objects.active = obj

        # Render obj file
        bpy.ops.export_scene.obj(
            filepath=filepath,
            check_existing=False,
            use_selection=True,
            use_mesh_modifiers=True,
            use_normals=True,
            use_materials=False,
            global_scale=1.0,
            axis_up="Y",
            axis_forward="-Z"
        )

        # Restore previous visibility
        obj.hide = last_hide
        obj.hide_render = last_hide_render

    def _step_6_save_meshed_objects(self):
        """
        Save the animation data.
        """

        # Start by hiding everything
        for obj in bpy.data.objects:
            obj.hide = True
            obj.hide_render = True

        for obj in self.object_categories["MESH"]: 
            # Save the obj file.
            filepath = self.proteinvr_output_dir + obj.name + "_mesh.obj"
            self._save_as_obj(obj, filepath)

            # Search the node tree to find a texture

            if not "nodes" in dir(obj.active_material.node_tree):
                Messages.send_message(
                    "NODE_ERROR", 
                    'Object "' + obj.name + '" has no node tree (material).',
                    operator=self
                )
                return False

            texture_images = [n.image for n in obj.active_material.node_tree.nodes if n.type == "TEX_IMAGE"]
            if len(texture_images) > 0:
                print("=" * 15)
                print("WARNING! More than one image node found in material for " + obj.name + ". Using " + str(texture_images[0]))
                print("=" * 15)

            # Save that texture
            if len(texture_images) > 0:
                img = texture_images[0]

                # See https://blender.stackexchange.com/questions/3128/why-blender-throws-an-exception-when-saving-a-copy-of-image
                filepath = self.proteinvr_output_dir + obj.name + "_mesh.png"

                # Store current render settings
                settings = bpy.context.scene.render.image_settings
                format = settings.file_format
                mode = settings.color_mode
                depth = settings.color_depth

                # Change render settings to our target format
                settings.file_format = 'PNG'

                # Save image to PNG, this does NOT render anything! It only
                # means that the save command will use the current scene's
                # render settings.
                img.save_render(filepath)

                # Restore previous render settings
                settings.file_format = format
                settings.color_mode = mode
                settings.color_depth = depth             
            else:
                Messages.send_message(
                    "NODE_ERROR", 
                    'Object "' + obj.name + '" has no texture node. Required for objects of category "Mesh".',
                    operator=self
                )
                return False

        return True

    def _step_7_save_filenames_and_filesizes(self):
        """
        Record the filenames of the baked images. Also, get the total size of
        the files.
        """

        # Save list of all rendered frames
        frame_file_names = [os.path.basename(f) for f in glob.glob(self.frame_dir + "proteinvr_baked_texture*.png") if not ".small.png" in f]
        def key(a): return int(a.replace("proteinvr_baked_texture", "").replace(".png", ""))
        frame_file_names.sort(key=key)

        # Also get the total size of the files.
        reg_file_size = 0
        small_file_size = 0
        for filename in glob.glob(self.frame_dir + "proteinvr_baked_texture*.png"):
            filesize = os.path.getsize(filename)
            if ".small.png" in filename:
                small_file_size = small_file_size + filesize
            else:
                reg_file_size = reg_file_size + filesize
        
        for i, frame_file_name in enumerate(frame_file_names):
            self.extra_data["spheres"][i]["material"] = frame_file_names[i]

        self.extra_data["filesizes"] = {
            "regular": reg_file_size,
            "small": small_file_size
        }

        # json.dump(frame_file_names, open(self.frame_dir + "filenames.json",'w'))
        # json.dump({
        #     "regular": reg_file_size,
        #     "small": small_file_size
        # }, open(self.frame_dir + "filesizes.json",'w'))

    def _step_8_make_proteinvr_clickable_meshes(self):
        """
        Identify the meshes marked as clickable. Make and save simple OBJ
        files that encompass those objects. Better to click on those simple
        objects that the complex original meshes.
        """

        # Now go through visible objects and get encompassing spheres
        # for obj in bpy.data.objects:
        self.restore_ui_state()

        # import pdb; pdb.set_trace()
        for obj in self.objects_to_consider:
            if object_is_proteinvr_clickable(obj) and obj.proteinvr_clickable == True:
                # Get the vert coordintes
                vert_coors = [(obj.matrix_world * v.co) for v in obj.data.vertices]
                vert_coors = numpy.array([[v.x, v.y, v.z] for v in vert_coors])
                center = numpy.mean(vert_coors, axis=0)
                radius = numpy.max(numpy.linalg.norm(vert_coors - center, axis=1))

                # Add a sphere
                obj_names.save_object_names()
                bpy.ops.mesh.primitive_ico_sphere_add(
                    size=radius, # Radius
                    subdivisions=2, 
                    view_align=False, 
                    enter_editmode=False, 
                    location=center,
                    rotation=(0.0, 0.0, 0.0)
                )
                new_obj_name = obj_names.object_names_different()[0]
                sphere = bpy.data.objects[new_obj_name]
                # Utils.select_and_active(sphere)

                mod = sphere.modifiers.new(name='Shrinkwrap',type='SHRINKWRAP')
                mod.target = obj
                bpy.context.scene.objects.active = sphere
                bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Shrinkwrap")
                sphere.name = "ProteinVR_tmp_" + obj.name
                bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

        # Export the shrinkwrapped proteinvr_clickable objects
        for obj in [o for o in bpy.data.objects if o.name.startswith("ProteinVR_tmp_")]:
            if obj.type == 'MESH':
                filepath = self.proteinvr_output_dir + obj.name.replace("ProteinVR_tmp_", "proteinvr_clickable_") + ".obj"
                self._save_as_obj(obj, filepath)
                self.extra_data["clickableFiles"].append(os.path.basename(filepath))
            
            # Remove the proteinvr_clickable mesh now that it's saved
            bpy.ops.object.delete()

    def _step_9_save_signs(self):
        """
        Save the text and locations of the signs (billboards with text).
        """

        for o in bpy.data.objects:
            if o.name.startswith("ProteinVRSign"):
                self.extra_data["signs"].append({
                    "location": list(o.location),
                    "text": o.proteinvr_sign_text
                })

    def _step_10_generate_texture_babylon_and_manifest_files(self):
        """
        Wrap the textures in babylon files to take advantage of babylon's
        caching system.
        """

        manifest = {
            "version": int(1000000 * random.random()),
            "enableSceneOffline" : True,
            "enableTexturesOffline" : True
        }

        babylon = {
            "materials": [
                {
                    "name": None,
                    "id": None,
                    "ambient": [0, 0, 0],
                    "diffuse": [0, 0, 0],
                    "specular": [0, 0, 0],
                    "emissive": [0, 0, 0],
                    "specularPower": 64,
                    "alpha": 1,
                    "backFaceCulling": True,
                    "checkReadyOnlyOnce": False,
                    "maxSimultaneousLights": 4,
                    "emissiveTexture": {
                        "name": None,
                        "level": 1,
                        "hasAlpha": 0,
                        "coordinatesMode": 0,
                        "uOffset": 0,
                        "vOffset": 0,
                        "uScale": 1,
                        "vScale": 1,
                        "uAng": 0,
                        "vAng": 0,
                        "wAng": 0,
                        "wrapU": 0,
                        "wrapV": 0,
                        "coordinatesIndex": 0
                    }
                }
            ]
        }

        png_files = glob.glob(self.frame_dir + "*.png")
        png_files.append(os.path.abspath(self.frame_dir + "..") + os.sep + "skybox.png")

        for filename in png_files:
            json.dump(manifest, open(filename + ".babylon.manifest", 'w'))

            bsnm = os.path.basename(filename)
            babylon["materials"][0]["name"] = bsnm
            babylon["materials"][0]["id"] = bsnm
            babylon["materials"][0]["emissiveTexture"]["name"] = bsnm
            json.dump(babylon, open(filename + ".babylon", 'w'))

    def _get_nearest_index(self, index, coors):
        coor = numpy.array(self.extra_data["spheres"][index]["position"])
        dists = coors - coor
        dists = dists * dists
        dists = numpy.sum(dists, axis=1)
        return numpy.argmin(dists)

    def _frame_to_coor(self, frame_index):
        array_index = self._frame_index_to_array_index(frame_index)
        return numpy.array(self.extra_data["spheres"][array_index]["position"])
    
    def _frame_index_to_array_index(self, frame_index):
        return frame_index - self.extra_data["firstFrameIndex"]

    def _step_11_get_neighboring_path_points(self):
        # What frames are the path points?
        path_data, frames_that_connect_back_to_main_path = Utils.garden_path_string_to_data()

        # Make a dictionary to store path points. Store some frame-neighbor
        # data. 
        frame_neighbors = {}
        for start_frame, end_frame in path_data:
            for frame in range(start_frame, end_frame + 1):
                frame_neighbors[frame] = []

                if frame != start_frame:
                    frame_neighbors[frame].append(frame - 1)
                if frame != end_frame:
                    frame_neighbors[frame].append(frame + 1)

        # For each * frame, find the closest frame in the main path Now go
        # back and find frames that should connect back to the main path.
        for connecting_frame in frames_that_connect_back_to_main_path:
            connecting_frame_coor = self._frame_to_coor(connecting_frame)
            best_dist_squared = 1e10
            best_main_path_frame = -1
            for main_path_index in range(path_data[0][0], path_data[0][1] + 1):
                main_path_coor = self._frame_to_coor(main_path_index)
                dist_squared = connecting_frame_coor - main_path_coor
                dist_squared = dist_squared * dist_squared
                dist_squared = numpy.sum(dist_squared)
                if dist_squared < best_dist_squared:
                    best_dist_squared = dist_squared
                    best_main_path_frame = main_path_index

                # print(connecting_frame_coor, main_path_coor, dist_squared)

            frame_neighbors[best_main_path_frame].append(connecting_frame)
            frame_neighbors[connecting_frame].append(best_main_path_frame)

        # Now you need to convert the frame indexes in frame_neighbors to array indexies
        frame_neighbors_with_array_indices = {}
        for frame_index in frame_neighbors.keys():
            array_index = self._frame_index_to_array_index(frame_index)
            frame_neighbors_with_array_indices[array_index] = list(set([
                self._frame_index_to_array_index(fi) for fi in frame_neighbors[frame_index]
            ]))
        
        # Save that to json
        self.extra_data["nextMoves"] = frame_neighbors_with_array_indices
    
    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.

        :returns: A dictionary indicating that the button has finished.
        :rtype: :class:`???`
        """

        self.save_ui_state()

        if self._step_0_existing_files_check_ok_and_copy() == False:
            self.restore_ui_state()
            return {'FINISHED'}

        debug = False

        if self._step_1_initialize_variables() == False:
            self.restore_ui_state()
            return {'FINISHED'}

        self._step_2_get_camerea_positions()
        self._step_3_store_animation_data_of_obj_in_mesh_list()

        if len(glob.glob(self.proteinvr_output_dir + "frames/*.png")) == 0:
            self._step_4_render_static_frames(debug)
        
        self._step_5_render_skybox_image()

        print("Why this if-statement logic? (BELOW) Why not just throw an error?")

        if self._step_6_save_meshed_objects():
            self._step_7_save_filenames_and_filesizes()
            self._step_8_make_proteinvr_clickable_meshes()
            self._step_9_save_signs()
            self._step_10_generate_texture_babylon_and_manifest_files()    
            self._step_11_get_neighboring_path_points()

            json.dump(
                self.extra_data, 
                open(self.proteinvr_output_dir + "data.json", 'w')
            )

            print(self.extra_data)

        self.restore_ui_state()

        return {'FINISHED'}
