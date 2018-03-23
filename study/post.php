<html>
<head>
<title>Perception of Data Quality Issues in Viusualizations</title>
<link rel="stylesheet" type="text/css" href="./src/style.css" />
<script src="./src/config.js"></script>
<script src="https://d3js.org/d3.v4.min.js"></script>
</head>
<body>
<?php
// Write all of our demographics information to demo.csv
// Again, DO NOT commit demo.csv to a public repo. It might contain TurkIDs, and by default contains IPs (as a backup if the Turk ID fails to link).
// I recommend replacing the ID column with
// DO make sure that the server can write to demo.csv

$path = 'data/demo.csv';
if(true || is_writable($path)){
  $file = fopen($path,'a') or die ("Cannot open $path");

  if(filesize($path)==0){
    //Make the header if we're the first entry
    $header = "timestamp,experiment,id,ip,gender,age,education,experience,comments".PHP_EOL;
    if(fwrite($file,$header) === FALSE){
      echo "Cannot write to $path";
      exit;
    }
    //echo "Wrote header $header to $path";
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
  echo "<p>You are now finished with this experiment. Thank you for your participation.</p>";
  //echo "wrote $writestr to $path";

  fclose($file);
}
else{
  echo "$path is not writable";
  exit;
}
?>
  <p>If you have any further questions, consult the <a href="consent.html" target="_blank">consent form.</a></p>
  <p>If you have issues submitting, the Prolific completion code for this survey is <b><span id="prolificCode"></span></b> <button onclick="copyText()" type="button">Copy</button>.</p>

  <p><a href="" id="prolificLink" target="_blank"><button type="button">Complete Task</button></a>
</body>
<script>
d3.select("#prolificCode").html(prolific_code);
d3.select("#prolificLink").attr("href",prolific_URL);

function copyText(){
  var text = d3.select("#prolificCode").node();
  if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select().createTextRange();
      document.execCommand("copy");

  } else if (window.getSelection) {
      var range = document.createRange();
       range.selectNode(text);
       window.getSelection().addRange(range);
       document.execCommand("copy");
  }
}
</script>
</html>
