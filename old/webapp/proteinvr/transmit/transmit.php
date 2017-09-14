<?php

// For debugging
// $student = true;
// if ($student) {
//     $_POST["id"] = "2324234234";
// } else {
//     $_POST = array(
//         "id" => "2324234234",
//         "locx" => "32.5",
//         "locy" => "22.5",
//         "locz" => "35.2",
//         "rotx" => "1.3",  // probably radians.
//         "roty" => "0.3",
//         "rotz" => "0.1"
//     );
// }

// First, check all the .cache files in this directory to see if any are older
// than a day. Basically trash collection.

$files = glob("*.cache");

for ($i = 0; $i < count($files); $i++) {
    $file = $files[$i];
    $file_m_time = filemtime($file);
    $curtime = time();
    $age_in_secs = $curtime - $file_m_time;

    if ($age_in_secs > 24 * 60* 60) {
        unlink($file);
    }
}

// Now do a little validation. The id must be an integer. Let's hash it to
// boot so people can't guess what the file name is on the server (overkill).
if (!(is_numeric($_POST["id"]))) {
    echo '"Ooooopps!" ~ Governor Rick Perry.';
    die();
}
$id = strval(intval($_POST["id"]));
// $id = hash('ripemd160', $id); // needlessly computationally intensive. Just make sure it's an int.
$filename = $id.'.cache';

// Now figure out what kind of call you're looking at a proceed...
if (count($_POST) == 1) {
    // It must be one of the students, because no location and rotation info

    // Make sure file exists.
    if (!(file_exists($filename))) {
        echo '"Ooooopps!" ~ Governor Rick Perry.';
        die();
    }

    // is present. Just return the previously saved JSON.
    echo file_get_contents($filename);

    // Also "touch" the file to update its modification time.
    touch($filename);

    die();
} else {
    // It must be the teacher trying to set the location/rotation.
    // No need to retain the id.
    unset($_POST['id']);

    // Save the $_POST data as json.
    file_put_contents($filename, json_encode($_POST));

    die();
}
