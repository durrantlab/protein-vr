import parent from "./ObjectParent";
import Core from "../Core/Core";
import CameraChar from "../CameraChar"; 

declare var BABYLON;

class Ground extends parent {
    /**
    The Ground namespace is where all the functions and variables related
    to the ground are stored.
    */

    /** 
    A variable where the ground mesh is stored. 
    */
    static groundMesh: any;

    public objectMatch(m: any, json: any): boolean {
        /**
        This function checks a mesh to see if it is marked as this type of
        mesh. You can mark a mesh as this type of mesh using the VR Blender
        plugin.

        :param any m: The mesh.
        :param any json:  The associated json file, which contains the
                   information about whether or not the mesh is
                   marked as this type of mesh.

        :returns: Whether or not the provided mesh matches the object
                  described in the json.
                  
        :rtype: :any:`bool`
        */

        if (json.g === "1") {
            // It's the ground
            m.checkCollisions = false;  // No need to check for collisions
                                        // with the ground because you
                                        // test for collisions manually by
                                        // casting a ray.
            m.isPickable = true;  // Make the ground pickable. That's how
                                    // the manual collision checking works.
            Ground.groundMesh = m;  // Set the ground mesh to be
                                            // this one.
            return true;
        }

        return false;
    }

    public objectNoMatch(m: any, json: any): void {
        /**
        This function checks a mesh to see if it is NOT marked as this type of
        mesh.

        :param any m: The mesh.
        :param any json: The associated json file, which contains the
                   information about whether or not the mesh is
                   marked as this type of mesh.
        */

        m.isPickable = false;  // Everything that isn't the ground
                                // isn't pickable.
    }

    public static ensureCharAboveGround(): void {
        /**
        Make sure the character (really the camera) is always above the
        ground.
        */

        // Get a point in 3D space that is three feet above the camera.
        let pointAboveCamera = CameraChar.camera.position.add(
            new BABYLON.Vector3(0, 3, 0)
        );

        // Cast a ray straight down from that point, and get the point
        // where that ray intersects with the ground.
        let groundPt = Core.scene.pickWithRay(
            new BABYLON.Ray(
                pointAboveCamera, new BABYLON.Vector3(0, -0.1, 0)
            )
        ).pickedPoint;

        // Get a point in 3D space that is three feet above the camera.
        let pointBelowCamera = CameraChar.camera.position.subtract(
            new BABYLON.Vector3(0, 3, 0)
        );

        // If there is no such point, check above the camera. Maybe the
        // camera has accidentally fallen through the ground.
        if (groundPt === null) {

            // Cast a ray straight up from that point, and get the point
            // where that ray intersects with the ground.
            let groundPt = Core.scene.pickWithRay(
                new BABYLON.Ray(
                    pointBelowCamera,
                    new BABYLON.Vector3(0, 0.1, 0)
                )
            ).pickedPoint;
        }

        // If the ground point exists, you can check if the character is
        // above or below that point.
        if (groundPt !== null) {

            // Get the y value (up-down axis) of the ground.
            let groundAltitude = groundPt.y;

            // Get the y value (up-down axis) of the character's feet.
            let feetAltitude = CameraChar.feetAltitude();

            // If the ground is aboe the feet, you've got a problem.
            if (groundAltitude > feetAltitude) {
                // Move the camera so it's on top of the ground.
                let delta = feetAltitude - groundAltitude;
                CameraChar.camera.position.y =
                    CameraChar.camera.position.y - delta;
            }
        } else {
            // If that point still doesn't exist, the charamter/camera
            // must have fallen off the edge of some cliff.
        }
    }
}

export default Ground;