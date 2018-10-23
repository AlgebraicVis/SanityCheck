var tableauGray;

var good,bad,kdeResults,dotResults,histResults;

var labels = ["Visualizations with A Priori Parameters",
"Closest Visualizations (Pixel Color Change)",
"Furthest Visualizations (Pixel Color Change)"
];

var ranSimulation = false;

function setup(){
  createCanvas(850,750);
  background(255);
  tableauGray = color("#333");
  textFont("Futura",24);
  textAlign(CENTER);
  good = nNormal(100,0.7,0.15);
  bad = good.slice();
  mode = 0;
  drawPair(good,bad);
}

function simulate(){
  document.getElementById("simBtn").disabled = "disabled";
  document.getElementById("simBtn").value = "Running...";
  setTimeout(function(){runSimulation()},50);
}

function resample(){
  good = nNormal(100,0.7,0.15);
  createBad();
  ranSimulation = false;
  document.getElementById("simBtn").disabled = null;
  drawPair(good,bad);
}

function updateLabels(){
  var noiseVal = +document.getElementById("noiseVal").value;
  var outlierVal = +document.getElementById("outlierVal").value;
  var biasVal = +document.getElementById("biasVal").value;
  var modeVal = +document.getElementById("modeVal").value;

  document.getElementById("noiseLabel").innerHTML = noiseVal;
  document.getElementById("outlierLabel").innerHTML = outlierVal;
  document.getElementById("biasLabel").innerHTML = biasVal;
  document.getElementById("modeLabel").innerHTML = modeVal;

  createBad();
}

function createBad(){
  var noiseVal = +document.getElementById("noiseVal").value;
  var outlierVal = +document.getElementById("outlierVal").value;
  var biasVal = +document.getElementById("biasVal").value;
  var modeVal = +document.getElementById("modeVal").value;
  bad = addNoise(addOutlier(addBias(addMode(good,modeVal),biasVal),outlierVal),noiseVal);
  ranSimulation = false;
  document.getElementById("simBtn").disabled = null;
  drawPair(good,bad);
}

async function runSimulation(){
  kdeResults = await parameterSweep(good,bad,"kde");
  dotResults = await parameterSweep(good,bad,"dot");
  histResults = await parameterSweep(good,bad,"histogram");
  document.getElementById("simBtn").disabled = "disabled";
  document.getElementById("simBtn").value = "Simulate";
  mode = 1;
  drawPair(good,bad,labels[mode]);
  ranSimulation = true;
}

function mouseClicked(){
  if(ranSimulation){
    mode = (mode+1) % 3;
    drawPair(good,bad,labels[mode]);
  }
}

function drawPair(good,bad){
  var sigma,bins,markSize,markOpacity;

  switch(mode){


      case 1:
        sigma = kdeResults.worst.bandwidth;
        bins = histResults.worst.bin;
        markSize = dotResults.worst.markSize;
        markOpacity = dotResults.worst.alpha;
      break;

      case 2:
        sigma = kdeResults.best.bandwidth;
        bins = histResults.best.bin;
        markSize = dotResults.best.markSize;
        markOpacity = dotResults.best.alpha;
      break;

      case 0:
      default:
        sigma = min(bandwidthEstimate(good), bandwidthEstimate(bad));
        bins = max(binEstimate(good),binEstimate(bad));
        markSize = 25;
        markOpacity = 0.1;
      break;

  }

  background(255);
  noStroke();

  text(labels[mode], 400,50);
  text("Distribution", 200, 100);
  text("Distribution + Flaw(s)", 600, 100);
  //wilkinsonDotPlot(good,0,0,350,175);
  //wilkinsonDotPlot(bad,400,0,350,175);

  histogram(good,0,150,350,175,bins);
  histogram(bad,400,150,350,175,bins);

  dotplot(good,0,450,350,25,markSize,markOpacity,false);
  dotplot(bad,400,450,350,25,markSize,markOpacity,false);

  kdeplot(good,0,550,350,175,sigma);
  kdeplot(bad,400,550,350,175,sigma);
}

function draw(){

}

