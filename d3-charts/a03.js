// 
// a03.js
// CSC444 Assignment 03, Spring 2024
// Yahya Al Malallah <yahyaalmalallah@arizona.edu>
//
// The purpose of this assignment is to recreate four different charts (chart_1, chart_2, chart_3, scatterplot_2) using SVG elements and D3.js.
// Populating these charts with data from the ukDriverFatalities and scores datasets.

// Helper function to calculate color based on count
function color(count) {
    // Calculate the amount of color based on count
    var amount = (2500 - count) / 2500 * 255;
    // Calculate different shades of color using clamp function
    var s = clamp(amount), s2 = clamp(amount / 2 + 127), s3 = clamp(amount / 2 + 127);
    // Return RGB color string
    return rgb(s, s2, s3);
}

// Helper function to ensure a value is within the range [0, 255]
function clamp(v) {
    return Math.floor(Math.max(0, Math.min(255, v)));
}

// Helper function to create RGB color string
function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

// Function to calculate width of rectangles based on SVG width
function rectWidth(svgWidth) { 
    return function() { 
        return Math.ceil(svgWidth / ukDriverFatalities.length);
    };
}

// Function to calculate height of rectangles based on SVG height and count
function rectHeight(svgHeight) {
    return function(row, index) { 
        return row.count / 2500 * svgHeight; 
    };
}

// Function to calculate x-coordinate of rectangles based on SVG width and index
function rectX(svgWidth) { 
    return function(row, index) {
        return index * svgWidth / ukDriverFatalities.length; 
    };
}

// Function to calculate y-coordinate of rectangles based on SVG height, count, and index
function rectY(svgHeight) {
    return function(row, index) {
        return svgHeight - (row.count / 2500 * svgHeight);
    };
}

// Function to map GPA score to x-coordinate
function mapGPAToX(gpa) {
    return (gpa / 4.00) * (500 - margin.left - margin.right);
}

// Function to map ACT score to y-coordinate
function mapACTToY(act) {
    return (1 - (act / 36)) * (500 - margin.top - margin.bottom);
}

// Function to map SATV score to circle radius
function mapSATVToRadius(satv) {
    return (satv / 800) * 5; 
}

// Function to map SATM score to circle color
function mapSATMToColor(satm) {
    // Define minimum and maximum scores for SATM
    const minScore = 200;
    const maxScore = 800;
    // Normalize SATM score to range [0, 1]
    const normalizedScore = (satm - minScore) / (maxScore - minScore);    // Darker blue means higher SATM score
    // Calculate RGB components for color based on normalized score
    const r = 255 * (1 - normalizedScore);
    const g = 255 * (1 - normalizedScore);
    const b = 255 * (0);
    // Return RGB color string
    return "rgb(" + r + "," + g + "," + b + ")";
}

// The creation of the charts (chart_1, chart_2, chart_3, scatterplot_2)
// Create SVG element for chart_1
var chart1 = d3.select("#vis1")
    .append("svg")
    .attr("width", 600)
    .attr("height", 300)
    .attr("class", "my-chart");
// Plot rectangles using D3 in chart_1
chart1.selectAll("rect")
    .data(ukDriverFatalities)
    .enter()
    .append("rect")
    .attr("width", () => Math.ceil(600 / (1984 - 1969 + 1)))
    .attr("height", () => Math.ceil(300 / 12))
    .attr("x", (d) => Math.ceil(600 / (1984 - 1969 + 1)) * (d.year - 1969))
    .attr("y", (d) => Math.ceil(300 / 12) * (11 - d.month))
    .attr("fill", (d) => color(d.count));

// Create SVG element for chart_2
var chart2 = d3.select("#vis2")
    .append("svg")
    .attr("width", 600)
    .attr("height", 300)
    .attr("class", "my-chart");
// Plot circles using D3 in chart_2
chart2.selectAll("circle")
    .data(ukDriverFatalities)
    .enter()
    .append("circle")
    .attr("cx", (d) => Math.ceil(600 / (1984 - 1969 + 1)) * (d.year - 1969 + 0.5))
    .attr("cy", (d) => Math.ceil(300 / 12) * (11 - d.month + 0.5))
    .attr("r", (d) => d.count / 500 * 3)
    .attr("stroke", "white")
    .attr("fill", "blue");

