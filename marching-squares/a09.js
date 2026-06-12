// 
// a09.js
// CSC444 Assignment 09, Fall 2024
// Yahya Al Malallah <yahyaalmalallah@arizona.edu>
//
// JavaScript file for generating isocontours from grid data, including two types of visualizations, Outline and Filled.
//

////////////////////////////////////////////////////////////////////////
// Global variables, preliminaries, and helper functions

let svgSize = 490;
let bands = 49;

let xScale = d3.scaleLinear().domain([0, bands]).  range([0, svgSize]);
let yScale = d3.scaleLinear().domain([-1,bands-1]).range([svgSize, 0]);

function createSvg(sel)
{
  return sel
    .append("svg")
    .attr("width", svgSize)
    .attr("height", svgSize);
}

function createGroups(data) {
  return function(sel) {
    return sel
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + xScale(d.Col) + "," + yScale(d.Row) + ")";
      });
  };
}

d3.selection.prototype.callReturn = function(callable)
{
  return callable(this);
};

// This function returns the pair [min/max] for a cell d.
function gridExtent(d) {
  return [Math.min(d.NW, d.NE, d.SW, d.SE),
          Math.max(d.NW, d.NE, d.SW, d.SE)];
}



////////////////////////////////////////////////////////////////////////
// Functions for isocontouring

// Given a cell d and an isovalude value, this returns a 4-bit polarity
// signature in result.case as an integer [0,15].  Any bit that is 1
// indicates that the associate cell corner is on or above the contour.
function polarity(d, value) {
  let result = {
    NW: d.NW < value ? 0 : 1,
    NE: d.NE < value ? 0 : 1,
    SW: d.SW < value ? 0 : 1,
    SE: d.SE < value ? 0 : 1
  };
  result.case = result.NW + result.NE * 2 + result.SW * 4 + result.SE * 8;
  return result;
}

// currentContour is a global variable which stores the value
// of the contour we are currently extracting
var currentContour;

function includesOutlineContour(d) {
  let extent = gridExtent(d);
  return currentContour >= extent[0] && currentContour <= extent[1];
}

// Determines whether the current contour value should be considered within the range of a given data cell for filled contour visualization.
function includesFilledContour(d) {
  let extent = gridExtent(d); // Get the min and max values of the cell
  return currentContour >= extent[0]; // Check if currentContour is within the range starting from the minimum value
}

// Function to generate SVG path data for contour outlines
function generateOutlineContour(d) {
  let path = "";
  // Set up interpolation scales for each edge
  let wScale = d3.scaleLinear().domain([d.SW, d.NW]).range([0, 10]); // West side
  let eScale = d3.scaleLinear().domain([d.SE, d.NE]).range([0, 10]); // East side
  let nScale = d3.scaleLinear().domain([d.NW, d.NE]).range([0, 10]); // North side
  let sScale = d3.scaleLinear().domain([d.SW, d.SE]).range([0, 10]); // South side

  // // Define the interpolation points
  const interpWest = wScale(currentContour);
  const interpEast = eScale(currentContour);
  const interpNorth = nScale(currentContour);
  const interpSouth = sScale(currentContour);

  // Compute polarity and determine the case index
  const caseIndex = polarity(d, currentContour).case;

  switch (caseIndex) {
    // NW 
    // Only the top-left corner is above the isovalue
    case 1:
    // Top-right, bottom-left, and bottom-right corners are above the isovalue
    case 14:
      path = `M ${interpNorth},${10} L ${0},${interpWest}`;
      break;

    // NE
    // Only the top-right corner is above the isovalue
    case 2:
    // Top-left, bottom-left, and bottom-right corners are above the isovalue
    case 13:
      path = `M ${interpNorth},${10} L ${10},${interpEast}`;
      break;

    // SW
    // Only the bottom-left corner is above the isovalue
    case 4:
    // Top-left, top-right, and bottom-right corners are above the isovalue
    case 11:
      path = `M ${interpSouth},${0} L ${0},${interpWest}`;
      break;

    // SE
    // Only the bottom-right corner is above the isovalue
    case 8:
    // Top-left, top-right, and bottom-left corners are above the isovalue
    case 7:
      path = `M ${interpSouth},${0} L ${10},${interpEast}`;
      break;

    // Horizontal
    // Top-left and top-right corners are above the isovalue
    case 3:
    // Bottom-left and bottom-right corners are above the isovalue
    case 12:
      path = `M ${10},${interpEast} L ${0},${interpWest}`;
      break;

    // Vertical
    // Top-left and bottom-left corners are above the isovalue
    case 5:
    // Top-right and bottom-right corners are above the isovalue
    case 10:
      path = `M ${interpNorth},${10} L ${interpSouth},${0}`;
      break;
    
    // Diagonal
    // Top-right and bottom-left corners are above the isovalue
    case 6:
    // Top-left and bottom-right corners are above the isovalue
    case 9:
      path = `M ${interpNorth},${10} L ${10},${interpEast}`;
      path += `M ${interpSouth},${0} L ${0},${interpWest} `;
      break;

    // No corners are above the isovalue; no line segments are drawn
    case 0:
      path = '';
      break;
    // All corners are above the isovalue; no line segments are drawn
    case 15:
      path = '';
      break;
    default:
      console.log("other");
      break;
  }

  // Close the path if it's not empty
  if (path !== "") {
    path += " Z";
  }

  return path;
}

