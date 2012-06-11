<?php
/* 错误信息 */
define("PARAMS_ERROR", "invalid http params");
define("PARAMS_OK", "ok");
define("TOO_BIG", "file too big");
define("OTHER_ERR", "unknown error");
define("GOOD_FILE", "ok");
define("UPLOAD_OK", "ok");

class Upload {

	public function __construct() {
		/* 配置文件 */
		$configFile = dirname(__FILE__) . "/config.ini";
		$config = @parse_ini_file($configFile, true);
		$this->limits = $config["upload_limit"];
		$this->paths = $config["path"];
		$this->dir_required = $config["env"]["ignore_parent_dir"] != true;
	}
	
	/**
	 * 解析http请求参数
	 */
	private function parseParams(){
		if(!isset($_POST["filename"]) || !isset($_POST["filepath"]) || !isset($_POST["target"])){
			return PARAMS_ERROR;
		}
		$this->filename = urldecode($_POST["filename"]);
		$this->filepath = urldecode($_POST["filepath"]);
		$this->target = urldecode($_POST["target"]);
		$this->root = $this->paths[$this->target];
		$this->overwrite = $this->target == "test_home";
		if(!$this->root){
			return PARAMS_ERROR;
		}
		if($this->filename && $this->filepath && $this->target){
			return PARAMS_OK;
		}
		return PARAMS_ERROR;
	}
	/**
	 * 上传
	 */
	public function doUpload() {

		$paramsResult = $this->parseParams();

		if(PARAMS_OK != $paramsResult) return array("code" => "500", "msgs" => $paramsResult);

		$this->getFileInfo();

		$checkResult = $this->checkFile();

		if(GOOD_FILE != $checkResult)	return array("code" => "500", "msgs" => $checkResult);
		
		$file = $this->getSavePath();
		
		if($file == -1){
			return array("code" => 500, "msgs" => "parent directory is required " . dirname($file));
		}else if(file_exists($file) && !$this->overwrite){
			return array("code" => 500, "msgs" => "file cannot be overwrite: " . $file);
		}else if(!is_writable(dirname($file))){
			return array("code" => 500, "msgs" => "Write permission is required: ". $file);
		}else{
			$res = move_uploaded_file($this->fileTemp, $file);
			if($res){
				return array("code" => 200, "msgs" => $file);
			}else{
				return array("code" => 500, "msgs" => "error occur while save file");
			}
		}
	}
	
	/**
	 * 保存路径
	 */
	private function getSavePath(){
		$dir = $this->filepath;
		if (substr($dir, 0, 1) != '/') $dir = '/' . $dir;
		if (substr($dir, -1, 1) != '/') $dir .= '/';

		$file = $this->root . $dir . $this->filename;

		$parent_dir = dirname($file);

		if($this->dir_required == true){
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
	}


	/**
	 * 检测文件是否合法
	 */
	private function checkFile() {
		// 文件类型
		if(0 >= $this->fileSize)
			return OTHER_ERR;

		if(UPLOAD_OK != $this->fileError)
			return OTHER_ERR;

		if(isset($this->limits) && isset($this->limits["max_size"]) && ($maxSize = (int)$this->limits["max_size"]))
			if($maxSize < (int)$this->fileSize)
				return TOO_BIG;
		return GOOD_FILE;
	}

	/**
	 * 获取上传文件信息
	 */
	private function getFileInfo() {
		if(! isset($_FILES["file"]) || empty($_FILES["file"]))
			return;
		$fileInfo = $_FILES["file"];
		$this->fileName = $fileInfo["name"];
		$this->fileType = $fileInfo["type"];
		$this->fileTemp = $fileInfo["tmp_name"];
		$this->fileError = $fileInfo["error"];
		$this->fileSize = $fileInfo["size"];
	}
}

/**
 * entry point
 */
$uploadHandler = new Upload();
$res = $uploadHandler->doUpload();
echo json_encode($res);