// Create SVG element for chart_3
var chart3 = d3.select("#vis3")
    .append("svg")
    .attr("width", 600)
    .attr("height", 300)
    .attr("class", "my-chart");
// Plot rectangles using D3 in chart_3
chart3.selectAll("rect")
    .data(ukDriverFatalities)
    .enter()
    .append("rect")
    .attr("width", rectWidth(600))
    .attr("height", rectHeight(300))
    .attr("x", rectX(600))
    .attr("y", rectY(300));

// scatterplot 2 creation
// Margin for the axis
const margin = { top:10, right: 10, bottom: 50, left: 50}; 
// Create SVG element for scatterplot_2
var scatterplot_2 = d3.select("#vis4")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .attr("class", "my-chart");
// Plot circles using D3 in scatterplot_2
scatterplot_2.selectAll("circle")
    .data(scores)
    .enter()
    .append("circle")
    .attr("cx", (d) => margin.left + mapGPAToX(d.GPA))
    .attr("cy", (d) => margin.top + mapACTToY(d.ACT))
    .attr("r", (d) => mapSATVToRadius(d.SATV))
    .attr("fill", (d) => mapSATMToColor(d.SATM))


// Create x-axis line for scatterplot_2
scatterplot_2.append("line")
    .attr("x1", margin.left)
    .attr("y1", 500 - margin.bottom)
    .attr("x2", 500 - margin.right)
    .attr("y2", 500 - margin.bottom)
    .attr("stroke", "black");
// Create x-axis ticks and labels for scatterplot_2
const xTicks = d3.range(0, 5, 0.5);
scatterplot_2.selectAll(".xTick")
    //ticks
    .data(xTicks)
    .enter()
    .append("line")
    .attr("class", "xTick")
    .attr("x1", d => margin.left + (d / 4) * (500 - margin.left - margin.right))
    .attr("y1", 500 - margin.bottom - 5)
    .attr("x2", d => margin.left + (d / 4) * (500 - margin.left - margin.right))
    .attr("y2", 500 - margin.bottom + 5)
    .attr("stroke", "black");
    //labels
    scatterplot_2.selectAll(".xLabel")
    .data(xTicks)
    .enter().append("text")
    .attr("class", "xLabel")
    .attr("x", d => margin.left + (d / 4) * (500 - margin.left - margin.right))
    .attr("y", 500 - margin.bottom + 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text(d => d.toFixed(2));
// Create x-axis label for scatterplot_2
scatterplot_2.append("text")
    .attr("x", (500 - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 500 - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text("GPA");

// Create y-axis line for scatterplot_2
scatterplot_2.append("line")
    .attr("x1", margin.left)
    .attr("y1", margin.top)
    .attr("x2", margin.left)
    .attr("y2", 500 - margin.bottom)
    .attr("stroke", "black");
// Create y-axis ticks and labels for scatterplot_2
const yTicks = d3.range(0, 37, 4);
scatterplot_2.selectAll(".yTick")
    //ticks
    .data(yTicks)
    .enter().append("line")
    .attr("class", "yTick")
    .attr("x1", margin.left - 5)
    .attr("y1", d => margin.top + (d / 36) * (500 - margin.top - margin.bottom))
    .attr("x2", margin.left + 5)
    .attr("y2", d => margin.top + (d / 36) * (500 - margin.top - margin.bottom))
    .attr("stroke", "black");
    //labels
    scatterplot_2.selectAll(".yLabel")
    .data(yTicks)
    .enter().append("text")
    .attr("class", "yLabel")
    .attr("x", margin.left - 10)
    .attr("y", d => margin.top + (d / 36) * (500 - margin.top - margin.bottom) + 4)
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .text(d => 36 - d);
// Create y-axis label for scatterplot_2
scatterplot_2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(500 - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text("ACT");
