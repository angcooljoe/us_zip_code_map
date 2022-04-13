const selectClinic = document.getElementById("select-clinic");

let zipCodeCentroids = {
  type: "FeatureCollection",
  name: "centroids",
  crs: {
    type: "name",
    properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
  },
  features: [],
};

let map = L.map("map", { fullScreenControl: true, zoomSnap: 0.2 }).streetView().addTo(map);

let startLatitude = 39.26;
let startLongitude = -97.13;
let startZoom = 5.2;

map.setView([startLatitude, startLongitude], startZoom);
let mapZoomLevel = map.getZoom();

map.attributionControl.addAttribution(
  '<a href="https://dentalimplantmachine.com/">Dental Implant Machine</a>'
);

L.control
  .scale({ metric: false, imperial: true, position: "bottomright" })
  .addTo(map);

const fsControl = L.control.fullscreen();
map.addControl(fsControl);

map.on("enterFullscreen", function () {});
map.on("exitFullscreen", function () {});

L.easyButton(
  '<img src="images/home.png">',
  function (btn, map) {
    map.setView([startLatitude, startLongitude], startZoom);
  },
  "Default View"
).addTo(map);

function thousandsSeparator(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}

let circleMarkerStart = {
  color: "#000000",
  fillColor: "#000000",
  fillOpacity: 0,
  opacity: 0,
  radius: 1,
  weight: 0,
};

let circleMarkerFound = {
  color: "#000000",
  fillColor: "#000000",
  fillOpacity: 0.3,
  opacity: 1,
  radius: 10,
  weight: 1,
};

let styleStateLines = {
  color: "#000000",
  opacity: 1,
  weight: 2,
};

function colorByStatus(a) {
  return a === "Exclusive"
    ? "#c3ecb2"
    : a === "FRoR"
    ? "#aadaff"
    : a === "Purchased"
    ? "#eb9dad"
    : a === "Simple"
    ? "#c69edb"
    : a === "Client"
    ? "#ebac26"
    : "#f5f5f5";
}

let popupStyle = {
  closeButton: true,
};

let popupStyleClinic = {
  closeButton: true,
  autoClose: false,
};

function onEachCentroid(feature, layer) {
  let popupContent =
    '<p class="popup-title">' + feature.properties.ZCTA5CE10 + "</p>";
  layer.bindPopup(popupContent, popupStyle);
}

function onEachCentroidClinic(feature, layer) {
  let popupContent =
    '<p class="popup-title">' + feature.properties.clinic + "</p>";
  layer.bindPopup(popupContent, popupStyleClinic);
}

function onEachCentroidTooltip(feature, layer) {
  let tooltipContent =
    '<p class="tooltip-text">' + feature.properties.ZCTA5CE10 + "</p>";

  layer.bindTooltip(tooltipContent, {
    className: "labels-zipcode",
    direction: "center",
    permanent: false,
  });
}

//-----------------------------------

// MAIN MAP LAYERS
let vectorTileGrid;
let layerZipCodeCentroids;
let layerStates = L.geoJson(stateLines, { style: styleStateLines }).addTo(map);
let clinicNames = [];
let uniqueClinicNames = [];
//-----------------------------------

// POPUP CONTENT CONTROL
let switchButton = document.getElementById("clinic-switch");
let isChecked = switchButton.checked;

function controlPopupContent(e) {
  isChecked = switchButton.checked;
  let properties = e.layer.properties;
  let popupContent;
  if (isChecked) {
    popupContent =
      '<p class="popup-title">' +
      properties.ZCTA5CE10 +
      "</p>" +
      '<p class="popup-text">Status: ' +
      properties.status +
      "</p>" +
      '<p class="popup-text">Clinic: ' +
      properties.clinic +
      "</p>" +
      '<p class="popup-text">Population: ' +
      thousandsSeparator(properties.population) +
      "</p>" +
      '<p class="popup-text">Median Income: $' +
      thousandsSeparator(properties.median_income) +
      "</p>";
  } else {
    popupContent =
      '<p class="popup-title">' +
      properties.ZCTA5CE10 +
      "</p>" +
      '<p class="popup-text">Status: ' +
      properties.status +
      "</p>" +
      '<p class="popup-text">Population: ' +
      thousandsSeparator(properties.population) +
      "</p>" +
      '<p class="popup-text">Median Income: $' +
      thousandsSeparator(properties.median_income) +
      "</p>";
  }

  L.popup(popupStyle).setContent(popupContent).setLatLng(e.latlng).openOn(map);
}

