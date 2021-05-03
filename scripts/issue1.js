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

    let correlations = {}

    for(let i in indicatorsValues){
        let stats = new Statistics(indicatorsValues[i], {gdp:'metric',value:'metric'})
        correlations[i] = stats.correlationCoefficient('gdp', 'value').correlationCoefficient
    }

    console.log(JSON.stringify(correlations))

}

const getIndicatorToGdpCorrelationPerCountry = (data, columns, indicator) => {

    let gdpKey = 'GDP per capita (current US$)'

    let result = {}

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

        let correlations = {}

        for(let i in indicatorsValues){
            if(indicatorsValues.length > 0){
                let stats = new Statistics(indicatorsValues, {gdp:'metric',value:'metric'})
                correlations = stats.correlationCoefficient('gdp', 'value').correlationCoefficient
            }
            else correlations = NaN
        }

        result[country] = correlations

    }

    return result


}