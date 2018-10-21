<?php
		// proxy.php
		//Author: Tony Jefferson
		//This is a simple and VERY insecure proxy server
		//This takes a url, then reaches out to it to pull down data and send it back to the requesting client
		ini_set("memory_limit",-1);
		if(array_key_exists('filename',$_REQUEST)){
			//$_REQUEST is an associative array built into PHP that contains the web request
			//This will have all of the values from the request and information about the request
        	$fileName =$_REQUEST['filename'];
        } else {
        	echo "<strong>Need a <em>filename</em> to fetch!</strong>";
			//This shuts down the current php script
        	exit(); //You can also call die() - according to the PHP spec they are identical
        }
        
        // get the contents from the file using the file_get_contents() function
		// This can be a url or a local file. PHP does not care which it is
		$fileData = file_get_contents($fileName);
     	
     	// send a content-type header for the response so that the client browser will understand what is coming back
		header("content-type: application/javascript");
        // echo the content from the file or url
    	echo $fileData;
?>