// Function to generate SVG path data for filled contours
function generateFilledContour(d) {
  let path = "";
  // Set up interpolation scales for each edge
  let wScale = d3.scaleLinear().domain([d.SW, d.NW]).range([0, 10]); // West side
  let eScale = d3.scaleLinear().domain([d.SE, d.NE]).range([0, 10]); // East side
  let nScale = d3.scaleLinear().domain([d.NW, d.NE]).range([0, 10]); // North side
  let sScale = d3.scaleLinear().domain([d.SW, d.SE]).range([0, 10]); // South side

  // // Define the interpolation points
  const interpWest = wScale(currentContour);
  const interpEast = eScale(currentContour);
  const interpNorth = nScale(currentContour);
  const interpSouth = sScale(currentContour);

  // Compute polarity and determine the case index
  const caseIndex = polarity(d, currentContour).case;
  
  switch (caseIndex) {
    // NW 
    // Only the top-left corner is above the isovalue
    case 14:
      path = `M ${interpNorth},${10} L 0, 10 L ${0},${interpWest} Z`;
      break;
    // Top-right, bottom-left, and bottom-right corners are above the isovalue
    case 1:
      path = `M ${interpNorth},${10}  L 10, 10 L 10, 0 L 0, 0 L ${0},${interpWest} Z`;
      break;

    // NE
    // Only the top-right corner is above the isovalue
    case 13:
      path = `M ${interpNorth},${10} L 10, 10 L ${10},${interpEast} Z`;
      break;
    // Top-left, bottom-left, and bottom-right corners are above the isovalue
    case 2:
      path = `M ${interpNorth},${10} L 0, 10 L 0,0 L 10,0 L ${10},${interpEast} Z`;
      break;

    // SW
    // Only the bottom-left corner is above the isovalue
    case 11:
      path = `M ${interpSouth},${0} L 0, 0 L ${0},${interpWest} Z`;
      break;
    // Top-left, top-right, and bottom-right corners are above the isovalue
    case 4:
      path = `M ${interpSouth},${0} L 10,0 L 10,10 L 0,10  L ${0},${interpWest} Z`;
      break;

    // SE
    // Only the bottom-right corner is above the isovalue
    case 7:
      path = `M ${interpSouth},${0} L 10,0 L ${10},${interpEast} Z`;
      break;
    // Top-left, top-right, and bottom-left corners are above the isovalue
    case 8:
      path = `M ${interpSouth},${0}  L 0,0 L 0,10 L 10,10 L ${10},${interpEast} Z`;
      break;

    // Horizontal
    // Top-left and top-right corners are above the isovalue
    case 12:
      path = `M ${10},${interpEast} L 10,10 L 0,10 L ${0},${interpWest} Z`;
      break;
    // Bottom-left and bottom-right corners are above the isovalue
    case 3:
      path = `M ${10},${interpEast} L 10,0 L 0,0 L ${0},${interpWest} Z`;
      break;

    // Vertical
    // Top-left and bottom-left corners are above the isovalue
    case 10:
      path = `M ${interpSouth},${0} L 0,0 L 0,10 L ${interpNorth},${10} Z`;
      break;
    // Top-right and bottom-right corners are above the isovalue
    case 5:
      path = `M ${interpSouth},${0} L 10,0 L 10,10 L ${interpNorth},${10} Z`;
      break;
    
    // Diagonal
    // Top-right and bottom-left corners are above the isovalue
    case 9:
      path = `M ${10},${interpEast} L 10,10 L ${interpNorth},${10} Z`;

      path += ` M ${0},${interpWest} L 0,0 L ${interpSouth},${0} Z`;
      break;
    // Top-left and bottom-right corners are above the isovalue
    case 6:
      path = `M ${0},${interpWest} L 0,10 L ${interpNorth},${10} `;

      path += ` M ${10},${interpEast} L 10,0 L ${interpSouth},${0} Z`;
      break;

    // No corners are above the isovalue; no line segments are drawn
    case 0:
      path = 'M 0,0 L 0, 10 L 10,10 L 10,0 Z';
      break;
    // All corners are above the isovalue; no line segments are drawn
    case 15:
      path = '';
      break;
    default:
      break;
  }
  return path;
}


