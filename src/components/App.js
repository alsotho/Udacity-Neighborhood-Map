import React, {Component} from 'react';
import LocationList from './LocationList';

class App extends Component {
    /* Constructor */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {
                    'name': "Make Way for Ducklings",
                    'type': "Tourist Attraction",
                    'latitude': 42.355499 ,
                    'longitude': -71.069784,
                    'streetAddress': "4 Charles St S"
                },
                {
                    'name': "Boston Opera House",
                    'type': "Entertainment",
                    'latitude': 42.353993  ,
                    'longitude': -71.062317,
                    'streetAddress': "539 Washington St"
                },
                {
                    'name': "101 Bakery",
                    'type': "Restaurant",
                    'latitude': 42.351492,
                    'longitude': -71.060516,
                    'streetAddress': "56 Beach St"
                },
                {
                    'name': "Orpheum Theatre",
                    'type': "Entertainment",
                    'latitude': 42.35626,
                    'longitude': -71.061037,
                    'streetAddress': "1 Hamilton Pl"
                },
                {
                    'name': "Fenway Park",
                    'type': "Entertainment",
                    'latitude': 42.346683,
                    'longitude': -71.097229,
                    'streetAddress': "4 Yawkey Way"
                },
                {
                    'name': "New England Aquarium",
                    'type': "Entertainment",
                    'latitude': 42.359146,
                    'longitude': -71.049764,
                    'streetAddress': "1 Central Wharf"
                },
                {
                    'name': "Boston Tea Party Ships & Museum",
                    'type': "Museum",
                    'latitude': 42.352185,
                    'longitude': -71.051288,
                    'streetAddress': "306 Congress St"
                },
                {
                    'name': "Mike's Pastry",
                    'type': "Bakery",
                    'latitude': 42.364266,
                    'longitude': -71.054396,
                    'streetAddress': "300 Hanover St"
                },
                {
                    'name': "The Barking Carb",
                    'type': "Resturant",
                    'latitude': 42.353787 ,
                    'longitude': -71.04867,
                    'streetAddress': "88 Sleeper St"
                }
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        // Connect the initMap() function within this class to the global window context,
        // so Google Maps can invoke it
        window.initMap = this.initMap;
        // Asynchronously load the Google Maps script, passing in the callback reference
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyAu5AWVJ9K65IMwIRZc7G41c4S96GHYCLo&callback=initMap')
    }

    /* Initializes the map once the map script is loaded */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 42.359275 , lng: -71.057723},
            zoom: 15,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /** Opens the infowindow for the pin
     * @param {object} location marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * Retrives the location data from the foursquare api
     * @param {object} location marker
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "IGLC5UPDEWFFOE3K3KL3ESPRO2MLBJOUL4X2MZZ4WYKCLCPW";
        var clientSecret = "FLVHDHTO2F3VAAEADBOASL55WYEC0KCDFZKUZATFAKWS5TKL";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /**
     * Close the infowindow for the marker
     * @param {object} location marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /* App render function */
    render() {
        return (
            <div>
                <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/**
 * Load the google maps asynchronously
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}
