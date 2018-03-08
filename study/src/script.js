/***
Study Parameters
***/

var participantData = [];
var rt;

// 20 total vizzes means an alpha of 0.05
var vizRows = 5;
var vizColumns = 4;

var vizWidth = 200;
var vizHeight = 100;

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

  var vizzes = vizRows * vizColumns;
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
  for(i = 0;i<vizzes;i++){
    d3.select("#panel").append("svg")
      .classed("vis",true)
      .style("width",vizWidth)
      .style("height",vizHeight)
      .on("click",select);
  }
};

//What happens when we select a viz in our grid
// Deselected the previously selected viz, if any.
// Highlight the current viz.
// Enable the "Confirm" button.
var select = function(){
    d3.select(".selected")
      .classed("selected",false);

    d3.select(this)
      .classed("selected",true);
};

/***
Viz Functions
***/

var scatter = function(svg,data,markSize,markOpacity){
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
/***
Utility Functions
***/



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
