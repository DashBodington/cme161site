// Dave Deriso, dderiso@stanford.edu, (c) 2014
// This code is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. Based on a work at https://github.com/dderiso/stanford_data_viz_course.

/* @pjs crisp="true"; */
/* @pjs font="data:font/truetype,base64, {base 64 encoded data block}"; */ 

function random_triangle_meshes(p) {
    console.log(p)
    
    // this is a hack to make the lines smoother by scaling the resolution
    scale = 2;
    height_w = 400;
    width_w = window.innerWidth - 200;
    height = height_w * scale + 30;
    width = width_w * scale;
    p.size(width*scale, height*scale, p.WEBGL);
    p.externals.canvas.height = height;
    p.externals.canvas.width = width;
    p.externals.canvas.style.height = height_w + "px";
    p.externals.canvas.style.width = width_w + "px";
    p.strokeWeight(scale - .5);

    // params
    var noise = .7, // probability that a random point will have more weight than the last point
        n_lines = 6,
        n_points = Math.floor(width_w/25),
        frame_rate = 10,
        squeeze = 40,
        lines = new Array(n_lines),
        offset_h = (height-100)/n_lines,
        offset_w = width/n_points;
    
    // make 2D array of nodes
    for (var i = 0; i < n_lines; i++){
        lines[i] = new Array(n_points);
        for (var j = 0; j < n_points; j++){
            lines[i][j] = (offset_h+squeeze) * (Math.random() - .5);
        }
    }
    
    var updating = false; // prevent collisions
    var draw = function() {
        if(updating){ return; } // prevent collisions
        updating = true;

        p.background(255);
        for (i=0; i< n_lines; i++)
        {
            p.stroke(255*(i/n_lines),139*(i/n_lines),202);
            p.beginShape(p.TRIANGLE_STRIP);
            
            var offset_h_i = (scale*height - i*offset_h) - 70;
            for (var j = 0; j < n_points; j++){
                p.vertex(j*offset_w, offset_h_i - lines[i][j]);
            }

            // random combination of random point and last timestep
            var smoothness = noise + (1 - noise) * Math.random();
            var random_point = (offset_h + squeeze) * (Math.random() - .5);
            var new_point = smoothness * random_point + (1 - smoothness) * lines[i][n_points-1];

            lines[i].shift();
            lines[i].push(new_point);
            p.endShape();
        }
        updating = false; // prevent collisions
    }

    // run draw at predefined frame_rate
    window.setInterval(draw, 1000/frame_rate);
}

var random_triangle_meshes_canvas = document.getElementById("processing_random_triangle_meshes");
random_triangle_meshes_canvas.getContext('webgl', { antialias: true});
var random_triangle_meshes_processing = new Processing(random_triangle_meshes_canvas, random_triangle_meshes);
// triangle_meshes_processing.exit(); to detach it

