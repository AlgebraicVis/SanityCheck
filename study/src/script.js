/***
Study Parameters
***/

//Populate the trial stimuli, optionally permuting the trials
var makeStimuli = function(permute){
  var stimuli = [];
  //what distribution type the null is generated from
  var distributions = ["uniform","normal","exponential"];
  //what "flaw" is introduced to the null
  var flaws = ["spike","gap","outliers"];
  //how big this flaw is, in terms of points added/removed.
  //we want to make sure all stim have the same number of points, so we
  //have to make up this difference with more/fewer samples from the null
  var flawMagnitude = [10,15,20];
  //viz type
  var vizTypes = ["scatter","histogram","density"];
  //viz parameters
  //kde bandwidth
  //note that silverman's would prefer 0.07 for the gaussian case
  var bandwidths = [0.0175,0.035,0.07];
  //histogram bins
  //note that sturge's rule would give us only 7!
  var bins = [7,14,28];
  //scatterplot opacity
  var opacities = [0.05,0.15,0.3];

  var replicates = 1;
  var stimulis;
  var parameters;

  //currently all blocked effects. We'd potentially want some of these to be random, such
  //as distribution type
  for(dist of distributions){
    for(flaw of flaws){
      for(magnitude of flawMagnitude){
        for(vis of vizTypes){
          switch(vis){
            case "scatter":
              parameters = opacities;
            break;

            case "density":
              parameters = bandwidths;
            break;

            case "histogram":
            default:
              parameters = bins;
            break;
          }
          for(parameter of parameters){
            for(var i = 0;i<replicates;i++){
              stimulis = {};
              stimulis.distribution = dist;
              stimulis.flaw = flaw;
              stimulis.magnitude = magnitude;
              stimulis.vis = vis;
              stimulis.parameter = parameter;
              stimuli.push(stimulis);
            }
          }
        }
      }
    }
  }
  if(permute){
    dl.permute(stimuli);
  }
  return stimuli;
}

var participantData = [];
var rt;
var stimuli = makeStimuli(true);
var questionIndex = 0;

// 20 total vizzes means an alpha of 0.05
var vizRows = 5;
var vizColumns = 4;
var numViz = vizRows*vizColumns;

var vizWidth = 200;
var vizHeight = 100;


//Data values should be in [0,1]
//Our samplers
var bandwidth = 0.15;

//Uniform distribution
var uniform = dl.random.uniform(0.5-bandwidth,0.5+bandwidth);

//Gaussian distribution
//our unconstrained gaussian
var uGaussian = dl.random.normal(0.5,bandwidth);
//clamped to [0,1]
var gaussian = function(){ return constrain(uGaussian());};

//Exponential distribution
//unconstrained exponential
var uExp = function(){
  //Inverse transform sampling
  //cdf = 1 - e^(-λx)
  //x = -(1/λ) * ln(1-cdf)
  //x = -mu * ln(1-cdf)
  //λ= 1/sigma
  var cdf = Math.random();
  return -bandwidth * Math.log(1-cdf);
};
//clamped to [0,1]
var exponential = function(){ return constrain(uExp());};

//How many samples per graph?
var numSamples = 50;
var x = d3.scaleLinear().domain([0,1]).range([0,vizWidth]);

/***
UI Functions
***/

//What happens when the participant clicks the ready button.
// The RT timer starts
// 20 divs are created in the 4x5 grid
// The divs are populated by vizzes, according to the current trial information
// The "Confirm" button becomes enabled.
var ready = function(){
  //You can't "ready" twice.
  d3.select("#readyBtn")
    .style("visibility","hidden")
    .attr("disabled","disabled");

  //Start the clock.
  rt = new Date();

  //Set up our grid of visualizations.

  var i;

  //Make sure the grid is the right size.

  //Our columns need to make room for the borders of our svg elements.
  var margin = 20;
  d3.select("#panel")
    .style("grid-template-columns",function(){
       var l = "";
       for(i = 0;i<vizColumns;i++){
         l+=(vizWidth+margin)+"px ";
       }
       return l.trim();
     })
    .style("grid-template-rows",function(){
       var l = "";
       for(i = 0;i<vizRows;i++){
         l+=(vizHeight+margin)+"px ";
       }
       return l.trim();
     });

  //Add an svg for each viz.
  for(i = 0;i<numViz;i++){
    d3.select("#panel").append("svg")
      .classed("vis",true)
      .style("width",vizWidth)
      .style("height",vizHeight)
      .on("click",select);
  }

  makeVizzes(stimuli[questionIndex]);
};

