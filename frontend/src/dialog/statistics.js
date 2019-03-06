const statistics = {
    endpoint_id: "statistics_content",

    text: {
        de: {
            title: "Statistik",
            info: "Statistische Kennzahlen",
            indicator: "verfügbare Indikatoren",
            choice: "Bitte wählen.....",
            no_choice: "Kein Indikator gewählt",
            load: "Lädt Diagramm......",
            pnt: "alle Stützpunkte",
            trend: "Prognosewerte",
            unit: "Einheit",
            chart: "Statistik für Gebietseinheit",
            for: "für",
            time: "Zeitpunkt",
            min: "Minimum",
            max: "Maximum",
            average: "Mittelwert",
            median: "Median",
            stDev: "Standartabweichung",
            deviation:"Abweichung vom Mittelwert",
            areaCount: "Anzahl in die Berechnung einbezogenen Gebietseinheiten",
            probability:"Wahrscheinlichkeit"

        },
        en: {
            title: "Statistics",
            info: "Statistical indicators",
            indicator: "available indicators",
            choice: "Please choose.....",
            no_choice: "No indicator selected",
            load: "Loading diagram ......",
            pnt: "all base points",
            trend: "Forecast values",
            unit: "Unit",
            chart: "Basic statistics for territorial unit",
            for: "for",
            time: "Timestamp",
            min: "Minimum",
            max: "Maximum",
            average: "Mean",
            median: "Median",
            stDev: "Standard deviation",
            deviation:"Deviation from mean",
            areaCount: "Number of administrative areas used in calculation",
            probability: "Probability"
        }
    },

    open: function () {
        console.log("Starting: Values read")
        let lan = language_manager.getLanguage(),
            geoJSON = this.chart.settings.allValuesJSON;
        this.chart.settings.lan=lan;
        // todo REINIS REFACTOR the getting of Data Values TO init:function(..){....} !!!  Here only the Visualisation Data-, html binding!
        this.chart.settings.allValuesObjectArray = this.getAllValues(geoJSON);
        this.chart.settings.currentValue = this.getCurrentValue(geoJSON);
        this.chart.settings.areaCount = this.getAreaCount(geoJSON);
        this.chart.settings.areaType = this.getAreaType(geoJSON);
        this.chart.settings.statistics = this.calculateStatistics(statistics.getOnlyValues(this.chart.settings.allValuesObjectArray));
        this.chart.data=this.sortObjectAscending(this.chart.settings.allValuesObjectArray,"value","ags");
        this.chart.data = this.getDistributionFunctionValues(this.chart.data);
        this.chart.data = this.getDeviationValues(this.chart.data, this.chart.settings.statistics.average);
        let chart = this.chart;
        const timeStamp = zeit_slider.getTimeSet();

        let html = he.encode(`
             <div class="jq_dialog" id="${this.endpoint_id}">
                <div class="container">
                    <div class="header">               
                        <h4>${this.text[lan].info} ${this.text[lan].for}: ${chart.settings.indText}</h4>
                        <h4 id="selectedArea">${chart.settings.name}</h4>
                        <h6 id="selectedAGS">AGS: ${chart.settings.ags}</h6>
                        <h6 id="timeStamp">${this.text[lan].time}: ${timeStamp}</h6>
                        <h6 id="currentValue">${chart.settings.indText}: ${chart.settings.currentValue} ${chart.settings.indUnit} </h6>
                    </div>
                    <hr />
                    <div class="table"> 
                    <h4>${this.text[lan].info}</h4>
                    <table id="statistics_table"  style="width:100%">
                          <tr>
                            <td>${this.text[lan].areaCount}</td>
                            <td>${chart.settings.allValuesObjectArray.length}</td>
                            <td>${chart.settings.areaType}</td>
                            
                          </tr>
                          <tr>
                            <td>${this.text[lan].average}</td>
                            <td>${chart.settings.statistics.average}</td>
                            <td>${chart.settings.indUnit}</td>
                            
                          </tr>
                          <tr>
                            <td>${this.text[lan].median}</td>
                            <td>${chart.settings.statistics.median}</td>
                            <td>${chart.settings.indUnit}</td>
                          </tr>
                          <tr>
                            <td>${this.text[lan].stDev}</td>
                            <td>${chart.settings.statistics.stDeviation}</td>
                            <td>${chart.settings.indUnit}</td>
                          </tr>
                          <tr>
                            <td>${this.text[lan].max}</td>
                            <td>${chart.settings.statistics.max}</td>
                            <td>${chart.settings.indUnit}</td>
                          </tr>                          <tr>
                            <td>${this.text[lan].min}</td>
                            <td>${chart.settings.statistics.min}</td>
                            <td>${chart.settings.indUnit}</td>
                          </tr>
                          
                    </table>
                    </div>
                    <div id="container_diagramm" class="container_diagramm">
                        <div id="diagramm">
                            <h3 class="Hinweis_diagramm" id="Hinweis_diagramm_empty">${this.text[lan].no_choice}</h3>
                            <h3 class="Hinweis_diagramm" id="diagramm_loading_info">${this.text[lan].load}</h3>
                            <svg id="visualisation" height="100"></svg>
                        </div>
                        <div id="tooltip"></div>
                    </div>
                </div>
            </div>
                                  `);

        //settings for the manager
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html = html;
        dialog_manager.instructions.title = this.text[lan].title;
        dialog_manager.create();
        chart.init();


    },

    chart: {
        settings: {
            lan:"",
            ags: "",
            ind: "",
            indText: "",
            indUnit: "",
            name: "",
            allValuesJSON: "",
            currentValue: "",
            allValuesObjectArray: {},
            areaCount: "",
            areaType: {},
            statistics: {
                min: ",",
                max: ",",
                average: "",
                median: "",
                stDeviation: ""
            }
        },
        data: [],
        init: function () {

            // TODO REINIS Set correct Height and Width of the Visualisation!!
            $("#statistics_content #visualisation").height(532);
            $("#statistics_content #visualisation").width(1100);
            let svg = d3.select("#statistics_content #visualisation"),
                margin = {top: 20, right: 60, bottom: 30, left: 60},
                diagram = $('#statistics_content #diagramm'),
                chart_width = diagram.width() - margin.left - margin.right,
                chart_height = $('.ui-dialog').height() * (1.5 / 3) - 100;
            this.controller.showVisualisation(2, svg, chart_width, chart_height, margin);
        },
        controller: {
            showVisualisation: function (selection, svg, chart_width, chart_height, margin) {
                console.log("Starting visualisation: Controller start")
                // TODO REINIS diese Variabeln definitionen sinnvoll???
                let data = statistics.chart.data,
                    chart = statistics.chart,
                    selectedAgs = chart.settings.ags,
                    mean = chart.settings.statistics.average,
                    xAxisName = "",
                    yAxisName = "",
                    indUnit = "";

                if (selection == 1) {
                    // Bar graph of Values Ascending!!!!!
                    console.log("Starting visualisation: Selection: 1")
                    let dataSorted = statistics.sortObjectAscending(data, "value", "ags");
                    xAxisName = chart.settings.areaType;
                    yAxisName = chart.settings.indText;
                    indUnit = chart.settings.indUnit;
                    statistics.drawOrderedValuesChart(dataSorted, xAxisName, yAxisName, indUnit, selectedAgs, mean, svg, chart_width, chart_height, margin);

                }
                else if(selection=2){
                    // Line graph, distribution Function !!!!!
                    console.log("Starting visualisation: Selection: 2")
                    let dataSorted = statistics.sortObjectAscending(data, "distFuncValue", "ags");
                    console.log(dataSorted);
                    xAxisName = chart.settings.indText;
                    yAxisName = statistics.text[chart.settings.lan].probability;
                    indUnit = chart.settings.indUnit;
                    // TODO REINIS finish THIS! Graph for Verteilungsfunktion!
                    statistics.drawLineGraph(dataSorted, xAxisName, yAxisName, indUnit, selectedAgs, mean, svg, chart_width, chart_height, margin)
                }
                else {console.log("No graphical option chosen!")}

            }
            /*
            //call on select inside the toolbar
            $(document).on("click", dev_chart.chart_selector, function () {
                let callback = function () {
                    if(get_ags()) {
                        dev_chart.chart.settings.ags = get_ags();
                        dev_chart.chart.settings.name = get_name();
                        dev_chart.chart.settings.ind = indikatorauswahl.getSelectedIndikator();
                        dev_chart.chart.settings.ind_vergleich = false;
                        dev_chart.open();
                    }
                };
                try {
                    set_swal(callback);
                }catch(err){
                    alert_manager.alertError();
                }
            })
            */

        },

    },


    getAllValues: function (geoJSON) {
        // extracts the indicator Values from GeoJSON
        let valueArray = [];
        for (let elem in geoJSON.features) {
            let object = geoJSON["features"][elem]["properties"];
            // checks if Object has "value_comma" property and it is not empty, then fetches the value
            if (object.hasOwnProperty("value_comma") && object.value_comma !== "") {
                //create object:
                let obj = {name: object.gen, value: this.parseFloatWithComma(object.value_comma), ags: object.ags};
                if (typeof obj.value == "number") {
                    valueArray.push(obj);
                }
            }
        }
        return valueArray;

    },

    getCurrentValue: function (geoJSON) {
        let currentValue = null;
        // check if geoJSON has value "ags", and finds the corresponding value
        for (let elem in this.chart.settings.allValuesJSON["features"]) {
            let object = geoJSON["features"][elem]["properties"];
            if (object.hasOwnProperty("ags")) {
                if (object["ags"] == this.chart.settings.ags) {
                    currentValue = this.parseFloatWithComma(object["value_comma"]);
                }
            }
        }
        return currentValue;
    },

    getAreaCount: function (geoJSON) {
        return Object.keys(geoJSON["features"]).length
    },
    getAreaType: function (geoJSON) {
        return geoJSON["features"][0]["properties"]["des"];
    },

    parseFloatWithComma: function (string) {
        return parseFloat(string.replace(',', '.'));
    },

    calculateStatistics: function (values) {
        let maxValue = Math.max(...values);
        console.log("Max: " + maxValue);
        let minValue = Math.min(...values);
        console.log("Min: " + minValue);
        let averageValue = this.calculateAverage(values);
        console.log("avg: " + averageValue);
        let medianValue = this.calculateMedian(values);
        console.log("median: " + medianValue);
        let stDeviationValue = this.calculateStDeviation(values, averageValue);
        console.log("stdev: " + stDeviationValue);
        return {
            max: this.roundNumber(maxValue),
            min: this.roundNumber(minValue),
            average: this.roundNumber(averageValue),
            median: this.roundNumber(medianValue),
            stDeviation: this.roundNumber(stDeviationValue)
        };

    },

    calculateAverage: function (values) {
        let total = 0;

        for (let num in values) {

            total += parseFloat(values[num]);
        }
        return total / values.length;
    },

    calculateMedian(values) {

        let median = 0,
            numsLen = values.length;
        values.sort();
        if (numsLen % 2 === 0) { // is even
            // average of two middle numbers
            median = (values[numsLen / 2 - 1] + values[numsLen / 2]) / 2;
        } else { // is odd
            // middle number only
            median = values[(numsLen - 1) / 2];
        }
        return median;
    },

    calculateStDeviation: function (values, average) {

        let squareDiffSum = null;
        let count = values.length;
        for (let num in values) {
            let diff = parseFloat(values[num]) - average;
            let sqr = diff * diff;
            squareDiffSum = squareDiffSum + sqr;
        }
        ;
        let stDeviation = Math.sqrt(squareDiffSum / (count - 1));
        return stDeviation;

    },
    roundNumber: function (number) {
        return Math.round(parseFloat(number) * 100) / 100
    },

    sortObjectAscending: function (objectArray, key1, key2) {
        let sortedData = objectArray.sort((function (a, b) {
            return a[key1] - b[key1] || a[key2] - b[key2];
        }));
        return sortedData;
    },
    getOnlyValues: function (objectArray) {
        let valueArray = [];
        for (let num in objectArray) {
            valueArray.push(parseFloat(objectArray[num].value))
        }
        return valueArray
    },
    getDistributionFunctionValues: function (sortedObjectArray) {
        let totalSum = 0,
            sumTillNow = 0,
            distributionFuncObjectArray = [];
        for (let num in sortedObjectArray) {
            totalSum += sortedObjectArray[num].value;
        }
        for (let num in sortedObjectArray) {
            sumTillNow += sortedObjectArray[num].value;
            let distrFunc = sumTillNow / totalSum;
            let obj = sortedObjectArray[num];
            obj.distFuncValue = distrFunc;
            distributionFuncObjectArray.push(obj);
        }
        return distributionFuncObjectArray;
    },

    getDeviationValues: function (objectArray, mean) {
        let deviationArray = [];
        for (let num in objectArray) {
            let obj = objectArray[num],
                distribution = objectArray[num].value - mean;
            obj.deviation = distribution;
            deviationArray.push(obj);
        }
        return deviationArray
    },
    drawOrderedValuesChart: function (data, xAxisName, yAxisName, indUnit, selectedAgs, mean, svg, chart_width, chart_height, margins) {

        let lan = language_manager.getLanguage(),
            maxValue = d3.max(data, function (d, i) {
                return d.value;
            }),
            minValue = d3.min(data, function (d, i) {
                return d.value
            });
        if (minValue >= 0) {
            minValue = 0
        }
        console.log("Object found: " + data.find(function (obj) {
            return obj.ags == selectedAgs
        }));
        let selectedObject = data.find(function (obj) {
            return obj.ags == selectedAgs
        });
        console.log("Selected object: " + selectedObject.name);

        let xScale = d3.scaleBand()
            .domain(data.map(function (d) {
                return d.ags;
            }))
            .range([0, chart_width])
            .padding(0);

        let yScale = d3.scaleLinear()
            .range([chart_height, 0])
            .domain(d3.extent([minValue, maxValue]))
            .nice();

        // sets the Start of Chart to the right Position, creates container for chart
        let g = svg.append("g")
            .attr("class", "graph")
            .attr("transform", `translate(${margins.left}, ${margins.top})`);


        // Create Bars!
        let rects = g.selectAll('rect')
            .data(data)
            .enter()
            .append("rect")
            .attr('x', function (d) {
                return xScale(d.ags);
            })
            .attr("y", function (d) {
                return yScale(Math.max(0, d.value));
            })
            .attr('width', xScale.bandwidth())
            .attr('height', function (d) {
                return Math.abs(yScale(d.value) - yScale(0));
            })
            .attr("fill", function (d) {
                if (d.ags == selectedAgs) {
                    return "red";
                }
                return "blue";
            })
            .attr('stroke', 'white')
            .attr('stroke-width', function (d) {
                if (xScale.bandwidth() > 30) {
                    return 3
                } else if (xScale.bandwidth() > 10) {
                    return 1
                } else return 0
            })
            .on("mouseover", function (d) {
                let html = d.name + "<br/>" + d.value + " " + indUnit;
                let x = xScale(d.ags),//(d3.event.pageX - document.getElementById('visualisation').getBoundingClientRect().x) - 100,
                    y = yScale(d.value) - 40//(d3.event.pageY - document.getElementById('visualisation').getBoundingClientRect().y) - 60;
                //Change Color
                d3.select(this).style("fill", "green");

                $('#tooltip')
                    .html(html)
                    .css({"left": x, "top": y})
                    .show();
            })
            .on("mouseout", function (d) {
                // change tooltip
                let html = selectedObject.name + "<br/>" + selectedObject.value + " " + indUnit,
                    x = xScale(selectedObject.ags),
                    y = yScale(selectedObject.value) - 40;
                $("#tooltip")
                    .html(html)
                    .css({"left": x, "top": y});
                //Adjust Bar color
                let color = "";
                {
                    if (d.ags == selectedAgs) {
                        color = "red";
                    } else color = "blue"
                }
                d3.select(this).style("fill", color);
            });
        console.log(`Bar count: ${rects.size()}`);
        // Add initial Tooltip
        $("#tooltip")
            .html(selectedObject.name + "<br/>" + selectedObject.value + " " + indUnit)
            .css({"left": xScale(selectedObject.ags), "top": yScale(selectedObject.value) - 40})
            .show();

        // Draw the Average line in Graph
        g.append("line")          // attach a line
            .attr("class", "meanLine")
            .style("stroke", "black")  // colour the line
            .style("stroke-dasharray", ("3, 3"))
            .attr("x1", -5)     // x position of the first end of the line
            .attr("y1", yScale(mean))      // y position of the first end of the line
            .attr("x2", chart_width + 5)     // x position of the second end of the line
            .attr("y2", yScale(mean));    // y position of the second end of the line

        //Text for AverageLine
        g.append("text")
            .attr("x", margins.left)
            .attr("y", yScale(mean) + margins.top - 40)
            .style("text-anchor", "middle")
            .text(`${this.text[lan].average} ${decodeURI('%CE%BC')}`);

        //Initialise both Axis
        let xAxis = d3.axisBottom(xScale)
            .tickFormat("")
            .tickSize(0);
        let yAxis = d3.axisLeft(yScale);

        g.append('g')
            .call(xAxis)
            .attr('transform', 'translate(0,' + (yScale(0)) + ')');
        g.append('g')
            .call(yAxis);

        // text label for the X axis
        g.append("text")
            .attr("transform",
                "translate(" + (chart_width / 2) + " ," +
                (chart_height + margins.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(`${xAxisName}`);

        // text label for the Y axis
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margins.left)
            .attr("x", 0 - (chart_height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(`${yAxisName} \n ${indUnit}`);


    },
    drawLineGraph: function (data, xAxisName, yAxisName, indUnit, selectedAgs, mean, svg, chart_width, chart_height, margins) {
        let lan = language_manager.getLanguage(),
            maxYValue = d3.max(data, function (d, i) {
                return d.distFuncValue;
            }),
            minYValue = d3.min(data, function (d, i) {
                return d.distFuncValue
            }),
            maxXValue= d3.max(data, function (d, i) {
            return d.value;
        }),
            minXValue = d3.min(data, function (d, i) {
                return d.value;
            });
        if (minYValue >= 0) {
            minYValue = 0
        }

        let xScale = d3.scaleLinear()
            .domain(d3.extent([minXValue,maxXValue]))
            .range([0, chart_width])
            .nice();

        console.log(`MaxX: ${maxXValue}; minX: ${minXValue}; max Y: ${maxYValue}; min Y: ${minYValue}.`)
        let yScale = d3.scaleLinear()
            .range([chart_height, 0])
            .domain(d3.extent([minYValue, maxYValue]))
            .nice();

        // sets the Start of Chart to the right Position, creates container for chart
        let g = svg.append("g")
            .attr("class", "graph")
            .attr("transform", `translate(${margins.left}, ${margins.top})`);
        // Create lineGraph!
        let line = d3.line()
            .x(function (d, i) {
                return xScale(d.value);
            }) // set the x values for the line generator
            .y(function (d) {
                return yScale(d.distFuncValue);
            }); // set the y values for the line generator
            //.curve(d3.curveMonotoneX) // apply smoothing to the line

        // Draw the Average line in Graph
        g.append("line")          // attach a line
            .attr("class", "meanLine")
            .style("stroke", "black")  // colour the line
            .style("stroke-dasharray", ("3, 3"))
            .attr("x1",xScale(mean) )     // x position of the first end of the line
            .attr("y1", yScale(minYValue))      // y position of the first end of the line
            .attr("x2", xScale(mean))     // x position of the second end of the line
            .attr("y2", yScale(maxYValue));    // y position of the second end of the line

        console.log("Line positions: "+ xScale(mean) +" "+ yScale(minYValue));

        //Text for AverageLine
        g.append("text")
            .attr("x", xScale(mean)+40)
            .attr("y", yScale(maxYValue) + margins.top)
            .style("text-anchor", "middle")
            .text(`${this.text[lan].average} ${decodeURI('%CE%BC')}`);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", farbschema.getColorHexMain())
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
        //Initialise both Axis
        let xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format(".2r"))
            .tickSize(2);
        let yAxis = d3.axisLeft(yScale);

        g.append('g')
            .call(xAxis)
            .attr('transform', 'translate(0,' + (yScale(0)) + ')');
        g.append('g')
            .call(yAxis);

        // text label for the X axis
        g.append("text")
            .attr("transform",
                "translate(" + (chart_width / 2) + " ," +
                (chart_height + margins.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(`${xAxisName} ${indUnit}`);

        // text label for the Y axis
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margins.left)
            .attr("x", 0 - (chart_height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(`${yAxisName}`);
    }
};