function onEachFeatureHighClinic(feature, layer) {
  isChecked = switchButton.checked;
  // let properties = e.layer.properties;
  let popupContent;
  if (isChecked) {
    popupContent =
      '<p class="popup-title">' +
      feature.properties.ZCTA5CE10 +
      "</p>" +
      '<p class="popup-text">Status: ' +
      feature.properties.status +
      "</p>" +
      '<p class="popup-text">Clinic: ' +
      feature.properties.clinic +
      "</p>" +
      '<p class="popup-text">Population: ' +
      thousandsSeparator(feature.properties.population) +
      "</p>" +
      '<p class="popup-text">Median Income: $' +
      thousandsSeparator(feature.properties.median_income) +
      "</p>";
  } else {
    popupContent =
      '<p class="popup-title">' +
      feature.properties.ZCTA5CE10 +
      "</p>" +
      '<p class="popup-text">Status: ' +
      feature.properties.status +
      "</p>" +
      '<p class="popup-text">Population: ' +
      thousandsSeparator(feature.properties.population) +
      "</p>" +
      '<p class="popup-text">Median Income: $' +
      thousandsSeparator(feature.properties.median_income) +
      "</p>";
  }

  layer.bindPopup(popupContent, popupStyleClinic);
}

//-----------------------------------

// MAP LEGEND
let legendZipCodes = L.control({ position: "bottomleft" });
legendZipCodes.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend legend-regions");
  div.innerHTML =
    '<i style="background:' +
    "#c3ecb2" +
    '"></i> ' +
    "Exclusive" +
    "<br>" +
    '<i style="background:' +
    "#aadaff" +
    '"></i> ' +
    "FROR" +
    "<br>" +
    '<i style="background:' +
    "#eb9dad" +
    '"></i> ' +
    "Purchased" +
    "<br>" +
    '<i style="background:' +
    "#c69edb" +
    '"></i> ' +
    "Simple" +
    "<br>" +
    '<i style="background:' +
    "#ebac26" +
    '"></i> ' +
    "Client" +
    "<br>" +
    '<i style="background:' +
    "#f5f5f5" +
    '"></i> ' +
    "Not Assigned" +
    "<br>";
  return div;
};

legendZipCodes.addTo(map);
//-----------------------------------

function otherMapFeaures() {
  layerZipCodeCentroids = L.geoJson(zipCodeCentroids, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circleMarkerStart);
    },
    onEachFeature: onEachCentroid,
  }).addTo(map);

  // SEARCH BARS
  let searchByZipCode = new L.Control.Search({
    container: "search-zip-code",
    layer: layerZipCodeCentroids,
    textPlaceholder: "Search by Zip Code",
    propertyName: "zip_numbers",
    marker: { circle: circleMarkerFound, icon: false, animate: true },
    collapsed: false,
    position: "topright",
    zoom: 12,
  });

  searchByZipCode.on("search:locationfound", function (e) {
    if (e.layer._popup) e.layer.openPopup();
  });

  map.addControl(searchByZipCode);

  let searchByState = new L.Control.Search({
    container: "search-state",
    layer: layerStates,
    textPlaceholder: "Zoom to State",
    propertyName: "NAME",
    marker: false,
    collapsed: false,
    position: "topleft",
    moveToLocation: function (latlng, title, map) {
      let zoom = map.getBoundsZoom(latlng.layer.getBounds());
      map.setView(latlng, zoom);
    },
  });

  map.addControl(searchByState);
  //-----------------------------------

  // TOOLTIPS FILTERING
  let tooltipsVisible = false;
  let layerFilteredCentroids;

  function filterTooltips() {
    let currZoomLevel = map.getZoom();

    if (currZoomLevel >= 10) {
      if (map.hasLayer(layerFilteredCentroids)) {
        layerFilteredCentroids.remove();
      }

      let mapBounds = map.getBounds();
      let maxLat = mapBounds["_northEast"]["lat"];
      let minLat = mapBounds["_southWest"]["lat"];
      let maxLng = mapBounds["_northEast"]["lng"];
      let minLng = mapBounds["_southWest"]["lng"];

      function filteringFunction(feature) {
        let latitudePoint = feature.geometry.coordinates[1];
        let longitudePoint = feature.geometry.coordinates[0];

        return (
          latitudePoint <= maxLat &&
          latitudePoint >= minLat &&
          longitudePoint <= maxLng &&
          longitudePoint >= minLng
        );
      }

      layerFilteredCentroids = L.geoJson(zipCodeCentroids, {
        filter: filteringFunction,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, circleMarkerStart);
        },
        onEachFeature: onEachCentroidTooltip,
      }).addTo(map);

      layerFilteredCentroids.eachLayer(function (layer) {
        layer.openTooltip();
      });
      tooltipsVisible = true;
    } else {
      if (map.hasLayer(layerFilteredCentroids)) {
        layerFilteredCentroids.remove();
      }
      tooltipsVisible = false;
    }
  }

  map.on("moveend", function (e) {
    filterTooltips();
  });
  //-----------------------------------
}

