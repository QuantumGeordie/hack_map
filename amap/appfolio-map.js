function initialize() {
  var styles = [
      {
          "featureType": "administrative",
          "stylers": [
              { "visibility": "off" }
          ]
      },
      {
          "featureType": "landscape",
          "stylers": [
              { "visibility": "off" }
          ]
      },
      {
          "featureType": "poi",
          "stylers": [
              { "visibility": "off" }
          ]
      },
      {
          "featureType": "road",
          "stylers": [
              { "visibility": "off" }
          ]
      },
      {
          "featureType": "transit",
          "stylers": [
              { "visibility": "off" }
          ]
      },
      {
          "featureType": "water",
          "stylers": [
              { "visibility": "simplified" },
              { "color": "#a8a8a2" }
          ]
      },
      {
          "featureType": "administrative.province",
          "stylers": [
              { "visibility": "on" }
          ]
      },
      {
          "featureType": "administrative.province",
          "elementType": "labels",
          "stylers": [
              { "weight": 0.1 }
          ]
      },
      {
          "featureType": "administrative.province",
          "stylers": [
              { "weight": 1.2 }
          ]
      }
  ];

  var mapOptions = {
    center: new google.maps.LatLng(39.50, -98.35),
    zoom: 5,
    styles: styles
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);

  var DURATION = 100
    , INTERVAL = 1
    , MAGNITUDE_SCALE = 100000
    , START_RADIUS_RATIO = 0.8
    , START_OPACITY = 0.35
    , END_OPACITY = 0
    , FADE_TIME_RATIO = 4;


  var input =
    JSON.stringify([
      {
        time: 13425234,
        lat: 39.50,
        lng: -98.35,
        magnitude: 0.1,
        type: "balls1"
      },
      {
        time: 13426234,
        lat: 40.50,
        lng: -98.35,
        magnitude: 0.5,
        type: "balls2"
      },
      {
        time: 13427234,
        lat: 41.50,
        lng: -98.35,
        magnitude: 0.75,
        type: "balls3"
      },
      {
        time: 13428234,
        lat: 42.50,
        lng: -98.35,
        magnitude: 1,
        type: "balls4"
      },
      {
        time: 13429234,
        lat: 43.50,
        lng: -98.35,
        magnitude: 1,
        type: "balls5"
      }
    ]);

  function convert_event_to_circle_options(event) {
    return {
      strokeColor: '#FF0000',
      strokeOpacity: 0.35,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: new google.maps.LatLng(event.lat, event.lng),
      radius: 0,
      time: event.time,
      magnitude: event.magnitude,
      type: event.type
    };
  }

  function animateCircle(circle, magnitude, duration, interval, delay) {
    window.setTimeout(function() {
      var startSize = magnitude*START_RADIUS_RATIO*MAGNITUDE_SCALE
        , endSize = magnitude*MAGNITUDE_SCALE
        , growthCycle = duration/FADE_TIME_RATIO
        , deltaRadius = (endSize-startSize)/growthCycle
        , deltaOpacity = (END_OPACITY-START_OPACITY)/(duration-growthCycle)
        , count = 0;

      circle.setRadius(startSize);
      circle.setValues( {
                          fillOpacity: START_OPACITY,
                          strokeOpacity: START_OPACITY
                        });

      var intervalHandle = window.setInterval(function() {
        if(count < growthCycle) {
          circle.setRadius(circle.radius + deltaRadius);
        } else {
          circle.setValues( {
                              fillOpacity: circle.fillOpacity + deltaOpacity,
                              strokeOpacity: circle.strokeOpacity + deltaOpacity
                            });
          if(count === duration) {
            window.clearInterval(intervalHandle);
            circle.setMap(null);
            // delete me!
          }
        }
        count++;
      }, interval);
    }, delay);
  };

  function yo_momma(input) {
    var data_array = jQuery.parseJSON(input)
      , len = data_array.length
      , circleOptions = []
      , start_time = data_array[0].time;

    for(var i = 0; i < len; i++) {
      circleOptions.push(convert_event_to_circle_options(data_array[i]));
    }

    for(var i = 0; i < len; i++) {
      var options = circleOptions[i];
      circle = new google.maps.Circle(options);
      animateCircle(circle, options.magnitude, DURATION, INTERVAL, (options.time-start_time));
    }
  }

  yo_momma(input);
}

google.maps.event.addDomListener(window, 'load', initialize);