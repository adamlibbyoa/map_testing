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
var trails = [];
var location;
var currentTrail = 0;
var waypoint;
var selectedTrailDistance = 0;
// 35.610295
//-97.4613617
function onNavigatingTo(args) {
    const page = args.object;
    var m = page.getViewById("myMap");
    var map = new mapbox.MapboxView();
    map.id = "themap";
    //console.log("going into map ready");

    map.on("mapReady", (args) => {
        console.log("map is ready");
        if (global.trails.length == 0) {
            console.log("No trails to show");
        } else {
            for (var i = 0; i < global.trails.length; i++) {
                // add trail heads here
                map.addMarkers([{
                    id: global.trails[i].id,
                    lat: global.trails[i].coordinates[0].lat,
                    lng: global.trails[i].coordinates[0].lng,
                    iconPath: "./icons/trail_head_marker.png",
                    title: "Trail head: " + global.trails[i].name,
                    subtitle: "Trail is: " + global.trails[i].distance + "m",
                    onTap: function () {
                        console.log("tapped trail head");
                    }
                }]);
                // draw the trails here
                map.addPolyline({
                    id: global.trails[i].id,
                    color: global.trails[i].trailColor,
                    points: global.trails[i].coordinates
                });
            }
        }
    });
    geolocation.getCurrentLocation({
        desiredAccuracy: 1,
        updateDistance: 1
    }).then(loc => {
        //console.log(loc);
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

function onBackPressed(args) {
    var btn = args.object;
    var page = btn.page;
    page.frame.navigate("home/home-page");

}
exports.onBackPressed = onBackPressed;

exports.onNavigatingTo = onNavigatingTo;

function viewPreviousTrail(args) {
    var btn = args.object;
    var page = btn.page;
    var map = page.getViewById("themap");
    map.removePolylines();
    if (currentTrail > 0) {
        currentTrail--;
        console.log("goto prev trail");
    } else {
        currentTrail = global.trails.length - 1;
        console.log("went to last trail");
    }
    map.addPolyline({
        id: global.trails[currentTrail].id,
        color: global.trails[currentTrail].trailColor,
        points: global.trails[currentTrail].coordinates
    });
}
exports.viewPreviousTrail = viewPreviousTrail;

function viewNextTrail(args) {
    var btn = args.object;
    var page = btn.page;
    var map = page.getViewById("themap");
    map.removePolylines();
    if (currentTrail < global.trails.length - 1) {
        currentTrail++;
        console.log("goto next trail");
    } else {
        currentTrail = 0;
        console.log("went back to trail 0");
    }
    map.addPolyline({
        id: global.trails[currentTrail].id,
        color: global.trails[currentTrail].trailColor,
        points: global.trails[currentTrail].coordinates
    });
}
exports.viewNextTrail = viewNextTrail;