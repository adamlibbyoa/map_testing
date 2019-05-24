/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./home-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");

const application = require("tns-core-modules/application");
var frameModule = require("ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const Accuracy = require("tns-core-modules/ui/enums").Accuracy;
const accessToken =
  "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";

var recordBtn;
var watchID; // used for background recording

var observ;
var map;

var deviceRotation = {
  x: 0, // roll
  y: 0, // pitch
  z: 0 // yaw  (we don't care about yaw)
};

var location;
var waypoint;
// 35.610295
//-97.4613617

function onMapLoaded(args) {
  var page = args.object.page;
  // get the map container (not the actual map though). This is where the map is going to be 'spawned' in.
  var m = page.getViewById("myMap");
  map = new mapbox.MapboxView();
  map.id = "themap";

  map.on("mapReady", args => {
    application.on(application.suspendEvent, args => {
      if (args.android) {
        if (map != null) {
          m.removeChildren();
          map.destroy();
        }
        // background location does not work here. Maybe I will try something later.
        // watchID = geolocation.watchLocation(
        //   function(loc) {
        //     if (loc) {
        //       console.log("watching: " + loc.latitude + ", " + loc.longitude);
        //     }
        //   },
        //   function(error) {
        //     console.log(error);
        //   }
        // );
        console.log("suspended");
      }
    });

    console.log("map is ready");
    observ.set("isLoading", false);

    if (global.trails.length == 0) {
      console.log("No trails to show");
    } else {
      var trailHeads = [];
      for (var i = 0; i < global.trails.length; i++) {
        var tMarker = {
          id: global.trails[i].id,
          lat: global.trails[i].coordinates[0].lat,
          lng: global.trails[i].coordinates[0].lng,
          iconPath: "./icons/trail_start_end.png",
          //title: "Trail head: " + global.trails[i].name,
          //subtitle: "Trail is: " + global.trails[i].distance + "m",
          onTap: marker => onTrailHeadTap(marker)
        };
        trailHeads = [...trailHeads, tMarker];

        // add trail heads here
        // draw the trails here
        map.addPolyline({
          id: global.trails[i].id,
          color: global.trails[i].trailColor,
          points: global.trails[i].coordinates
        });
      }
      //map.addMarkers(trailHeads);

      for (var i = 0; i < global.markers.length; i++) {
        var marker = global.markers[i];
        var icon;
        if (marker.type == "obstical") {
          icon = "./icons/obstical_icon_marker.png";
        } else if (marker.type == "camp") {
          icon = "./icons/camp_trail_marker.png";
        } else if (marker.type == "poi") {
          icon = "./icons/poi_trail_marker.png";
        }
        map.addMarkers([
          {
            id: marker.id,
            lat: marker.location.lat,
            lng: marker.location.lng,
            iconPath: icon,
            title: marker.type,
            subtitle: JSON.stringify(marker.data),
            onTap: function() {
              console.log(marker.data);
            }
          }
        ]);
      }
    }

    //#region  gps thingy whenever a user clicks, not needed just a learning thing.
    // map.setOnMapClickListener((point) => {
    //     // waypoint = JSON.stringify(point);
    //     console.log("We clicked: " + JSON.stringify(point));
    //     var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + point.lng + "," + point.lat + ".json?access_token=" + accessToken;
    //     fetch(url).then(response => {
    //             return response.json();
    //         })
    //         .then(data => {
    //             waypoint = (data.features[0].center);
    //             map.removeMarkers();
    //             map.addMarkers([{
    //                 id: curID,
    //                 lat: point.lat,
    //                 lng: point.lng,
    //                 iconPath: "./icons/trail_head_marker.png",
    //                 title: data.features[0].text,
    //                 subtitle: data.features[0].place_name,
    //                 onTap: function () {
    //                     console.log("Tapped the added marker " + curID)
    //                 }
    //             }]);
    //
    //
    //         })
    //         .then(() => {
    //             var dirUrl = "https://api.mapbox.com/directions/v5/mapbox/driving/" + location.longitude + "," + location.latitude + ";" + waypoint[0] + "," + waypoint[1] + "?geometries=geojson&access_token=" + accessToken;
    //             //console.log(dirUrl);
    //             fetch(dirUrl).then(res => {
    //                 //var routes = res.json();
    //                 return res.json();
    //             }).then(routeData => {
    //                 var coords = routeData.routes[0].geometry.coordinates;
    //                 var coordinates = [];
    //                 for (var i = 0; i < coords.length; i++) {
    //                     var tempCoord = {
    //                         lat: coords[i][1],
    //                         lng: coords[i][0]
    //                     }
    //                     coordinates = [...coordinates, tempCoord];
    //                 }
    //
    //                 console.log(coordinates);
    //                 //console.log(routeData);
    //                 map.removePolylines();
    //                 map.addPolyline({
    //                     id: 10,
    //                     color: 0xffff0000,
    //                     points: coordinates
    //                 })
    //             }).catch(err => {
    //                 console.log(err);
    //             })
    //         })
    //         .catch(err => {
    //             console.log(err);
    //         });
    // });
    //#endregion
  });

  //console.log("navigatedto");
  global.loadTrails();

  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      // console.log(loc);
      location = loc;
      map.accessToken =
        "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
      map.latitude = location.latitude;
      map.longitude = location.longitude;
      map.showUserLocation = true;
      map.hideCompass = "false";
      map.zoomLevel = 19;

      map.mapStyle = "satellite_streets"; // satellite_streets | mapbox://styles/mapbox/outdoors-v11
      m.addChild(map);

      page.bindingContext = observ;
    });
}
exports.onMapLoaded = onMapLoaded;

onTrailHeadTap = data => {
  console.log(data.id);
};

function onNavigatingTo(args) {
  var m = args.object.getViewById("myMap");
  // hide the status bar if the device is an android
  if (application.android) {
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
  }

  // get rid of the ugly actionbar
  var topmost = frameModule.topmost();
  topmost.android.showActionBar = false;

  // not sure where to put this, so I'll put this here...
  // this will run when the application is suspended. It basically deletes the map.
  application.on(application.launchEvent, args => {
    map = null;
  });

  // when the application is resumed, this will be caused. I'm thinking about doing background recording. We will see.
  application.on(application.resumeEvent, args => {
    if (args.android) {
      //geolocation.clearWatch(watchID);
      console.log("resumed");
    }
  });
  const page = args.object;
  observ = new Observable();
  observ.set("isLoading", true);
  page.bindingContext = observ;
}

function recenterTap(args) {
  var btn = args.object;
  var page = btn.page;
  var map = page.getViewById("themap");
  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      map.setCenter({
        lat: loc.latitude,
        lng: loc.longitude,
        animated: true
      });
      // this works, just annoying so I commented it out
      //   map.animateCamera({
      //     target: {
      //       lat: loc.latitude,
      //       lng: loc.longitude
      //     },
      //     tilt: 60,
      //     zoomLevel: 20,
      //     duration: 2000
      //   });

      // this is testing stuff, I just threw it into the recenter so I can activate it on a button click
      //startTrackingAccelerometer();
      //startTimer();
    });
}
exports.recenterTap = recenterTap;

exports.onNavigatingTo = onNavigatingTo;

exports.goToRecording = function(args) {
  frameModule.topmost().navigate({
    moduleName: "recordpage/record-page",
    context: {},
    animated: true
  });
};
