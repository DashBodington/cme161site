// C3 init

var my_data = [
  ["Cycling", 3.92, 4.60, 3.78, 4.17, 3.91, 1.89, 1.46, 1.19, 1.68, 1.2, 1.0],
  ["Olympic Sport Average", 1.51, 1.67, 2.12, 1.86, 1.93, 0.98, 0.9, 1.0, 0.99, 0.97, 0.77],
  ["x", 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2012, 2014, 2015, 2016],
];

var my_chart_parameters = {
  "bindto": '#cycling_chart',
  "data": {
  	"x" : "x",
    "columns": my_data,
    "selection": {
      "enabled": true
    }
  },
  "axis": {
    "x": {
    },
    "y": {
      label: {
      	text: '% Positive Doping Tests',
      	position: 'outer-center'
    	}
    },
    "y2": {
      show: false,
      label: 'Y2 Label'
    }
  },
  "point": {
    "r": 5,
    "focus": {
      "expand": {
        "r": 7,
        "enabled": true
      }
    }
  },
  "grid": {
    "x": {
      "show": false
    },
    "y": {
      "show": true
    }
  },
  "tooltip": {
    "show": false,
    "grouped": false
  }
};

var my_chart_object = c3.generate(my_chart_parameters);

// slides

var slide_0 = function() {
  document.getElementById("message").innerHTML = "Professional cycling has come a long way when it comes to doping in the last 10 years, if you believe most professionals' claims.";
};

var slide_1 = function() {
  //my_chart_object.select(["Cycling"], [0, 1, 2]);
  my_chart_object.xgrids([{
    value: 2005,
    text: "Lance Armstrong's Reign"
  }]);
  my_chart_object.regions.add([{
    end: 2005
  }]);
  document.getElementById("message").innerHTML = "Lance Armstrong, who won the Tour de France every year from 1999-2005 while doping, passed over 250 drug tests in this period.";
};

var slide_1_1 = function() {
	my_chart_object.select(["Cycling"], [0, 1, 2]);
  document.getElementById("message").innerHTML = "During these years 30-40% of doping tests among the top 10 finishers of cycling's biggest races were failed.";
};

var slide_1_2 = function() {
	my_chart_object.unselect();
  my_chart_object.xgrids.add([{
    value: 2008,
    text: "Biological Passport System"
  }]);
  my_chart_object.regions.add([{
    start: 2008,
  }]);
  document.getElementById("message").innerHTML = "From 2008-2009, the World Anti-Doping Agency (WADA) developed a 'Biological Passport' system to track athletes' biological variables over time. This included new out-of-competition testing.";
};

var slide_2 = function() {
	my_chart_object.unselect();
	my_chart_object.revert();
  my_chart_object.hide("Cycling");
  my_chart_object.hide("Olympic Sport Average");
  my_chart_object.load({
    columns: [
      ["Total # Tests", 12352, 13199, 12751, 14229, 16462, 19436, 21835, 21427, 19139, 22252, 22471]
    ]
  });
  my_chart_object.axis.labels({y: "# Doping Tests in Cycling"});
    my_chart_object.xgrids.add([{
    value: 2010,
    text: "Top 3 TdF finisher disqualified"
  }]);
  my_chart_object.regions.add([{
    end: 2010,
  }]);
  my_chart_object.focus("Total # Tests");
  document.getElementById("message").innerHTML = "While the percentage of positive tests has decreased severely, this is partially due to the increasing number of doping tests. Top riders continued to cheat.";
};

var slide_3 = function() {
my_chart_object.axis.labels({y: "% Positive Doping Tests"});
  my_chart_object.unload({ids: "Total # Tests"});
  my_chart_object.show("Cycling");
  my_chart_object.show("Olympic Sport Average");
  my_chart_object.revert();
  my_chart_object.regions.add([{
    start: 2008
  }]);
  my_chart_object.axis.min({y: 0});
  document.getElementById("message").innerHTML = "Despite increased testing and closing the gap on other sports, many professionals and amateurs fail doping controls every year. Are tests helping? Or are dopers getting better at hiding?";
  
};

var slide_4 = function() {
	my_chart_object.load({
    columns: [
      ["Technological Fraud", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
    ]});
	my_chart_object.unload({
    ids: "Cycling"
  });
  my_chart_object.unload({
    ids: "Olympic Sport Average"
  });
  my_chart_object.axis.labels({y: "Frequency of Technological Fraud"});
  my_chart_object.axis.max({x: 2016});
  document.getElementById("message").innerHTML = "With increased biological scrutiny, some cyclists are finding new ways to cheat. 2016 saw cycling's first confirmed case of ''technological fraud'' (a hidden motor) at the cyclocross world championships.";
};

var slides = [slide_0, slide_1, slide_1_1, slide_1_2, slide_2, slide_3, slide_4];

// cycle through slides

var current_slide = 0;

var run = function() {
  slides[current_slide]();
  current_slide += 1;

  if (current_slide === 1) {
    document.getElementById("start_btn").innerHTML = "Start";
  } else if (current_slide === slides.length) {
    current_slide = 0;
    document.getElementById("start_btn").innerHTML = "Replay";
  } else {
    document.getElementById("start_btn").innerHTML = "Continue";
  }
};

// button event handler

document.getElementById('start_btn').addEventListener("click", run);

// init

run();