function parameterSweep(good,bad,visType){
  //I've got a good distribution, and a bad one.
  //What's the closest visualization I can make, in image space?

  var results = [];
  var diff,minDiff,maxDiff,best,worst;
  var first = true;
  switch(visType){
    case "kde":
    //valid bandwidths
    var sigmas = dl.range(0.01,0.26,0.01);
    for(var sigma of sigmas){
      background(255);
      kdeplot(good,0,0,300,50,sigma);
      kdeplot(bad,0,50,300,50,sigma);
      diff = imgDiff(0,0,0,50,300,50);
      var obj = {"bandwidth": sigma, "diff": diff};
      if(first){
        first = false;
        minDiff = diff;
        maxDiff = diff;
        best = obj;
        worst = obj;
      }
      if(diff<=minDiff){
        minDiff = diff;
        worst = obj;
      }
      if(diff>=maxDiff){
        maxDiff = diff;
        best = obj;
      }
      results.push(obj);
    }
    break;

    case "histogram":
    var bins = dl.range(5,51);
    for(var bin of bins){
      background(255);
      histogram(good,0,0,300,50,bin);
      histogram(bad,0,50,300,50,bin);
      diff = imgDiff(0,0,0,50,300,50);
      var obj = {"bin": bin, "diff": diff};
      if(first){
        first = false;
        minDiff = diff;
        maxDiff = diff;
        best = obj;
        worst = obj;
      }
      if(diff<=minDiff){
        minDiff = diff;
        worst = obj;
      }
      if(diff>=maxDiff){
        maxDiff = diff;
        best = obj;
      }
      results.push(obj);
    }
    break;

    case "dot":
    default:
    //valid mark sizes
    var ms = dl.range(10,26,1);
    //valid opacities
    var as = dl.range(0.05,1.05,0.05);
    for(var m of ms){
      for(var a of as){
        background(255);
        dotplot(good,0,0,300,50,m,a,false);
        dotplot(bad,0,50,300,50,m,a,false);
        diff = imgDiff(0,0,0,50,300,50);
        var obj = {"alpha": a, "markSize": m, "diff": diff};
        if(first){
          first = false;
          minDiff = diff;
          maxDiff = diff;
          best = obj;
          worst = obj;
        }
        if(diff<=minDiff){
          minDiff = diff;
          worst = obj;
        }
        if(diff>=maxDiff){
          maxDiff = diff;
          best = obj;
        }
        results.push(obj);
      }
    }
    break;
  }

  best.label = "best";
  worst.label = "worst";
  results.worst = worst;
  results.best = best;
  console.log(best);
  console.log(worst);
  return results;
}


function bandwidthEstimate(dist) {
  var sigma = dl.stdev(dist);

  //something suitably nice when we've only got one value
  if(sigma == 0){
    sigma = 1;
  }

  var n = dist.length;
  var silverman =  Math.pow((4 * Math.pow(sigma, 5) / (3 * n)), 0.2);
  return silverman;
}


//How many bins in our histogram?

function binEstimate(dist, rule){
  var numBins;
  var ext, range, countD, n, qs, iqr, binSize;

  switch(rule){
    case "WILKINSON":
    ext = dl.extent(dist);
    range = Math.abs(ext[1] - ext[0]);
    countD = dl.count.distinct(dist);
    numBins = range / (3 + Math.log2(countD) * Math.log2(countD) );
    break;

    case "FREEDMAN-DIACONIS":
    n = dist.length;
    qs = dl.quartile(dist);
    iqr = qs[2] - qs[0];
    binSize = 2 * ( iqr / Math.pow(n, 1/3));
    ext = dl.extent(dist);
    range = Math.abs(ext[1] - ext[0]);
    numBins = range / binSize;
    break;

    case "SQUAREROOT":
    n = dist.length;
    numBins = Math.sqrt(n);
    break;

    case "STURGES":
    default:
    n = dist.length;
    numBins = Math.ceil(Math.log2(n))+1;
    break;
  }

  return numBins
}

//Dot Plot Sweep

function dotPlotBin(data,w,markSize) {
  data = data.sort();
  var x = function(pos){
    return map(pos,0,1,0,w);
  }
  var bins = [];
  var curx = x(0);
  var curIndex = -1;
  var dX;
  for(var i = 0;i<data.length;i++){
    dX = x(data[i]);
    if(i==0 || dX>curx+markSize){
      curIndex++;
      bins[curIndex] = {"value": data[i], "count": 1, "sum" : data[i]};
    }
    else{
      bins[curIndex].count++;
      bins[curIndex].sum+= data[i];
      bins[curIndex].value = bins[curIndex].sum / bins[curIndex].count;
    }
    curx = x(bins[curIndex].value);
  }
  return bins;
}

