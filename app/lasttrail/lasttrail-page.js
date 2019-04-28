/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./lasttrail-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const filesystemModule = require("tns-core-modules/file-system");
const documents = filesystemModule.knownFolders.documents();
const fname = "gpscoords";
const folder = documents.getFolder("GPSTESTING" || "GPStesting");
const file = folder.getFile("data.txt" || "gpsdata.txt");

var curID = 2;
const accessToken = "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
var watchID;
var recordedLocations = [];

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
        file.readText().then(res => {
            recordedLocations = JSON.parse(res);
            var coordinates = [];
            for (var i = 0; i < recordedLocations.length; i++)
            {
                var tempCoord = 
                {
                    lat: recordedLocations[i].latitude,
                    lng: recordedLocations[i].longitude
                }
                coordinates = [...coordinates, tempCoord];
            }
            
            map.addPolyline({
                id: 11,
                color: 0xffff0000,
                points: coordinates
            });

        })
    });

    geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10}).then(loc => {
       // console.log(loc);
        location = loc;
        map.accessToken = "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
        map.latitude = location.latitude;
        map.longitude = location.longitude;
        map.showUserLocation = true;
        map.zoomLevel = 16;
        map.mapStyle = "satellite_streets";
        
        m.addChild(map);
        page.bindingContext = new HomeViewModel();
        
    });
}

function onBackPressed(args)
{
    var btn = args.object;
    var page = btn.page;
    page.frame.navigate("home/home-page");

}
exports.onBackPressed = onBackPressed;

function buttonStartWatch(args)
{
    var map = args.object.page.getViewById("themap");
    watchID = geolocation.watchLocation( 
        function(loc) {
        if (loc)
        {
           // console.log(loc);
           recordedLocations = [...recordedLocations, loc];
           var coordinates = [];
                    for (var i = 0; i < recordedLocations.length; i++)
                    {
                        var tempCoord = 
                        {
                            lat: recordedLocations[i].latitude,
                            lng: recordedLocations[i].longitude
                        }
                        coordinates = [...coordinates, tempCoord];
                    }
            map.latitude = loc.latitude;
            map.longitude = loc.longitude;
            map.addPolyline({
                id: 11,
                       color: 0xffff0000,
                       points: coordinates
            })
            args.object.page.getViewById("lastloc").text = "Watching: " + loc.latitude + "," + loc.longitude;
        }
    },
    function(err) {
        console.log(err);
    },
    {desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime : 1000 * 3}
    );

}

function buttonStopWatch()
{
    if (watchID)
    {
        geolocation.clearWatch(watchID);
        console.log(JSON.stringify(recordedLocations));
        file.writeText(JSON.stringify(recordedLocations)).then((result) => {
            file.readText().then((res) => {
                console.log("we wrote: " + res);
            })
        }).catch (err => console.log(err));
    }
}

exports.buttonStartWatch = buttonStartWatch;
exports.buttonStopWatch = buttonStopWatch;
exports.onNavigatingTo = onNavigatingTo;