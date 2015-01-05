// Dave Deriso, dderiso@stanford.edu, (c) 2014
// This code is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. Based on a work at https://github.com/dderiso/stanford_data_viz_course.

/* @pjs crisp="true"; */
/* @pjs font="data:font/truetype,base64, {base 64 encoded data block}"; */ 

function noisy_lines(processing) {

    // canvas
    scale = 1.65;
    height_w = 400; //window.innerHeight - 100; // (window.innerHeight - 200)*2;
    width_w = window.innerWidth - 200; //window.innerWidth * 2;
    height = height_w * scale;
    width = width_w * scale;

    processing.size(width*scale, height*scale, processing.OPENGL);
    canvas.height = height;
    canvas.width = width;
    canvas.style.height = height_w + "px";
    canvas.style.width = width_w + "px";

    // console.log(Processing.instances[0].externals.context);
    
    // DEBUG
    console.log(width,height);

    // params
    var n_lines = 10,
        n_points = Math.floor(width_w/20),
        frame_rate = 20,
        squeeze = 20,
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

    // environment
    processing.frameRate(frame_rate);
    processing.textMode(processing.SCREEN);
    processing.smooth();
    processing.strokeWeight(.5);
    

    function update_lines()
    {
        for (i=0; i< n_lines; i++)
        {
            processing.stroke(255*(i/n_lines),139*(i/n_lines),202);
            var offset_h_i = (scale*height - i*offset_h) - 70;

            processing.fill(66,139,202);

            for (var j = 0; j < n_points; j++){
                processing.ellipse(j*offset_w, offset_h_i - lines[i][j],5, 5);
            }

            processing.noFill();
            
            processing.beginShape(processing.TRIANGLE_STRIP);
    
            for (var j = 0; j < n_points; j++){
                processing.vertex(j*offset_w, offset_h_i - lines[i][j]);
            }

            new_point = lines[i][0]; //Math.random() - .5; //(2*lines[i][n_points-1] + 3*(Math.random() - .5) )/5;
            lines[i].shift();
            lines[i].push(new_point);

            processing.endShape();
        }
    }

  // Override draw function, by default it will be called 60 times per second
    processing.draw = function() {
        processing.background(255);
        update_lines();
        // console.log( mouseX, mouseY)
      }
}

// attaching the sketchProc function to the canvas
var canvas = document.getElementById("viz_1");
var p = new Processing(canvas, noisy_lines);
// p.exit(); to detach it

