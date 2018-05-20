
var rectWidth = 50;
var height = 300;
var data = [100, 250, 175, 200, 120, 50, 60];
var svg = d3.select('svg');

// copy-paste of how to make new york
// geojson http://data.beta.nyc//dataset/3bf5fb73-edb5-4b05-bb29-7c95f4a727fc/resource/6df127b1-6d04-4bb7-b983-07402a2c3f90/download/f4129d9aa6dd4281bc98d0f701629b76nyczipcodetabulationareas.geojson
var width = 960,
  height = 1160;



var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json("./opendataset_borough_boundaries.geojson", (d) => { return d; }).then((NYC_MapInfo) => {
  console.log(NYC_MapInfo)
  // after loading geojson, use d3.geo.centroid to find out
  // where you need to center your map
  var center = d3.geoCentroid(NYC_MapInfo);
  const projection = d3.geoMercator()
  projection
    .scale(60000)
    // .translate([width / 2, height / 2])
    // .center(center);
    .center([-73.94, 40.70]);

  // now you can create new path function with
  // correctly centered projection
  var path = d3.geoPath()
    .projection(projection);

  // and finally draw the actual polygons
  svg.selectAll("path")
    .data(NYC_MapInfo.features)
    .enter()
    .append("path")
    .style("fill", "steelblue")
    .attr("d", path);

  gradeChecker = (restaurant) => {
    if (restaurant["Grade"] === "A") {
      return "green"
    } else if (restaurant["Grade"] === "B") {
      return "blue"
    } else if (restaurant["Grade"] === "C") {
      return "yellow"
    } else {
      return "red";
    }
  }

  cuisineTypeCheck = (restaurnt) => {
    const color = d3.scale.category20c();
    var o = d3.scale.ordinal()
      .domain(["foo", "bar", "baz"])
      .range([...d3.schemePastel1, ...d3.schemePastel2, ...d3.schemeSet1, ...d3.schemeSet2, ...d3.schemeSet3, ...d3.schemeAccent]);
    const cuisineType = restaurnt["Cuisine"];
  }

  getCuisines = (data) => {
    const cuisineTypes = {};
    data.forEach(restaurant => {
      cuisineTypes[restaurant["Cuisine"]] = 1;
    });
    return Object.keys(cuisineTypes);
  }

  d3.csv('./cleanedup_short_list_with_ratings_noblanklat.csv', (d) => {
    return {
      key: d["CAMIS"],
      ...d
    };
  }).then((data) => {
    console.log(data);
    const cuisines = getCuisines(data);
    const colorScale = d3.scaleOrdinal().domain(cuisines).range([...d3.schemePastel1, ...d3.schemePastel2, ...d3.schemeSet1, ...d3.schemeSet2, ...d3.schemeSet3, ...d3.schemeAccent])
    // mixing with mapbox
    // debugger;
    var tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text("a simple tooltip");
    const other = {};
    svg.selectAll("circle")
      .data(data).enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection([+d['Lng'], +d['Lat']])[0];
      })
      .attr("cy", function (d) { return projection([+d['Lng'], +d['Lat']])[1]; })
      .attr("r", "4px")
      .attr("fill", function (d) {
        // return gradeChecker(d);
        return colorScale(d["Cuisine"])
      })
      .attr('stroke', function (d) {
        return colorScale(d["Cuisine"])
      })
      .attr("class", "testcircle")
      .on("mouseover", function (d) { tooltip.text(d['DBA'] + ": " + d['Cuisine']); return tooltip.style("visibility", "visible"); })
      .on("mousemove", function () {
        return tooltip.style("top",
          (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
      })
      .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });
    //   .on("mouseover", function (d) {

    //   console.log(d)
    //   // d3.select(this).enter().append("text")
    //   // .append("svg:title")
    //   // .text(function (d) { return d['DBA'] + ": ", d['Cuisine']; });
    // })
  })

});
// get to see if there are other grade values - seems like too many reds
// also get a dict of the type of eateries we have (possibly whittle down the list)





  // const testData = [[40.7750119, -73.948142], [40.7102956, -73.8491607]];
  // data.forEach((marker) => {
  //   var el = document.createElement('div');
  //   el.className = 'marker';
  //   new mapboxgl.Marker(el)
  //     .setLngLat([+marker['Lng'], +marker['Lat']])
  //     .addTo(map)
  // })
  // testData.forEach((marker) => {
  //   var el = document.createElement('div');
  //   el.className = 'marker';
  //   new mapboxgl.Marker(el)
  //   .setLngLat([marker[1], marker[0]])
  //   .addTo(map)
  // })
