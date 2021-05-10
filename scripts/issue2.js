const getAgricultureIndicatorsOverTime = ( minGdp = 0, maxGdp = 9999999) => {


    let interestIndicators = ["Access to electricity (% of population)","Access to electricity, rural (% of rural population)",
        "Agricultural methane emissions (% of total)","Agricultural nitrous oxide emissions (% of total)",
        "Agricultural raw materials exports (% of merchandise exports)",
        "Agricultural raw materials imports (% of merchandise imports)",
        "Agriculture, forestry, and fishing, value added (% of GDP)"]

    let result = []
    let b = 0

    for(let year = 1992; year <= 2020; year++){

        let yearBlock = {year}

        let target = main_data_object.filter(instance => parseInt(instance.year) === year && instance['GDP per capita (current US$)'] > minGdp && instance['GDP per capita (current US$)'] < maxGdp )

        for(let indicator of interestIndicators){
            let values = target.map(instance => parseFloat(instance[indicator])).filter(instance => !isNaN(instance))
            yearBlock[indicator] =  values.length ? average(values) : !b ? 0 : b[indicator];

        }

        b = {...yearBlock}
        result.push(yearBlock)


    }
    return interestIndicators.map(id => ({
        id: id,
        values: result.map( d => ({year: d.year, value: d[id]}))
    }));

}

const renderIssue2Plot = (indicators, targetSvg, title, line, {x,y,z}) => {

    let svg = d3.select(targetSvg),
        margin = {top: 40, right: 80, bottom: 175, left: 80},
        width = svg.attr('width') - margin.left - margin.right,
        height = svg.attr('height') - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#fff")
        .text("Indicador");

    let indicator = g.selectAll(".indicator")
        .data(indicators)
        .enter().append("g")
        .attr("class", "indicator");


    indicator.append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .attr('marker-start', 'url(#dot)')
        .attr('marker-mid', 'url(#dot)')
        .attr('marker-end', 'url(#dot)')
        .style("stroke", d => z(d.id))
        .style("fill",'none')
        .style('stroke-width',3)

    indicator.append("circle")
        .attr("cx", 0)
        .attr("cy", (d,i) => 370 + i*25)
        .attr("r", 7)
        .style("fill", d => z(d.id))

    indicator.append("text")
        .attr("x", 20)
        .attr("y", (d,i) => 370 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
        .text(d => d.id)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-family", 'arial')
        .style("font-size", '10pt')

    indicator.append("text")
        .attr("x", (width / 2) + 40)
        .attr("y", 0 - (margin.top / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", 'arial')
        .text(title);

    return indicator

}




const runIssue2 = () => {

    let data = getAgricultureIndicatorsOverTime(0, 10000)

    let x = d3.scaleLinear().range([0, 800]),
        y = d3.scaleLinear().range([330, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);


    let line = d3.line()
        .curve(d3.curveBasis)
        .x(d => x(d.year))
        .y(d => y(d.value));

    x.domain([1991,2020]);
    y.domain([0,100]);

    z.domain(d => d.id);


    let energyFields = ["Access to electricity (% of population)","Access to electricity, rural (% of rural population)"]
    let agricultureFields =[ "Agricultural methane emissions (% of total)","Agricultural nitrous oxide emissions (% of total)",
        "Agricultural raw materials exports (% of merchandise exports)",
        "Agricultural raw materials imports (% of merchandise imports)",
        "Agriculture, forestry, and fishing, value added (% of GDP)"]

    let energyIndicatorsChart = renderIssue2Plot(data.filter(d => energyFields.includes(d.id)), '#issue2electricity', "Indicadores de Energia",line, {x,y,z})
    let agricultureIndicatorsChart = renderIssue2Plot(data.filter(d => agricultureFields.includes(d.id)), '#issue2agriculture', "Indicadores de Agricultura",line, {x,y,z})

    let slider = createD3RangeSlider(0, 10000, "#slider-container");

    slider.onChange(newRange => {

        data = getAgricultureIndicatorsOverTime(newRange.begin, newRange.end)

        d3.select("#range-label").text("Range de Pib : " + newRange.begin + " - " + newRange.end);

        energyIndicatorsChart.data(data.filter(d => energyFields.includes(d.id)))
        energyIndicatorsChart.select(".line").attr("d", function(d) { return line(d.values); })

        agricultureIndicatorsChart.data(data.filter(d => agricultureFields.includes(d.id)))
        agricultureIndicatorsChart.select(".line").attr("d", function(d) { return line(d.values); })


    });

    slider.range(0,10000);


}


