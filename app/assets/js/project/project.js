//Colors for plots
//var zoneColor = d3.scale.ordinal().range(["#99ff33", "#ffff66", "#ff9933", "#ff5050", "#ff3399", "#ff00ff"]).domain([1, 2, 3, 4, 5, 6, 7]);
var zoneColor = d3.scale.ordinal().range(["#99DA58", "#F0F075", "#E6994D", "#E96767", "#E64D99", "#DF20DF"]).domain([1, 2, 3, 4, 5, 6, 7]);
var gradeColor = d3.scale.ordinal().range(["MediumSeaGreen", "CornFlowerBlue", "Tomato"]).domain([-1, 0, 1]);
var movingColor = d3.scale.ordinal().range(["#608FBE", "DodgerBlue"]).domain([1, -1]);
var pedalColor = d3.scale.ordinal().range(["#BF6240", "OrangeRed"]).domain([1, -1]);

//Custom scatter function to trace the outline of the ride
var scatter = function(data_in, chart_id) {

  var margin = {
      "top": 30,
      "right": 30,
      "bottom": 50,
      "left": 50
    },
    width = 250 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .domain([d3.min(data_in, function(d) {
      return d.value.meanLn;
    }), d3.max(data_in, function(d) {
      return d.value.meanLn;
    })])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([d3.min(data_in, function(d) {
      return d.value.meanLt;
    }), d3.max(data_in, function(d) {
      return d.value.meanLt;
    })])
    .range([height, 0]);

//size scale, changes slightly with speed
  var s = d3.scale.linear()
    .domain([d3.min(data_in, function(d) {
      return d.value.meanV;
    }), d3.max(data_in, function(d) {
      return d.value.meanV;
    })])
    .range([3, 1]);

  d3.select("#" + chart_id).selectAll("*").remove();

  var div = d3.select("#" + chart_id).append("div");

  var svg = div.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g");

  //Add colored background
  /*
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "darkseaGreen");
  */

  var dot = svg.selectAll(".dot")
    .data(data_in)
    .enter()
    .append("g")
    .attr("class", "dot")
    .attr("r", 0)
    .attr("transform", function(d, i) {
      return "translate(" + (x(d.value.meanLn) + margin.left) + "," + (y(d.value.meanLt) + margin.top) + ")";
    });

//Add visual elements
  dot.append("circle")
    .attr("r", function(d) {
      if (d.value.count > 0) {
        return s(d.value.meanV);
      } else {
        return 1;
      }
    })
    .attr("fill", function(d) {
      if (d.value.count > 0) {
        return "black";
      } else {
        return "lightgray";
      }
    });

}

    ////////////////////////////////////////////////////////////////
    //Hack to get brushing to work on a composite graph, these features are still in beta
    var compositeChart = dc.compositeChart;
    dc.compositeChart = function(parent, chartGroup) {
      var _chart = compositeChart(parent, chartGroup);

      _chart._brushing = function() {
        var extent = _chart.extendBrush();
        var rangedFilter = null;
        if (!_chart.brushIsEmpty(extent)) {
          rangedFilter = dc.filters.RangedFilter(extent[0], extent[1]);
        }

        dc.events.trigger(function() {
          if (!rangedFilter) {
            _chart.filter(null);
          } else {
            _chart.replaceFilter(rangedFilter);
          }
          _chart.redrawGroup();
        }, dc.constants.EVENT_DELAY);
      };

      return _chart;
    };

    ////////////////////////////////////////////////////////////////

