bl_info = {
    "name": "CRC Multi Bake",
    "author": "Jacob Durrant",
    "version": (1, 0, 0),
    "blender": (2, 79, 0),
    "location": "View3D",
    "description": "Bakes all images in the scene on the CRC.",
    "category": "Development",
}

import bpy
import bmesh
import os
import random
import tempfile
import subprocess

def copy_from_crc(remote_path):
    scene = bpy.context.scene
    crc_addr = scene.crc_multi_bake_remote_addr
    os.system("scp -rC " + crc_addr + ":" + remote_path + " " + bpy.path.abspath("//") + os.sep)

def copy_to_crc(local_path, remote_path):
    scene = bpy.context.scene
    crc_addr = scene.crc_multi_bake_remote_addr
    os.system("scp -rC " + local_path + " " + crc_addr + ":" + remote_path)

def run_on_crc(cmd):
    print("Runing on CRC:")
    print("    " + cmd)

    scene = bpy.context.scene
    crc_addr = scene.crc_multi_bake_remote_addr
    return subprocess.check_output(
        "ssh " + crc_addr + " '" + cmd + "'", shell=True
    ).decode('utf-8')

class BakeAllObjs(bpy.types.Operator):
    """Tooltip"""
    bl_idname = "render.bake_all_objs"
    bl_label = "Bake All Objects"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        self.setup()
        return {'FINISHED'}

    def remove_old_bake_tex_nodes(self):
        for obj in bpy.data.objects:
            for slot in obj.material_slots:
                mat = slot.material
                mat.use_nodes = True
                matnodes = mat.node_tree.nodes
                for node in matnodes:
                    if node.name.startswith("bake_tex_node_"):
                        matnodes.remove(node)

    def setup(self):
        scene = bpy.context.scene

        # Create temp directory
        tmpdir = tempfile.mkdtemp() + os.sep
        drnm = os.path.basename(bpy.data.filepath) if bpy.data.filepath != "" else str(random.randint(0, 10000000))
        tmpdir2 = tmpdir + drnm + os.sep
        os.mkdir(tmpdir2)

        # Save the blend file to that directory, packing everything.
        # Make sure internal data will be saved with blend file
        if bpy.data.use_autopack == False:
            bpy.ops.file.autopack_toggle()
        bpy.ops.wm.save_as_mainfile(
            filepath=tmpdir2 + "scene.blend",
            check_existing=False, copy=True
        )

        # Copy the support files.
        os.system("cp " + os.path.dirname(__file__) + os.sep + "support" + os.sep + "* " + tmpdir2)

        # Make a bakeit.sh file.
        with open(tmpdir2 + "bakeit.sh", "w") as f:
            f.write("""mkdir -p output_imgs
                       /ihome/jdurrant/durrantj/programs/blender-2.79-linux-glibc219-x86_64/blender scene.blend --background --python bake_all.py -- {crc_multi_bakes_per_mesh} {crc_multi_bake_dimen} {crc_multi_bake_samples}
            """.format(
                crc_multi_bakes_per_mesh=scene.crc_multi_bakes_per_mesh,
                crc_multi_bake_dimen=scene.crc_multi_bake_dimen,
                crc_multi_bake_samples=scene.crc_multi_bake_samples
            ))

        # Make a combineit.sh file.
        with open(tmpdir2 + "combineit.sh", "w") as f:
            f.write("""mkdir -p output_imgs
                       rm ./output_imgs/*.png
                       rm ./output_imgs/*.jpg
                       ~/programs/anaconda2/bin/python combine_renders.py
                       export blendname=`basename $(pwd)`
                       cd output_imgs
                       cp ../created_baked_blend.py ./

                       # Copy file with UVs
                       cp ../scene.with_uvs.blend ${o}blendname{c}.baked.blend

                       # Rename and png files with .bake_target.png in it.
                       #ls *.bake_target.png > t
                       #cat t | sed "s/.bake_target.png/.png/g" > t2
                       #paste t t2 | awk '{o}print "mv " $0{c}' | bash
                       #rm t t2

                       # Bring in baked textures and save over file.
                       /ihome/jdurrant/durrantj/programs/blender-2.79-linux-glibc219-x86_64/blender ${o}blendname{c}.baked.blend --background --python created_baked_blend.py
                       rm *.blend1 created_baked_blend.py
            """.format(
                o="{",
                c="}"
            ))

        # Make a submitall.sh file.
        with open(tmpdir2 + "submitall.sh", "w") as f:
            torun = "cd ~/multi-bake/" + drnm + os.sep + "; "

            for i in range(scene.crc_multi_bakes_num_nodes):
                torun = torun + "jid" + str(i) + "=$(sbatch submit-" + scene.crc_multi_bake_queue + ".sh | awk '{print $4}'); "

            torun = torun + "sbatch --dependency=afterany:" + ":".join(
                ["$jid" + str(i) for i in range(scene.crc_multi_bakes_num_nodes)]
            ) + " submit-cleanup-" + scene.crc_multi_bake_queue + ".sh"
            f.write(torun)

        # Make a zip file
        zipname = drnm + ".zip"
        os.system("cd " + tmpdir + "; zip -r " + zipname + " " + drnm)

        # Make directory on crc.
        run_on_crc("mkdir -p ~/multi-bake/")
        copy_to_crc(tmpdir + zipname, "~/multi-bake/")
        run_on_crc("cd ~/multi-bake/; unzip -o " + zipname + "; rm " + zipname)  # -f too?
        run_on_crc("chmod -R a+rwx ~/multi-bake/" + drnm)
        run_on_crc("cd ~/multi-bake/" + drnm + os.sep + "; ./submitall.sh")

        # Remove tmp directory
        # print(tmpdir)
        os.system("rm -r " + tmpdir)

