const statistics = {
    endpoint_id: "statistics_content",
    //toolbar selector
    selector_toolbar:"#ind_stat",
    text: { // the translations
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
            amount:"anzahl",
            area:"Gebiet",
            areas:"Gebiete",
            value:"Wert",
            values:"Werte",
            probDensity:"Wahrscheinlichkeitsdichte",
            cumulativeDistribution:"Kumulative Verteilung",
            intervalCount:"Anzahl Intervale",
            interval:"Intervall",
            selectChart:"Diagramm wählen",
            download:"Diagramm herunterladen"

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
            amount: "amount",
            area:"Area",
            areas:"Areas",
            value:"Value",
            values:"Values",
            probDensity:"Probability density",
            cumulativeDistribution:"Cumulative distribution",
            intervalCount:"Interval count",
            interval:"Interval",
            selectChart:"Select chart",
            download:"Download Chart"


        }
    },
    init:function(){
        //disable element for raster view and enable for gebiete view
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster"){
            helper.disableElement(this.selector_toolbar,exclude.disable_text);
        }else{
            helper.enableElement(this.selector_toolbar,$(this.chart_selector_toolbar).data("title"));
        }
        this.controller.set();
    },
    open: function () {

        this.populateChartSettingsWithValues(); // Gets all the necessary values for chart.settings

        const chart = this.chart,
            timeStamp = zeit_slider.getTimeSet(),
            lan = chart.settings.lan;
        //Write the HTML code for Statistics Dialog View
        const html = he.encode(`
             <div class="jq_dialog" id="${this.endpoint_id}">
                <div class="container">
                    <div >               
                        <h4">${this.text[lan].info} ${this.text[lan].for_lang}: </h4>
                        <h2>${chart.settings.indText} (${timeStamp})</h2>
                    </div>
                    <br/>
                  <div id="statistics_info_container">
                    <div id="area_info"}>
                        <h3 id="selectedArea">${chart.settings.name} (AGS: ${chart.settings.ags})</h3>
                        <h5 id="currentValue" >${this.text[lan].value}: ${this.parseStringPointToComma(chart.settings.currentValue)} ${chart.settings.indUnit}</h5>
                    </div>
                    
                    <div id="statistics_table_container" align="center"> 
                    
                    <h4 id="table_title">${this.text[lan].info}</h4>
                    <table id="statistics_table" align="center">
                          <tr class="uneven">
                            <td class="table_element" >${this.text[lan].areaCount}</td>
                            <td class="table_element" align="right">${chart.settings.allValuesObjectArray.length}</td>                         
                          </tr>
                          <tr class="even">
                            <td class="table_element">${this.text[lan].average}</td>
                            <td class="table_element" align="right">${this.parseStringPointToComma(chart.settings.statistics.average)}  ${chart.settings.indUnit}</td>
                          </tr>
                          <tr class="uneven">
                            <td class="table_element">${this.text[lan].median}</td>
                            <td class="table_element" align="right">${this.parseStringPointToComma(chart.settings.statistics.median)}  ${chart.settings.indUnit}</td>                           
                          </tr>
                          <tr class="even">
                            <td class="table_element" >${this.text[lan].stDev}</td>
                            <td class="table_element" align="right">${this.parseStringPointToComma(chart.settings.statistics.stDeviation)}  ${chart.settings.indUnit}</td>                            
                          </tr>
                          <tr class="uneven">
                            <td class="table_element">${this.text[lan].max}</td>
                            <td class="table_element" align="right">${this.parseStringPointToComma(chart.settings.statistics.max)}  ${chart.settings.indUnit}</td>                            
                          </tr class="even">                          <tr>
                            <td class="table_element">${this.text[lan].min}</td>
                            <td class="table_element" align="right">${this.parseStringPointToComma(chart.settings.statistics.min)}  ${chart.settings.indUnit}</td>
                          </tr>                          
                    </table>
                    </div>
                  </div>
                    
                    <hr />
                    
                    <div id="chart_select_container" class="ui form">
                        <div class="fields">
                            <div class="field" >
                                <label>${this.text[lan].selectChart}:</label>
                                    <div id="chart_ddm_diagramm" class="ui selection dropdown">
                                        <i class="dropdown icon"></i>    
                                        <div class="text">${this.text[lan].values}</div>                    
                                        <div class="menu">
                                            <div class="item" data-value="valueChart">${this.text[lan].values}</div>
                                            <div class="item" data-value="densityChart">${this.text[lan].probDensity}</div>
                                            <div class="item" data-value="distributionChart">${this.text[lan].cumulativeDistribution}</div>
                                        </div>
                              
                                    </div>
                                </div>

                        </div>
                             <div class="inline field" id="intervalCountInput" align="right">
                                   <label>${this.text[lan].intervalCount}:</label>                                
                                   <input type="text" id="intervalCountInputField" class="form-control" placeholder="${chart.settings.densityIntervalCount}" >
                             </div>
                    </div>
                    <div id="statistics_container_diagramm" class="container_diagramm">
                        <div id="statistics_diagramm";">
                            <svg id="statistics_visualisation"></svg>
                            <div id="tooltip"></div>
                            <div id="intervalInfo"></div>
                        </div>
                    </div>
                </div>
            </div>`);

        /* TO BE INCLUDED TO ENABLE DOWNLOAD OF GRAPH AS PDF PNG

                                <div class="field">
                                <label>${this.text[lan].download}:</label>
                                    <div id="diagramm_download" class="ui selection dropdown">
                                        <i class="dropdown icon"></i>
                                        <div class="text">${this.text[lan].choice}</div>
                                        <div class="menu">
                                            <div class="item" data-format="png">PNG</div>
                                            <div class="item" data-format="pdf">PDF</div>
                                        </div>

                                    </div>
                                </div>
         */

        //setting up the dialog Window
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html = html;
        dialog_manager.instructions.title = this.text[lan].title;
        dialog_manager.create();
        chart.init();


    },
    populateChartSettingsWithValues:function(){ //This function gets all the derived Values from GeoJSON and writes them to chart.setting
        const chart=this.chart,
            geoJSON=chart.settings.allValuesJSON; // GeoJSON is initially set in ./src/map/indikator_json.js

        chart.settings.allValuesObjectArray = this.getAllValues(geoJSON);
        chart.settings.decimalSpaces= statistics.getDecimalSpaces(geoJSON);
        chart.settings.decimalSpaces= this.getDecimalSpaces();
        chart.settings.currentValue = this.getCurrentValue(geoJSON,chart.settings.ags);
        chart.settings.areaCount = this.getAreaCount(geoJSON);
        chart.settings.statistics = this.calculateStatistics(statistics.getOnlyValues(this.chart.settings.allValuesObjectArray), chart.settings.decimalSpaces);
        chart.settings.data=this.sortObjectAscending(chart.settings.allValuesObjectArray,"value","ags"); //sorts the geoJSON data according to the VALUE attribute
        chart.settings.data = this.getDistributionFunctionValues(chart.settings.data); // adds the Distribution function Values to dataset
        chart.settings.data = this.getDeviationValues(chart.settings.data, this.chart.settings.statistics.average); // adds the deviation (from average) Values to dataset
        chart.settings.densityIntervalCount=Math.round(chart.settings.data.length/4); // sets the default Interval Count for the probability density Chart
        chart.settings.lan=language_manager.getLanguage();
    },
    getAllValues: function (geoJSON) {
        // extracts the indicator Values from GeoJSON
        let valueArray = [];
        for (let elem in geoJSON.features) {
            let object = geoJSON["features"][elem]["properties"];
            // checks if Object has "value_comma" property and it is not empty, then fetches the value
            if (object.hasOwnProperty("value_comma") && object.value_comma !== "") {
                //create object:
                let obj = {name: object.gen, value: helper.parseFloatCommaToPoint(object.value_comma), ags: object.ags};
                if (typeof obj.value == "number") {
                    valueArray.push(obj);
                }
                else {
                    console.log("The JSON Object either has no value_comma property!!")
                }
            }
        }
        return valueArray;

    },
    getCurrentValue: function (geoJSON, ags) {
        let currentValue = null;
        // check if geoJSON has value "ags", and finds the corresponding value
        for (let elem in this.chart.settings.allValuesJSON["features"]) {
            let object = geoJSON["features"][elem]["properties"];
            if (object.hasOwnProperty("ags")) {
                if (object["ags"] === ags) {
                    currentValue = helper.parseFloatCommaToPoint(object["value_comma"]);
                }
            }
        }
        return currentValue;
    },
    getAreaCount: function (geoJSON) {
        return Object.keys(geoJSON["features"]).length
    },
    parseStringPointToComma:function(input){
        return input.toString().replace('.',',')
    },
    calculateStatistics: function (values, decimal) {
        let maxValue = Math.max(...values);

        let minValue = Math.min(...values);

        let averageValue = this.calculateAverage(values);

        let medianValue = this.calculateMedian(values);

        let stDeviationValue = this.calculateStDeviation(values, averageValue);

        return {
            max: this.roundNumber(maxValue,decimal),
            min: this.roundNumber(minValue, decimal),
            average: this.roundNumber(averageValue, decimal),
            median: this.roundNumber(medianValue, decimal),
            stDeviation: this.roundNumber(stDeviationValue, decimal)
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

        return Math.sqrt(squareDiffSum / (count - 1));

    },
    getDecimalSpaces:function(){
        return parseInt(indikatorauswahl.getIndikatorInfo(false,"rundung"));
    },
    roundNumber: function (number, decimalSpaces) {
        return Math.round(parseFloat(number) * Math.pow(10, decimalSpaces)) / Math.pow(10, decimalSpaces)
    },
    sortObjectAscending: function (objectArray, key1, key2) {
        return objectArray.sort((function (a, b) {
            return a[key1] - b[key1] || a[key2] - b[key2];
        }));
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
    getDensityFunctionIntervalValues: function(data,intervalCount,decimal) {
        let densityFunctionObjectArray = [];

        data = this.sortObjectAscending(data, "deviation", "ags");
        let min = data[0].deviation,
            max = data[data.length-1].deviation,
            difference = max - min,
            classSize = difference / intervalCount,
            intervalLowerLimit = min;
        for (let i = 0; i < intervalCount; i++) {
            let counter = 0,
                intervalElementValues=[],
                intervalElements=[],
                intervalUpperLimit = intervalLowerLimit + classSize,
                intervalMiddle=intervalLowerLimit+(intervalUpperLimit-intervalLowerLimit)/2;
            for (let elem in data) {
                if (data[elem].deviation >= intervalLowerLimit && data[elem].deviation <= intervalUpperLimit) {
                    counter++;
                    let element={name:data[elem].name, ags:data[elem].ags, value:data[elem].value, deviation:data[elem].deviation};
                    intervalElementValues.push(data[elem].deviation);
                    intervalElements.push(element);
                }
            }
            let averageClassValue=Math.round(this.calculateAverage(intervalElementValues) * 1000) / 1000,
                probability=counter/data.length*100,  // Probability in PERCENT!

                classObject = {intervalUpperLimit:statistics.roundNumber(intervalUpperLimit,decimal), intervalLowerLimit: statistics.roundNumber(intervalLowerLimit, decimal),intervalMiddle:statistics.roundNumber(intervalMiddle,decimal),  count:counter, probability: statistics.roundNumber(probability,decimal+1), intervalAverageValue: statistics.roundNumber(averageClassValue, decimal), elements:intervalElements};
            intervalLowerLimit=intervalUpperLimit;
            densityFunctionObjectArray.push(classObject);
        }
        return densityFunctionObjectArray;
    },
    findSelectedAreaInInterval:function(intervalArray, selectedAgs){ // Finds the selected Area in one of the Intervals

        let x = 0,
            y = 0,
            name="",
            deviation=0,
            found=false;
        for (let interval in intervalArray) {
            for (let elem in intervalArray[interval].elements)
                if (intervalArray[interval].elements[elem].ags === selectedAgs) {
                    x = intervalArray[interval].elements[elem].deviation;
                    y= intervalArray[interval].probability;
                    name= intervalArray[interval].elements[elem].name;
                    deviation= intervalArray[interval].elements[elem].deviation;
                    found=true;
                }
            if (found){
                break;
            }
        }

        return {x:x,y:y, name:name, deviation:deviation};

    },


    chart: { // Holds all the variables
        settings: {
            lan:"",
            ags: "",
            ind: "",
            indText: "",
            indUnit: "",
            decimalSpaces:0,
            name: "",
            allValuesJSON: "",
            currentValue: "",
            allValuesObjectArray: [],
            data: [],
            densityIntervalCount:25,
            areaCount: "",
            selectedChart:"valueChart",
            statistics: {
                min: ",",
                max: ",",
                average: "",
                median: "",
                stDeviation: ""
            }
        },

        init: function () { // sets the chart/visualisation/svg container dimensions

            let svg = d3.select("#statistics_content #statistics_visualisation"),
                margin = {top: 20, right: 60, bottom: 30, left: 60},

                // Setting dynamic visualisation dimensions
                container_height=$('.ui-dialog').height() * (2 / 3) - 100,
                container_width=$("#statistics_content .container").width();
            if (container_height<100){
                container_height=200;  // um bei Waagerechtem Smartphonedisplay eine vernünftige Visualisierungsgröße zu setzen
            }

            $("#statistics_content #statistics_visualisation").height(container_height).width(container_width);

            const chart_width = container_width-margin.right-10, // -10px needed to NOT cover the last few px of graph axis
                chart_height =container_height-2*margin.top-2*margin.bottom,
                chart= statistics.chart;

            //reset the default visualisation chart, start drawing
            chart.settings.selectedChart="valueChart";
            chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin); // draws the Chart
            //Initialize the drop-down menu
            chart.controller.setInteractiveElemenents(svg, chart_width, chart_height, margin);

        },
        controller: { // controls the drawing of Chart and corresponding Menus

            setInteractiveElemenents:function(svg, chart_width, chart_height, margin){ // Sets the Menus and controls the drawing of Chart based on Menu choices
                let chart_auswahl = $('#chart_ddm_diagramm'),
                    chart=statistics.chart,
                    intervalCountInput=$("#intervalCountInput"),
                    intervalCountInputField=$("#intervalCountInputField"),
                    tooltip= $("#tooltip"),
                    visualisation=$("#statistics_visualisation");

                chart_auswahl.dropdown({  //set up the Visualisation dropdown menu
                    onChange: function (value) {
                        switch (value) {
                            case "valueChart":
                                chart.settings.selectedChart='valueChart';
                                visualisation.empty();
                                chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                                chart_auswahl.dropdown("hide");
                                intervalCountInput.hide();
                                break;

                            case "densityChart":
                                chart.settings.selectedChart='densityChart';
                                visualisation.empty();
                                chart_auswahl.dropdown("hide");
                                intervalCountInput.show();
                                tooltip.hide();
                                chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                                break;
                            case "distributionChart":
                                chart.settings.selectedChart='distributionChart';
                                visualisation.empty();
                                chart_auswahl.dropdown("hide");
                                intervalCountInput.hide();
                                tooltip.hide();
                                chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                                break;
                            default:
                                alert("Error, no chart Type selected!")

                        }
                    }
                });
                setTimeout(function(){  // Workaround: Hides the initial Dropdown menu choice list
                    chart_auswahl.dropdown("hide");
                },500);

                // sets the intervalCountInput behaviour
                intervalCountInputField.css({"width":"60px"});
                intervalCountInput.hide();
                intervalCountInput.on('change', function(e) {
                    let inputIntervalCount=intervalCountInputField.val();

                    intervalCountInputField.val(inputIntervalCount);
                    chart.settings.densityIntervalCount=inputIntervalCount;
                    visualisation.empty();
                    chart.controller.showVisualisation(chart.settings.selectedChart, svg, chart_width, chart_height, margin);
                });
                $("body").mouseup(function(e)   // todo Reinis: Possibly transfer to the draw Function if Density Graph?
                { // sets the IntervalInfo Tooltip behaviour
                    let intervalInfo = $("#intervalInfo");
                    // if the target of the click isn't the container nor a descendant of the container
                    if (!intervalInfo.is(e.target) && intervalInfo.has(e.target).length === 0)
                    {
                        intervalInfo.hide();
                    }
                });

            },

            showVisualisation: function (selection, svg, chart_width, chart_height, margin) { // passes the right Parameters to the relevant Chart Visualisation Method, based on Chart-Select Menu choice
                let chart = statistics.chart,
                    parameters={data:[],
                        xAxisName:"",
                        yAxisName:"",
                        averageName:statistics.text[chart.settings.lan].average,
                        xValue:"",
                        yValue:"",
                        selectedAGS:chart.settings.ags,
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
                    parameters.data=statistics.sortObjectAscending(chart.settings.data, "value", "ags"); // Sort the data according to indicator value
                    parameters.xAxisName=statistics.text[chart.settings.lan].areas;
                    parameters.yAxisName=statistics.text[chart.settings.lan].values;
                    parameters.xValue="ags";
                    parameters.yValue="value";
                    this.drawOrderedValuesChart(parameters);

                }
                else if(selection=== "densityChart"){
                    // Bar graph of Density function!
                    let classCount= chart.settings.densityIntervalCount;
                    parameters.data=statistics.getDensityFunctionIntervalValues(chart.settings.data,classCount,chart.settings.decimalSpaces); // separate indicator values into intervals to display in density chart
                    parameters.xAxisName=(statistics.text[chart.settings.lan].deviation);
                    parameters.yAxisName=statistics.text[chart.settings.lan].probability;
                    parameters.xValue="intervalMiddle";
                    parameters.yValue="probability";
                    this.drawDensityFunctionChart(parameters);
                }

                else if(selection==="distributionChart"){
                    // Line graph, distribution Function !!!!!
                    parameters.data=statistics.sortObjectAscending(chart.settings.data, "distFuncValue", "ags");
                    parameters.xAxisName=statistics.text[chart.settings.lan].values;
                    parameters.yAxisName=statistics.text[chart.settings.lan].cumulativeDistribution;
                    parameters.xValue="value";
                    parameters.yValue="distFuncValue";

                    this.drawCumulativeDistributionChart(parameters)
                }

                else {console.log("No graphical option chosen!")}
            },

            // Methods to draw the relevant Graph!
            drawOrderedValuesChart: function (parameters) {
                const tooltip = $("#tooltip");
                let data = parameters.data,
                    xValue = parameters.xValue,
                    yValue = parameters.yValue,
                    xAxisName = parameters.xAxisName,
                    yAxisName = parameters.yAxisName,
                    averageName=parameters.averageName,
                    selectedAreaAGS = parameters.selectedAGS,
                    indUnit = parameters.indUnit,
                    mean = parameters.mean,
                    stDeviation=parameters.stDeviation,
                    svg = parameters.svg,
                    margins = parameters.margins,
                    chart_width = parameters.chart_width,
                    chart_height = parameters.chart_height,

                    maxValue = d3.max(data, function (d, i) {
                        return d[yValue];
                    }),
                    minValue = d3.min(data, function (d, i) {
                        return d[yValue]
                    }),
                    selectedArea = data.find(function (obj) {
                        return obj[xValue] === selectedAreaAGS
                    });
                if (minValue >= 0) {
                    minValue = 0
                }

                // Setting the scales for chart
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
                        return yScale(Math.max(0, d[yValue]));
                    })
                    .attr('width', xScale.bandwidth())
                    .attr('height', function (d) {
                        return Math.abs(yScale(d[yValue]) - yScale(0));
                    })
                    .attr("fill", function (d) {
                        if (d[xValue] === selectedAreaAGS) {
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
                    .on("mouseover", function (d) { // Show Tooltip with Value
                        let html = d.name + "<br/>" + statistics.parseStringPointToComma(d[yValue]) + " " + indUnit;
                        let x = xScale(d[xValue]),
                            y = yScale(d[yValue]) - 40;
                        if (d[yValue]<=0){
                            y=yScale(0)-40;
                        }
                        //Change Color
                        d3.select(this).style("fill", "green");

                        tooltip
                            .html(html)
                            .css({"left": x, "top": y})
                            .show();
                    })
                    .on("mouseout", function (d) {
                        // change tooltip

                        let html = selectedArea.name + "<br/>" + statistics.parseStringPointToComma(selectedArea[yValue]) + " " + indUnit,
                            x = xScale(selectedArea[xValue]),
                            y = yScale(selectedArea[yValue]) - 40;
                        tooltip
                            .html(html)
                            .css({"left": x, "top": y});
                        //Adjust Bar color
                        let color = "";
                        {
                            if (d[xValue] === selectedAreaAGS) {
                                color = "red";
                            } else color = klassengrenzen.getColor(d[yValue])
                        }
                        d3.select(this).style("fill", color);


                    });

// Add initial Tooltip
                tooltip
                    .html(selectedArea.name + "<br/>" + statistics.parseStringPointToComma(selectedArea[yValue]) + " " + indUnit)
                    .css({"left": xScale(selectedArea[xValue]), "top": yScale(selectedArea[yValue]) - 40})
                    .show();


// Draw the Average line in Graph
                g.append("line")          // attach a line
                    .attr("class", "meanLine")
                    .style("stroke", "black")  // colour the line
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", ("10, 3,5,3"))
                    .attr("x1", 0)     // x position of the first end of the line
                    .attr("y1", yScale(mean))      // y position of the first end of the line
                    .attr("x2", chart_width)     // x position of the second end of the line
                    .attr("y2", yScale(mean));    // y position of the second end of the line
//Text for AverageLine
                g.append("text")
                    .attr("x", margins.left)
                    .attr("y", yScale(mean) + margins.top - 40)
                    .style("text-anchor", "middle")
                    .text(`${averageName} ${decodeURI('%CE%BC')}`);

                // Draw standard Deviation lines
                // upper stDeviation

                if (mean+stDeviation<maxValue) { // check if StDeviation does not exceed axis domain
                    g.append("line")          // attach a line
                        .attr("class", "stDeviationLine")
                        .style("stroke", "black")  // colour the line
                        .style("stroke-dasharray", ("3, 3,15,3"))
                        .attr("x1", 0)     // x position of the first end of the line
                        .attr("y1", yScale(mean+stDeviation))      // y position of the first end of the line
                        .attr("x2", chart_width )     // x position of the second end of the line
                        .attr("y2", yScale(mean+stDeviation));    // y position of the second end of the line
                    // text label for the upper stDeviation
                    g.append("text")
                        .attr("x", margins.left)
                        .attr("y", yScale(mean+stDeviation) -15)
                        .style("text-anchor", "middle")
                        .text(`+ ${decodeURI('%CF%83')}`);
                }
                // lower stDeviation
                // check if StDeviation does not exceed axis domain
                if(mean-stDeviation>minValue) {
                    g.append("line")          // attach a line
                        .attr("class", "stDeviationLine")
                        .style("stroke", "black")  // colour the line
                        .style("stroke-dasharray", ("3, 3,15,3"))
                        .attr("x1", -5)     // x position of the first end of the line
                        .attr("x1", 0)     // x position of the first end of the line
                        .attr("y1", yScale(mean-stDeviation))      // y position of the first end of the line
                        .attr("x2", chart_width)     // x position of the second end of the line
                        .attr("y2", yScale(mean-stDeviation));    // y position of the second end of the line
                    // text label for the upper stDeviation
                    g.append("text")
                        .attr("x", margins.left)
                        .attr("y", yScale(mean-stDeviation) +15)
                        .style("text-anchor", "middle")
                        .text(`- ${decodeURI('%CF%83')}`);
                }

                //Initialise both Axis
                //determine if Axis should have ticks
                let xAxis = d3.axisBottom(xScale)
                    .tickFormat("")
                    .tickSize(0);


                let yAxis = d3.axisLeft(yScale)
                    .tickFormat(function(d, i) {
                        return statistics.parseStringPointToComma(d) });

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
                    mean = parameters.mean,
                    stDeviation = parameters.stDeviation,
                    indUnit = parameters.indUnit,
                    svg = parameters.svg,
                    averageName = parameters.averageName,
                    selectedAreaAGS = parameters.selectedAGS,
                    margins = parameters.margins,
                    chart_width = parameters.chart_width,
                    chart_height = parameters.chart_height,
                    barWidth = chart_width / data.length,

                    maxYValue = d3.max(data, function (d) {
                        return d[yValue];
                    }),
                    minYValue = 0, // minimum Y value should always be 0

                    maxXValue = d3.max(data, function (d) {
                        return d[xValue]
                    }),
                    minXValue = d3.min(data, function (d) {
                        return d[xValue]
                    }),
                    tooltip = $("#tooltip");

                let xScale = d3.scaleLinear()
                    .domain(d3.extent([minXValue, maxXValue]))
                    .range([barWidth / 2, chart_width - barWidth / 2]);

                // drawing the yAxis 1/10 longer than max Value, to facilitate space for Average, stDeviation texts
                let yScale = d3.scaleLinear()
                    .range([chart_height, 0])
                    .domain(d3.extent([minYValue, maxYValue + Math.round(maxYValue / 10)]))
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
                    .attr('x', function (d, i) {
                        return i * barWidth;
                    })
                    .attr("y", function (d) {
                        return yScale(Math.max(0, d[yValue]));
                    })
                    .attr('width', barWidth)
                    .attr('height', function (d) {
                        return Math.abs(yScale(d[yValue]) - yScale(0));
                    })
                    .attr("fill", function (d) {
                        return klassengrenzen.getColor(d[xValue] + mean)
                    })
                    .attr('stroke', 'white')
                    .attr('stroke-width', function (d) {
                        if (barWidth > 30) {
                            return 3
                        } else if (barWidth > 10) {
                            return 1
                        } else return 0
                    })
                    .on("mouseover", function (d) {
                        let html = "Interval: " + statistics.parseStringPointToComma(d.intervalLowerLimit) + " / " + statistics.parseStringPointToComma(d.intervalUpperLimit) + "<br/>" + yAxisName + ": " + statistics.parseStringPointToComma(d[yValue]+ "%"),
                            x = xScale(d[xValue])-barWidth/2,  // -barWidth to avoid flickering tooltip if parent <div> borders size exceeded
                            y = yScale(d[yValue]) - 40;
                        //Change Color
                        d3.select(this).style("fill", "green");

                        tooltip
                            .html(html)
                            .css({"left": x, "top": y})
                            .show();
                    })
                    .on("mouseout", function () {
                        // change tooltip
                        tooltip
                            .html(selectedArea.name + "<br/>" )
                            .css({"left": xScale(selectedArea.x)-40, "top": yScale(selectedArea.y/2)});
                        d3.select(this).style("fill", function (d) {
                            return klassengrenzen.getColor(d[xValue] + mean)
                        });
                    })
                    .on('click', function (d) { // onClick on a Bar rectangle opens a list of all included areas w/ their corresponding values
                        let html = "",
                            x = xScale(d[xValue]) + 40,
                            y = yScale(d[yValue] / 2);
                        for (let elem in d.elements) {
                            html += d.elements[elem].name + ": " + statistics.parseStringPointToComma(d.elements[elem].value) + " " + indUnit + "<br/>" + " ";

                        }
                        $("#intervalInfo")
                            .html(html)
                            .css({
                                "left": x,
                                "top": y,
                                "max-height": chart_height - y + margins.top + margins.bottom,
                                "overflow": "auto"
                            })
                            .show()
                    });

                //Draw the selected area line in Graph
                // Find the selected district, x,y Values
                let selectedArea=statistics.findSelectedAreaInInterval(data, selectedAreaAGS);
                g.append("line")          // attach a line
                    .attr("class", "selectedAreaLine")
                    .style("stroke", "red")  // colour the line
                    .style("stroke-width", barWidth/10 )  // set line width
                    .attr("x1", xScale(selectedArea.x))    // x position of the first end of the line
                    .attr("y1", yScale(selectedArea.y)+3)      // y position of the first end of the line, 3px corresponds to bar border
                    .attr("x2", xScale(selectedArea.x))     // x position of the second end of the line
                    .attr("y2", yScale(minYValue)-3);    // y position of the second end of the line, 3px corresponds to bar border

//Text for area line in Graph
                tooltip
                    .html(selectedArea.name + "<br/>")
                    .css({"left": xScale(selectedArea.x)-40, "top": yScale(selectedArea.y/2)})
                    .show();

// Draw the Average line in Graph
                g.append("line")          // attach a line
                    .attr("class", "meanLine")
                    .style("stroke", "black")  // colour the line
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", ("10, 3,5,3"))
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
// check if StDeviation does not exceed axis domain, if not, add the line
                if (stDeviation<maxXValue) {
                    g.append("line")          // attach a line
                        .attr("class", "stDeviationLine")
                        .style("stroke", "black")  // colour the line
                        .style("stroke-dasharray", ("3, 3,15,3"))
                        .attr("x1", xScale(0 + stDeviation))     // x position of the first end of the line
                        .attr("y1", yScale(maxYValue + Math.round(maxYValue / 10)))      // y position of the first end of the line
                        .attr("x2", xScale(0 + stDeviation))     // x position of the second end of the line
                        .attr("y2", yScale(minYValue));    // y position of the second end of the line
                    // text label for the upper stDeviation
                    g.append("text")
                        .attr("x", xScale(0 + stDeviation) + 15)
                        .attr("y", yScale(maxYValue + Math.round(maxYValue / 10)) + margins.top)
                        .style("text-anchor", "middle")
                        .text(`+ ${decodeURI('%CF%83')}  `);
                }
// lower stDeviation
// check if StDeviation does not exceed axis domain, if not, add the line
                if(-stDeviation>minXValue) {
                    g.append("line")          // attach a line
                        .attr("class", "stDeviationLine")
                        .style("stroke", "black")  // colour the line
                        .style("stroke-dasharray", ("3, 3,15,3"))
                        .attr("x1", xScale(0 - stDeviation))     // x position of the first end of the line
                        .attr("y1", yScale(maxYValue + Math.round(maxYValue / 10)))      // y position of the first end of the line
                        .attr("x2", xScale(0 - stDeviation))     // x position of the second end of the line
                        .attr("y2", yScale(minYValue));    // y position of the second end of the line
                    // text label for the lower stDeviation
                    g.append("text")
                        .attr("x", xScale(0 - stDeviation) - 15)
                        .attr("y", yScale(maxYValue + Math.round(maxYValue / 10)) + margins.top)
                        .style("text-anchor", "middle")
                        .text(`- ${decodeURI('%CF%83')}  `);
                }

//Initialise both Axis
//determine if Axis should have ticks
                let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format(".2r"))
                    .tickFormat(function(d, i) {
                        return statistics.parseStringPointToComma(d) });

                let yAxis = d3.axisLeft(yScale)
                    .tickFormat(function(d, i) {
                        return statistics.parseStringPointToComma(d) });

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
                    .text(`${xAxisName}, ${indUnit}`);

// text label for the Y axis
                g.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margins.left)
                    .attr("x", 0 - (chart_height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text(`${yAxisName} %`);


            },
            drawCumulativeDistributionChart: function (parameters) {
                let data = parameters.data,
                    xValue = parameters.xValue,
                    yValue = parameters.yValue,
                    xAxisName = parameters.xAxisName,
                    yAxisName = parameters.yAxisName,
                    indUnit = parameters.indUnit,
                    mean = parameters.mean,
                    selectedAreaAGS=parameters.selectedAGS,
                    averageName=parameters.averageName,
                    stDeviation=parameters.stDeviation,
                    svg = parameters.svg,
                    margins = parameters.margins,
                    chart_width = parameters.chart_width,
                    chart_height = parameters.chart_height,
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
                    }),
                    selectedArea = data.find(function (obj) {
                        return obj.ags === selectedAreaAGS
                    }),
                    tooltip = $("#tooltip");
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

                // modify data to be able to display DISCRETE distribution function
                let distData=[];
                for (let i=0;i<data.length;i++) {
                    let firstPoint = {[xValue]: data[i][xValue], [yValue]: data[i][yValue]},
                        secondPoint={};
                    if (i === data.length - 1) {
                        secondPoint = {[xValue]: data[i][xValue], [yValue]: data[i][yValue]}
                    } else {
                        secondPoint = {[xValue]: data[i + 1][xValue], [yValue]: data[i][yValue]};
                    }
                    distData.push(firstPoint);
                    distData.push(secondPoint);
                }

                // Create lineGraph!

                let line = d3.line()
                    .x(function (d, i) {
                        return xScale(d[xValue]);
                    }) // set the x values for the line generator
                    .y(function (d) {
                        return yScale(d[yValue]);
                    }); // set the y values for the line generator

                g.append("path")
                    .datum(distData)
                    .attr("fill", "none")
                    .attr("stroke", farbschema.getColorHexMain())
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);

                // Draw the Average line
                g.append("line")          // attach a line
                    .attr("class", "meanLine")
                    .style("stroke", "black")  // colour the line
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", ("10, 3,5,3"))
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

                // Draw standard Deviation lines
                // upper stDeviation

                if (mean+stDeviation<maxXValue) { // check if StDeviation does not exceed axis domain
                    g.append("line")          // attach a line
                        .attr("class", "stDeviationLine")
                        .style("stroke", "black")  // colour the line
                        .style("stroke-dasharray", ("3, 3,15,3"))
                        .attr("x1", xScale(mean+stDeviation))     // x position of the first end of the line
                        .attr("y1", yScale(maxYValue))      // y position of the first end of the line
                        .attr("x2", xScale(mean+stDeviation))     // x position of the second end of the line
                        .attr("y2", yScale(minYValue));    // y position of the second end of the line
                    // text label for the upper stDeviation
                    g.append("text")
                        .attr("x", xScale(mean+stDeviation)+15)
                        .attr("y", yScale(maxYValue) + margins.top)
                        .style("text-anchor", "middle")
                        .text(`+ ${decodeURI('%CF%83')}  `);
                }
                // lower stDeviation
                // check if StDeviation does not exceed axis domain
                if(mean-stDeviation>minXValue) {
                    g.append("line")          // attach a line
                        .attr("class", "stDeviationLine")
                        .style("stroke", "black")  // colour the line
                        .style("stroke-dasharray", ("3, 3,15,3"))
                        .attr("x1", xScale(mean-stDeviation))     // x position of the first end of the line
                        .attr("y1", yScale(maxYValue ))      // y position of the first end of the line
                        .attr("x2", xScale(mean - stDeviation))     // x position of the second end of the line
                        .attr("y2", yScale(minYValue));    // y position of the second end of the line
                    // text label for the lower stDeviation
                    g.append("text")
                        .attr("x", xScale(mean-stDeviation)-15)
                        .attr("y", yScale(maxYValue) + margins.top)
                        .style("text-anchor", "middle")
                        .text(`- ${decodeURI('%CF%83')}  `);
                }



                //Draw the selected area line in Graph
                // Find the selected district, x,y Values
                g.append("line")          // attach a line
                    .attr("class", "selectedAreaLine")
                    .style("stroke", "red")  // colour the line
                    .style("stroke-width", 2 )  // set line width
                    .attr("x1", xScale(selectedArea.value))    // x position of the first end of the line
                    .attr("y1", yScale(selectedArea.distFuncValue))
                    .attr("x2", xScale(selectedArea.value))     // x position of the second end of the line
                    .attr("y2", yScale(minYValue));
                //Text for area line in Graph
                tooltip
                    .html(selectedArea.name + "<br/>")
                    .css({"left": xScale(selectedArea.value)-40, "top": yScale(selectedArea.distFuncValue/2)})
                    .show();

                //Initialise both Axis
                let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format(".2r"))
                    .tickFormat(function(d, i) {
                        return statistics.parseStringPointToComma(d) })
                    .tickSize(2);
                let yAxis = d3.axisLeft(yScale)
                    .tickFormat(function(d, i) {
                        return statistics.parseStringPointToComma(d) });;

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

        },

    },
    controller:{
        set:function(){// set the behavior on Statistics-Icon click- open the Statistics Dialog
            $(document).on("click", statistics.selector_toolbar, function () {
                let callback = function () {
                    if (Dialoghelper.getAGS_Input()) {
                        statistics.open();
                    }
                };
                try {
                    Dialoghelper.setSwal(callback);
                } catch (err) {
                    alert_manager.alertError();
                }
            });
        }
    },

};