//Create our data and draw our vizzes, given a setting of IVs
//Need to:
// create data with flaw
// create data without flaws
// make the vizzes
// tell the participant what to look for
var makeVizzes = function(stimulis){
  var data = [];
  var i,j;
  var sampler;

  switch(stimulis.distribution){
    case "exponential":
    sampler = exponential;
    break;

    case "normal":
    sampler = gaussian;
    break;

    case "uniform":
    default:
    sampler = uniform;
    break;
  }

  //the first distribution is the flawed one
  //don't worry, we'll permute later.
  data[0] = [];

  var flawSize = stimulis.magnitude;
  switch(stimulis.flaw){
    case "spike":
    //all non-spike values
    for(j = 0;j<numSamples-flawSize;j++){
      data[0].push(sampler());
    }
    //spike values are a single mode in the iqr somewhere
    var qs = dl.quartile(data[0]);
    var spikeVal = dl.random.uniform(qs[0],qs[2])();
    for(j = 0;j<flawSize;j++){
      data[0].push(spikeVal);
    }
    console.log("spike of "+flawSize+" at "+spikeVal);
    break;

    case "gap":
    //we're going to be removing values, so we need more samples initially
    for(j = 0;j<numSamples+flawSize;j++){
      data[0].push(sampler());
    }
    var qs = dl.quartile(data[0]);
    var gapVal = dl.random.uniform(qs[0],qs[2])();
    //remove the n closest points to the gap value
    var closer = function(a,b){
      if( Math.abs(a-gapVal)>Math.abs(b-gapVal)){
        return -1;
      }
      else if( Math.abs(a-gapVal)<Math.abs(b-gapVal)){
        return 1;
      }
      else{
        return 0;
      }
    }
    data[0] = data[0].sort(closer);
    data[0] = data[0].splice(0,numSamples);
    console.log("gap of "+flawSize+" at "+gapVal);
    break;

    case "outliers":
    default:
    //all non-outlier values
    for(j = 0;j<numSamples-flawSize;j++){
      data[0].push(sampler());
    }
    //outlier values are anything in [0,1] that's outside of
    // q1-1.5iqr or q3+1.5iqr
    var qs = dl.quartile(data[0]);
    var iqr = qs[2]-qs[0];
    var fenceMin = qs[0]-(1.5*iqr);
    var fenceMax = qs[2]+(1.5*iqr);
    //if our fences are out of [0,1], then we can't place outliers there
    //but if BOTH fences are out of [0,1], then just place outliers in whichever of
    //[0,1] is closest to the fence
    //outliers will always be placed outside of just one of the fences
    if(fenceMin<0 && fenceMax>1){
      if(Math.abs(fenceMin)>Math.abs(fenceMax-1)){
        console.log(flawSize+" outliers with value 1");
        for(j = 0;j<flawSize;j++){
          data[0].push(1);
        }
      }
      else{
        console.log(flawSize+" outliers with value 0");
        for(j = 0;j<flawSize;j++){
          data[0].push(0);
        }
      }
    }
    else if(fenceMin<0){
      var osampler = dl.random.uniform(fenceMax,1);
      console.log(flawSize+" outliers somewhere more than "+fenceMax);
      for(j = 0;j<flawSize;j++){
        data[0].push(osampler());
      }
    }
    else{
      var osampler = dl.random.uniform(0,fenceMin);
      console.log(flawSize+" outliers somewhere less than "+fenceMin);
      for(j = 0;j<flawSize;j++){
        data[0].push(osampler());
      }
    }
    break;
  }

  data[0].flawed = true;

  for(i = 1;i<numViz;i++){
    //the rest are "normal"
    data[i] = [];
    data[i].flawed = false;
    for(j = 0;j<numSamples;j++){
      data[i].push(sampler());
    }
  }

  dl.permute(data);
  var makeViz;
  switch(stimulis.vis){
    case "density":
      makeViz = density;
    break;

    case "scatter":
      makeViz = scatter;
    break;

    case "histogram":
      makeViz = histogram;
    default:
    break;
  }

  var curSvg;
  for(i = 0;i<data.length;i++){
    curSvg = d3.select("svg:nth-child("+(i+1)+")");
    curSvg.datum(data[i]);
    makeViz(curSvg,data[i],stimulis.parameter);
  }

  var text = stimulis.flaw=="outliers" ? "<b>"+stimulis.flaw+"</b>" : "a <b>"+stimulis.flaw+"</b>";


  d3.select("#flawType").html(text);
}

//What happens when we select a viz in our grid
// Deselected the previously selected viz, if any.
// Highlight the current viz.
// Enable the "Confirm" button.
var select = function(){
    d3.select(".selected")
      .classed("selected",false);

    d3.select(this)
      .classed("selected",true);

    d3.select("#confirmBtn").attr("disabled",null);
};