class CompileAllBakes(bpy.types.Operator):
    """Tooltip"""
    bl_idname = "render.compile_all_bakes"
    bl_label = "Compile All Bakes"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        scene = bpy.context.scene
        drnm = os.path.basename(bpy.data.filepath) if bpy.data.filepath != "" else str(random.randint(0, 10000000))
        run_on_crc("cd ~/multi-bake/" + drnm + os.sep + "; sbatch submit-cleanup-" + scene.crc_multi_bake_queue + ".sh")
        return {'FINISHED'}

class DownloadBakedImages(bpy.types.Operator):
    """Tooltip"""
    bl_idname = "render.download_backed_images"
    bl_label = "Download Baked Files"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        scene = bpy.context.scene

        copy_from_crc(
            "~/multi-bake/" + os.path.basename(bpy.data.filepath) + os.sep + "output_imgs" + os.sep + "*"
        )
        return {'FINISHED'}

class CheckProgress(bpy.types.Operator):
    """Tooltip"""
    bl_idname = "render.remote_baking_progress"
    bl_label = "Check Remote Progress"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        scene = bpy.context.scene

        statuses = run_on_crc(
            "bash ~/multi-bake/" + os.path.basename(bpy.data.filepath) + os.sep + "progress.sh"
        ).split("\n")
        statuses = [s.strip().split() for s in statuses if s.strip() != ""]
        msgs = [
            cnt + " node" + ("s" if cnt != "1" else "") + " with status " + status
            for cnt, status in statuses
        ]
        msg = "; ".join(msgs)
        if msg == "":
            msg = "No jobs... (done?)"
        scene.crc_multi_bake_status_str = msg

        return {'FINISHED'}

class ActiveObjSurfArea(bpy.types.Operator):
    """Tooltip"""
    bl_idname = "render.get_active_obj_surf_area"
    bl_label = "Active Object Surface Area"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        scene = bpy.context.scene
        scene.active_obj_surf_area = sum([p.area for p in bpy.context.active_object.data.polygons])
        return {'FINISHED'}

