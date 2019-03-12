const statistics = {
    endpoint_id: "statistics_content",
    chart_selector:"#statistics",
    text: {
        de: {
            title: "Statistik",
            info: "Statistische Kennzahlen",
            indicator: "Indikator",
            choice: "Bitte wählen.....",
            no_choice: "Kein Indikator gewählt",
            load: "Lädt Diagramm......",
            pnt: "alle Stützpunkte",
            trend: "Prognosewerte",
            unit: "Einheit",
            chart: "Statistik für Gebietseinheit",
            for_lang: "für",
            time: "Zeitpunkt",
            min: "Minimum",
            max: "Maximum",
            average: "Mittelwert",
            median: "Median",
            stDev: "Standartabweichung",
            deviation:"Abweichung vom Mittelwert",
            areaCount: "Anzahl in die Berechnung einbezogenen Gebietseinheiten",
            probability:"Wahrscheinlichkeit",
            amount:"Anzahl",
            area:"Gebiet",
            areas:"Gebiete",
            value:"Wert",
            values:"Werte"

        },
        en: {
            title: "Statistics",
            info: "Statistical indicators",
            indicator: "Indicator",
            choice: "Please choose.....",
            no_choice: "No indicator selected",
            load: "Loading diagram ......",
            pnt: "all base points",
            trend: "Forecast values",
            unit: "Unit",
            chart: "Basic statistics for territorial unit",
            for_lang: "for",
            time: "Timestamp",
            min: "Minimum",
            max: "Maximum",
            average: "Mean",
            median: "Median",
            stDev: "Standard deviation",
            deviation:"Deviation from mean",
            areaCount: "Number of administrative areas used in calculation",
            probability: "Probability",
            amount: "Amount",
            area:"Area",
            areas:"Areas",
            value:"Value",
            values:"Values"


        }
    },

    open: function () {

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
                        <h4>${this.text[lan].info} ${this.text[lan].for_lang}: </h4>
                        <h2>${chart.settings.indText}</h2>
                        <h3 id="selectedArea">${chart.settings.name}</h3>
                        <h6 id="selectedAGS">AGS: ${chart.settings.ags}</h6>
                        <h6 id="timeStamp">${this.text[lan].time}: ${timeStamp}</h6>
                        <h6 id="currentValue">${this.text[lan].indicator}: ${chart.settings.indText}  </h6>
                        <h6 id="currentValue">${this.text[lan].value}: ${chart.settings.currentValue} ${chart.settings.indUnit}</h6>
                    </div>
                    <hr />
                    <div class="table" > 
                    <h4 style="text-align:center;">${this.text[lan].info}</h4>
                    <table id="statistics_table" >
                          <tr class="uneven">
                            <td class="table_element">${this.text[lan].areaCount}</td>
                            <td class="table_element">${chart.settings.allValuesObjectArray.length}  ${chart.settings.areaType}</td>
                           
                            
                          </tr>
                          <tr class="even">
                            <td class="table_element">${this.text[lan].average}</td>
                            <td class="table_element">${chart.settings.statistics.average}  ${chart.settings.indUnit}</td>
                    
                            
                          </tr>
                          <tr class="uneven">
                            <td class="table_element">${this.text[lan].median}</td>
                            <td class="table_element">${chart.settings.statistics.median}  ${chart.settings.indUnit}</td>
                           
                          </tr>
                          <tr class="even">
                            <td class="table_element">${this.text[lan].stDev}</td>
                            <td class="table_element">${chart.settings.statistics.stDeviation}  ${chart.settings.indUnit}</td>
                            
                          </tr>
                          <tr class="uneven">
                            <td class="table_element">${this.text[lan].max}</td>
                            <td class="table_element">${chart.settings.statistics.max}  ${chart.settings.indUnit}</td>
                            
                          </tr class="even">                          <tr>
                            <td class="table_element">${this.text[lan].min}</td>
                            <td class="table_element">${chart.settings.statistics.min}  ${chart.settings.indUnit}</td>
                          </tr>
                          
                    </table>
                    </div>
                    <div id="chart_select_container" class="ui form" style="margin-left: 60px">
                        <div class="fields">
                            <div class="field">
                                <label>Select chart:</label>
                                    <div id="chart_ddm_diagramm" class="ui selection dropdown">
                                        <i class="dropdown icon"></i>    
                                        <div class="default text">Values</div>                    
                                        <div class="menu">
                                            <div class="item" data-value="valueChart">Values</div>
                                            <div class="item" data-value="densityChart">Probability density</div>
                                            <div class="item" data-value="distributionChart">Cumulative distribution</div>
                                        </div>
                              
                                    </div>
                                </div>
                               <div class="two wide field" id="classCountInput">
                                   <label>Class count:</label>                                
                                   <input type="text"  class="form-control" id="classCountInputField" placeholder="25" >
                               </div>
                        </div>
                               <div class="ui warning message field" >
                                <div class="header">Zu viele Klassen!</div>
                                <ul class="list">
                                 <li>Geben Sie nicht mehr als ${chart.data.length/2} Klassen ein.</li>
                                </ul>
                               </div>
                    </div>
                    <div id="container_diagramm" class="container_diagramm">
                        <div id="diagramm">
                            <h3 class="Hinweis_diagramm" id="Hinweis_diagramm_empty">${this.text[lan].no_choice}</h3>
                            <h3 class="Hinweis_diagramm" id="diagramm_loading_info">${this.text[lan].load}</h3>
                            <svg id="statistics_visualisation" height="100"></svg>
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
            densityClasCount:25,
            areaCount: "",
            areaType: {},
            selectedChart:"valueChart",
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
            $("#statistics_content #statistics_visualisation").height(532);
            $("#statistics_content #statistics_visualisation").width(1100);
            let svg = d3.select("#statistics_content #statistics_visualisation"),
                margin = {top: 20, right: 60, bottom: 30, left: 60},
                diagram = $('#statistics_content #diagramm'),

                chart_width = diagram.width() - margin.left - margin.right,
                chart_height = $('.ui-dialog').height() * (1.5 / 3) - 100,
                chart= statistics.chart;

            //Set table css styling
            $("#statistics_table").css({    "margin-left":"auto",
                "margin-right":"auto"});
            $(".table_element").css({"border":"1px solid black","padding":"5px"});
            $(".even").css({"background-color":"white"});
            $(".uneven").css({"background-color":"gainsboro"});


            chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
            chart.controller.setDropDownMenu(svg, chart_width, chart_height, margin);

        },
        controller: {
            setDropDownMenu:function(svg, chart_width, chart_height, margin){
                //set up the dropdown menu
                let chart_auswahl = $('#chart_ddm_diagramm'),
                    chart=statistics.chart,
                    classCountInput=$("#classCountInput"),
                    tooltip= $("#tooltip"),
                    visualisation=$("#statistics_visualisation");

                chart_auswahl.dropdown({
                    onChange: function (value, text, $choice) {
                        if (value === 'valueChart') {
                            chart.settings.selectedChart='valueChart';
                            visualisation.empty();
                            chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                            chart_auswahl.dropdown("hide");
                            classCountInput.hide();
                            tooltip.hide();
                        } else if (value === 'densityChart') {
                            chart.settings.selectedChart='densityChart';
                            visualisation.empty();
                            chart_auswahl.dropdown("hide");
                            classCountInput.show();
                            tooltip.hide();
                            chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                        } else if (value='distributionChart'){
                            chart.settings.selectedChart='distributionChart';
                            visualisation.empty();
                            chart_auswahl.dropdown("hide");
                            classCountInput.hide();
                            tooltip.hide();
                            chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                        }
                    }
                });
                setTimeout(function(){
                    chart_auswahl.dropdown("hide");
                },500);
                // Set the classCount inpt field css.properties
                // todo ! REINIS Add the Warning, handle event when too many classes chosen. Set default class amount
                $("#classCountInputField").css({"width":"60px"});
                classCountInput.hide();
                classCountInput.on('change', function(e) {
                    let inputClassCount=$("#classCountInputField").val();
                    console.log("ClassCount! "+inputClassCount);
                    console.log("Data length: "+chart.data.length);
                    if (inputClassCount > chart.data.length/2){
                        inputClassCount=Math.round(chart.data.length/2);
                        chart_auswahl.addClass("warning");

                        $("#classCountInputField").val(inputClassCount);
                        console.log("Too much! "+inputClassCount);
                        console.log(chart_auswahl.attr("class"));
                    }
                    else {chart_auswahl.removeClass("warning")}
                    chart.settings.densityClasCount=inputClassCount;
                    visualisation.empty();
                    chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                });

            },

            showVisualisation: function (selection, svg, chart_width, chart_height, margin) {

                let chart = statistics.chart,
                    parameters={data:[],
                        xAxisName:"",
                        yAxisName:"",
                        averageName:statistics.text[chart.settings.lan].average,
                        xValue:"",
                        yValue:"",
                        selectedValue:chart.settings.ags,
                        indUnit:chart.settings.indUnit,
                        mean:chart.settings.statistics.average,
                        stDeviation:chart.settings.statistics.stDeviation,
                        svg:svg,
                        chart_width:chart_width,
                        chart_height:chart_height,
                        margins:margin
                    };

                if (selection === "valueChart") {
                    // Bar graph of Values Ascending!!!!!
                    let dataSorted = statistics.sortObjectAscending(chart.data, "value", "ags");
                    parameters.data=dataSorted;
                    parameters.xAxisName=statistics.text[chart.settings.lan].areas;
                    parameters.yAxisName=statistics.text[chart.settings.lan].values;
                    parameters.xValue="ags";
                    parameters.yValue="value";

                    statistics.drawOrderedValuesChart(parameters);

                }
                else if(selection=== "densityChart"){
                    // Bar graph of Density function!
                    //todo REINIS add the ClassCount selector!!
                    let classCount= chart.settings.densityClasCount,
                        classData =statistics.getDensityFunctionClassValues(chart.data,classCount);
                    parameters.data=classData;
                    parameters.xAxisName=(statistics.text[chart.settings.lan].deviation);
                    parameters.yAxisName=statistics.text[chart.settings.lan].amount;
                    parameters.xValue="classMiddle";
                    parameters.yValue="count";
                    statistics.drawDensityFunctionChart(parameters);
                }

                else if(selection==="distributionChart"){
                    // Line graph, distribution Function !!!!!
                    let dataSorted = statistics.sortObjectAscending(chart.data, "distFuncValue", "ags");
                    parameters.data=dataSorted;
                    parameters.xAxisName=statistics.text[chart.settings.lan].values;
                    parameters.yAxisName=statistics.text[chart.settings.lan].probability;
                    parameters.xValue="value";
                    parameters.yValue="distFuncValue";

                    statistics.drawLineGraph(parameters)
                }



                else {console.log("No graphical option chosen!")}

            }

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
        console.log("hellihallo");

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
        values.sort(function(a, b){return a - b});
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
            distributionFuncObjectArray = [],
            min=sortedObjectArray[0].value;
        console.log("min: "+sortedObjectArray[0].value);
        for (let num in sortedObjectArray) {
            totalSum += sortedObjectArray[num].value-min;
        }
        for (let num in sortedObjectArray) {
            sumTillNow += sortedObjectArray[num].value-min;
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

    getDensityFunctionClassValues: function(data,classCount) {
        let densityFunctionObjectArray = [];
        if (classCount > (data.length / 2)){
            classCount=data.length/2
        }

        data = this.sortObjectAscending(data, "deviation", "ags");
        let min = data[0].deviation,
            max = data[data.length-1].deviation,
            difference = max - min,
            classSize = difference / classCount,
            classLowerLimit = min;
        for (let i = 0; i < classCount; i++) {
            let counter = 0,
                classElementValues=[],
                classUpperLimit = classLowerLimit + classSize,
                classMiddle=classLowerLimit+(classUpperLimit-classLowerLimit)/2;
            for (let elem in data) {
                if (data[elem].deviation >= classLowerLimit && data[elem].deviation <= classUpperLimit) {
                    counter++;
                    classElementValues.push(data[elem].deviation);

                }
            }
            let averageClassValue=this.calculateAverage(classElementValues),
                className=`${this.roundNumber(classLowerLimit)} bis ${this.roundNumber(classUpperLimit)}`,
                classObject = {name:className, classUpperLimit:classUpperLimit, classLowerLimit:classLowerLimit,classMiddle:classMiddle,  count:counter, classAverageValue:averageClassValue};
            classLowerLimit=classUpperLimit;
            densityFunctionObjectArray.push(classObject);
        }

        return densityFunctionObjectArray;
    },

    drawOrderedValuesChart: function (parameters) {
        let data = parameters.data,
            xValue = parameters.xValue,
            yValue = parameters.yValue,
            xAxisName = parameters.xAxisName,
            yAxisName = parameters.yAxisName,
            averageName=parameters.averageName,
            selectedValue = parameters.selectedValue,
            indUnit = parameters.indUnit,
            mean = parameters.mean,
            stDeviation=parameters.stDeviation,
            svg = parameters.svg,
            chart_width = parameters.chart_width,
            chart_height = parameters.chart_height,
            margins = parameters.margins;


        let lan = language_manager.getLanguage(),
            maxValue = d3.max(data, function (d, i) {
                return d[yValue];
            }),
            minValue = d3.min(data, function (d, i) {
                return d[yValue]
            });
        if (minValue >= 0) {
            minValue = 0
        }
        let selectedObject = data.find(function (obj) {
            return obj[xValue] === selectedValue
        });


        let xScale = d3.scaleBand()
            .domain(data.map(function (d) {
                return d[xValue];
            }))
            .range([0, chart_width])
            .padding(0);

        let yScale = d3.scaleLinear()
            .range([chart_height, 0])
            .domain(d3.extent([minValue, maxValue+maxValue/10]))
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
                return xScale(d[xValue]);
            })
            .attr("y", function (d) {
                let max = Math.max(0, d[yValue]);
                return yScale(Math.max(0, d[yValue]));
            })
            .attr('width', xScale.bandwidth())
            .attr('height', function (d) {
                return Math.abs(yScale(d[yValue]) - yScale(0));
            })
            .attr("fill", function (d) {
                if (d[xValue] === selectedValue) {
                    return "red";
                }
                return  klassengrenzen.getColor(d[yValue]);
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
                let html = d.name + "<br/>" + d[yValue] + " " + indUnit;
                let x = xScale(d[xValue]),
                    y = yScale(d[yValue]) - 40
                //Change Color
                d3.select(this).style("fill", "green");

                $('#tooltip')
                    .html(html)
                    .css({"left": x, "top": y})
                    .show();
            })
            .on("mouseout", function (d) {
                // change tooltip

                let html = selectedObject.name + "<br/>" + selectedObject[yValue] + " " + indUnit,
                    x = xScale(selectedObject[xValue]),
                    y = yScale(selectedObject[yValue]) - 40;
                $("#tooltip")
                    .html(html)
                    .css({"left": x, "top": y});
                //Adjust Bar color
                let color = "";
                {
                    if (d[xValue] === selectedValue) {
                        color = "red";
                    } else color = klassengrenzen.getColor(d[yValue])
                }
                d3.select(this).style("fill", color);


            });

// Add initial Tooltip


        $("#tooltip")
            .html(selectedObject.name + "<br/>" + selectedObject[yValue] + " " + indUnit)
            .css({"left": xScale(selectedObject[xValue]), "top": yScale(selectedObject[yValue]) - 40})
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
            .text(`${averageName} ${decodeURI('%CE%BC')}`);

        //Initialise both Axis
        //determine if Axis should have ticks
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
    drawDensityFunctionChart: function (parameters) {
        let data = parameters.data,
            xValue = parameters.xValue,
            yValue = parameters.yValue,
            xAxisName = parameters.xAxisName,
            yAxisName = parameters.yAxisName,
            mean=parameters.mean,
            stDeviation=parameters.stDeviation,
            svg = parameters.svg,
            averageName=parameters.averageName,
            chart_width = parameters.chart_width,
            chart_height = parameters.chart_height,
            margins = parameters.margins,
            barWidth=chart_width / data.length,

            lan = language_manager.getLanguage(),

            maxYValue = d3.max(data, function (d) {
                return d[yValue];
            }),
            minYValue = d3.min(data, function (d) {
                return d[yValue]
            }),
            maxXValue=d3.max(data,function(d){
                return d[xValue]
            }),
            minXValue=d3.min(data,function(d){
                return d[xValue]
            });
        console.log("Bar width:" +barWidth);


        let xScale = d3.scaleLinear()
            .domain(d3.extent([minXValue, maxXValue]))
            .range([barWidth/2, chart_width-barWidth/2]);

        let yScale = d3.scaleLinear()
            .range([chart_height, 0])
            .domain(d3.extent([minYValue, maxYValue+Math.round(maxYValue/10)]))
            .nice();

        // sets the Start of Chart to the right Position, creates container for chart
        let g = svg.append("g")
            .attr("class", "graph")
            .attr("transform", `translate(${margins.left}, ${margins.top})`);

        // Create Bars!
        g.selectAll('rect')
            .data(data)
            .enter()
            .append("rect")
            .attr('x', function (d,i) {
                return i*barWidth;
            })
            .attr("y", function (d) {
                return yScale(Math.max(0, d[yValue]));
            })
            .attr('width',barWidth)
            .attr('height', function (d) {
                return Math.abs(yScale(d[yValue]) - yScale(0));
            })
            .attr("fill", function(d){return klassengrenzen.getColor(d[xValue]+mean)})
            .attr('stroke', 'white')
            .attr('stroke-width', function (d) {
                if (barWidth > 30) {
                    return 3
                } else if (barWidth > 10) {
                    return 1
                } else return 0
            })
            .on("mouseover", function (d) {
                let html ="Wertebereich: "+ d.name + "<br/>" +yAxisName+ ": "+ d[yValue] ;
                let x = xScale(d[xValue]),//(d3.event.pageX - document.getElementById('visualisation').getBoundingClientRect().x) - 100,
                    y = yScale(d[yValue]) - 40//(d3.event.pageY - document.getElementById('visualisation').getBoundingClientRect().y) - 60;
                //Change Color
                d3.select(this).style("fill", "green");

                $('#tooltip')
                    .html(html)
                    .css({"left": x, "top": y})
                    .show();
            })
            .on("mouseout", function (d) {
                // change tooltip
                $("#tooltip")
                    .hide();
                d3.select(this).style("fill", function(d){return klassengrenzen.getColor(d[xValue]+mean)});


            });

// Draw the Average line in Graph
        g.append("line")          // attach a line
            .attr("class", "meanLine")
            .style("stroke", "black")  // colour the line
            .style("stroke-dasharray", ("3, 3"))
            .attr("x1", xScale(0))     // x position of the first end of the line
            .attr("y1", yScale(maxYValue+Math.round(maxYValue/10)))      // y position of the first end of the line
            .attr("x2", xScale(0))     // x position of the second end of the line
            .attr("y2", yScale(minYValue));    // y position of the second end of the line

//Text for AverageLine
        g.append("text")
            .attr("x", xScale(0)+40)
            .attr("y",  yScale(maxYValue+Math.round(maxYValue/10)) + margins.top)
            .style("text-anchor", "middle")
            .text(`${averageName} ${decodeURI('%CE%BC')}`);


        // Draw standard Deviation lines
        // upper stDeviation
        /*
        g.append("line")          // attach a line
            .attr("class", "stDeviationLine")
            .style("stroke", "black")  // colour the line
            .style("stroke-dasharray", ("3, 3,15,3"))
            .attr("x1", xScale(0))     // x position of the first end of the line
            .attr("y1", yScale(maxYValue))      // y position of the first end of the line
            .attr("x2", xScale(0))     // x position of the second end of the line
            .attr("y2", yScale(minYValue));    // y position of the second end of the line
        // lower stDeviation
        g.append("line")          // attach a line
            .attr("class", "stDeviationLine")
            .style("stroke", "black")  // colour the line
            .style("stroke-dasharray", ("3, 3,15,3"))
            .attr("x1", xScale(0))     // x position of the first end of the line
            .attr("y1", yScale(maxYValue))      // y position of the first end of the line
            .attr("x2", xScale(0))     // x position of the second end of the line
            .attr("y2", yScale(minYValue));    // y position of the second end of the line
*/



        //Initialise both Axis
        //determine if Axis should have ticks
        let xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format(".2r"));
        //.tickSize(2);

        let yAxis = d3.axisLeft(yScale);

        let X= g.append('g')
            .call(xAxis)
            .attr('transform', 'translate(0,' + (yScale(0)) + ')');
        g.append('g')
            .call(yAxis);
//remove the axis line from x Axis
        X.selectAll("path").attr("display", "none");

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
            .text(`${yAxisName}`);


    },
    drawLineGraph: function (parameters) {
        let data = parameters.data,
            xValue = parameters.xValue,
            yValue = parameters.yValue,
            xAxisName = parameters.xAxisName,
            yAxisName = parameters.yAxisName,
            indUnit = parameters.indUnit,
            mean = parameters.mean,
            averageName=parameters.averageName,
            stDeviation=parameters.stDeviation,
            svg = parameters.svg,
            chart_width = parameters.chart_width,
            chart_height = parameters.chart_height,
            margins = parameters.margins,
            maxYValue = d3.max(data, function (d, i) {
                return d[yValue];
            }),
            minYValue = d3.min(data, function (d, i) {
                return d[yValue]
            }),
            maxXValue= d3.max(data, function (d, i) {
                return d[xValue];
            }),
            minXValue = d3.min(data, function (d, i) {
                return d[xValue];
            });
        if (minYValue >= 0) {
            minYValue = 0
        }

        let xScale = d3.scaleLinear()
            .domain(d3.extent([minXValue,maxXValue]))
            .range([0, chart_width])
            .nice();

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
                return xScale(d[xValue]);
            }) // set the x values for the line generator
            .y(function (d) {
                return yScale(d[yValue]);
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

        //Text for AverageLine
        g.append("text")
            .attr("x", xScale(mean)+40)
            .attr("y", yScale(maxYValue) + margins.top)
            .style("text-anchor", "middle")
            .text(`${averageName} ${decodeURI('%CE%BC')}`);
        // Draw the main plot
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




