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

        
    def _step_0_existing_files_check_ok_and_copy(self):
        """
        Check to make sure the user-specified files exist. If so, start
        copying some files.
        
        :returns: True if files are ok and copied. False otherwise.
        :rtype: :class:`???`
        """

        # Save some things to variables
        self.scene = bpy.data.scenes["Scene"]
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
            "cameraPositions": [],
            "clickableFiles": [],
        }
        
        # Put objects into "render layer" categories.
        self.object_categories = {
            "BACKGROUND": [],
            "STATIC": [],
            "MESHED": []  # Includes onces marked meshed, and any ones that have animations.
        }

        # Seperates the objects into their respective categories as specified by the user
        for obj in [o for o in bpy.data.objects if not "Camera" in o.name]:
            if(obj.bpy.types.Object.proteinvr_category == "background"): #Capitalize
                self.object_categories["BACKGROUND"].append(obj) # background = an eventual PNG file that will be the background image. NOT MOVING
            elif(obj.bpy.types.Object.proteinvr_category == "static"):
                    self.object_categories["STATIC"].append(obj) # Static = low quality non moving images, this based on user preference
            elif(obj.bpy.types.Object.proteinvr_category == "mesh"):
                    self.object_categories["MESH"].append(obj) # Meshed = high quality objects, ALL ANIMATED objects are here, but some non animated can be in there if use wants high quality
            


    def _step_2_get_camerea_positions(self):
        """
        Get the locations of the camera along the aniamted camera path.
        """

        for this_frame in range(self.frame_start, self.frame_end + 1):
            self.set_frame(this_frame)
            this_camera_pos = self.camera.location.copy()
            self.extra_data["cameraPositions"].append([round(this_camera_pos.x, 3), round(this_camera_pos.y, 3), round(this_camera_pos.z, 3)])

    def _compress_png(self, filename):
        """
        Compress a png file. Uses pngquant.

        :param str filename: The filename of the png to compress.
        """

        if os.path.exists(self.scene.pngquant_path):
            cmd = self.scene.pngquant_path + ' --speed 1 --quality="0-50" ' + filename + ' -o ' + filename + '.tmp.png'  # --strip 
            # print("RUN: " + cmd)          
            os.system(cmd)
            os.rename(filename + '.tmp.png', filename)
        else:
            print("WARNING: pngquant path not valid: " + self.scene.pngquant_path)

    def _step_3_add_animated_objects_to_mesh_list_and_store_animation_data(self):
        """
        Get all the objects that are currently visible, but have animations.

        :param list,list meshed_objs,animation_data: meshed_objs is a
                         list of objects. animation_data is a dictionary that
                         records the animation of the objects.
        """

        # animation_data is a dictionary to hold location data of animated objects
        animation_data = {}

        # Looping through all objects for error checking to make sure an animated object was not placed in the wrong category
        for obj in [o for o in bpy.data.objects if not "Camera" in o.name]:
            if obj.hide == False and obj.hide_render == False: 
                pos_loc_data = []
                for f in range(self.frame_start, self.frame_end + 1):  # Looping through each frame
                    self.set_frame(f)
                    loc = obj.location
                    rot = obj.rotation_euler
                    pos_loc_data.append((round(loc.x, 2), round(loc.y, 2), round(loc.z, 2), round(rot.x, 2), round(rot.y, 2), round(rot.z, 2))) # Storing location data

                keys = ["_".join([str(i) for i in l]) for l in pos_loc_data]

                keys = set(keys)
                num_keyframes = len(keys)
                if num_keyframes > 1: # Checking to see if object is animated
                    object_categories["MESH"].append(obj) # If object is animated then, add to category MESH
                    animation_data[obj.name] = pos_loc_data # Add location data to animation_data dictionary with key of object name

        # Save the animation data
        self.extra_data["animations"] = animation_data

        return

        ################################## OLD CODE #################################

        # DO WE NEED THIS METHOD ANYMORE NOW THAT WE HAVE A HASH TABLE THAT IS 
        # CONTAINS ALL THE OBJECTS THAT ARE MESHED, How about switching this method to 
        # get_meshed_animations?

        # Note that this also saves the animation data. This isn't necessary
        # for identifying the object, but we have to get it anyway, so why not
        # save it?
        # meshed_objs = []
        # animation_data = {}
        # for obj in [o for o in bpy.data.objects if not "Camera" in o.name]: #change for loop to iterate through the hash table
        #     if obj.hide == False and obj.hide_render == False: #would not need to check for hide value anymore
        #         pos_loc_data = []
        #         for f in range(self.frame_start, self.frame_end + 1):
        #             self.set_frame(f)
        #             loc = obj.location
        #             rot = obj.rotation_euler
        #             pos_loc_data.append((round(loc.x, 2), round(loc.y, 2), round(loc.z, 2), round(rot.x, 2), round(rot.y, 2), round(rot.z, 2)))
                
        #         keys = ["_".join([str(i) for i in l]) for l in pos_loc_data]

        #         keys = set(keys)
        #         num_keyframes = len(keys)
        #         if num_keyframes > 1:
        #             meshed_objs.append(obj)
        #             animation_data[obj.name] = pos_loc_data
        # return meshed_objs, animation_data
        
    def _step_4_render_static_frames(self, debug=False):
        """
        Render the frames, both mobile and full resolution.

        :param bool debug: Whether to run in debug  # bpy.types.Object.background = self.prop_funcs.boolProp("background_image", False, description="Assigning image to be the background")
        # bpy.types.Object.static = self.prop_funcs.boolProp("static", False, description="Assigning 3-D objects that are static/low quality, they are NOT animated")
        # bpy.types.Object.mesh = self.prop_funcs.boolProp("mesh", False, description="Assigning 3-D objects that will be animated/High quality objects")mode. Defaults to False.
        """

        # Hide all objects in Background and meshed category. Show objects in static category.
        # For through each. For each frame, render a png file of the static images.

        #Hiding objects in Background and Mesh category
        hide_objects("BACKGROUND")
        hide_objects("MESH")

        # Showing objects in Static category
        show_objects("STATIC")

        self.scene.render.resolution_percentage = 100.0
        self.scene.cycles.samples = self.scene.proteinvr_num_cycles
        self.scene.cycles.preview_samples = self.scene.proteinvr_num_cycles
        self.scene.cycles.film_transparent = True  # Because you're saving the background separately.

        self.camera.rotation_mode = 'XYZ'

        for static_obj in object_categories["STATIC"]:
            for this_frame in range(self.frame_start, self.frame_end + 1):
                print("Frame", this_frame)

                self.set_frame(this_frame)
                this_camera_pos = self.camera.location.copy()
                self.camera.rotation_euler.x = 1.5707963267948966
                self.camera.rotation_euler.y = 0.0
                self.camera.rotation_euler.z = 0.0
                self.camera.keyframe_insert(data_path="rotation_euler", frame=this_frame)

                if not debug:
                    self.scene.render.filepath = self.frame_dir + "protein_baked_texture" + str(this_frame) + ".png"
                    self.scene.render.image_settings.file_format = 'PNG'
                    self.scene.render.image_settings.file_format = "RGBA"
                    self.scene.render.image_settings.compression = 100
                    self.scene.render.image_settings.quality = self.scene.jpeg_quality
                    self.scene.render.resolution_x = self.scene.proteinvr_bake_texture_size
                    self.scene.render.resolution_y = self.scene.proteinvr_bake_texture_size
                    self.scene.render.resolution_percentage = 100
                    bpy.ops.render.render(write_still=True)
                    self._compress_png(self.scene.render.filepath)

                    if self.scene.proteinvr_mobile_bake_texture_size != 0:
                        self.scene.render.resolution_percentage = int(100.0 * self.scene.proteinvr_mobile_bake_texture_size / self.scene.proteinvr_bake_texture_size)
                        self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png.small.png"
                        bpy.ops.render.render(write_still=True)
                        self._compress_png(self.scene.render.filepath)
                    else:
                        print("WARNING: Skipping the mobile textures...")

            show_objects("MESH")

            self.scene.cycles.film_transparent = False

        ######################################################## OLD CODE BELOW ##############################################

        # # Get all the objects that are currently visible, but have animations.
        # meshed_objs, _ = self._step_3_add_animated_objects_to_mesh_list_and_store_animation_data()
        
        # # Hide the moving objects (not rendered to sphere)
        # for obj in meshed_objs:          # INSTEAD OF ITERATING THROUGH THE ARRAY, GET RID OF IT, AND ITERATE THROUGH THE HAS TABLE
        #     obj.hide = True
        #     obj.hide_render = True
        
        # # Setup cycles samples
        # self.scene.render.resolution_percentage = 100.0
        # self.scene.cycles.samples = self.scene.proteinvr_num_cycles
        # self.scene.cycles.preview_samples = self.scene.proteinvr_num_cycles
        # self.scene.cycles.film_transparent = True  # Because you're saving the background separately.

        # self.camera.rotation_mode = 'XYZ'

        # for this_frame in range(self.frame_start, self.frame_end + 1):
        #     print("Frame", this_frame)

        #     self.set_frame(this_frame)
        #     this_camera_pos = self.camera.location.copy()
        #     self.camera.rotation_euler.x = 1.5707963267948966
        #     self.camera.rotation_euler.y = 0.0
        #     self.camera.rotation_euler.z = 0.0
        #     self.camera.keyframe_insert(data_path="rotation_euler", frame=this_frame)

        #     if not debug:
        #         # Create the image
        #         self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png"
        #         self.scene.render.image_settings.file_format = 'PNG'
        #         self.scene.render.image_settings.color_mode = "RGBA"
        #         self.scene.render.image_settings.compression = 100
        #         self.scene.render.image_settings.quality = self.scene.jpeg_quality
        #         self.scene.render.resolution_x = self.scene.proteinvr_bake_texture_size
        #         self.scene.render.resolution_y = self.scene.proteinvr_bake_texture_size
        #         self.scene.render.resolution_percentage = 100
        #         bpy.ops.render.render(write_still=True)
        #         self._compress_png(self.scene.render.filepath)

        #         # frame_file_names.append("proteinvr_baked_texture" + str(this_frame) + ".png")

        #         # Now render at 1/4 size. But note that I'm rerendering here,
        #         # not resizing. So can be computationally intensive. I chose
        #         # this because I believe it gives better results, but I'm not
        #         # sure.
        #         if self.scene.proteinvr_mobile_bake_texture_size != 0:
        #             self.scene.render.resolution_percentage = int(100.0 * self.scene.proteinvr_mobile_bake_texture_size / self.scene.proteinvr_bake_texture_size)
        #             self.scene.render.filepath = self.frame_dir + "proteinvr_baked_texture" + str(this_frame) + ".png.small.png"
        #             bpy.ops.render.render(write_still=True)
        #             self._compress_png(self.scene.render.filepath)
        #         else:
        #             print("WARNING: Skipping the mobile textures...")
                
        # # Reshow moving objects  
        # for obj in meshed_objs:  #ITERATE THROUGH HASH TABLE AGAIN?
        #     obj.hide = False
        #     obj.hide_render = False

        # self.scene.cycles.film_transparent = False  # Time to restore the environment lighting

    def _step_5_render_background_image(self):
        """
        Get the environment texture and save that.
        """
        # Next, render the background (only once)
        #   Change to frame 1
        #   Hide all objects in Static and meshed categories
        #   Render background.png, using code like that below.

        self.set_frame = self.frame_start

        hide_objects("MESH")
        hide_objects("STATIC")

        src_background_environment_image = bpy.path.abspath(self.scene.background_environment_image)
        if os.path.exists(src_background_environment_image):
            shutil.copyfile(src_background_environment_image, self.proteinvr_output_dir + "environment.png")
        else:
            print("WARNING: Environmental texture file does not exist!")

        ##### OLD CODE BELOW #######

        # src_background_environment_image = bpy.path.abspath(self.scene.background_environment_image)
        # if os.path.exists(src_background_environment_image):
        #     shutil.copyfile(src_background_environment_image, self.proteinvr_output_dir + "environment.png")
        # else:
        #     print("WARNING: Environmental texture file does not exist!")

    def _step_6_save_meshed_objects(self):
        """
        Save the animation data.
        """

        for obj_name in object_categories["MESH"]: 
            obj = bpy.data.objects[obj_name]

            # Save the obj file.
            filepath = self.proteinvr_output_dir + obj.name + "_animated.obj"
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

            # Search the node tree to find a texture
            texture_images = [n.image for n in obj.active_material.node_tree.nodes if n.type == "TEX_IMAGE"]
            if len(texture_images) > 0:
                print("=" * 15)
                print("WARNING! More than one image node found in material for " + obj_name + ". Using " + str(texture_images[0]))
                print("=" * 15)

            # Save that texture
            image = texture_images[0]
            image.alpha_mode = 'STRAIGHT'
            image.filepath_raw = self.proteinvr_output_dir + obj.name + "_animated.png"
            image.file_format = 'PNG'
            image.save()

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
            
        json.dump(frame_file_names, open(self.frame_dir + "filenames.json",'w'))
        json.dump({
            "regular": reg_file_size,
            "small": small_file_size
        }, open(self.frame_dir + "filesizes.json",'w'))

    def _step_8_make_proteinvr_clickable_meshes(self):
        """
        Identify the meshes marked as clickable. Make and save simple OBJ
        files that encompass those objects. Better to click on those simple
        objects that the complex original meshes.
        """

        # Now go through visible objects and get encompassing spheres
        for obj in bpy.data.objects:
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
            bpy.ops.object.select_all(action='DESELECT')
            obj.select = True
            bpy.context.scene.objects.active = obj

            if obj.type == 'MESH':
                filepath = self.proteinvr_output_dir + obj.name.replace("ProteinVR_tmp_", "proteinvr_clickable_") + ".obj"
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
                self.extra_data["clickableFiles"].append(os.path.basename(filepath))
            
            # Remove the proteinvr_clickable mesh now that it's saved
            bpy.ops.object.delete()

    def execute(self, context):
        """
        Runs when button pressed.

        :param bpy_types.Context context: The context.

        :returns: A dictionary indicating that the button has finished.
        :rtype: :class:`???`
        """

        if self._step_0_existing_files_check_ok_and_copy() == False:
            return {'FINISHED'}

        debug = False

        self._step_1_initialize_variables()
        self._step_2_get_camerea_positions()
        self._step_3_add_animated_objects_to_mesh_list_and_store_animation_data()

        if len(glob.glob(self.proteinvr_output_dir + "frames/*.png")) == 0:
            self._step_4_render_static_frames(debug)
        self._step_5_render_background_image()
        self._step_6_save_meshed_objects()
        self._step_7_save_filenames_and_filesizes()
        self._step_8_make_proteinvr_clickable_meshes()

        json.dump(
            self.extra_data, 
            open(self.proteinvr_output_dir + "data.json", 'w')
        )

        print(self.extra_data)

        return {'FINISHED'}
