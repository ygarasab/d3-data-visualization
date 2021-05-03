const getAgricultureIndicatorsOverTime = data => {



    let interestIndicators = ["Access to electricity (% of population)","Access to electricity, rural (% of rural population)","Agricultural machinery, tractors per 100 sq. km of arable land",
        "Agricultural methane emissions (% of total)","Agricultural nitrous oxide emissions (% of total)",
        "Agricultural raw materials exports (% of merchandise exports)",
        "Agricultural raw materials imports (% of merchandise imports)",
        "Agriculture, forestry, and fishing, value added (% of GDP)"]

    let result = []


    for(let year = 1960; year <= 2020; year++){

        let yearBlock = {year}

        let target = data.filter(instance => parseInt(instance.year) === year)

        for(let indicator of interestIndicators){
            let values = target.map(instance => parseFloat(instance[indicator])).filter(instance => !isNaN(instance))
            if(values.length)yearBlock[indicator] = average(values)

        }


        result.push(yearBlock)


    }

    console.log(result)

}