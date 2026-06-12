// 
// a06.js
// CSC444 Assignment 06, Spring 2024
// Yahya Al Malallah <yahyaalmalallah@arizona.edu>
//
// This file contains the JavaScript code responsible for implementing
// the interactive visualization features, including linked views and
// interactive brushing, for the Iris Dataset. Below is an overview of
// the functionalities implemented in `a06.js`:

// - **Linked Views**: The code establishes two scatterplot visualizations
// linked to different attributes of the Iris Dataset, enabling users to
// explore relationships between different variables from the two visualizations.

// - **Interactive Brushing**: Implements interactive brushing
// functionality, allowing users to select specific regions of
// interest on the scatterplots. The selected points are highlighted,
// and unselected points are visually distinguished to provide clarity.
//



////////////////////////////////////////////////////////////////////////
// Global variables for the dataset and brushes

let data = iris;

// Define color scale
let colorScale = d3.scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica"])
    .range(["#ADD8E6", "#FFD580", "#AA336A"]);

// brush1 and brush2 will store the extents of the brushes,
// if brushes exist respectively on scatterplot 1 and 2.
//
// if either brush does not exist, brush1 and brush2 will
// hold the null value.

let brush1 = null;
let brush2 = null;

////////////////////////////////////////////////////////////////////////
// xAccessor and yAccessor allow this to be generic to different data
// fields


// Function to create a scatterplot based on provided accessors
function makeScatterplot(sel, xAccessor, yAccessor) {
  // Define plot dimensions
  let width = 500;
  let height = 500;

  // Create SVG element
  let svg = sel
    .append("svg")
    .attr("width", width).attr("height", height);

  // Create scales for x and y axes
  let xScale = d3.scaleLinear()
    .domain([d3.min(data, xAccessor), d3.max(data, xAccessor)])
    .range([50, width - 50]);

  let yScale = d3.scaleLinear()
    .domain([d3.min(data, yAccessor), d3.max(data, yAccessor)])
    .range([height - 50, 50]); // Inverted to match SVG coordinate system

  let brush = d3.brush();

  // Append brush element
  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  // Append circles representing data points
  let circles = svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", function(d, i) { return "circle_" + i; }) // Assign unique IDs
    .attr("cx", function(d) { return xScale(xAccessor(d)); })
    .attr("cy", function(d) { return yScale(yAccessor(d)); })
    .attr("r", 5)
    .attr("fill", function(d) { return colorScale(d.species); })
    .on("click", onClick); // Attach the click event listener to each circle

  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  // Add x axis
  svg.append("g")
    .attr("transform", "translate(0," + (height - 50) + ")")
    .call(xAxis);

  // Add y axis
  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(yAxis);

  // Return plot object for global use in the brushes
  return {
    svg: svg,
    brush: brush,
    xScale: xScale,
    yScale: yScale
  };
}

////////////////////////////////////////////////////////////////////////
// Setup plots

plot1 = makeScatterplot(d3.select("#scatterplot_1"),
                        function(d) { return d.sepalLength; },
                        function(d) { return d.sepalWidth; });
plot2 = makeScatterplot(d3.select("#scatterplot_2"),
                        function(d) { return d.petalLength; },
                        function(d) { return d.petalWidth; });



////////////////////////////////////////////////////////////////////////
// Callback during brushing

// Define click event on circles
function onClick() {
  // Remove highlight from all circles
  d3.selectAll("circle").attr("r", 5);
  let d = d3.select(this).datum();
  // Display the data record in the HTML table
  d3.select("#table-sepalLength").text(d.sepalLength);
  d3.select("#table-sepalWidth").text(d.sepalWidth);
  d3.select("#table-petalLength").text(d.petalLength);
  d3.select("#table-petalWidth").text(d.petalWidth);
  d3.select("#table-species").text(d.species);

  // Get the ID of the clicked circle
  let circleId = d3.select(this).attr("id");

  let firstCricle = d3.select(`#scatterplot_1 #${circleId}`);
  let secondCricle = d3.select(`#scatterplot_2 #${circleId}`);

  // Highlight the corresponding point in the other scatterplot
  firstCricle.attr("r", 10);
  secondCricle.attr("r", 10);
}


