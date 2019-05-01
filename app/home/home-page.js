/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./home-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const filesystemModule = require("tns-core-modules/file-system");
const dialogs = require("tns-core-modules/ui/dialogs");
const accelerometer = require("nativescript-accelerometer");
const application = require("tns-core-modules/application");
var frameModule = require("ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const timerModule = require("tns-core-modules/timer");

const documents = filesystemModule.knownFolders.documents();
const fname = "gpscoords";
const folder = documents.getFolder("GPSTESTING" || "GPStesting");
const file = folder.getFile("data.txt" || "gpsdata.txt");

var curID = 2;
const accessToken =
  "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
var watchID;
var recordedLocations = [];
var locations = [];
var curLocID = 0;
var recordBtn;
var savebtn;
var recordPopup;
var observ;

var deviceRotation = {
  x: 0, // roll
  y: 0, // pitch
  z: 0 // yaw  (we don't care about yaw)
};

var location;
var waypoint;
// 35.610295
//-97.4613617
function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();
  // hide the status bar if the device is an android
  if (application.android) {
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
  }
  // save the record/save buttons for later use
  recordBtn = page.getViewById("recordbtn");
  //savebtn = page.getViewById("savebtn");
  recordPopup = page.getViewById("recordPopup");
  recordPopup.visibility = "collapsed";
  // get rid of the ugly actionbar
  var topmost = frameModule.topmost();
  topmost.android.showActionBar = false;

  // set the default visibility of the record/save buttons
  recordBtn.visibility = "visible";
  //savebtn.visibility = "collapsed";

  // get the map container (not the actual map though). This is where the map is going to be 'spawned' in.
  var m = page.getViewById("myMap");
  var map = new mapbox.MapboxView();
  map.id = "themap";
  map.on("mapReady", args => {
    console.log("map is ready");

    if (global.trails.length == 0) {
      console.log("No trails to show");
    } else {
      for (var i = 0; i < global.trails.length; i++) {
        // add trail heads here
        map.addMarkers([
          {
            id: global.trails[i].id,
            lat: global.trails[i].coordinates[0].lat,
            lng: global.trails[i].coordinates[0].lng,
            iconPath: "./icons/trail_head_marker.png",
            title: "Trail head: " + global.trails[i].name,
            subtitle: "Trail is: " + global.trails[i].distance + "m",
            onTap: function() {
              console.log("tapped trail head");
            }
          }
        ]);
        // draw the trails here
        map.addPolyline({
          id: global.trails[i].id,
          color: global.trails[i].trailColor,
          points: global.trails[i].coordinates
        });
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

  geolocation
    .getCurrentLocation({
      desiredAccuracy: 1,
      updateDistance: 1
    })
    .then(loc => {
      // console.log(loc);
      location = loc;
      map.accessToken =
        "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
      map.latitude = location.latitude;
      map.longitude = location.longitude;
      map.showUserLocation = true;
      map.zoomLevel = 18;

      map.mapStyle = "mapbox://styles/mapbox/outdoors-v9";
      global.loadTrails();
      m.addChild(map);

      page.bindingContext = observ;
    });
}
var starttime;
var curCoords = [];
var trailName = "";
var isPopupOpen = false;

function createTrailTap(args) {
  if (recording) {
    recording = false;
    buttonStopWatch();

    return;
  }
  if (isPopupOpen) {
    recordPopup.visibility = "collapsed";
    recordBtn.text = "+";
  } else {
    recordPopup.visibility = "visible";
    recordBtn.text = "X";
  }
  isPopupOpen = !isPopupOpen;
}
exports.createTrailTap = createTrailTap;

function startRecording(map) {
  map.trackUser({
    mode: "FOLLOW", // "NONE" | "FOLLOW" | "FOLLOW_WITH_HEADING" | "FOLLOW_WITH_COURSE"
    animated: true
  });
  map.removePolylines();
  var dist = 0;
  var mtomi = 0.00062137;
  var lastLoc = null;
  watchID = geolocation.watchLocation(
    function(loc) {
      if (loc) {
        // console.log(loc);
        recordedLocations = [...recordedLocations, loc];
        curCoords = [];
        for (var i = 0; i < recordedLocations.length; i++) {
          var tempCoord = {
            lat: recordedLocations[i].latitude,
            lng: recordedLocations[i].longitude
          };
          curCoords = [...curCoords, tempCoord];
        }
        if (lastLoc == null) {
          lastLoc = loc;
        } else {
          dist += geolocation.distance(lastLoc, loc) * mtomi;
          observ.set("dist", dist.toFixed(2));
          lastLoc = loc;
        }
        map.latitude = loc.latitude;
        map.longitude = loc.longitude;
        map.addPolyline({
          id: 11,
          color: 0xffff0000,
          points: curCoords
        });
        //map.page.getViewById("lastloc").text = "Left/right: " + deviceRotation.x + "; Forward/Back: " + deviceRotation.y;
      }
    },
    function(err) {
      console.log(err);
    },
    {
      // possibly set these dynamically based on battery optimization
      desiredAccuracy: 1,
      updateDistance: 2,
      minimumUpdateTime: 1000 * 3
    }
  );
}
var recording = false;

function buttonStartWatch(args) {
  dialogs
    .prompt({
      title: "Name your trail!",
      okButtonText: "Save",
      cancelButtonText: "Cancel",
      inputType: dialogs.inputType.text
    })
    .then(res => {
      if (res.result) {
        // the user clicked save
        trailName = res.text;
        console.log("recording started: " + res.text);
        recording = true;
        recordPopup.visibility = "collapsed";
        recordBtn.text = "End";
        //savebtn.visibility = "visible";

        starttime = new Date();
        var map = args.object.page.getViewById("themap");
        //recenterTap(args);
        startRecording(map);
      }
    });
}
var initMonitoring = true;

function recenterTap(args) {
  var btn = args.object;
  var page = btn.page;
  var map = page.getViewById("themap");
  geolocation
    .getCurrentLocation({
      desiredAccuracy: 3,
      updateDistance: 10
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
      startTrackingAccelerometer();
      startTimer();
    });
}
exports.recenterTap = recenterTap;

function startTrackingAccelerometer() {
  accelerometer.startAccelerometerUpdates(
    function(data) {
      if (initMonitoring) {
        initMonitoring = false;
        deviceRotation.x = data.x;
        deviceRotation.y = data.y;
      }

      var pitch = 180.0 * (data.x - deviceRotation.x);
      var roll = 180.0 * (data.y - deviceRotation.y);

      observ.set("roll", "Roll: " + pitch.toFixed(1));
      observ.set("pitch", "Pitch: " + roll.toFixed(1));
    },
    {
      sensorDelay: "ui"
    }
  );
}

function stopTrackingAccelerometer() {
  accelerometer.stopAccelerometerUpdates();
}

var timerID;
function startTimer() {
  var start = Date.now();
  var second = 1000; //ms
  timerID = timerModule.setInterval(() => {
    observ.set("time", Math.floor((Date.now() - start) / second));
  }, second);
}

function endTimer() {
  timerModule.clearInterval(timerID);
}

function buttonStopWatch() {
  if (watchID) {
    recordBtn.text = "+";
    //savebtn.visibility = "collapsed";
    geolocation.clearWatch(watchID);
    global.addTrail(trailName, curCoords, recordedLocations);

    //console.log(res);
    curCoords = []; // reset the coords if it was successfully added
    recordedLocations = [];
    map.removePolylines();
    map.removeMarkers();
    for (var i = 0; i < global.trails.length; i++) {
      // add trail heads here
      map.addMarkers([
        {
          id: global.trails[i].id,
          lat: global.trails[i].coordinates[0].lat,
          lng: global.trails[i].coordinates[0].lng,
          iconPath: "./icons/trail_head_marker.png",
          title: "Trail head: " + global.trails[i].name,
          subtitle: "Trail is: " + global.trails[i].distance + "m",
          onTap: function() {
            // toggle viewing of all trails when clicked on a trail head
            console.log("tapped trail head");
          }
        }
      ]);
      // draw the trails here
      map.addPolyline({
        id: global.trails[i].id,
        color: global.trails[i].trailColor,
        points: global.trails[i].coordinates
      });
    }
  }
}

function showLastTrailTap(args) {
  var btn = args.object;
  var page = btn.page;
  page.frame.navigate("lasttrail/lasttrail-page");
}

exports.showLastTrailTap = showLastTrailTap;
exports.buttonStartWatch = buttonStartWatch;
exports.buttonStopWatch = buttonStopWatch;
exports.onNavigatingTo = onNavigatingTo;
