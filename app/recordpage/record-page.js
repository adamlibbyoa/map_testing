/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./record-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const filesystemModule = require("tns-core-modules/file-system");
const dialogs = require("tns-core-modules/ui/dialogs");
const accelerometer = require("nativescript-accelerometer");
const application = require("tns-core-modules/application");
var frameModule = require("ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const timerModule = require("tns-core-modules/timer");
const Accuracy = require("tns-core-modules/ui/enums").Accuracy;
const documents = filesystemModule.knownFolders.documents();
const fname = "gpscoords";
const folder = documents.getFolder("GPSTESTING" || "GPStesting");
const file = folder.getFile("data.txt" || "gpsdata.txt");
const androidApp = require("tns-core-modules/application").android;
//const iosUtils = require("utils/utils.ios");

// import {
//     android as androidApp,
//     ios as iosApp
// } from "application";
// import {
//     ios as iosUtils
// } from "utils/utils";


var vm;
var curID = 2;
const accessToken = "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
var watchID;
var recordedLocations = [];
var trails = [];
var curCoords = [];
var location;
var currentTrail = 0;
var waypoint;
var selectedTrailDistance = 0;
var map;
var timerID;
var timerStarted = false;

// 35.610295
//-97.4613617
function onNavigatingTo(args) {
    const page = args.object;

    var topmost = frameModule.topmost();
    topmost.android.showActionBar = false;
    vm = new HomeViewModel();
    vm.set("elevation", "000m");
    //vm.set("duration", "0s");
    vm.set("distance", "0.00mi");
    // vm.set("battery", "100");
    var m = page.getViewById("myMap");

    map = new mapbox.MapboxView();
    if (application.android) {
        const activity = application.android.startActivity;
        const win = activity.getWindow();
        win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    }
    map.id = "themap";
    //console.log("going into map ready");

    map.on("mapReady", (args) => {
        map.animateCamera({
            target: {
                lat: location.latitude,
                lng: location.longitude
            },
            zoomLevel: 17,
            altitude: 2000,
            tilt: 60,
            duration: 2000
        });
        startRecording(map);

    });
    geolocation.getCurrentLocation({
        desiredAccuracy: Accuracy.high
    }).then(loc => {
        //console.log(loc);
        location = loc;
        map.accessToken = "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
        map.latitude = location.latitude;
        map.longitude = location.longitude;
        map.showUserLocation = true;
        map.zoomLevel = 16;
        vm.set("elevation", loc.altitude.toFixed(0) + "m");

        map.mapStyle = "satellite_streets";
        startTimer();
        batteryMonitor();
        m.addChild(map);
        page.bindingContext = vm;

    });

}

function onBackPressed(args) {
    var btn = args.object;
    var page = btn.page;
    page.frame.navigate("home/home-page");

}
exports.onBackPressed = onBackPressed;

exports.onNavigatingTo = onNavigatingTo;

function startRecording(map) {
    map.trackUser({
        mode: "FOLLOW", // "NONE" | "FOLLOW" | "FOLLOW_WITH_HEADING" | "FOLLOW_WITH_COURSE"
        animated: true
    });
    map.removePolylines();
    map.removeMarkers();
    dist = 0;
    var curLineID = 0;
    var mtomi = 0.00062137;
    var lastLoc = null;
    watchID = geolocation.watchLocation(
        function (loc) {
            if (loc) {
                // console.log(loc);
                recordedLocations = [...recordedLocations, loc]; // save the location data
                vm.set("elevation", loc.altitude.toFixed(2) + " m");


                // check and see if last loc is null
                if (lastLoc == null) {
                    lastLoc = loc;

                    // save the current coords
                    curCoords = [...curCoords, {
                        lat: loc.latitude,
                        lng: loc.longitude
                    }];
                } else if (geolocation.distance(lastLoc, loc) == 0) {
                    console.log("We havent moved, so we are not going to save it");
                }
                // else we want to calculate the distance and draw a polyline
                else {
                    // calc distance in miles
                    dist += geolocation.distance(lastLoc, loc) * mtomi;
                    vm.set("distance", dist.toFixed(2) + " mi");

                    // save the current coords
                    curCoords = [...curCoords, {
                        lat: loc.latitude,
                        lng: loc.longitude
                    }];
                    // save temp coords to draw
                    var tempcoords = [{
                            lat: lastLoc.latitude,
                            lng: lastLoc.longitude
                        },
                        {
                            lat: loc.latitude,
                            lng: loc.longitude
                        }
                    ];


                    map.addPolyline({
                        id: curLineID,
                        color: 0xffff0000,
                        points: tempcoords
                    });


                    // set the last location to the current
                    lastLoc = loc;
                    curLineID++;
                }


                // old way
                /**
                 * 
                 
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
                */
                //map.page.getViewById("lastloc").text = "Left/right: " + deviceRotation.x + "; Forward/Back: " + deviceRotation.y;
            }
        },
        function (err) {
            console.log(err);
        }, {
            // possibly set these dynamically based on battery optimization
            desiredAccuracy: Accuracy.high,
            updateDistance: 5,
            minimumUpdateTime: 1000 * 3
        }
    );
}

function batteryMonitor() {

    // if (iosApp) {
    //     iosUtils.getter(UIDevice, UIDevice.currentDevice).batteryMonitoringEnabled = true;
    //     vm.set("battery", +(iosUtils.getter(UIDevice, UIDevice.currentDevice).batteryLevel * 100));
    // } else {
    androidApp.registerBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED, (context, intent) => {
        let level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
        let scale = intent.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1);
        let percent = (level / scale) * 100.0;
        vm.set("battery", percent.toFixed(0));
    });
    //}
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
            //startTrackingAccelerometer();
            //startTimer();
        });
}
exports.recenterTap = recenterTap;