////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects


// d3 function to compute isocontours for all cells that span given a
// range of values, [minValue,maxValues], this function produces a set
// of size "steps" isocontours to be added to the selection "sel"
function createOutlinePlot(minValue, maxValue, steps, sel)
{
  let contourScale = d3.scaleLinear().domain([1, steps]).range([minValue, maxValue]);
  for (let i=1; i<=steps; ++i) {
    currentContour = contourScale(i);
    sel.filter(includesOutlineContour).append("path")
      .attr("transform", "translate(0, 10) scale(1, -1)") // ensures that positive y points up
      .attr("d", generateOutlineContour)
      .attr("fill", "none")
      .attr("stroke", "black");
  }
}

// d3 function to compute filled isocontours for all cells that span
// given a range of values, [minValue,maxValues], this function produces
// a set of size "steps" isocontours to be added to the selection "sel".
// colorScale is used to assign their fill color.
function createFilledPlot(minValue, maxValue, steps, sel, colorScale)
{
  let contourScale = d3.scaleLinear().domain([1, steps]).range([minValue, maxValue]);
  for (let i=steps; i>=1; --i) {
    currentContour = contourScale(i);
    sel.filter(includesFilledContour).append("path")
      .attr("transform", "translate(0, 10) scale(1, -1)") // ensures that positive y points up
      .attr("d", generateFilledContour)
      .attr("fill", function(d) { return colorScale(currentContour); });
  }
}

// Compute the isocontour plots
let plot1T = d3.select("#plot1-temperature")
    .callReturn(createSvg)
    .callReturn(createGroups(temperatureCells));
let plot1P = d3.select("#plot1-pressure")
    .callReturn(createSvg)
    .callReturn(createGroups(pressureCells));

createOutlinePlot(-70, -60, 10, plot1T);
createOutlinePlot(-500, 200, 10, plot1P);

// Compute the filled isocontour plots
let plot2T = d3.select("#plot2-temperature")
    .callReturn(createSvg)
    .callReturn(createGroups(temperatureCells));
let plot2P = d3.select("#plot2-pressure")
    .callReturn(createSvg)
    .callReturn(createGroups(pressureCells));

createFilledPlot(-70, -60, 10, plot2T, 
              d3.scaleLinear()
                .domain([-70, -60])
                .range(["blue", "red"]));
createFilledPlot(-500, 200, 10, plot2P, 
              d3.scaleLinear()
                .domain([-500, 0, 500])
                .range(["#ca0020", "#f7f7f7", "#0571b0"]));
