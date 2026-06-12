// 
// a010.js
// CSC444 Assignment 10, Spring 2024
// Yahya Al Malallah <yahyaalmalallah@arizona.edu>
//
// This JavaScript file provides a robust framework for interactive data visualization using D3.js.
// The script includes functions for initializing and updating transfer functions for color and opacity,
// designed to enhance the visualization of scalar data within a web-based application.
//



////////////////////////////////////////////////////////////////////////
// Global variables and helper functions

// colorTF and opacityTF store a list of transfer function control
// points.  Each element should be [k, val] where k is a the scalar
// position and val is either a d3.rgb or opacity in [0,1] 
let colorTF = [];
let opacityTF = [];

// D3 layout variables
let size = 500;
let svg = null;

// Variables for the scales
let xScale = null;
let yScale = null;
let colorScale = null;


////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  svg = d3.select("#tfunc")
    .append("svg")
    .attr("width", size)
    .attr("height", size);
  //Initialize the axes
  // Add axes groups but do not call them yet
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${size-20})`);
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${30},0)`);

  //Initialize path for the opacity TF curve
  const opacityLine = svg.append("path")
  .datum(opacityTF)
  .attr("class", "opacity-line")
  .attr("fill", "none")
  .attr("stroke", "black");

  //Initialize circles for the opacity TF control points
  let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

  svg.append("g")
    .attr("class", "points")
    .selectAll("circle")
    .data(opacityTF)
    .enter()
    .append("circle")
    .attr("index", (d,i) => i)
    .style('cursor', 'pointer')
    .call(drag);

  //After initializing, set up anything that depends on the TF arrays
  updateTFunc();
}

// Call this function whenever a new dataset is loaded or whenever
// colorTF and opacityTF change
function updateTFunc() {
  // Update the scales for the x and y axes
  xScale = d3.scaleLinear()
      .domain(dataRange)  // Set from global variable
      .range([30, size - 20]);  // Add padding for axes

  yScale = d3.scaleLinear()
      .domain([0, 1])  // Opacity ranges from 0 to 1
      .range([size - 20, 70]);  // Inverted scale for y-axis

  // Update the axes with the new scales
  svg.select(".x-axis").call(d3.axisBottom(xScale));
  svg.select(".y-axis").call(d3.axisLeft(yScale));
  let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
  // Update circles for opacity transfer function points
  // Update the circles for control points
  const circles = svg.select(".points").selectAll("circle")
    .data(opacityTF, d => d[0]);

    circles.enter()
    .append("circle")
    .merge(circles)
    .attr("r", 5)
    .attr("cx", d => xScale(d[0]))
    .attr("cy", d => yScale(d[1]))
    .attr("index", (d,i) => i)
    .style('cursor', 'pointer')
    .style("fill", "black")
    .call(drag);


  circles.exit().remove();

  // Update the polyline
  svg.select(".opacity-line")
    .datum(opacityTF)
    .attr("d", d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveMonotoneX));
  // Update color bar rectangles based on colorScale
  const colorBarWidth = size - 100;
  const numRects = colorBarWidth / 10;
  const colorRectData = d3.range(numRects).map(function(i) {
      return dataRange[0] + (i * (dataRange[1] - dataRange[0]) / numRects);
  });

  svg.selectAll(".color-bar")
      .data(colorRectData)
      .join("rect")
      .attr("class", "color-bar")
      .attr("x", (d, i) => 50 + i * (colorBarWidth / numRects))
      .attr("y", 30)
      .attr("width", colorBarWidth / numRects)
      .attr("height", 20)
      .style("fill", d => colorScale(d));
}



// To start, let's reset the TFs and then initialize the d3 SVG canvas
// to draw the default transfer function

resetTFs();
initializeTFunc();


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

// Will track which point is selected
let selected = null;

// Called when mouse down
function dragstarted(event,d) {
  selected = parseInt(d3.select(this).attr("index"));
}

