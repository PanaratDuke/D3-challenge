
var svgWidth = 960;
var svgHeight = 500;


var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};


var axisWidth = svgWidth - margin.left - margin.right;
var axisHeight = svgHeight - margin.top - margin.bottom;

// Organize axis information
var xAxes = [
  {"statistic" : "poverty",
   "label": "In Poverty (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "age",
   "label": "Age (Median)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "income",
   "label": "Household Income (Median)",
   "min_value" : 100000.0,
   "max_value" : -100000.0}
];
var yAxes = [
  {"statistic" : "obesity",
   "label": "Obese (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "smokes",
   "label": "Smokes (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "healthcare",
   "label": "Lacks Healthcare (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0}
];
var currentXStatistic = "none";
var currentYStatistic = "none";


var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("style","background-color:lightcyan");

// Append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("fill", "white");

// Create group for x-axis labels
var xLabelsGroup = svg.append("g")
                      .attr("transform", `translate(${margin.left + axisWidth/2}, ${margin.top + axisHeight + 20})`);

xAxes.map((axis, i) => {
  xLabelsGroup.append("text")
             .attr("x", 0)
             .attr("y", 15 + i * 20)
             .attr("value", axis.statistic) // value to grab for event listener
             .attr("id", axis.statistic)
             .classed("active", i == 0)
             .classed("inactive", i != 0)
             .text(axis.label);
});

xLabelsGroup.selectAll("text")
            .on("click", function() {
  let newXStatistic = d3.select(this).attr("value");
  xLabelsGroup.select(`#${currentXStatistic}`).classed("active", false).classed("inactive", true);
  xLabelsGroup.select(`#${newXStatistic}`).classed("active", true).classed("inactive", false);
  updateChart(newXStatistic, currentYStatistic);
});

// Create group for y-axis labels
var yLabelsGroup = svg.append("g")
                      .attr("transform", `translate(0, ${axisHeight/2})`);

yAxes.map((axis, i) => {
  yLabelsGroup.append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", 0)
              .attr("y", 20 + i * 20)
              .attr("value", axis.statistic) // value to grab for event listener
              .attr("id", axis.statistic)
              .classed("active", i == 0)
              .classed("inactive", i != 0)
              .text(axis.label);
});

yLabelsGroup.selectAll("text")
            .on("click", function() {
  let newYStatistic = d3.select(this).attr("value");
  yLabelsGroup.select(`#${currentYStatistic}`).classed("active", false).classed("inactive", true);
  yLabelsGroup.select(`#${newYStatistic}`).classed("active", true).classed("inactive", false);
  updateChart(currentXStatistic, newYStatistic);
});

// Retrieve data from the CSV file and execute everything below
var povertyData = null;
var circlesGroup = null;
var xAxisGroup = null;
var yAxisGroup = null;
d3.csv("Resources/database_2018.csv").then(data => {
  // Select the necessary object attributes
  // Convert numeric fields from strings
  // Test for min & max for each statistic
  povertyData = data.map(r => {
    newRow = {};
    newRow.state = r.StateName;
    newRow.abbr = r.state;

    xAxes.map(axis => {
      rFloat = +r[axis.statistic];
      newRow[axis.statistic] = rFloat;
      if (rFloat < axis.min_value) axis.min_value = rFloat;
      if (rFloat > axis.max_value) axis.max_value = rFloat;
    });

    yAxes.map(axis => {
      rFloat = +r[axis.statistic];
      newRow[axis.statistic] = rFloat;
      if (rFloat < axis.min_value) axis.min_value = rFloat;
      if (rFloat > axis.max_value) axis.max_value = rFloat;
    });

    return newRow;
  });

  // Draw the initial chart
  currentXStatistic = xAxes[0].statistic;
  currentYStatistic = yAxes[0].statistic;
  let xLinearScale = xScale(currentXStatistic);
  let yLinearScale = yScale(currentYStatistic);

  // X-axis
  let bottomAxis = d3.axisBottom(xLinearScale);
  xAxisGroup = chartGroup.append("g")
                             .classed("x-axis", true)
                             .attr("transform", `translate(0, ${axisHeight})`)
                             .call(bottomAxis);

  // Y-axis
  let leftAxis = d3.axisLeft(yLinearScale);
  yAxisGroup = chartGroup.append("g")
              .classed("y-axis", true)
              .call(leftAxis);

  // Draw Circles
  circlesGroup = chartGroup.selectAll("circle")
                           .data(povertyData)
                           .enter()
                           .append("circle")
                           .attr("cx", d => xLinearScale(d[currentXStatistic]))
                           .attr("cy", d => yLinearScale(d[currentYStatistic]))
                           .attr("r", 15)
                           .attr("opacity", ".5")
                           .classed("stateCircle", true);

  // Add Text Labels on top of Circles
  abbrGroup = chartGroup.selectAll(".stateText")
                        .data(povertyData)
                        .enter()
                        .append("text")
                        .text(d => d.abbr)
                        .attr("x", d => xLinearScale(d[currentXStatistic]))
                        .attr("y", d => yLinearScale(d[currentYStatistic])+5)
                        .classed("stateText", true);

  // Add Tool Tips for hover on every circle
  updateToolTip(currentXStatistic, currentYStatistic);
}
);

/*
 *     UPDATE CHART
 */
function updateChart(newXStatistic, newYStatistic) {
  let xLinearScale = xScale(newXStatistic);
  let yLinearScale = yScale(newYStatistic);

  if (newXStatistic != currentXStatistic) {
    // Update x-axis
    let bottomAxis = d3.axisBottom(xLinearScale);
    xAxisGroup.transition()
              .duration(1000)
              .call(bottomAxis);
    currentXStatistic = newXStatistic;
  }

  if (newYStatistic != currentYStatistic) {
    let leftAxis = d3.axisLeft(yLinearScale);
    yAxisGroup.transition()
              .duration(1000)
              .call(leftAxis);
    currentYStatistic = newYStatistic;
  }

  // Update circle positions
  circlesGroup.transition()
              .duration(1000)
              .attr("cx", d => xLinearScale(d[newXStatistic]))
              .attr("cy", d => yLinearScale(d[newYStatistic]));

  // Update state abbreviation positions
  abbrGroup.transition()
           .duration(1000)
           .attr("x", d => xLinearScale(d[newXStatistic]))
           .attr("y", d => yLinearScale(d[newYStatistic])+5);

  updateToolTip(newXStatistic, newYStatistic);
}

// -------------------------------------------------------------
//     UTILITY FUNCTIONS
//--------------------------------------------------------------

function xScale(xStatistic) {
  let idx = statistic2Index(xStatistic);
  return d3.scaleLinear()
           .domain([xAxes[idx].min_value * 0.8, xAxes[idx].max_value * 1.2])
           .range([0, axisWidth]);
}

function yScale(yStatistic) {
  let idx = statistic2Index(yStatistic);
  return d3.scaleLinear()
           .domain([yAxes[idx].min_value * 0.8, yAxes[idx].max_value * 1.2])
           .range([axisHeight, 0]);
}

function statistic2Index(statistic) {
  let index = 0;
  switch(statistic) {
    case "age":
    case "smokes":
      index = 1;
      break;
    case "income":
    case "healthcare":
      index = 2;
      break;
  }
  return index;
}

// function used for updating circles group with new tooltip
function updateToolTip(xStatistic, yStatistic) {
  let xIdx = statistic2Index(xStatistic);
  let yIdx = statistic2Index(yStatistic);

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xAxes[xIdx].label}:  ${d[xStatistic]}<br>${yAxes[yIdx].label}:  ${d[yStatistic]}`);
    });

  circlesGroup.call(toolTip)
              .on('mouseover', toolTip.show)
              .on('mouseout', toolTip.hide);
}