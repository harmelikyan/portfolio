//preloader
$(window).on('load', function() {
  if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow', function() {
      $(this).remove();
    });
  }
});
var countryName;
var countryCodeGlobal = "";
var lat;
var lng;
var countryBoundary;
var map;
var citiesMarker;
var wikiMarker;
var country_code;

$(document).ready(function () {
  $("#countries").change(function(){
    locateCountry($(this).val());
  });

map = L.map("issMap", {
  attributionControl: false,
}).setView([0, 0], 1.5);

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileUrl, { attribution })
tiles.addTo(map)


 countryBoundary = new L.geoJson().addTo(map);

 citiesMarker = L.markerClusterGroup();
 map.addLayer(citiesMarker);

wikiMarker = L.markerClusterGroup();
map.addLayer(wikiMarker);

 getCountry();
 getUserLocation();
});

$("#weather").click(function() {
  if($("#countries").val() === "") {
    $("#weather-table").hide();
  } 
  else {
  $("#weather-table").show();
  }
})

$("#closeButton").click(function() {
  $("#weather-table").hide();
})

// // countryName
function getCountry() {
  $.ajax({
    url: 'php/getCountriesCode.php',
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      // console.log(result)
      for(var country of result) {
        countryName =  $('#countries').append(`<option value="${country["iso_a2"]}">${country["name"]}</option>`);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    }  
  })
}

function getUserLocation() {
  console.log("Getting user location");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const {
          latitude
        } = position.coords;
        const {
          longitude
        } = position.coords;
        const coords = [latitude, longitude];
        console.log(position);
        $.ajax({
          url: "php/getLatLong.php?lat=" +
            latitude +
            "&lng=" +
            longitude +
            "&username=harmelikyan",
          type: "GET",
          success: function (json) {
            let info = JSON.stringify(json)
            console.log("json: ", json["data"]);
            // 
             country_code = json["data"].countryCode;
            $("#countries").val(country_code.toUpperCase()).change();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            console.log(jqXHR);
          }
        });
      },
    )
  }
}


//   //country border
  function getCountryBorder(countryCode) {
    $.ajax({
      url: 'php/getCountryBorders.php',
      type: 'GET',
      dataType: 'json', 
      data: {
          countryCode: $('#countries').val(),
      },
      
      success: function(json) {
        console.log(JSON.stringify(json))
        countryBoundary.clearLayers();
        countryBoundary.addData(json).setStyle(countryStyle());
        const bounds = countryBoundary.getBounds();
        map.fitBounds(bounds);

        const east = bounds.getEast();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const south = bounds.getSouth();
        ;
        getNearbyCities(east, west, north, south);
        getNearbyWikis(east, west, north, south);
        

 },

      error: function(jqXHR, textStatus, errorThrown) {
        // your error code
        console.log(jqXHR);
      }
            
    })
    
  }

function countryStyle() {
  return {
    fillColor: "blue",
    weight: 2,
    fillOpacity: 0.2,
  }
}

function locateCountry(countryCode) {
  if (countryCode == "") return;
  countryName = $("#country option:selected").text();
  countryCodeGlobal = countryCode;
  getCountryBorder(countryCode);
  getCountryInfo(countryCode);
  
}

//get nearby cities and put markers
function getNearbyCities(east, west, north, south) {
  citiesMarker.clearLayers();
  $.ajax({
    url: "php/getCitiesNearby.php",
    type: "GET",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
      username: "harmelikyan",
    },
    success: function (json) {
      // json = JSON.stringify(json);
      console.log(json);
      // const data = json.geonames;
      const city_icon = L.ExtraMarkers.icon({
        icon: "fa-building",
        markerColor: 'red',
        shape: 'circle',
        prefix: 'fa'
      });

      for (let i = 0; i < json.data.length; i++) {
        const marker = L.marker([json.data[i].lat, json.data[i].lng], {
          icon: city_icon,
        }).bindPopup(
          "<b>" +
          json.data[i].name +
          "</b><br>Population: " +
          parseInt(json.data[i].population).toLocaleString("en")
          
        );
        
        citiesMarker.addLayer(marker);
        
      }
    },
  });
}

