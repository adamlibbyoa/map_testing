/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./home-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
var curID = 2;
const accessToken = "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";

var location;
var waypoint;
// 35.610295
//-97.4613617
function onNavigatingTo(args) {
    const page = args.object;    
    var m = page.getViewById("myMap");
    var map = new mapbox.MapboxView();
    map.id = "themap";
    map.on("mapReady", (args) => {
        console.log("map is ready");
        map.addMarkers([
            {
                id: 1,
                lat: 35.610295,
                lng: -97.4613617,
                title: "OC",
                subtitle: "OC is not home",
                onTap: function(){console.log("tapped!")}
            }
        ]);
        map.setOnMapClickListener((point) => {
           // waypoint = JSON.stringify(point);
            console.log("We clicked: " + JSON.stringify(point));
            var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + point.lng + "," + point.lat + ".json?access_token=" + accessToken;
            fetch(url).then(response => {
                return response.json();
            })
            .then(data => {
                waypoint = (data.features[0].center);
                map.removeMarkers();
                map.addMarkers([
                    {
                        id: curID,
                        lat: point.lat,
                        lng: point.lng,
                        title: data.features[0].text,
                        subtitle: data.features[0].place_name,
                        onTap: function(){console.log("Tapped the added marker " + curID)}
                    }
                ]);
                

            })
            .then(() => {
                var dirUrl = "https://api.mapbox.com/directions/v5/mapbox/driving/" + location.longitude + "," + location.latitude + ";" + waypoint[0] + "," + waypoint[1] + "?geometries=geojson&access_token=" + accessToken;
                //console.log(dirUrl);
                fetch(dirUrl).then(res => {
                    //var routes = res.json();
                    return res.json();
                }).then(routeData => {
                    var coords = routeData.routes[0].geometry.coordinates;
                    var coordinates = [];
                    for (var i = 0; i < coords.length; i++)
                    {
                        var tempCoord = 
                        {
                            lat: coords[i][1],
                            lng: coords[i][0]
                        }
                        coordinates = [...coordinates, tempCoord];
                    }

                    console.log(coordinates);
                    //console.log(routeData);
                    map.removePolylines();
                    map.addPolyline({
                       id: 10,
                       color: 0xffff0000,
                       points: coordinates
                    })
                }).catch(err => {
                    console.log(err);
                })
            })
            .catch(err => {
                console.log(err);
            });
        });

    });

    geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10}).then(loc => {
       // console.log(loc);
        location = loc;
        map.accessToken = "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
        map.latitude = location.latitude;
        map.longitude = location.longitude;
        map.showUserLocation = true;
        map.zoomLevel = 10;
        map.mapStyle = "satellite_streets";
        
        
 
        
        

        m.addChild(map);
        page.bindingContext = new HomeViewModel();
        
    });
}


exports.onNavigatingTo = onNavigatingTo;