$.ajax({
  url: "https://www.strava.com/api/v3/activities/472785360/streams/time,latlng,distance,altitude,velocity_smooth,heartrate,cadence,watts,temp,moving,grade_smooth?access_token=85f8d96cace55790535a16d2a9c987202b219574&callback=?",
  dataType: 'jsonp',
  success: function(remote_json) {

    //Reformat data for crossfilter
    var allData = []
      //Collect types
    var types = []
    for (i = 0; i < remote_json.length; i++) {
      types.push(remote_json[i].type);
    }
    //Create the required array of objects
    for (i = 0; i < remote_json[0].data.length; i++) {
      vals = []
      for (j = 0; j < remote_json.length; j++) {
        vals.push(remote_json[j].data[i]);
      }
      allData.push(_.object(types, vals))
    }
    remote_json = allData;

    //console.log(allData.toString())

    window.remote_json = remote_json;


////////////////////////////////////////////////////////////////
    // crossfilter
    var cf = crossfilter(remote_json);

    //Convert watts to a power zone
    var powerToZone = function(power) {
      if (power < 0.55 * ftp) {
        return 1;
      } else if (power < 0.75 * ftp) {
        return 2;
      } else if (power < 0.9 * ftp) {
        return 3;
      } else if (power < 1.05 * ftp) {
        return 4;
      } else if (power < 1.20 * ftp) {
        return 5;
      } else if (power < 3 * ftp) {
        return 6;
      } else {
        return 7;
      }
    };

////////////////////////////////////////////////////////////////
    // dimensions
    var watts = cf.dimension(function(d) {
      return Math.round(d.watts / 5) * 5
    });

    var upDown = cf.dimension(function(d) {
      if (d.grade_smooth > 0) {
        return "Climbing";
      } else if (d.grade_smooth < 0) {
        return "Descending";
      } else {
        return "Flat";
      }
    });

    var cadence = cf.dimension(function(d) {
      return Math.round(d.cadence)
    });

    var pedal = cf.dimension(function(d) {
      if (d.cadence > 0) {
        return "Pedalling";
      } else {
        return "Coasting";
      }
    });

    var speed = cf.dimension(function(d) {
      return Math.round(d.velocity_smooth)
    });

    var dist = cf.dimension(function(d) {
      return Math.round(d.distance / 100.0) / 10
    });

    var dist2 = cf.dimension(function(d) {
      return Math.round(d.distance / 100.0) / 10
    });

    var grade = cf.dimension(function(d) {
      return Math.round(d.grade_smooth);
    });

    var temp = cf.dimension(function(d) {
      return Math.round(d.temp);
    });

    var moving = cf.dimension(function(d) {
      if (d.moving) {
        return "Moving";
      } else {
        return "Stationary";
      }
    });

    ftp = 300.0;
    var zone = cf.dimension(function(d) {
      return powerToZone(d.watts);
    });

    // groups
    //Custom reduce/remove function
    /////////////////////////////////////////////////////////////
    var mean_reduce_init = function() {
      return {
        "count": 0, // count
        "meanA": 0, //altitude
        "meanV": 0, //speed
        "meanP": 0, //POwer
        "meanC": 0, //cadence
        "meanLt": 0, //lattitude
        "meanLn": 0, //longitude
        "totalA": 0,
        "totalV": 0,
        "totalP": 0,
        "zoneP": 0, //Power zone
        "totalC": 0,
        "totalLt": 0,
        "totalLn": 0,
      };
    }

    var mean_reduce_add = function(p, v, nf) {
      ++p.count;
      p.totalA += v.altitude;
      p.totalV += v.velocity_smooth;
      p.totalP += v.watts;
      p.totalC += v.cadence;
      p.totalLn += v.latlng[1];
      p.totalLt += v.latlng[0];
      if (p.count > 0) {
        p.meanA = p.totalA / p.count;
        p.meanV = p.totalV / p.count;
        p.meanP = p.totalP / p.count;
        p.meanC = p.totalC / p.count;
        p.meanLt = p.totalLt / p.count;
        p.meanLn = p.totalLn / p.count;
        p.zoneP = powerToZone(p.meanP);
      } else {
        p.meanA = 0;
        p.meanV = 0;
        p.meanP = 0;
        p.zoneP = 0;
        p.meanC = 0;
      }
      return p;
    }

    var mean_reduce_remove = function(p, v, nf) {
      --p.count;
      p.totalA -= v.altitude;
      p.totalV -= v.velocity_smooth;
      p.totalP -= v.watts;
      p.totalC -= v.cadence;
      p.totalLn -= v.latlng[1];
      p.totalLt -= v.latlng[0];
      if (p.count > 0) {
        p.meanA = p.totalA / p.count;
        p.meanV = p.totalV / p.count;
        p.meanP = p.totalP / p.count;
        p.meanC = p.totalC / p.count;
        p.meanLt = p.totalLt / p.count;
        p.meanLn = p.totalLn / p.count;
        p.zoneP = powerToZone(p.meanP);
      } else {
        p.meanA = 0;
        p.meanV = 0;
        p.meanP = 0;
        p.zoneP = 0;
        p.meanC = 0;
      }
      return p;
    }

    /////////////////////////////////////////////////////////////

    //Properly group dimensions and perform calculations

    var grade_sum = grade.group().reduceCount(function(d) {
      return d.grade
    });

    //Pie Charts
    var watts_count = watts.group().reduceCount();
    var upDown_count = upDown.group().reduceCount();
    var moving_count = moving.group().reduceCount();
    var pedal_count = pedal.group().reduceCount();
    var zone_count = zone.group().reduceCount();

    //Standard Plots
    var dist_group = dist.group().reduce(mean_reduce_add, mean_reduce_remove, mean_reduce_init);
    var dist_group2 = dist2.group().reduce(mean_reduce_add, mean_reduce_remove, mean_reduce_init);
    var watts_group = watts.group().reduce(mean_reduce_add, mean_reduce_remove, mean_reduce_init);
    var grade_group = grade.group().reduce(mean_reduce_add, mean_reduce_remove, mean_reduce_init);

    //Filter out non-moving data
    //moving.filter(true);
    //

    //Power zones
    var zone_chart = dc
      .pieChart("#zone_chart")
      .width(250)
      .height(200)
      .dimension(zone)
      .group(zone_count)
      .innerRadius(40)
      .colors(zoneColor);

      //Uphill, downhill, flat
    var grade_chart = dc
      .pieChart("#grade_chart")
      .width(250)
      .height(200)
      .dimension(upDown)
      .group(upDown_count)
      .renderTitle(false)
      .colors(gradeColor)
      .colorAccessor(function(d) {
        if (d.key == "Climbing") {
          return 1;
        } else if (d.key == "Descending") {
          return -1;
        } else {
          return 0;
        }
      });

      //moving data (find breaks or stops in ride)
    var moving_chart = dc
      .pieChart("#moving_chart")
      .width(250)
      .height(200)
      .dimension(moving)
      .group(moving_count)
      .innerRadius(40)
      .colors(movingColor)
      .colorAccessor(function(d) {
        if (d.key == "Moving") {
          return -1;
        } else {
          return 1;
        }
      });

      //rider pedalling or coasting
    var pedal_chart = dc
      .pieChart("#pedal_chart")
      .width(250)
      .height(200)
      .dimension(pedal)
      .group(pedal_count)
      .innerRadius(40)
      .colors(pedalColor)
      .colorAccessor(function(d) {
        if (d.key == "Pedalling") {
          return -1;
        } else {
          return 1;
        }
      });

      //Composite plot with speed, power, elevation
    var composite_profile = dc.compositeChart("#profile_chart")
    composite_profile.width(1000)
      .height(200)
      .x(d3.scale.linear().domain([0, 1000]))
      .dimension(dist)
      .yAxisLabel("Power (watts)", 25)
      .elasticX(true)
      .margins({
        top: 10,
        right: 50,
        bottom: 50,
        left: 70
      })
      .xAxisLabel("Distance (km)")
      .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5).horizontal(true))
      .renderHorizontalGridLines(true)
      .rightYAxisLabel("Speed (m/s)", 25)
      .compose([
        dc.lineChart(composite_profile)
        .dimension(dist)
        .useRightYAxis(true)
        .ordinalColors([movingColor(-1)])
        .group(dist_group, "Speed")
        .valueAccessor(function(d) {
          return d.value.meanV;
        })
        .defined(function(d) {
          return d.y != 0;
        }),
        dc.lineChart(composite_profile)
        .dimension(dist)
        .brushOn(true)
        .ordinalColors(["Black"])
        .group(dist_group, "Elevation")
        .renderArea(true)
        .valueAccessor(function(d) {
          return d.value.meanA;
        })
        .defined(function(d) {
          return d.y != 0;
        }),
        dc.lineChart(composite_profile)
        .dimension(dist)
        .useRightYAxis(false)
        .ordinalColors([pedalColor(-1)])
        .group(dist_group, "Power")
        .valueAccessor(function(d) {
          return d.value.meanP;
        })
        .defined(function(d) {
          return d.y != 0;
        })
      ]);

      //Composite plot with power and cadence vs. grade
    var composite_grade = dc.compositeChart("#grade_composite")
    composite_grade.width(500)
      .height(200)
      .x(d3.scale.linear().domain([-20, 20]))
      .dimension(grade)
      .yAxisLabel("Cadence(rpm)", 25)
      .xAxisLabel("Grade (percent)")
      .elasticY(true)
      .legend(dc.legend().x(80).y(-13).itemHeight(13).gap(5))
      .margins({
        top: 10,
        right: 50,
        bottom: 50,
        left: 70
      })
      .renderHorizontalGridLines(true)
      .rightYAxisLabel("Power (watts)")
      .compose([
        dc.barChart(composite_grade)
        .group(grade_group, "Avg Power")
        .centerBar(false)
        .useRightYAxis(true)
        .centerBar(true)
        .xUnits(dc.units.fp.precision(1))
        .valueAccessor(function(d) {
          return d.value.meanP;
        })
        .colors(zoneColor)
        .colorAccessor(function(d) {
          if (typeof(d.value) != "undefined") {
            return d.value.zoneP;
          } else {
            return 0;
          }
        }),
        dc.scatterPlot(composite_grade)
        .group(grade_group, "Avg Cadence")
        .clipPadding(10)
        .ordinalColors(["Black"])
        .xUnits(dc.units.fp.precision(1))
        .keyAccessor(function(d) {
          return d.key;
        })
        .valueAccessor(function(d) {
          return d.value.meanC;
        })
      ]);

      //composite plot with time at power and cadence vs. power value
    var composite_power = dc.compositeChart("#power_composite")
    composite_power.width(500)
      .height(200)
      .x(d3.scale.linear().domain([10, 1000]))
      .dimension(watts)
      .yAxisLabel("Cadence (rpm)", 25)
      .xAxisLabel("Power (watts)")
      .legend(dc.legend().x(80).y(-13).itemHeight(13).gap(5))
      .margins({
        top: 10,
        right: 50,
        bottom: 50,
        left: 60
      })
      .renderHorizontalGridLines(true)
      .rightYAxisLabel("Time (s)", 25)
      .elasticY(true)
      .compose([
        dc.barChart(composite_power)
        .dimension(watts)
        .group(watts_group, "Watts")
        .useRightYAxis(true)
        .centerBar(true)
        .colors(zoneColor)
        .valueAccessor(function(d) {
          if (d.key > 0) {
            return d.value.count;
          } else {
            return 0;
          }
        })
        .colorAccessor(function(d) {
          if (typeof(d.value) != "undefined") {
            return d.value.zoneP;
          } else {
            return 0;
          }
        }),
        dc.scatterPlot(composite_power)
        .dimension(watts)
        .clipPadding(10)
        .group(watts_group, "Avg Cadence")
        .keyAccessor(function(d) {
          return d.value.meanP;
        })
        .valueAccessor(function(d) {
          return d.value.meanC;
        })
        .ordinalColors(["Black"])
        .xUnits(dc.units.fp.precision(1))
      ]);

//Functions to perform summary analysis of selected data
    var groupStats = function(data_in, name, prec) {
      return [d3.min(data_in, function(d) {
        return d.value[name];
      }).toPrecision(prec), d3.max(data_in, function(d) {
        return d.value[name];
      }).toPrecision(prec), d3.mean(data_in, function(d) {
        return d.value[name];
      }).toPrecision(prec)];
    }

    var dimStats = function(data_in, name, prec) {
      return [d3.min(data_in, function(d) {
        return d[name];
      }), d3.max(data_in, function(d) {
        return d[name];
      }), d3.mean(data_in, function(d) {
        return d[name];
      })];
    }

    var distStats = function(data_in, name, prec) {
      return d3.sum(data_in, function(d) {
        return d[name];
      });
    }

//Keep the custom plots and metrics updated with the dc-filtered crossfilter
    var render_plots = function() {
      scatter(dist_group2.top(Infinity),
        "map_chart"
      );

      var sts = distStats(speed.top(Infinity), "velocity_smooth", 3)
      d3.select("#dist_txt").text((sts / 1000).toFixed(2));
      //d3.select("#dist_txt").text(dist.top(Infinity).length/100);
      var sts = dimStats(temp.top(Infinity), "temp", 3)
      d3.select("#temp_txt").text(sts[0].toFixed(1))
      var sts = dimStats(watts.top(Infinity), "watts", 3)
      d3.select("#power_txt").text("avg: " + sts[2].toFixed(0) + ", min: " + sts[0].toFixed(0) + ", max: " + sts[1].toFixed(0));
      var sts = dimStats(speed.top(Infinity), "velocity_smooth", 3)
      d3.select("#speed_txt").text("avg: " + sts[2].toFixed(1) + ", min: " + sts[0].toFixed(1) + ", max: " + sts[1].toFixed(1));
      var sts = dimStats(cadence.top(Infinity), "cadence", 3)
      d3.select("#cadence_txt").text("avg: " + sts[2].toFixed(0) + ", min: " + sts[0].toFixed(0) + ", max: " + sts[1].toFixed(0));
    }

//Provide reset button
    var showButton = function() {
      if (composite_grade.filters().length > 0 || composite_power.filters().length > 0 || composite_profile.filters().length > 0 || zone_chart.filters().length > 0 ||
        grade_chart.filters().length > 0 ||
        moving_chart.filters().length > 0 || pedal_chart.filters().length > 0) {
        d3.select(".btn-btn")
          .remove();
        d3.select("#resetButton")
          .append("button")
          .attr("type", "button")
          .attr("class", "btn-btn")
          .append("div")
          .attr("class", "label")
          .append("text")
          .text(function(d) {
            return "Reset Filters";
          })
          .on("click", function() {
            composite_grade.filter(null);
            composite_power.filter(null);
            composite_profile.filter(null);
            zone_chart.filter(null);
            grade_chart.filter(null);
            moving_chart.filter(null);
            pedal_chart.filter(null);
            dc.redrawAll();
            render_plots();
          })

          d3.select(".btn-btn").select(".label").style('color','black');
          //console.log(d3.select(".btn-btn").select(".label").style("fill,"black"))

      } else {
        d3.select(".btn-btn")
          .remove();
      };
      render_plots();
    };

//When any dc plot gets filtered, we need to activate the reset button, and update the non-dc visualizations
    composite_grade.on('filtered', function() {
      showButton();
    });
    composite_profile.on('filtered', function() {
      showButton();
    });
    composite_power.on('filtered', function() {
      showButton();
    });
    zone_chart.on('filtered', function() {
      showButton();
    });
    grade_chart.on('filtered', function() {
      showButton();
    });
    moving_chart.on('filtered', function() {
      showButton();
    });
    pedal_chart.on('filtered', function() {
      showButton();
    });



    //plot everything for the first time
    render_plots()
    dc.renderAll();

  }
});
