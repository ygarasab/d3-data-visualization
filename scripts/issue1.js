let average = (array) => array.reduce((a, b) => a + b) / array.length;

const gdpIndicatorArray = data => {

    let gdpKey = 'GDP per capita (current US$)'

    let gdps = data.map(instance => parseInt(instance[gdpKey]))
    gdps = gdps.filter(value => !isNaN(value)).sort((a,b) => a-b)
    gdps = [... new Set(gdps)]


    let indicatorsValues = {}

    let mustAvoid = [ gdpKey, 'year', "Country Name", "Country Code", "Surface area (sq. km)"]

    for(let i of data.columns){
        if( mustAvoid.includes(i) ) continue
        indicatorsValues[i] = []
    }

    for(let gdp of gdps){
        let target =  data.filter(instance => parseInt(instance[gdpKey]) === gdp)

        for(let i in indicatorsValues){
            let value = target.map(instance => parseFloat(instance[i])).filter(instance => !isNaN(instance))
            if(value.length) indicatorsValues[i].push({gdp, value : average(value)})

        }

    }

    let correlations = []

    for(let i in indicatorsValues){
        let stats = new Statistics(indicatorsValues[i], {gdp:'metric',value:'metric'})
        correlations.push({
            indicator : i,
            value : stats.correlationCoefficient('gdp', 'value').correlationCoefficient
        })
    }

    console.log(JSON.stringify(correlations))

}

const getIndicatorToGdpCorrelationPerCountry = (data, indicator) => {

    let gdpKey = 'GDP per capita (current US$)'

    let result = []

    let countries = [...new Set(data.map(instance => instance['Country Code']))]

    for(let country of countries){

        let countryData = data.filter(instance => instance['Country Code'] === country)

        let gdps = countryData.map(instance => parseInt(instance[gdpKey]))
        gdps = gdps.filter(value => !isNaN(value)).sort((a,b) => a-b)
        gdps = [... new Set(gdps)]


        let indicatorsValues = []


        for(let gdp of gdps){

            let target =  countryData.filter(instance => parseInt(instance[gdpKey]) === gdp)

            let value = target.map(instance => parseFloat(instance[indicator])).filter(instance => !isNaN(instance))
            if(value.length) indicatorsValues.push({gdp, value : average(value)})


        }

        let correlations = NaN

        for(let i in indicatorsValues){
            if(indicatorsValues.length > 0){
                let stats = new Statistics(indicatorsValues, {gdp:'metric',value:'metric'})
                correlations = stats.correlationCoefficient('gdp', 'value').correlationCoefficient
            }
        }

        result.push({country, correlations})

    }

    return result


}



const displayBars = setMapView =>{

    var margin = {top: 20, right: 30, bottom: 40, left: 400},
        width = 1200 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#issue1bars")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
    d3.json("data/gdp-to-indicator-correlation.json", data => {

        d3.select("#map-label")
            .text('Employment in agriculture (% of total employment) (modeled ILO estimate)')

        data.sort(function (a, b) {
            return d3.descending(Math.abs(a.value), Math.abs(b.value))
        })
        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, .8])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        var y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(function (d) {
                return d.indicator;
            }))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))

        //Bars
        let bars = svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")

        bars.on('click', d => { setMapView(d.indicator); d3.select("#map-label").text(d.indicator)})
            .attr("x", x(0))
            .attr("y", d => y(d.indicator))
            .attr("width", d => Math.abs(x(d.value)))
            .attr("height", y.bandwidth())
            .attr("fill", d => d.value > 0 ? 'blue' : "red")


    })
}

const draw = ()  =>{

    let svg = d3.select("#issue1map"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    let path = d3.geoPath();
    let projection = d3.geoMercator()
        .scale(100)
        .center([0,20])
        .translate([width / 2, height / 2]);

    let colorMapping = d3.map();
    let colorScaleP = d3.scaleSequential(d3.interpolateBlues)
    let colorScaleN = d3.scaleSequential(d3.interpolateReds)


    let target = svg.append("g")
        .selectAll("path")
        .data(map_generation_data.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "transparent")
        .attr("class", _ => "Country")
        .style("opacity", .8)




    const setMapView = indicator => {

        let interest = getIndicatorToGdpCorrelationPerCountry(main_data_object, indicator)

        interest.map(d => colorMapping.set(d.country, d.correlations))
        var tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');
        target.attr("fill", function (d) {
            let v = colorMapping.get(d.id)
            d.total = Math.abs(v) || 0;
            return v > 0 ? colorScaleP(d.total) : colorScaleN(d.total);
        })
            .on('mousemove', function(d) {
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:' + (mouse[0] + 15) +
                        'px; top:' + (mouse[1] +340) + 'px')
                    .html(colorMapping.get(d.id));
            })
            .on('mouseout', function() {
                tooltip.classed('hidden', true);
            });
    }

    setMapView('Employment in agriculture (% of total employment) (modeled ILO estimate)')

    return setMapView


}

const runIssue1 = () => {


    let setMapView = draw()
    displayBars(setMapView)
}