/*
Distance Functions
*/

//Boolean Distance
function bDiff(color1, color2){
  var c1 = d3.rgb(color1);
  var c2 = d3.rgb(color2);

  return c1.r==c2.r && c1.g==c2.g && c1.b==c2.b && c1.opacity==c2.opacity ? 0 : 1;
}

//Euclidean distance in CIELab colorspace
function cDiff(color1, color2){
  var c1 = d3.lab(color1);
  var c2 = d3.lab(color2);
  return sqrt( sq(c1.l - c2.l) + sq(c1.a - c2.a) + sq(c1.b - c2.b));
}

function imgDiff(x1, x2, y1, y2, w, h){
  loadPixels();
  var d = pixelDensity();
  var sumDiff = 0;
  var n = w * h;
  var i1, i2, c1 ,c2;

  var image1 = get(x1, y1, w, h);
  image1.loadPixels();
  var image2 = get(x2, y2, w, h);
  image2.loadPixels();
  i1 = image1.pixels;
  i2 = image2.pixels;
  for(var i = 0;i<i1.length;i+=4){
    c1 = d3.rgb(i1[i], i1[i+1], i1[i+2], i1[i+3] / 255);
    c2 = d3.rgb(i2[i], i2[i+1], i2[i+2], i2[i+3] / 255);
    sumDiff+= cDiff(c1,c2);
  }
  return sumDiff / (i1.length / 4);
}

/*
Generators
*/

function nNormal(n, m, s){
  var dist = [];
  var val;
  for(var i = 0;i < n;i++){
    val = constrain(randomGaussian(m, s), 0,1);
    dist.push(val);
  }
  return dist;
}

function gaussian(mu, sigma) {
  var gauss = {};
  gauss.mu = mu;
  gauss.sigma = sigma;
  gauss.pdf = function(x){
    var exp = Math.exp(Math.pow(x - gauss.mu, 2) / (-2 * Math.pow(gauss.sigma, 2)));
    return (1 / (gauss.sigma * Math.sqrt(2 * Math.PI))) * exp;
  };
  return gauss;
}

function epanechinikov(mu,support){
    var epa = {};
    epa.mu = mu;
    epa.support = support;
    epa.pdf = function(x){
        var dist = x - epa.mu;
        if(Math.avs(dist) > epa.support){
          return 0;
        }
        else{
          var u = dist/epa.support;
          return 0.75 * (1 - (u * u));
        }
    }
    return epa;
}


function kde(data, bandwidth){
  var density = {};
  density.kernels = [];
  for(var i = 0;i < data.length;i++){
    density.kernels.push(gaussian(data[i], bandwidth));
  }
  density.pdf = function(x){
    var val = 0;
    for(var i = 0;i<density.kernels.length;i++){
      val+= density.kernels[i].pdf(x);
    }
    return val;
  }
  return density;
}

function saveDistribution(distribution,filename){
  var data = new p5.Table();
  data.addColumn("id");
  data.addColumn("value");

  var row;
  for(var i = 0;i<distribution.length;i++){
    row = data.addRow();
    row.setNum("id",i);
    row.setNum("value",distribution[i]);
  }
  //console.log(data);
  saveTable(data,filename);
}

/*
Alphas
Data modifications
*/

function addBias(dist,bias){
  //add mean bias
  var distribution = dist.slice();
  for(var i = 0;i< distribution.length;i++){
    distribution[i] = constrain(distribution[i]+bias,0,1);
  }
  return distribution;
}

function addOutlier(dist, numOutliers){
  //add some outliers
  var distribution = dist.slice();
  var qs = dl.quartile(distribution);
  var iqr = qs[2]-qs[0];

  var upperF = min(qs[2] + ( 1.5 * iqr),1);
  var lowerF = max(qs[0] - (1.5 * iqr),0);

  var highOutlier = (1-upperF) > (lowerF-0);
  //outlier if more than 1.5iqr above q[2], or more than 1.5iqr below q[0]
  for(var i = 0;i<numOutliers;i++){
    if(highOutlier){
      distribution.push(random(upperF, 1));
    }
    else{
      distribution.push(random(0, lowerF));
    }
  }
  return distribution;
}

function addMode(dist, modeSize,modeVal){
  //add a random mode somewhere in the iqr.
  var distribution = dist.slice();
  var qs = dl.quartile(distribution);
  var mode = modeVal ? modeVal : random(qs[0], qs[2]);
  for(var i = 0;i < modeSize;i++){
    distribution.push(mode);
  }
  return distribution;
}