//What happens when we "confirm" our selection.
//Get rid of the existing vizzes
//Increment the question num
//See if we were right
//See how long it took
//If it's the last question, go to the post test/wrap up screen
var answer = function(){
  var right = d3.select(".selected").datum().flawed;
  rt = new Date()-rt;
  console.log("Correct?: "+right);
  participantData[questionIndex] = stimuli[questionIndex];
  participantData[questionIndex].correct = right;
  participantData[questionIndex].rt = rt;

  d3.select("#panel").selectAll("svg").remove("*");

  d3.select("#readyBtn")
    .style("visibility",null)
    .attr("disabled",null);

  d3.select("#confirmBtn")
    .attr("disabled","disabled");

    d3.select("#flawType").html("a flaw");

  questionIndex++;
  //Check to see if the next question is the last one
  if(questionIndex==stimuli.length-1){
    d3.select("#confirmBtn")
      .attr("type","submit")
      .attr("onclick","window.location.href='/post.html'");
  }
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

var cheat = function(){
  d3.selectAll("svg").filter(d => d.flawed).style("border-color","forestgreen");
}
/***
Viz Functions
***/

//Make a 1d scatterplot
//Takes a target svg, a data set, a mark size, and a mark opacity.
var scatter = function(svg,data,markOpacity){
  var markSize = 10;
  svg.selectAll("circle").data(data).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", d => x(d))
    .attr("cy", vizHeight/2)
    .attr("opacity",markOpacity);
};

function testScatter(){
  scatter(d3.select("svg"),dl.random.uniform(0,1).samples(50),10,0.2);
}

//Makes a histogram
//Takes a target svg, a data set, and a bin size.
var histogram = function(svg,data,binCount){
  var bins = dl.histogram(data,{min: 0,max:1,step: 1/binCount});
  var width = Math.ceil(x(bins.bins.step));
  var y = d3.scaleLinear().domain([0,dl.max(bins,"count")]).range([vizHeight,0]);

  svg.selectAll("rect").data(bins).enter().append("rect")
    .attr("x",d => Math.floor(x(d.value)) )
    .attr("y", d => y(d.count))
    .attr("fill","#333")
    .attr("height", d => vizHeight - y(d.count))
    .attr("width",width);
};

function testHistogram(){
  histogram(d3.select("svg"),dl.random.uniform(0,1).samples(50),20);
};

//Makes a density plot
//Takes a target svg, a data set, and a kernel bandwidth
var density = function(svg,data,bandwidth){
  var kde = KDE(data,bandwidth);
  var xs = x.ticks(40);
  var densities = xs.map(function(d){ return {x: d, y: kde(d)}});
  var y = d3.scaleLinear().domain([0,dl.max(densities,"y")]).range([vizHeight,0]);
  var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(d => x(d.x))
    .y0(y(0))
    .y1(d => y(d.y));

  svg.append("path").datum(densities)
    .attr("fill","#333")
    .attr("d", area);
};

function testDensity(){
  density(d3.select("svg"),dl.random.uniform(0,1).samples(50),0.05);
};

//Wikinson dot plot

var dotplot = function(svg,data,markSize){
  var bins = dotPlotBin(data,markSize);
  console.log(bins);
  var y = d3.scaleLinear().domain([0,dl.max(bins,"count")]).range([vizHeight,0]);

  svg.selectAll("g").data(bins).enter().append("g")
    .attr("transform", d => "translate("+x(d.value)+")");

  var dots = svg.selectAll("g").selectAll("circle").data(function(d,i){
      var data = [];
      for(var j=1;j<=d.count;j++){
        data.push({"bin": i, "row": j});
      }
      return data;
  }, function(d){ return d.bin+","+d.row;});

  dots.enter().append("circle")
      .attr("cx",0)
      .attr("cy",d => 100-((d.row)*(2*markSize)))
      .attr("r",markSize+"px")
      .attr("fill","#333");
};

/***
Utility Functions
***/

//Clamp to [0,1]
var constrain = function(val){
  if(val<0){
    return 0;
  }
  if(val>1){
    return 1;
  }
  else{
    return val;
  }
}

//Kullback-Leibler divergence D_KL(p||q) for 2 discrete distributions p and q
var KLD = function(p,q){
  //normalize p and q
  var pSum = dl.sum(p);
  var qSum = dl.sum(q);
  var pN = p.map(d => d/pSum);
  var qN = q.map(d => d/qSum);
  var info = pN.map(function(d,i){ return d*Math.log(d/qN[i]);});
  return dl.sum(info);
};

//Kernel Density Estimation

//gaussian kernel
var kernelGauss = function(sigma){
  return function(pos){
    var exp = Math.exp(Math.pow(pos, 2) / (-2 * Math.pow(sigma, 2)));
    return (1 / (sigma * Math.sqrt(2*Math.PI))) * exp;
  }
};

//returns a function that estimates the density at a given position
var KDE = function(data,bandwidth){
  var kernel = kernelGauss(bandwidth);
  //sum up the contribution of each kernel, then divide by the number of kernels.
  return function(pos){
    return  dl.mean(data.map(d => kernel(d-pos)));
  };
};

//Wilkinson dot plot Sweep
function dotPlotBin(data,markSize) {
  data = data.sort();
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
