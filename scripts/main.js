let main_data_object, map_generation_data;

const clearAll = () => {
    document.getElementById("issue1").style.display = 'none'
    document.getElementById("issue2").style.display = 'none'
    document.getElementById("issue3").style.display = 'none'
}

const render = issue => {
    clearAll()
    document.getElementById("issue" + issue).style.display = 'block'
}

d3.csv('data/data.csv', data => {
    main_data_object = data

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", data => {

        map_generation_data = data;
        runIssue1();
        runIssue2();
        runIssue3()
    })

})