// Called when mouse drags
function dragged(event, d) {
  if (selected != null) {
    // Get the new y position, constrained by the scale's domain
    let newY = Math.min(Math.max(yScale.invert(event.y), 0), 1);

    // If it's an endpoint (index 0 or 4), restrict movement to y-axis only
    if (selected === 0 || selected === opacityTF.length - 1) {
      opacityTF[selected] = [opacityTF[selected][0], newY];
    } else {
      // For other points, allow movement in both x and y
      let newX = Math.min(Math.max(xScale.invert(event.x), dataRange[0]), dataRange[1]);
      // Ensure that control points do not pass each other
      if (selected > 0) {
        newX = Math.max(newX, opacityTF[selected - 1][0]);
      }
      if (selected < opacityTF.length - 1) {
        newX = Math.min(newX, opacityTF[selected + 1][0]);
      }
      opacityTF[selected] = [newX, newY];
    }

    // Update the visualization and the volume renderer
    updateTFunc();
    updateVR(colorTF, opacityTF, false);
  }
}


// Called when mouse up
function dragended() {
  selected = null;
}




////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function(e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      initializeVR(fileData);

      //upon load, we'll reset the transfer functions completely
      resetTFs();

      //Update the tfunc canvas
      updateTFunc();
      
      //update the TFs with the volren
      updateVR(colorTF, opacityTF, false);
    }
  }
}

// Attach upload process to the loadData button
var input = document.getElementById("loadData");
input.addEventListener("change", upload);



////////////////////////////////////////////////////////////////////////
// Functions to respond to buttons that switch color TFs

function resetTFs() {
  makeOpacity();
  makeSequential();
}

// Make a default opacity TF
function makeOpacity() {
  opacityTF = [
    [dataRange[0], 0],  // Start with 0 opacity at the minimum data value
    [dataRange[0] + (dataRange[1] - dataRange[0]) * 0.25, 0.25],  // 25% opacity
    [dataRange[0] + (dataRange[1] - dataRange[0]) * 0.50, 0.50],  // 50% opacity
    [dataRange[0] + (dataRange[1] - dataRange[0]) * 0.75, 0.75],  // 75% opacity
    [dataRange[1], 1]  // Full opacity at the maximum data value
  ];

  
}




// Function to create a sequential color scale using D3.js
function makeSequential() {
  // Define a sequential color scale that interpolates the color red
  colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain(dataRange);  // Set the domain with the data range
  
  // Create a quantized transformation function
  colorTF = d3.quantize(t => {
        const domainExtent = dataRange[1] - dataRange[0];  // Calculate the range of the data
        const adjustedT = dataRange[0] + t * domainExtent; // Adjust 't' to be within the data range
        const color = d3.rgb(colorScale(adjustedT));       // Convert the scaled value to an RGB color
        return [adjustedT, color];                         // Return the adjusted value and color as a tuple
    }, 5);  // Quantize into 5 discrete steps
}

// Function to create a diverging color scale using D3.js
function makeDiverging() {
  // Define a diverging color scale using Red-Yellow-Blue interpolation
  colorScale = d3.scaleDiverging(d3.interpolateRdYlBu)
      .domain([dataRange[0], (dataRange[0] + dataRange[1]) / 2, dataRange[1]]);  // Set three-point domain for the scale
  
  // Create a quantized transformation function
  colorTF = d3.quantize(t => {
      const domainExtent = dataRange[1] - dataRange[0];  // Calculate the range of the data
      const adjustedT = dataRange[0] + t * domainExtent; // Adjust 't' to be within the data range
      const color = d3.rgb(colorScale(adjustedT));       // Convert the scaled value to an RGB color
      return [adjustedT, color];                         // Return the adjusted value and color as a tuple
  }, 5);  // Quantize into 5 discrete steps
}

// Function to create a categorical color scale using D3.js
function makeCategorical() {
  // Define a quantize scale for categorical data
  colorScale = d3.scaleQuantize()
      .domain(dataRange)          // Set the domain with the data range
      .range(d3.schemeCategory10); // Use a predefined 10-color scheme

  // Create a list of color transformations based on the midpoint of each segment
  colorTF = colorScale.range().map((color, index) => {
      const extent = colorScale.invertExtent(color);    // Find the data range that maps to this color
      const t = (extent[0] + extent[1]) / 2;            // Calculate the midpoint of the segment
      return [t, d3.rgb(color)];                        // Return the midpoint and its RGB color
  });
}




// Configure callbacks for sequential button
d3.select("#sequential").on("click", function() {
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});



// Configure callbacks for diverging button
d3.select("#diverging").on("click", function() {
  makeDiverging();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});



// Configure callbacks for categorical button
d3.select("#categorical").on("click", function() {
  makeCategorical();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});
