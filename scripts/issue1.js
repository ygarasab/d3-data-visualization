let average = (array) => array.reduce((a, b) => a + b) / array.length;

const gdpIndicatorArray = data => {

    let gdpKey = 'GDP per capita (current US$)'

    let gdps = data.map(instance => parseInt(instance[gdpKey]))
    gdps = gdps.filter(value => !isNaN(value)).sort((a,b) => a-b)
    gdps = [... new Set(gdps)]
    console.log(gdps)

    let indicatorsValues = {}

    let mustAvoid = [ gdpKey, 'year', "Country Name", "Country Code", "Surface area (sq. km)", "Net migration", "Rural population living in areas where elevation is below 5 meters (% of total population)", "Employment in agriculture, female (% of female employment) (modeled ILO estimate)", "Employment in agriculture, male (% of male employment) (modeled ILO estimate)",
    "Arable land (hectares)", "Arable land (% of land area)", "Agricultural irrigated land (% of total agricultural land)", "Cereal production (metric tons)", "Agriculture, forestry, and fishing, value added (current US$)", "Fertilizer consumption (% of fertilizer production)", "Rural land area where elevation is below 5 meters (sq. km)",
    "Crop production index (2004-2006 = 100)", "Rural population growth (annual %)"]

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

    console.log(correlations)

}