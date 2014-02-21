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
    var len = input.length
      , circleOptions = []
      , start_time = input[0].time;

    for(var i = 0; i < len; i++) {
      circleOptions.push(convert_event_to_circle_options(input[i]));
    }

    for(var i = 0; i < len; i++) {
      var options = circleOptions[i];
      circle = new google.maps.Circle(options);
      animateCircle(circle, options.magnitude, DURATION, INTERVAL, (options.time-start_time));
    }
  }

  $.ajax({
    url: "/balls"
  }).done(function(data) {
    yo_momma(data);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);