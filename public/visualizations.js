const urls = {
    geoJSON_MapUS: "https://davidvu408.github.io/misc-assets/job-search/us.json",
    totalApplications: '/getOdometerData',
    jobBoardSources: '/jobBoardPieChart',
    jobApplicationsToCities: '/applicationsBubbleMap',
    sankeyDiagramCompatibleData: '/applicationSankeyDiagram'
}


function createApplicationOdometers() {
    // Fill in top-level Application data
    fetch(urls.totalApplications)
        .then(((res) => res.json()))
        .then((data) => {
            totalApplicationsOdemeter.innerHTML = data.totalApplications;
            daysJobSearchingOdemeter.innerHTML = data.numDaysJobSearch;
            averageApplicationsOdemeter.innerHTML = data.averageAppsPerDay;
        }).catch((e) => {
            console.log(e);
        });
}

function createJobBoardPieChart() {
    let container = document.getElementById('job-board-pie-chart-container');
    // Calculate width for Pie Chart & Legend
    let width = container.clientWidth / 2,
        height = container.clientWidth / 2;

    let colorPallete = ["#6dccda", "#cdcc5d", "#a2a2a2", "#ed97ca", "#a8786e", "#ad8bc9", "#ed665d", "#67bf5c", "#ff9e4a", "#729ece"];
    let color = d3.scale.ordinal().range(colorPallete);

    d3.json(urls.jobBoardSources, function(data) {
        if (colorPallete.length < data.length) throw "Too many job board sources, not enough colors in the pallete";


        // Manipulations to data obj
        (function() {
            data.sort((a, b) => (a.value < b.value) ? 1 : -1); // Sort by DESC value        
            // Add relative percentages
            let totalValues = 0;
            data.forEach((d) => {
                totalValues += d.value;
            });
            data.forEach((e) => {
                e.relativePercentage = ((e.value / totalValues) * 100).toFixed(2) + '%';
            });
        })();

        // Create Pie Chart
        (function() {
            let chart = d3.select("#job-board-pie-chart")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height].join(' '))
                .attr("preserveAspectRatio", "xMidYMid")
                .append("g")
                .attr("transform", "translate(" + ((width / 2)) + "," + ((height / 2)) + ")")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height].join(' '))
                .attr("preserveAspectRatio", "xMidYMid");


            let radius = (Math.min(width, height) / 2) - 25;
            let arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(25);

            let pie = d3.layout.pie()
                .sort(null)
                .startAngle(1.1 * Math.PI)
                .endAngle(3.1 * Math.PI)
                .value(function(d) { return d.value; });


            let g = chart.selectAll(".arc")
                .data(pie(data))
                .enter().append("g")
                .attr("class", "arc");


            g.append("path")
                .attr("fill", function(d, i) { return color(i); })
                .transition()
                .ease("exp")
                .duration(2000)
                .attrTween("d", tweenPie);

            function tweenPie(b) {
                let i = d3.interpolate({ startAngle: 1.1 * Math.PI, endAngle: 1.1 * Math.PI }, b);
                return function(t) { return arc(i(t)); };
            }
        })();


        // Create Job Board Legend
        (function() {
            let legend = d3.select("#job-board-legend")
                .attr("width", width)
                .attr("height", height)
                .style("overflow", "visible");

            // create a list of keys
            let keys = data.map((e) => e.name);

            // Usually you have a color scale in your chart already
            let legendColor = d3.scale.ordinal()
                .domain(keys)
                .range(colorPallete);

            var ordinal = d3.scale.ordinal()
                .domain(keys)
                .range(colorPallete);

            // Add bullets for each name
            legend.selectAll("mydots")
                .data(keys)
                .enter()
                .append("circle")
                .attr("cx", 0)
                .attr("cy", function(d, i) { return 75 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 7)
                .style("fill", function(d, i) { return color(i) })

            // Add labels for each name
            legend.selectAll("mylabels")
                .data(keys)
                .enter()
                .append("text")
                .attr("x", 25)
                .attr("y", function(d, i) { return 75 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d, i) { return color(i) })
                .text(function(d, i) { return d + ' ' + data[i].relativePercentage })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
        })();

    });
}

