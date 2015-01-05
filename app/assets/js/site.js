// Dave Deriso, dderiso@stanford.edu, (c) 2014
// This code is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. Based on a work at https://github.com/dderiso/stanford_data_viz_course.

// respond to clicks
$(".nav li").click(
	function(){ 
		$(".nav li").removeClass("active");
		$(this).addClass("active");
		var id = $(this).find("a").attr("href").split("#")[1];
	}
);