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

  var DURATION = 10
    , INTERVAL = 1
    , MAGNITUDE_SCALE = 20000
    , START_RADIUS_RATIO = 0.8
    , START_OPACITY = 0.35
    , END_OPACITY = 0
    , FADE_TIME_RATIO = 4;

  var last_count = 0
    , data = new Array(2)
    , rotation = 0
    , data_ready_count = 0;

  function convert_event_to_circle_options(event) {
    return {
      strokeColor: '#FF0000',
      strokeOpacity: START_OPACITY,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: START_OPACITY,
      map: map,
      center: new google.maps.LatLng(event.lat, event.lng),
      radius: 0,
      time: event.time,
      magnitude: event.magnitude,
      type: event.type
    };
  }

  function continue_if_ready() {
    data_ready_count++;
    if(data_ready_count === 2) {
      data_ready_count = 0;
      yo_momma(data[1-rotation]);
    }
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
            last_count--;
            if(last_count === 0) continue_if_ready();
          }
        }
        count++;
      }, interval);
    }, delay);
  };

  function batchAnimateCircles(circles, magnitudes, duration, interval, delay) {
    window.setTimeout(function() {
      var startSizes = []
        , endSizes = []
        , growthCycle = duration/FADE_TIME_RATIO
        , deltaRadii = []
        , deltaOpacity = (END_OPACITY-START_OPACITY)/(duration-growthCycle)
        , count = 0
        , len = circles.length
        , startScale = START_RADIUS_RATIO*MAGNITUDE_SCALE
        , i, circle;

      for(i = 0; i < len; i++) {
        startSizes.push(magnitudes[i]*startScale);
        endSizes.push(magnitudes[i]*MAGNITUDE_SCALE);
        deltaRadii.push((endSizes[i]-startSizes[i])/growthCycle);
        circles[i].setRadius(startSizes[i]);
      }

      var intervalHandle = window.setInterval(function() {
        if(count < growthCycle) {
          for(i = 0; i < len; i++) circles[i].setRadius(circles[i].radius + deltaRadius);
        } else {
          for(i = 0; i < len; i++) {
            circle = circles[i];
            circle.setValues({
              fillOpacity: circle.fillOpacity + deltaOpacity,
              strokeOpacity: circle.strokeOpacity + deltaOpacity
            });
          }
          if(count === duration) {
            window.clearInterval(intervalHandle);
            for(i = 0; i < len; i++) circle[i].setMap(null);
            last_count -= len;
            if(last_count === 0) continue_if_ready();
          }
        }
        count++;
      }, interval);
    }, delay);
  }

  function yo_momma(input) {
    $.ajax({
      url: "/balls"
    }).done(function(response) {
      data[rotation] = response;
      rotation = 1-rotation;
      continue_if_ready()
    });

    var len = input.length
      , circleOptions = []
      , start_time = input[0].time;

    last_count = len;

    for(var i = 0; i < len; i++) {
      circleOptions.push(convert_event_to_circle_options(input[i]));
    }

    var circles = []
      , magnitudes = []
      , currentTime;

    for(var i = 0; i < len; i++) {
      var options = circleOptions[i];
      currentTime = options.time;
      while(currentTime === options.time) {
        circles.push(new google.maps.Circle(options));
        magnitudes.push(options.magnitude);
        i++;
      }
      i--;
      batchAnimateCircles(circles, magnitudes, DURATION, INTERVAL, (options.time-start_time));
      circles.length = 0;
      magnitudes.length = 0;
    }
  }

  $.ajax({
    url: "/balls"
  }).done(function(response) {
    yo_momma(response);
  });

}

google.maps.event.addDomListener(window, 'load', initialize);