function createApplicationFrequencyMap() {
    let bubbleMapContainer = document.getElementById('application-bubble-map');
    let width = bubbleMapContainer.clientWidth;
    let height = bubbleMapContainer.clientWidth / 1.92;

    // D3 Projection
    let projection = d3.geo.albersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([width]); // scale things down so see entire US

    // Define path generator
    let path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    let svg = d3.select("#application-bubble-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height].join(' ')) // Initialize viewbox
        .attr("preserveAspectRatio", "xMidYMid"); // Set aspect ratio to be preserved

    // Append Div for tooltip to SVG
    let div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // Load GeoJSON data and merge with states data
    d3.json(urls.geoJSON_MapUS, function(json) {

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function(d) {
                // Get data value
                let value = d.properties.visited;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "rgb(213,222,217)";
                }
            });

        // Map job applications frequency to cities
        d3.json(urls.jobApplicationsToCities, function(data) {
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return projection([d.lng, d.lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.lng, d.lat])[1];
                })
                .attr("r", function(d) {
                    return Math.sqrt(d.appCount) * 1.5;
                })
                .style("fill", "rgb(217,91,67)")
                .style("opacity", 0.85)

                // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
                // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.city + ',' + d.state + ',' + d.country + '<br>' + 'Applications Sent: ' + d.appCount)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

                })

                // fade out tooltip on mouse out               
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });

    });
}

function createApplicationsSankeyDiagram() {
    let container = document.getElementById('applications-sankey-diagram-container');

    let width = container.clientWidth * 0.8;
    let height = width / 2;
    // Use different color pallete then Pie Chart to differentiate meaning
    let color = d3.scale.category20();

    // append the svg canvas to the page
    let svg = d3.select("#applications-sankey-diagram").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height].join(' '))
        .attr("preserveAspectRatio", "xMidYMid")
        .style("overflow", "visible")
        .append("g");

    // Set the sankey diagram properties
    let sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(10)
        .size([width, height]);

    let path = sankey.link();

    // load the data
    d3.json(urls.sankeyDiagramCompatibleData, function(error, graph) {
        let nodeMap = {};
        graph.nodes.forEach(function(x) {
            nodeMap[x.name] = x;
        });
        graph.links = graph.links.map(function(x) {
            return {
                source: nodeMap[x.source],
                target: nodeMap[x.target],
                value: x.value
            };
        });

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        // add in the links
        let link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy);
            })
            .sort(function(a, b) { return a.dy - b.dy; });

        // add the link titles
        link.append("title")
            .text(function(d) {
                return d.source.name + " → " + d.target.name + d.value;
            })
            .style('font-size', '14px');

        // add in the nodes
        let node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("dragstart", function() {
                    this.parentNode.appendChild(this);
                })
                .on("drag", dragmove));

        // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", '35')
            .style("fill", function(d) {
                return d.color = color(d.name.replace(/ .*/, ""));
            })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title")
            .text(function(d) {
                return d.name + "\n" + d.value;
            });

        // add in the title for the nodes
        node.append("text")
            .attr("x", -5)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name + ": " + d.value; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this).attr("transform",
                "translate(" + (
                    d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
                ) + "," + (
                    d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
    });
}

function setEventListeners() { // Make Bubble Map Responsive
    d3.select(window).on('resize', onResize);

    function onResize() {
        // Reset Bubble Map Dimensions
        (function() {
            let bubbleMapContainer = document.getElementById('application-bubble-map');
            // Get current svg container dimensions        
            let width = bubbleMapContainer.clientWidth;
            let height = bubbleMapContainer.clientWidth / 1.92;
            // Reset the svg dimensions, preserveAspectRatio attribute will take care of rescaling
            d3.select("#application-bubble-map > svg")
                .attr('width', width)
                .attr('height', height);
        })();

        // Reset Pie Chart Dimensions
        (function() {
            let pieChartContainer = document.getElementById('job-board-pie-chart-container');
            // Get current svg container dimensions        
            let width = pieChartContainer.clientWidth / 2;
            let height = pieChartContainer.clientWidth / 2;
            // Reset the svg dimensions, preserveAspectRatio attribute will take care of rescaling
            d3.select("#job-board-pie-chart")
                .attr('width', width)
                .attr('height', height);
            d3.select("#job-board-pie-chart > g")
                .attr('width', width)
                .attr('height', height);
        })();

        // Reset Sankey Diagram Dimensions
        (function() {
            let sankeyDiagramContainer = document.getElementById('applications-sankey-diagram-container');
            // Get current svg container dimensions        
            let width = sankeyDiagramContainer.clientWidth * 0.8;
            let height = width / 2;
            // Reset the svg dimensions, preserveAspectRatio attribute will take care of rescaling
            d3.select("#applications-sankey-diagram > svg")
                .attr("width", width)
                .attr("height", height);
        })();
    }
}