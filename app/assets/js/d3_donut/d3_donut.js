

d3.json("https://limitless-cove-49457.herokuapp.com/donuts",function(data){


var flare_min = data;
flare_min.children = flare_min.children

var height = 1000,
  width = 1000;

var depthCount = function(branch) {
  if (!branch.children) {
    return 1;
  }
  return 1 + d3.max(branch.children.map(depthCount));
}

var max_depth = depthCount(flare_min);

var svg = d3
  .select("#donut_hierarchy")
  .append("svg")
  .attr("height", height)
  .attr("width", width)
  .append("g")
  .attr("transform", "translate(50,0)");

var tree = d3
  .layout
  .tree()
  .size([height, width - 150]);

var diagonal = d3
  .svg
  .diagonal()
  .projection(function(d) {
    return [d.y, d.x];
  });

var search_term = "Jelly";

function findInPath(source, text) {
  if (source.name.search(text) > 0) {
    return true;
  } else if (source.children || source._children) {
    var c = source.children ? source.children : source._children;
    for (var i = 0; i < c.length; i++) {
      if (findInPath(c[i], text)) {
        return true;
      }
    }
  }
  return false;
}

var linkFilter = function(d) {
  return findInPath(d.target, search_term)
}


flare_min.x0 = height / 2;
flare_min.y0 = 0;

var first = 1;
var i = 0;
var duration = 1000;

update(flare_min);


function shrink(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  }
}

function update(source) {
  var nodes = tree.nodes(flare_min);
  var links = tree.links(nodes);

  var node = svg.selectAll("g.node")
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });
    
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", click);

	//Try to shrink everything at the start
  if(first == 1){
  	//Can't make this work
  	first ++;
  }

  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("stroke", "steelblue")
    .style("stroke-width", "1.5px");

  nodeEnter.append("text")
    .attr("x", function(d) {
      return d.children || d._children ? -20 : 20;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function(d) {
      return d.name;
    })
    .style("fill-opacity", 1e-6)
    .style("font", "10px sans-serif")
    .style("fill", "black")
    .style("stroke-width", ".01px");



  var nodeUpdate = node.transition()
    .duration(duration)
    .ease("bounce")
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    })

  var colorScale = d3.scale.linear()
    .domain([1, max_depth])
    .range(["peru", "gold"]);

  nodeUpdate.select("circle")
    .filter(function(d) {
      return findInPath(d, search_term)
    })
    .style("fill", "red")
    .attr("r", 10)
    .style("stroke-width", "15px")
    .style("stroke", function(d) {
      return colorScale(d.depth);
    });

  nodeUpdate.select("circle")
    .filter(function(d) {
      return !findInPath(d, search_term)
    })
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    })
    .attr("r", 5)
    .style("stroke", "brown")
    .style("stroke-width", "5px");

  nodeUpdate.select("text")
    .style("fill-opacity", 1)
    .style("font", "10px sans-serif")
    .style("fill", "black")
    .style("stroke-width", ".01px");


  var nodeExit = node.exit().transition()
    .duration(duration)
    .ease("elastic")
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);


  var link = svg.selectAll("path.link")
    .data(links, function(d) {
      return d.target.id;
    });



  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .style("fill", "none")
    .style("stroke", "aqua")
    .style("stroke-width", "3px");

  link.transition()
    .duration(duration)
    .ease("elastic")
    .attr("d", diagonal);

  link.exit().transition()
    .duration(duration)
    .ease("elastic")
    .attr("d", function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .remove();

  link.filter(linkFilter).style("stroke", "deeppink")

  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}
};