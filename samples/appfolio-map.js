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

    var circleOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: new google.maps.LatLng(39.50, -98.35),
        radius: 500000
    };
    // Add the circle for this city to the map.
    var circle = new google.maps.Circle(circleOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);
