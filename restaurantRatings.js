var svg = d3.select('svg');
const width = 960, height = 760;

var svg = d3.select("#first-section").append("svg")
  .attr("width", width)
  .attr("height", height);


function loadSubwaylines() {
  d3.json("subwaylines.geojson", (d) => { return d; }).then(subwaylineMap => {
    var center = d3.geoCentroid(subwaylineMap);
    const projection = d3.geoMercator()
    projection
      .scale(70000)
      .translate([width / 2.5, height / 2])
      .center([-73.94, 40.70]);

    // now you can create new path function with
    // correctly centered projection
    var path = d3.geoPath()
      .projection(projection);

    // and finally draw the actual polygons
    svg.selectAll("path")
      .data(subwaylineMap.features)
      .enter()
      .append("path")
      .style("fill", "black")
      .attr("d", path);
  })
}

function drawNYCMap(svg, features, path) {
  svg.selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .style("fill", "steelblue")
    .attr("d", path);
}

d3.json("./opendataset_borough_boundaries.geojson", (d) => { return d; }).then((NYC_MapInfo) => {
  // after loading geojson, use d3.geo.centroid to find out
  // where you need to center your map
  var center = d3.geoCentroid(NYC_MapInfo);
  const projection = d3.geoMercator()
  projection
    .scale(70000)
    .translate([width / 2.5, height / 2])
    .center([-73.94, 40.70]);

  // now you can create new path function with
  // correctly centered projection
  var path = d3.geoPath()
    .projection(projection);

  // and finally draw the actual polygons
  drawNYCMap(svg, NYC_MapInfo.features, path);
  // svg.selectAll("path")
  //   .data(NYC_MapInfo.features)
  //   .enter()
  //   .append("path")
  //   .style("fill", "steelblue")
  //   .attr("d", path);

  // get color depending on the grade
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

  // calculate the distance based on Pixel values
  // from checking distance between 2 points, a euclid dist of  < 5 is about .2 mile
  // to get a mile, use euclid dist of 25
  // this is just comparing 2 close by coordinates
  euclideanDistance = (ax, ay, bx, by) => {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
  }

  // get list of cuisines types to map to color scales
  getCuisines = (data) => {
    const cuisineTypes = {};
    data.forEach(restaurant => {
      cuisineTypes[restaurant["Cuisine"]] = 1;
    });
    return Object.keys(cuisineTypes);
  }

  updateDescription = (restaurant) => {
    document.getElementsByClassName("restaurant-name")[0].innerHTML = "Name: " + restaurant['DBA'];
    document.getElementsByClassName("restaurant-cuisine")[0].innerHTML = "Type: " + restaurant['Cuisine'];
    document.getElementsByClassName("restaurant-grade")[0].innerHTML = "Grade: " + restaurant['Grade'];
  }

  d3.csv('./cleanedup_short_list_with_ratings_noblanklat.csv', (d) => {
    return {
      key: d["CAMIS"],
      ...d
    };
  }).then((data) => {
    // console.log(data);
    const cuisines = getCuisines(data);
    const colorScale = d3.scaleOrdinal()
      .domain(cuisines)
      .range([
        ...d3.schemePastel1,
        ...d3.schemePastel2,
        ...d3.schemeSet1,
        ...d3.schemeSet2,
        ...d3.schemeSet3,
        ...d3.schemeAccent
      ]);

    svg.selectAll("circle")
      .data(data).enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection([+d['Lng'], +d['Lat']])[0];
      })
      .attr("cy", function (d) { return projection([+d['Lng'], +d['Lat']])[1]; })
      .attr("r", "4px")
      .attr("opacity", "0.5")
      .attr("fill", function (d) {
        return colorScale(d["Cuisine"])
      })
      .attr('stroke', function (d) {
        return colorScale(d["Cuisine"])
      })
      .attr("class", "testcircle")
      .on("mouseover", function (d) {
        updateDescription(d);
      })
      .on("mousemove", function () {
      })
      .on("mouseout", function (d) {
      });

    // second section
    var secondSvg = d3.select("#second-section").append("svg")
      .attr("width", width)
      .attr("height", height);
    drawNYCMap(secondSvg, NYC_MapInfo.features, path);

    var waypoint = new Waypoint({
      element: document.getElementById('second-section'),
      handler: function (direction) {
        console.log(direction)
        // next step put the map on the same side
        // transition the data down ward to show different facts
        if (direction === 'down') {
          // d3.select("#second-section svg").remove();
          var t = d3.transition().duration(1000);
          const kosherRestaurants = data.filter(restaurant => restaurant["Cuisine"] === "Jewish/Kosher")
          secondSvg.selectAll("circle")
            .data(kosherRestaurants).enter()
            .append("circle")
            .attr("cx", function (d) {
              return projection([+d['Lng'], +d['Lat']])[0];
            })
            .attr("cy", function (d) { return projection([+d['Lng'], +d['Lat']])[1]; })
            .attr("r", "4px")
            .attr("opacity", "0.5")
            .attr("fill", function (d) {
              return colorScale(d["Cuisine"])
            })
            .attr('stroke', function (d) {
              return colorScale(d["Cuisine"])
            })
            .attr("class", "testcircle")
            .on("mouseover", function (d) {
              updateDescription(d);
            })
            .on("mousemove", function () {
            })
            .on("mouseout", function (d) {
            });
        }
      }
    });
  })

  loadSubwaylines();


});