class CRCMultiBake(bpy.types.Panel):
    """Creates a Panel in the scene context of the properties editor"""
    bl_label = "CRC Multi Bake"
    bl_idname = "SCENE_PT_layout"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "render"

    def draw(self, context):
        scene = context.scene

        layout = self.layout
        box = layout.box()
        # row = box.row()
        box.label(text="Remote Settings:", icon="INFO")
        box.prop(scene, "crc_multi_bake_dimen")
        box.prop(scene, "crc_multi_bake_samples")
        box.prop(scene, "crc_multi_bakes_per_mesh")
        box.prop(scene, "crc_multi_bakes_num_nodes")
        box.prop(scene, "crc_multi_bake_remote_addr")
        box.prop(scene, "crc_multi_bake_queue")

        box = layout.box()
        box.label(text="Submit/Retrieve:", icon="INFO")
        row = box.row()
        row.operator("render.bake_all_objs")
        row = box.row()
        row.operator("render.compile_all_bakes")
        row = box.row()
        row.operator("render.download_backed_images")

        box = layout.box()
        box.label(text="Remote Status:", icon="INFO")
        row = box.row()
        row.operator("render.remote_baking_progress")
        # layout.prop(scene, "crc_multi_bake_status_str")
        box.label(text=scene.crc_multi_bake_status_str)

        box = layout.box()
        box.label(text="Mesh Area:", icon="INFO")
        row = box.row()
        row.operator("render.get_active_obj_surf_area")
        row = box.row()
        box.label(text="Area: " + str(scene.active_obj_surf_area))

        box = layout.box()
        box.label(text="Notes:", icon="INFO")
        box.label(text="Different resolution? Put \"d1024\" in name.")
        box.label(text="Skip bake? Put \"no_bake\" in name.")
        box.label(text="Transfer bake? Obj copy ends in \".bake_target\"")
        box.label(text="Keep texture dimens < 2048px")


def register():
    bpy.utils.register_class(CRCMultiBake)
    bpy.utils.register_class(BakeAllObjs)
    bpy.utils.register_class(DownloadBakedImages)
    bpy.utils.register_class(CheckProgress)
    bpy.utils.register_class(CompileAllBakes)
    bpy.utils.register_class(ActiveObjSurfArea)

    bpy.types.Scene.crc_multi_bake_dimen = bpy.props.IntProperty(
        name = "Image Dimension", default=2048,
        description="The number of pixels along the side of a square image.",
    )

    bpy.types.Scene.crc_multi_bake_samples = bpy.props.IntProperty(
        name = "Samples/Bake", default=32,
        description="The number of samples to use when rendering.",
    )

    bpy.types.Scene.crc_multi_bakes_per_mesh = bpy.props.IntProperty(
        name = "Bakes/Mesh/Node", default=5,
        description="The number of backed images to produce per mesh.",
    )

    bpy.types.Scene.crc_multi_bakes_num_nodes = bpy.props.IntProperty(
        name = "Nodes", default=5,
        description="The number of CRC nodes to use.",
    )

    bpy.types.Scene.crc_multi_bake_remote_addr = bpy.props.StringProperty(
        name = "CRC Address", default="durrantj@h2p.crc.pitt.edu",
        description="The CRC remote address.",
    )

    bpy.types.Scene.crc_multi_bake_queue = bpy.props.StringProperty(
        name = "Queue (smp or high-mem)", default="high-mem",
        description="The CRC queue to use.",
    )

    bpy.types.Scene.crc_multi_bake_status_str = bpy.props.StringProperty(
        name = "Status", default="Unknown",
        description="The status of your jobs on the CRC.",
    )

    bpy.types.Scene.active_obj_surf_area = bpy.props.FloatProperty(
        name = "Surface Area", default=0.0,
        description="Surface area of active object.",
    )

def unregister():
    bpy.utils.unregister_class(CRCMultiBake)
    bpy.utils.unregister_class(BakeAllObjs)
    bpy.utils.unregister_class(DownloadBakedImages)
    bpy.utils.unregister_class(CheckProgress)
    bpy.utils.unregister_class(CompileAllBakes)
    bpy.utils.unregister_class(ActiveObjSurfArea)

if __name__ == "__main__":
    register()
