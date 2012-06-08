<?php
/**
 * @copyright 
 */
define('CDN_ROOT', '');
if(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
	define('ATT_OS_SLASH', '\\');
}else {
    define('ATT_OS_SLASH', '/');
}

//custom config
$conf = dirname(__FILE__) . ATT_OS_SLASH . 'endpoint.ini';
$config = @parse_ini_file($conf, true);

//default config
$filename = urldecode($_POST["filename"]);
$filepath = urldecode($_POST["filepath"]);
$filecontent = urldecode($_POST["filecontent"]);
$target = isset($_POST["target"]) ? $_POST["target"] : "test_home";

//getinfo
$response = array();
if($_REQUEST["command"] == "getinfo"){
	$response["config"] = $config;
	$response["code"] = 200;
	echo json_encode($response);
	exit();
}

$DEST = (isset($config["path"][$target]) && !empty($config["path"][$target]))
			? $config["path"][$target]
			: $config["path"]["test_home"];


if( $config["env"]["ignore_parent_dir"] == true){
	$DIR_REQUIRED = false;
}else{
	$DIR_REQUIRED = true;
}

function getDest($filepath, $filename, $root, $dir_required){
	$file = $root . $filepath . ATT_OS_SLASH . $filename;
	$parent_dir = dirname($file);

	if($dir_required == true){
		if(!is_dir($parent_dir)){
			return -1;
		}
		return $file;
	}

	$dir_arr = array();
	while(!is_dir($parent_dir)) {
		$dir_arr[] = $parent_dir;
		$parent_dir = dirname($parent_dir);
	}
	$dir_arr = array_reverse($dir_arr);
	foreach($dir_arr as $dir_name) {
		mkdir($dir_name, 0777);
	}
	return $file;
};

if(!$filename || !$filepath){
    $response["code"] = 400;
    $response["error"] = "filename or filepath missing";
}else if ($_FILES["file"]["error"] > 0){
    $response["code"] = 401;
    $response["error"] = $_FILES["file"]["error"];
}else{
	$dest = getDest($filepath, $filename, $DEST, $DIR_REQUIRED);
	
	if($dest == -1){
		$response["code"] = 504;
		$response["error"] = "parent dir is required";
	}else if(file_exists($dest) && $target != "test_home"){
		$response["code"] = 500;
		$response["error"] = "file existed";
	}else if(!is_writable(dirname($dest))){
		$response["code"] = 501;
		$response["error"] = $dest . " cannot be overwrite";
	}else{
		if($filecontent){
			$res = file_put_contents($dest, $filecontent);
		}else if($_FILES["file"]["size"]){
			$res = move_uploaded_file($_FILES["file"]["tmp_name"], $dest);
		}
		if($res){
			$response["code"] = 200;
		}else{
			$response["code"] = 502;
			$response["error"] = "error occur when save file";
		}
	}
}

echo json_encode($response);