var svg = d3.select('svg');
const width = 960, height = 760;

var svg = d3.select("#map").append("svg")
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
      .style("fill", "transparent")
      .style("stroke", "black")
      .attr("d", path);

    // add zoom feature
    var zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-100, -100], [width + 90, height + 100]])
      .on("zoom", zoomed);
    svg.call(zoom);
    function zoomed() {
      svg.attr("transform", d3.event.transform);
    }
  })
}

function drawNYCMap(svg, features, path) {
  svg.selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .style("fill", "steelblue")
    .attr("d", path)
}

function updateAllDataOnMap(svg, data, projection, colorScale) {

      const cuisineType = document.getElementById("cuisine-type") ? document.getElementById("cuisine-type").value : "NONE";
      const cuisineGrade = document.getElementById("cuisine-grade") ? document.getElementById("cuisine-grade").value : "NONE";
      let filterData = jQuery.extend(true, [], data);
      if (cuisineType && cuisineType !== "NONE") {
        filterData = filterData.filter(datum => datum["Cuisine"] === cuisineType);
      }
      if (cuisineGrade && cuisineGrade !== "NONE") {
        filterData = filterData.filter(datum => datum["Grade"] == cuisineGrade);

      }
      const camisValues = filterData.map(datum => datum["CAMIS"]);

  const selection = svg.selectAll("circle")
    .data(filterData)

  selection
    .enter()
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
    .on("mouseover", function (d) {
      updateDescription(d);
    })
    .on("mousemove", function () {
    })
    .on("mouseout", function (d) {
    })

  selection.exit().remove();
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

    updateAllDataOnMap(svg, data, projection, colorScale);

    function getCuisineTypeSelectOptions(data) {
      const cuisineTypes = Array.from(new Set(data.map(data => data["Cuisine"])));
      return cuisineTypes.reduce((agg, type) => {
        return agg + '<option value=' + type + '>' + type + '</option>';
      }, '<option value="NONE">None</option>');
    }
    function getGradeSelectOptions(data) {
      const cuisineGrades = Array.from(new Set(data.map(data => data["Grade"])));
      return cuisineGrades.reduce((agg, grade) => {
        return agg + '<option value=' + grade + '>' + grade + '</option>';
      }, '<option value="NONE">None</option>');
    }

    // set the dropdown options dynamically
    jQuery("#dropdowns").append('<select id="cuisine-type" name="Cuisine">' + getCuisineTypeSelectOptions(data) + '</select>');
    jQuery("#dropdowns").append('<select id="cuisine-grade" name="Grade">' + getGradeSelectOptions(data) + '</select>');
    jQuery("#cuisine-type, #cuisine-grade").change((val) => {
      updateAllDataOnMap(svg, data, projection, colorScale);
    })

  })

  loadSubwaylines();
});