function addNoise(dist, bandwidth){
  //add per element gaussian noise
  var distribution = dist.slice();
  if(bandwidth==0){
    return distribution;
  }
  for(var i = 0;i < distribution.length;i++){
    distribution[i] = constrain(distribution[i] + randomGaussian(0, bandwidth), 0, 1);
  }
  return distribution;
}

function removeRange(dist,minVal,maxVal){
  //remove all values within a certain range
  return dist.filter(function(x){ return (x<minVal || x >maxVal);});
}

function removeRandom(dist,n){
  //remove n random values
  var distribution = dist.slice();
  var index;
  for(var i = 0;i<n && distribution.length > 0; i++){
      index = Math.floor(Math.random() * distribution.length);
      distribution.splice(index,1);
  }
  return distribution;
}

/*
Vizzes
*/

function stripplot(data,x,y,w,h,markSize,opacity){
  var posX;

  push();
  noStroke();
  fill(red(tableauGray),green(tableauGray),blue(tableauGray),opacity*255);
  translate(x,y);
  for(var i = 0;i<data.length;i++){
    posX = map(data[i],0,1,0,w);
    rect(posX - (markSize / 2 ),0,markSize,markSize);
  }
  pop();
}

function dotplot(data,x,y,w,h,markSize,opacity,empty){
  var posX;
  var dotC = color(red(tableauGray),green(tableauGray),blue(tableauGray),opacity*255);
  push();
  noStroke();
  if(empty){
    fill(0,0);
    stroke(dotC);
    strokeWeight(3);
  }
  else{
    fill(dotC);
    noStroke();
  }
  translate(x,y);
  for(var i = 0;i<data.length;i++){
    posX = map(data[i],0,1,0,w);
    ellipse(posX, h/2, markSize,markSize);
  }
  pop();
}

function kdeplot(data,x,y,w,h,bandwidth){
  var density = kde(data,bandwidth);
  var epsilon = 0.01;
  var xs = dl.range(0,1,epsilon)
  var sX,sY,eX,eY;
  var deltaX = map(epsilon,0,1,0,w);
  var ys = xs.map(function(x){ return density.pdf(x);});
  var yMax = dl.max(ys);
  push();
  noStroke();
  fill(tableauGray);
  translate(x,y);

  beginShape();
  vertex(0,h);
  for(var i = 0; i<xs.length; i++){
    sX = map(xs[i],0,1,0,w);
    sY = map(ys[i],0,yMax,h,0);
    vertex(sX,sY);
  }
  vertex(sX,h);
  endShape(CLOSE);
  pop();
}

function histogram(data,x,y,w,h,numBins){
      var bins = dl.histogram(data,{min: 0, max: 1, step: 1/numBins});
      var dx = w / bins.length;
      var dy = h / dl.max(bins,"count");
      push();
      noStroke();
      fill(tableauGray);
      translate(x,y);
      var curx = 0;
      beginShape();
      vertex(0,h);
      for(var i = 0;i<bins.length;i++){
        vertex(curx,h-(bins[i].count*dy));
        vertex(curx+dx,h-(bins[i].count*dy));
        curx+=dx;
      }
      vertex(curx,h);
      endShape(CLOSE);
      pop();
}

function wilkinsonDotPlot(data,x,y,w,h,markSize){
    var bins;

    //make mark size "the biggest that will fit in our h"
    //if not provided
    if(!markSize){
      var markSize = 1;
      bins = dotPlotBin(data,w,markSize);
      while(dl.max(bins,"count")*markSize<h){
        markSize++;
        bins = dotPlotBin(data,w,markSize);
      }
      markSize = markSize>=2 ?  markSize-1 : 1;
      bins = dotPlotBin(data,w,markSize);
    }
    else{
      bins = dotPlotBin(data,w,markSize);
    }
    var curx;
    var cury;
    push();
    noStroke();
    fill(tableauGray);
    translate(x,y);
    var x = function(pos){
      return map(pos,0,1,0,w);
    }
    for(var i = 0;i<bins.length;i++){
      curx = x(bins[i].value);
      cury = h-markSize/2;
      for(var j = 0;j<bins[i].count;j++){
        ellipse(curx,cury,markSize,markSize);
        cury-=markSize;
      }
    }
    pop();
}
