var participantData = [];


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

//What happens when the participant clicks the ready button.
// The RT timer starts
// 20 divs are created in the 4x5 grid
// The divs are populated by vizzes, according to the current trial information
// The "Confirm" button becomes enabled.

var select = function(){
    d3.select(".selected")
      .classed("selected",false);

    d3.select(this)
      .classed("selected",true);
}

var ready = function(){
  d3.select("#readyBtn")
    .style("visibility","hidden")
    .attr("disabled","disabled");

  var vizRows = 5;
  var vizColumns = 4;
  var vizWidth = 200;
  var vizHeight = 100;

  var vizzes = vizRows * vizColumns;
  var i;
  d3.select("#panel")
    .style("grid-template-columns",function(){
       var l = "";
       for(i = 0;i<vizColumns;i++){
         l+=vizWidth+"px ";
       }
       return l.trim();
     })
    .style("grid-template-rows",function(){
       var l = "";
       for(i = 0;i<vizRows;i++){
         l+=vizHeight+"px ";
       }
       return l.trim();
     });

  for(i = 0;i<vizzes;i++){
    d3.select("#panel").append("svg")
      .classed("vis",true)
      .style("width",vizWidth)
      .style("height",vizHeight)
      .on("click",select);
  }
};
