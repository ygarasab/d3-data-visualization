const getBirthDataPerCountryPerYear = ( year) => {



    let target = main_data_object.filter(instance => parseInt(instance.year) === year )

    return target.map(instance => ({
        id : instance['Country Code'],
        birth : parseFloat(instance['Birth rate, crude (per 1,000 people)']),
        death : parseFloat(instance['Mortality rate, infant (per 1,000 live births)'])
    }))




}

const drawMap = (targetSvg, colorScale, startingSet, interestData) => {

    let svg = d3.select(targetSvg),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    let path = d3.geoPath();
    let projection = d3.geoMercator()
        .scale(100)
        .center([0,20])
        .translate([width / 2, height / 2]);

    let colorMapping = d3.map();


    let target = svg.append("g")
        .selectAll("path")
        .data(map_generation_data.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "transparent")
        .attr("class", _ => "Country")
        .style("opacity", .8)

    var tooltip = d3.select('body').append('div')
        .attr('class', 'hidden tooltip');


    const setMapView = data => {


        data.map(d => colorMapping.set(d.id, d[interestData]))

        target.attr("fill", function (d) {
            let v = colorMapping.get(d.id)

            d.total = Math.abs(v) || 0;
            return colorScale(d.total);
        })
            .on('mousemove', function(d) {
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:' + (interestData === 'birth' ? mouse[0] + 15 : mouse[0] + 650) +
                        'px; top:' + (mouse[1] -40) + 'px')
                    .html(colorMapping.get(d.id));
            })
            .on('mouseout', function() {
                tooltip.classed('hidden', true);
            });
    }

    setMapView(startingSet)

    return setMapView


}

const runIssue3 = () => {
    let data = getBirthDataPerCountryPerYear(2018)

    let setMapBirth = drawMap('#issue3map-birth', d3.scaleThreshold()
        .domain([0,5,10,15,20,40])
        .range(d3.schemeBlues[7]), data, 'birth')
    let setMapDeath = drawMap('#issue3map-death', d3.scaleThreshold()
        .domain([0,5,10,15,20,40])
        .range(d3.schemeReds[7]), data, 'death')

    var sliderStep = d3
        .sliderBottom()
        .min(1990)
        .max(2020)
        .width(1100)
        .tickFormat(d3.format('1'))
        .ticks(30)
        .step(1)
        .default(2019)
        .on('onchange', val => {
            d3.select('span#value-step').text(d3.format('1')(val));
            data = getBirthDataPerCountryPerYear(val)
            setMapBirth(data);
            setMapDeath(data)
        });

    var gStep = d3
        .select('div#slider-step')
        .append('svg')
        .attr('width', 1200)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gStep.call(sliderStep);

    d3.select('span#value-step').text(d3.format('1')(sliderStep.value()));

}