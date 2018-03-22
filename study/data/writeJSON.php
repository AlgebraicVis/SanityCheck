<?php

//Will iterate through all the properties of the JSON object we're given in the "answer" field.

//IMPORTANT:
// DO NOT commit the csvs to a public repository, it might contain raw Turk IDs, which are personal and should be obscured.
// I recommend that you replace IDs with per-study integer aliases.

// DO make sure that the csvs are writable.

  $rawAnswer = $_GET['answer'];
  if(!$rawAnswer || $rawAnswer==""){
      echo "No valid data";
      exit;
  }

  $answer = json_decode($rawAnswer,true);
  $cleaned = $_GET['clean'];

  if($answer['id']=="EMPTY"){
    $path = 'test.csv';
  }
  else{
    $path = $answer['id'].'.csv';
  }

  if(is_writable($path)){
    if(!$file = fopen($path,'w')){
      echo "Cannot open $path";
      exit;
    }

    $keys = array_keys($answer);
    if(filesize($path)==0){
      //Make the header if we're the first entry
      $header = "";
      for($i = 0;$i<count($keys)-1;$i++){
        $header.=$keys[$i].',';
      }
      $header.=$keys[count($keys)-1].PHP_EOL;
      if(fwrite($file,$header) === FALSE){
        echo "Cannot write to $path";
        exit;
      }
      echo "Wrote header $header to $path";
    }

    //Write all the values we have.
    $line = "";
    for($i = 0;$i<count($keys)-1;$i++){
      $line.=$answer[$keys[$i]].',';
    }
    $line.=$answer[$keys[$i]].PHP_EOL;

    if(fwrite($file,$line) === FALSE){
      echo "Cannot write to $path";
      exit;
    }
    echo "Wrote $line to $path";
    fclose($file);
  }
  else{
    echo "$path is not writable";
  }

?>