// //get nearby wikipedias
function getNearbyWikis(east, west, north, south) {
  wikiMarker.clearLayers();
  $.ajax({
    url: "php/getWikipedia.php",
    type: "GET",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
    },
    success: function (json) {
      // json = JSON.stringify(json);
      console.log(json);
      // const data = json.geonames;
      const wiki_icon = L.ExtraMarkers.icon({
        icon: 'fa-info',
        markerColor: 'blue',
        shape: 'circle',
        prefix: 'fas'
      });
      for (let i = 0; i < json.data.length; i++) {
        const marker = L.marker([json.data[i].lat, json.data[i].lng], {
          icon: wiki_icon,
        }).bindPopup(
          "<img src='" +
          json.data[i].thumbnailImg +
          "' width='100px' height='100px' alt='" +
          json.data[i].title +
          "'><br><b>" +
          json.data[i].title +
          "</b><br><a href='https://" +
          json.data[i].wikipediaUrl +
          "' target='_blank'>Wikipedia Link</a>"
        );
        wikiMarker.addLayer(marker);
      }
    },
  });
}


// //get country info
function getCountryInfo(countryCode) {
  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    datatype: 'json',
    data: {
      countryCodeGlobal: countryCodeGlobal
    },
    success: function(response) {
      let info = JSON.stringify(response);
      console.log(response);
            $("#country_capital").text(response['data'].capital);
            $("#country_population").html(parseInt(response['data'].population).toLocaleString("en"));
            $("#country_flag").attr("src", response['data'].flag);
            $("#area").html(response['data'].area);
            $("#region").html(response['data'].region);
            $("#timeZone").html(response['data'].timezones);
            $("#countryWikipedia").attr(
              "href",
              "https://en.wikipedia.org/wiki/" + response['data'].name
            );
    
    }
  })

}

// //Weather data
function getWeatherData() {
  $.ajax({
    url: "php/getWeather.php",
    type: "GET",
    datatype: 'json',
    data: {
      lat: lat,
      lng: lng
    },
    success: function (response) {
      let details = JSON.stringify(response);
      console.log(details);
      $("#first-row").html("Weather for the next Seven Days");
      $("#second-row").html("Max Temperature");
      $("#third-row").html("Min Temperature");
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < 7; i++) {
        const d = details["daily"][i];
        const day = days[new Date(d["dt"] * 1000).getDay()];
        $("#first-row").append("<td>" + day + "</td>");
        $("#second-row").append("<td>" + parseInt(d["temp"]["max"]) + "°</td>");
        $("#third-row").append("<td>" + parseInt(d["temp"]["min"]) + "°</td>");
      }
    },
  });
}

function getNews() {
    $("#news").html("");
    $.ajax({
      url: "php/getNews.php",
      type: "GET",
      datatype: 'json',
      data: {
        countryCodeGlobal: countryName,
      },
        success: function (json) {        
        console.log(json);
        for (let i = 0; i < json.data.length; i++) {
          $("#news").append(newsCard(json.data[i]));  
        }
      },
  
      error: function(jqXHR, textStatus, errorThrown) {
  
        // your error code
  
        console.log(jqXHR);
  
      } 
  
    });
  
  }
function newsCard(data) {
  const card =
    '<div class="card" style= display: inline"> <img class="card-img-top" src="' +
    data["urlToImage"] +
    '" alt="News Image"> <div class="card-body"> <h5 class="card-title">' +
    data["author"] +
    '</h5> <p class="card-text">' +
    data["title"] +
    '</p> <a href="' +
    data["url"] +
    '" target="_blank" class="btn btn-primary">See More</a> </div> </div>';
  return card;
}

// $("#covidImg").click(
  function covidData() {
  $.ajax({
    url: "php/covid.php",
    type: "GET",
    datatype: "json",
    data: {
      countryName: countryCodeGlobal
    },
    success: function(result) {
      let info = JSON.stringify(result);
      console.log(info);
      $("#cases").html(result['data'].cases);
      $("#todayCases").html(result['data'].todayCases);
      $("#deaths").html(result['data'].deaths);
      $("#todayDeaths").html(result['data'].todayDeaths);
      $("#recovered").html(result['data'].recovered);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    } 
  })
}
// )