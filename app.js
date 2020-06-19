

// var svgWidth = window.innerWidth;
// var svgHeight = window.innerHeight;
function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()){
        svgArea.remove();
    }



    var svgWidth = 960;
    var svgHeight = 600;

    var margin = {
        top: 20,
        right: 40,
        bottom: 100,
        left: 100
    };

    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    var svg = d3.select("body")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "insurance";

    // Function update x-scale var upon click on axis label
    function xScale(data, chosenXAxis){
        // Create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d=>d[chosenXAxis]), d3.max(data, d=>d[chosenXAxis])])
            .range([0, width]);
        
        return xLinearScale;
    }

    // Function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis){
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        
        return xAxis;
    }

    // Function used for updating circles group with a transition to 
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis){

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));

        return circlesGroup;
    }

    // Function used for updating circles group with new tooltip
    // function updateToolTip(chosenXAxis, circlesGroup){
    //     var label;

    //     if (chosenXAxis === "poverty"){
    //         label = "poverty";
    //     }
    //     else if(chosenXAxis === "age"){
    //         label = "age";
    //     }
    //     else (chosenXAxis === "income"){
    //         label = "income";
    //     }
    // }

    d3.csv("../Resources/database_2018.csv").then(function (database2018) {
        console.log("Print CSV file", database2018)
        var txtPoverty = [];
        var txtInsurance = [];
        database2018.forEach(function (d) {
            d.state = d.state;
            d.insurance = +d.insurance;
            d.age = +d.age;
            d.income = +d.income;
            d.poverty = +d.poverty;
            txtPoverty.push(d.poverty);
            txtInsurance.push(d.insurance);
            d.obses = +d.obses;
            d.smokes = +d.smokes;

            // console.log("txtPoverty= ",txtPoverty)
            // console.log("Insurance= ", insurance);
        });
        console.log("txtPoverty= ", txtPoverty)
        // Create Scale functions
        var xLinearScale = d3.scaleLinear()
            .domain([0, d3.max(database2018, d => d.poverty)])
            .range([0, chartWidth]);
        console.log("x coordinte=", xLinearScale)

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(database2018, d => d.insurance)])
            .range([chartHeight, 0]);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart
        chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        var circlesGroup = chartGroup.selectAll("circle")
            .data(database2018)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.insurance))
            .attr("r", "10")
            .attr("fill", "lightblue")
            .attr("opacity", "1")
           
        //== add text to circle ==
        var xtxtState = d3.scaleLinear()
            .domain(txtPoverty)
            .range([0, chartWidth]);
        var ytxtState = d3.scaleLinear()
            .domain(txtInsurance)
            .range([chartHeight, 0]);

        // console.log(`x-co = ${txtPoverty[1]}`);

        var circleLabels = chartGroup.selectAll(".text-label")
            .data(database2018)
            .enter()
            .append("text")
            .classed('text-label', true)
            .attr("font-size", 9)
            .attr("dx", d => xLinearScale(d.poverty) - 6)
            .attr("dy", d => yLinearScale(d.insurance) + 2)
            .text(d => d.state)
            // .style("fill", "white");

        //== add y axis labels ==
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 70)
            .attr("x", 0 - (chartHeight / 2))
            .attr("class", "axisText")
            .text("Medicare Coverage (%)")
            .attr("font-size", 12)
            .style("fill", "black");

        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 50)
            .attr("x", 0 - (chartHeight / 2))
            .attr("class", "axisText")
            .text("Smokes(%)")
            .attr("font-size", 12)
            .style("fill", "black");

        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 30)
            .attr("x", 0 - (chartHeight / 2))
            .attr("class", "axisText")
            .text("Obese (%)")
            .attr("font-size", 12)
            .style("fill", "black");

        //== add x axis labels ==
        chartGroup.append("text")
            // .classed("poverty", true)
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 20})`)
            .attr("class", "axisText")
            .text("Poverty (%)")
            .attr("font-size", 12)
            .style("fill", "black");

        chartGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 40})`)
            .attr("class", "axisText")
            .text("Age (Median)")
            .attr("font-size", 12)
            .style("fill", "black");

        chartGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 60})`)
            .attr("class", "axisText")
            .text("Household Income (Median)")
            .attr("font-size", 12)
            .style("fill", "black");

        //== add tool tip ==
        var toolTip = d3.select("body").append("div")
        // var toolTip = chartGroup.append("div")
            // .attr("class", "tooltip")
            .classed("tooltip", true)
            .style('display', 'none');
            // .attr('dx', '100')
            // .attr('dy', '100')
            // .style("opacity",".5")
            // .html('TOOLTIP');
        
        circlesGroup.on("mouseover", function(d){
            toolTip.style("display", "block")
                .html(`${d.state}<hr>Poverty:${d.poverty}%<br>Insurance:${d.insurance}%`)
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");
        })
            .on("mouseout", function(d){
                toolTip.style("display", "none");
            })
    }).catch(function (error) {
            console.log(error);
    });
};
        
makeResponsive();
d3.select(window).on("resize", makeResponsive);
