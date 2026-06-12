// 
// a07.js
// CSC444 Assignment 07, Spring 2024
// Yahya Al Malallah <yahyaalmalallah@arizona.edu>
//
// JavaScript file for generating a parallel coordinates plot from penguin dataset with two interactions features:
//
// onclick: when a text label is clicked, it swaps with the text label that is immediately to its right.
//          If the rightmost label is clicked, it swaps with the one immediately to its left.
//
// Brushing: brushing over a particular axis will select a subset of the data.
//           If the user brushes over multiple axes, the selection will satisfy all selected ranges.
//

////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 

let data = penguins

// dims will store the four axes in left-to-right display order
let dims = [
  "bill_length",
  "bill_depth",
  "flipper_length",
  "body_mass"
];

// mapping from dimension id to dimension name used for text labels
let dimNames = {
  "bill_length": "Bill Length",
  "bill_depth": "Bill Depth",
  "flipper_length": "Flipper Length",
  "body_mass": "Body Mass",
};




////////////////////////////////////////////////////////////////////////
// Global variables for the svg

let width = dims.length*125;
let height = 500;
let padding = 50;

let svg = d3.select("#pcplot")
  .append("svg")
  .attr("width", width).attr("height", height);




////////////////////////////////////////////////////////////////////////
// Initialize the x and y scales, axes, and brushes.  
//  - xScale stores a mapping from dimension id to x position
//  - yScales[] stores each y scale, one per dimension id
//  - axes[] stores each axis, one per id
//  - brushes[] stores each brush, one per id
//  - brushRanges[] stores each brush's event.selection, one per id

let xScale = d3.scalePoint()
  .domain(dims)
  .range([padding, width-padding]);

let yScales = {};
let axes = {};
let brushes = {};
let brushRanges = {};

// For each dimension, we will initialize a yScale, axis, brush, and
// brushRange
dims.forEach(function(dim) {
  //create a scale for each dimension
  yScales[dim] = d3.scaleLinear()
    .domain( d3.extent(data, function(datum) { return datum[dim]; }) )
    .range( [height-padding, padding] );

  //set up a vertical axis for each dimensions
  axes[dim] = d3.axisLeft()
    .scale(yScales[dim])
    .ticks(10);
  
  //set up brushes as a 20 pixel width band
  //we will use transforms to place them in the right location
  brushes[dim] = d3.brushY()
    .extent([[-10, padding], [+10, height-padding]]);
  
  //brushes will be hooked up to their respective updateBrush functions
  brushes[dim]
    .on("brush", updateBrush(dim))
    .on("end", updateBrush(dim))

  //initial brush ranges to null
  brushRanges[dim] = null;
});



var color = d3.scaleOrdinal()
  .domain(data.map(function(d) { return d.species; }))
  .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Adjust colors as needed
////////////////////////////////////////////////////////////////////////
// Make the parallel coordinates plots 

// add the actual polylines for data elements, each with class "datapath"
svg.append("g")
  .selectAll(".datapath")
  .data(data)
  .enter()
  .append("path")
  .attr("class", "datapath")
  //TODO: write the rest of this
    .attr("d", function(d) {
    return d3.line()(dims.map(function(dim) {
      return [xScale(dim), yScales[dim](d[dim])];
    }));
  })
  .style("stroke", function(d) { return color(d.species); })
  .style("opacity", 0.75)
  .style("fill", "none");

// add the axis groups, each with class "axis"
svg.selectAll(".axis")
  .data(dims, function(d) { return d; }) // Use dims array as the key
  .enter().append("g")
  .attr("class", "axis")
  .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; }) // Translate to appropriate x position
  .each(function(d) {
    d3.select(this).call(axes[d]); // Call the appropriate axis function
  });
  
// add the axes labels, each with class "label"
svg.selectAll(".label")
  .data(dims, function(d) { return d; }) // Use dims array as the key
  .enter().append("text")
  .attr("class", "label")
  .attr("x", function(d) { return xScale(d); }) // Position text at appropriate x coordinate
  .attr("y", 30) // Adjusted y position to be above the axis
  .attr("text-anchor", "middle")
  .text(function(d) { return dimNames[d]; }) // Set text to dimension name
  .on("click", onClick); // Assign onClick function


// add the brush groups, each with class ".brush" 
svg.selectAll(".brush")
  .data(dims, function(d) { return d; }) // Use dims array as the key
  .enter().append("g")
  .attr("class", "brush")
  .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; }) // Translate to appropriate x position
  .each(function(d) {
    d3.select(this).call(brushes[d]); // Call the appropriate brush function
  });



////////////////////////////////////////////////////////////////////////
// Interaction Callbacks

// Callback for swapping axes when a text label is clicked.
function onClick(event,d) {
 // Swap the clicked dimension with its neighbor to the right
 // if it is the rightmost, then swap the clicked dimension with its left neighbor.
 var index = dims.indexOf(d);
 var newIndex = (index === dims.length - 1) ? index - 1 : index + 1;
 var temp = dims[index];
 dims[index] = dims[newIndex];
 dims[newIndex] = temp;

 // Rebuild xScale with updated domain
 xScale.domain(dims);

 // Rebind data for axes and update their transforms
 svg.selectAll(".axis")
   .transition().duration(1000)
   .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; });
 // Rebind data for labels and update their transforms
 svg.selectAll(".label")
   .transition().duration(1000)
   .attr("x", function(d) { return xScale(d); });
 // Rebind data for brushes and update their transforms
 svg.selectAll(".brush")
   .transition().duration(1000)
   .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; });
 // Rebind data for data paths and update positions
 svg.selectAll(".datapath")
   .transition().duration(1000)
   .attr("d", function(d) {
     return d3.line()(dims.map(function(dim) {
       return [xScale(dim), yScales[dim](d[dim])];
     }));
   });
}

// Returns a callback function that calls onBrush() for the brush
// associated with each dimension
function updateBrush(dim) {
  return function(event) {
    brushRanges[dim] = event.selection;
    onBrush();
  };
}

// Callback when brushing to select elements in the PC plot
function onBrush() {
  // Select all polyline elements representing data paths
  let allLines = d3.selectAll(".datapath");

  // Function to determine if a data element is selected based on the brushRanges
  function isSelected(d) {
    for (let dim of dims) {
      // Check if brush is enabled for the current dimension and if data element falls within the brush range
      if (brushRanges[dim] && (yScales[dim](d[dim]) < brushRanges[dim][0] || yScales[dim](d[dim]) > brushRanges[dim][1])) {
        return false; // Return false if data element is outside the brush range for any dimension
      }
    }
    return true; // Return true if data element is within the brush range for all dimensions
  }

  // Filter and update opacity for selected data elements
  let selected = allLines
    .filter(isSelected)
    .style("opacity", 0.75);

  // Filter and update opacity for non-selected data elements
  let notSelected = allLines
    .filter(function(d) { return !isSelected(d); })
    .style("opacity", 0.1);

  // If at least one brush is enabled, set opacity for all data elements to 0.1,
  // then set opacity to 0.75 for selected data elements
  if (!Object.values(brushRanges).every(range => range === null)) {
    allLines.style("opacity", 0.1);
    selected.style("opacity", 0.75);
  }
}