function startTrackingAccelerometer() {
    accelerometer.startAccelerometerUpdates(
        function (data) {
            if (initMonitoring) {
                initMonitoring = false;
                deviceRotation.x = data.x;
                deviceRotation.y = data.y;
            }

            var pitch = 180.0 * (data.x - deviceRotation.x);
            var roll = 180.0 * (data.y - deviceRotation.y);

            // observ.set("roll", "Roll: " + pitch.toFixed(1));
            // observ.set("pitch", "Pitch: " + roll.toFixed(1));
        }, {
            sensorDelay: "ui"
        }
    );
}

function stopTrackingAccelerometer() {
    accelerometer.stopAccelerometerUpdates();
}


var curTime;

function startTimer() {
    if (!timerStarted) {
        timerStarted = true;

        var start = Date.now();
        var second = 1000; //ms
        timerID = timerModule.setInterval(() => {
            var seconds = Math.floor((Date.now() - start) / second);
            curTime = new Date(seconds * 1000).toISOString().substr(11, 8)
            vm.set("time", curTime);
        }, second);
    }
}

function endTimer() {
    timerModule.clearInterval(timerID);
}

function buttonStopWatch() {
    if (watchID) {
        dialogs.confirm({
                title: "Are you sure you are done recording?",
                okButtonText: "Confirm",
                cancelButtonText: "Resume"
            })

            .then(res => {
                if (res) {
                    // the user clicked save
                    //trailName = res.text;
                    geolocation.clearWatch(watchID);
                    timerStarted = false;
                    timerModule.clearInterval(timerID);
                    global.setCurrentTrailData(curCoords, dist, curTime);
                    //global.postTrail(trailName, curCoords, dist);

                    curCoords = []; // reset the coords if it was successfully added
                    recordedLocations = [];
                    map.removePolylines();
                    map.removeMarkers();
                    frameModule.topmost().navigate("endrecord/endrecord-page");
                }
            });
        //recordBtn.text = "+";
        //savebtn.visibility = "collapsed";
        //global.addTrail(trailName, curCoords, recordedLocations);

        //console.log(res);
    }
}

exports.buttonStopWatch = buttonStopWatch;