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

  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  var BATCH_MILLISECONDS = 0
    , NO_DATA_TIMEOUT = 5000
    , DATA_URL = '/data';

  var last_count = 0
    , data = new Array(2)
    , rotation = 0
    , data_ready = false;

  var dataConfigs =
  {
    request: {
      duration: 1000,
      interval: 100,
      color: '#0000FF',
      magnitude_scale: 20000,
      start_radius_ratio: 0.8,
      fade_time_ratio: 4,
      start_opacity: 0.35,
      end_opacity: 0
    },
    epayments: {
      duration: 3000,
      interval: 100,
      color: '#FF0000',
      magnitude_scale: 80000,
      start_radius_ratio: 0.3,
      fade_time_ratio: 4,
      start_opacity: 0.35,
      end_opacity: 0
    },
    transactions: {
      duration: 2000,
      interval: 100,
      color: '#00FF00',
      magnitude_scale: 50000,
      start_radius_ratio: 0.5,
      fade_time_ratio: 4,
      start_opacity: 0.35,
      end_opacity: 0
    }
  }

  function convert_event_to_circle_options(event) {
    return {
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.5,
      map: map,
      center: new google.maps.LatLng(event.lat, event.lng),
      radius: 0,
      time: event.time,
      magnitude: event.magnitude,
      type: event.type
    };
  }

  function continue_if_ready() {
    if(data_ready) {
      data_ready = false;
      yo_momma(data[1-rotation]);
    } else {
      data_ready = true;
    }
  }

  function animateCircle(options, delay) {
    window.setTimeout(function() {
      var config = dataConfigs[options.type]
      options.fillColor = config.color;
      options.strokeColor = config.color;
      options.fillOpacity = config.start_opacity;
      options.strokeOpacity = config.start_opacity;
      var duration = Math.floor(config.duration/config.interval)
        , circle = new google.maps.Circle(options)
        , endSize = options.magnitude * config.magnitude_scale
        , startSize = endSize * config.start_radius_ratio
        , growthCycle = duration / config.fade_time_ratio
        , deltaRadius = (endSize-startSize) / growthCycle
        , deltaOpacity = (config.end_opacity-config.start_opacity) / (duration-growthCycle)
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
          }
        }
        count++;
      }, config.interval);
      if(--last_count === 0) continue_if_ready();
    }, delay);
  };

  function batchAnimateCircles(circles, magnitudes, duration, interval, delay) {
    window.setTimeout(function() {
      duration = Math.floor(duration/interval);
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
          for(i = 0; i < len; i++) circles[i].setRadius(circles[i].radius + deltaRadii[i]);
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
            for(i = 0; i < len; i++) circles[i].setMap(null);
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
      url: DATA_URL
    }).done(function(response) {
      data[rotation] = response;
      rotation = 1-rotation;
      continue_if_ready();
    });

    if(input.length === 0) {
      setTimeout(function() {
        continue_if_ready();
      }, NO_DATA_TIMEOUT);
      return;
    }

    var len = input.length
      , circleOptions = []
      , start_time = input[0].time
      , circles = []
      , magnitudes = []
      , currentTime, options, i;

    last_count = len;

    for(i = 0; i < len; i++) {
      circleOptions.push(convert_event_to_circle_options(input[i]));
    }

    for(i = 0; i < len; i++) {
      options = circleOptions[i];
      currentTime = options.time;
//      while(currentTime <= (options.time + BATCH_MILLISECONDS)) {
//        circles.push(new google.maps.Circle(options));
//        magnitudes.push(options.magnitude);
//        if(++i === len) break;
//        options = circleOptions[i];
//      }
//      i--;

//      batchAnimateCircles(circles.slice(0), magnitudes.slice(0), DURATION, INTERVAL, (options.time-start_time));
//      circles.length = 0;
//      magnitudes.length = 0;
      console.log("DELAY: " + (options.time - start_time));
      animateCircle(options, (options.time-start_time));
    }
  }

  $.ajax({
    url: DATA_URL
  }).done(function(response) {
    yo_momma(response);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
