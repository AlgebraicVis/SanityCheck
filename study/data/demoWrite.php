<?php
// Write all of our demographics information to demo.csv
// Again, DO NOT commit demo.csv to a public repo. It might contain TurkIDs, and by default contains IPs (as a backup if the Turk ID fails to link).
// I recommend replacing the ID column with
// DO make sure that the server can write to demo.csv

$path = 'demo.csv';
if(is_writable($path)){
  if(!$file = fopen('demo.csv','w')){
    echo "Cannot open $path";
    exit;
  }

  if(filesize($path)==0){
    //Make the header if we're the first entry
    $header = "timestamp,experiment,id,ip,gender,age,education,experience,comments".PHP_EOL;
    if(fwrite($file,$header) === FALSE){
      echo "Cannot write to $path";
      exit;
    }
    echo "Wrote header $header to $path";
  }

  $id = $_POST['id'];
  $experiment = $_POST['experiment'];
  $gender = $_POST['gender'];
  $age = $_POST['age'];
  $education = $_POST['education'];
  $experience = $_POST['experience'];
  $comments = $_POST['comments'];
  $comments = str_replace(",","_",$comments);
  $time = date('c');
  $ip = $_SERVER['REMOTE_ADDR'];
  if(!$id || $id==""){
    $id = $ip;
  }

  $writestr = "$time,$experiment,$id,$ip,$gender,$age,$education,$experience,$comments";
  //echo $writestr;
  if (fwrite($file,$writestr.PHP_EOL) === FALSE) {
    echo "Cannot write to $path";
    exit;
  }

  echo "wrote $writestr to $path";

  fclose($file);
}
else{
  echo "$path is not writable";
}
?>