// Callback function during brushing
function onBrush() {
  let allCircles = d3.selectAll("circle");

  // Define a filter function to check if a data element is within the active selection regions of both brushes
  function isSelected(d) {
    if (brush1 && brush2) {
      let xSelected = plot1.xScale(d.sepalLength) >= brush1[0][0] && plot1.xScale(d.sepalLength) <= brush1[1][0];
      let ySelected = plot1.yScale(d.sepalWidth) >= brush1[0][1] && plot1.yScale(d.sepalWidth) <= brush1[1][1];
      let x2Selected = plot2.xScale(d.petalLength) >= brush2[0][0] && plot2.xScale(d.petalLength) <= brush2[1][0];
      let y2Selected = plot2.yScale(d.petalWidth) >= brush2[0][1] && plot2.yScale(d.petalWidth) <= brush2[1][1];
      return xSelected && ySelected && x2Selected && y2Selected;
    } else if (brush1) {
      return plot1.xScale(d.sepalLength) >= brush1[0][0] && plot1.xScale(d.sepalLength) <= brush1[1][0] 
          && plot1.yScale(d.sepalWidth) >= brush1[0][1] && plot1.yScale(d.sepalWidth) <= brush1[1][1];
    } else if (brush2) {
      return plot2.xScale(d.petalLength) >= brush2[0][0] && plot2.xScale(d.petalLength) <= brush2[1][0] 
          && plot2.yScale(d.petalWidth) >= brush2[0][1] && plot2.yScale(d.petalWidth) <= brush2[1][1];
    } else {
      // If no brush is active, return false for all data elements
      return false;
    }
  }
  
  // Filter the circles based on the selection
  let selected = allCircles.filter(isSelected);
  let notSelected = allCircles.filter(function(d) { return !isSelected(d); });

  // Apply stroke color to selected circles and remove stroke from unselected circles
  selected.attr("stroke", "black").attr("stroke-width", 2);
  notSelected.attr("stroke", "none");
}


////////////////////////////////////////////////////////////////////////
//
// d3 brush selection
//
// The "selection" of a brush is the range of values in either of the
// dimensions that an existing brush corresponds to. The brush selection
// is available in the event.selection object.
// 
//   e = event.selection
//   e[0][0] is the minimum value in the x axis of the brush
//   e[1][0] is the maximum value in the x axis of the brush
//   e[0][1] is the minimum value in the y axis of the brush
//   e[1][1] is the maximum value in the y axis of the brush
//
// The most important thing to know about the brush selection is that
// it stores values in *PIXEL UNITS*. Your logic for highlighting
// points, however, is not based on pixel units: it's based on data
// units.
//
// In order to convert between the two of them, remember that you have
// the d3 scales you created with the makeScatterplot function above.
//
// It is not necessary to use, but you might also find it helpful to
// know that d3 scales have a function to *invert* a mapping: if you
// create a scale like this:
//
//  s = d3.scaleLinear().domain([5, 10]).range([0, 100])
//
// then s(7.5) === 50, and s.invert(50) === 7.5. In other words, the
// scale object has a method invert(), which converts a value in the
// range to a value in the domain. This is exactly what you will need
// to use in order to convert pixel units back to data units.
//
//
// NOTE: You should not have to change any of the following:

function updateBrush1(event) {
  brush1 = event.selection;
  onBrush();
}

function updateBrush2(event) {
  brush2 = event.selection;
  onBrush();
}

plot1.brush
  .on("brush", updateBrush1)
  .on("end", updateBrush1);

plot2.brush
  .on("brush", updateBrush2)
  .on("end", updateBrush2);


  