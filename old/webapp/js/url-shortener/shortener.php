<?php
// Gets a shortened version of the url passed via $_GET["url"]
$url = "http://tinyurl.com/api-create.php?url=".$_GET["url"];
echo file_get_contents($url);

?>