// VECTOR GRID TILE LAYER
function addVectorTile() {
  let zipCodesPolygonsObjects = [];

  let linkGoogleSheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT2dTqRYnj0S5mUSKdVO3h7jX5D0LuNCEeg8ghZg9_KJwUhfpH9RciFsvv1W4pPd1910lh6OXM9Fk2I/pub?gid=486771173&single=true&output=csv";

  Papa.parse(linkGoogleSheets, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      let GoogleSheetsData = results.data;

      GoogleSheetsData.map(i => {

            //console.log("I", parseFloat(i["latitude_centroid"]), parseFloat(i["longitude_centroid"]))
            clinicNames.push(i["clinic_name"]);

            try {
                JSON.parse(i["geometry"]); //$.parseJSON(i["geometry"])

                  if( !isNaN(parseFloat(i["latitude_centroid"])) &&  !isNaN(parseFloat(i["longitude_centroid"]))){
                    newZipCode = {
                      arcs: $.parseJSON(i["geometry"]),
                      type: i["geometry"].includes("[[[") ? "MultiPolygon" : "Polygon",
                      properties: {
                        unique_id: parseInt(i["unique_id"]),
                        ZCTA5CE10: i["zip_number"].padStart(5, "0"),
                        zip_numbers: parseInt(i["zip_number"]),
                        status: i["status"],
                        clinic: i["clinic_name"],
                        lat_centroid: parseFloat(i["latitude_centroid"]),
                        lng_centroid: parseFloat(i["longitude_centroid"]),
                        population: i["population"],
                        median_income: i["Median Household Income In The Past 12 Months"],
                      },
                    };
                    zipCodesPolygonsObjects.push(newZipCode);

                    let newZipCodePoint = {
                      type: "Feature",
                      properties: {
                        unique_id: parseInt(i["unique_id"]),
                        ZCTA5CE10: i["zip_number"].padStart(5, "0"),
                        zip_numbers: parseInt(i["zip_number"]),
                        status: i["status"],
                        clinic: i["clinic_name"],
                      },
                      geometry: {
                        type: "Point",
                        coordinates: [
                          parseFloat(i["longitude_centroid"]),
                          parseFloat(i["latitude_centroid"]),
                        ],
                      },
                    };
                    zipCodeCentroids["features"].push(newZipCodePoint);
                  }else{
                    return false;
                  }


                
            } catch (e) {
                return false;
            }

      });


      zipCodesPolygonsBase["objects"]["zip_code_polygons"]["geometries"] =
        zipCodesPolygonsObjects;

      otherMapFeaures();

      vectorTileGrid = L.vectorGrid.slicer(zipCodesPolygonsBase, {
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
          zip_code_polygons: function (properties, zoom) {
            let status = properties.status;
            return {
              fillColor: colorByStatus(status),
              fillOpacity: 0.5,
              color: "#444444",
              opacity: 1,
              weight: 0.5,
              stroke: true,
              fill: true,
            };
          },
        },
        interactive: true,
        getFeatureId: function (f) {
          return f.properties.unique_id;
        },
      });
      vectorTileGrid.on("click", controlPopupContent);
      vectorTileGrid.addTo(map);

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

      uniqueClinicNames = clinicNames.filter(onlyUnique);
      uniqueClinicNames.sort();

      uniqueClinicNames.forEach((i) => {
        let newOption = document.createElement("option");
        newOption.textContent = i;
        newOption.label = i;
        newOption.value = i;
        selectClinic.appendChild(newOption);
      });
    },
  });
}

addVectorTile();

let layerHighlightedClinics;

function highlightClinics(selectedOption) {
  let filteredZips = [];

  let allFeatures = zipCodeCentroids.features;
  allFeatures.forEach((x) => {
    if (x["properties"]["clinic"] == selectedOption) {
      filteredZips.push(x["properties"]["zip_numbers"]);
    }
  });

  if (map.hasLayer(layerHighlightedClinics)) {
    map.removeLayer(layerHighlightedClinics);
  }

  if (selectedOption === "none") {
    if (map.hasLayer(layerHighlightedClinics)) {
      map.removeLayer(layerHighlightedClinics);
    }
  } else {
    function styleHighlightedZipCodes(feature) {
      return {
        fillColor: "#000000",
        fillOpacity: 0,
        color: "#000000",
        opacity: 1,
        weight: 3,
      };
    }

    L.TopoJSON = L.GeoJSON.extend({
      addData: function (jsonData) {
        if (jsonData.type === "Topology") {
          for (key in jsonData.objects) {
            geojson = topojson.feature(jsonData, jsonData.objects[key]);
            L.GeoJSON.prototype.addData.call(this, geojson);
          }
        } else {
          L.GeoJSON.prototype.addData.call(this, jsonData);
        }
      },
    });

    layerHighlightedClinics = new L.TopoJSON(zipCodesPolygonsBase, {
      filter: function (feature, layer) {
        if (filteredZips.includes(feature.properties.zip_numbers)) return true;
      },
      style: styleHighlightedZipCodes,
      onEachFeature: onEachFeatureHighClinic
    });

    layerHighlightedClinics.addTo(map);
    searchedClinicBounds = layerHighlightedClinics.getBounds();
    map.fitBounds(searchedClinicBounds);
  }
}
