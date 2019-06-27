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
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const timerModule = require("tns-core-modules/timer");
const Accuracy = require("tns-core-modules/ui/enums").Accuracy;
const documents = filesystemModule.knownFolders.documents();
const fname = "gpscoords";
const folder = documents.getFolder("GPSTESTING" || "GPStesting");
const file = folder.getFile("data.txt" || "gpsdata.txt");
const androidApp = require("tns-core-modules/application").android;
var enums = require("tns-core-modules/ui/enums");
const campModal = "Modals/CampModal/camp-modal";
const poiModal = "Modals/PoiModal/poi-modal";
const obsticalModal = "Modals/ObsticalModal/obstical-modal";
const confirmModal = "Modals/ConfirmModal/confirm-modal";
const utils = require("tns-core-modules/utils/utils");
const device = require("tns-core-modules/platform").device;
var backgroundService = require("../background-service");

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
const accessToken =
  "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
var watchID;
var recordedLocations = [];
var trails = [];
var curCoords = [];
var location;
var currentTrail = 0;
var waypoint;
var selectedTrailDistance = 0;
var markerID = 0;
var map;
var timerID;
var timerStarted = false;
var isShown;
var elevations = [];
var speeds = [];
var markers = [];
var resumed = false;
var curLoc;
var dist = 0;
var service;
var jobId = 321;
// 35.610295
//-97.4613617
var uid;
var vid;



exports.onNavigatingFrom = function (args) {
  console.log("removing home page suspendEvent Listener");
  application.off(application.suspendEvent);
  console.log("removing home page resumeEvent Listener");
  application.off(application.resumeEvent);
  if (map != null) {
    map.destroy();
  }
}


function onNavigatingTo(args) {
  const page = args.object;
  const context = args.context;
  vid = context.vid;
  uid = context.uid;
  console.log(vid);

  var popup = page.getViewById("trailNotesPopup")
  popup.translateY = 500;
  isShown = false;


  vm = new HomeViewModel();
  vm.set("isLoading", true);
  vm.set("elevation", "000m");
  //vm.set("duration", "0s");
  vm.set("distance", "0.00mi");
  // vm.set("battery", "100");

  // when the application is resumed, this will be caused. I'm thinking about doing background recording. We will see.
  application.on(application.resumeEvent, args => {
    if (args.android) {
      // cancel the background recording service
      // stopBackgroundRecording();
      // clearNotification();

      // load in the background recorded data so they can be drawn onto the map. 

      //recordedLocations = [...recordedLocations, global.backgroundLocations];
      for (var i = 0; i < global.backgroundLocations.length; i++) {
        var loc = global.backgroundLocations[i];
        console.dir(loc);

        curCoords = [...curCoords, {
          lat: loc.latitude,
          lng: loc.longitude
        }];
      }
      console.log("resumed record page");
      resumed = true;
    }
  });


  if (application.android) {
    // if device is android, run in full screen mode (i.e. get rid of the notification bar thing)
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);

    // get rid of the action bar
    var topmost = frameModule.topmost();
    topmost.android.showActionBar = false;
  }
}
exports.onNavigatingTo = onNavigatingTo;

function startBackgroundRecording() {
  if (application.android) {
    var context = utils.ad.getApplicationContext();
    if (device.sdkVersion >= "26") {
      var component = new android.content.ComponentName(context, com.oa.location.BackgroundService26.class);
      var builder = new android.app.job.JobInfo.Builder(jobId, component);
      builder.setRequiredNetworkType(android.app.job.JobInfo.NETWORK_TYPE_ANY);
      builder.setOverrideDeadline(0);
      //builder.setPeriodic(30);
      const jobScheduler = context.getSystemService(android.content.Context.JOB_SCHEDULER_SERVICE);
      service = jobScheduler.schedule(builder.build());
      //console.log(`Job Scheduled: ${jobScheduler.schedule(builder.build())}`);
    } else {
      var intent = new android.content.Intent(context, com.oa.location.BackgroundService.class);
      context.startService(intent);
    }
  }
}

function stopBackgroundRecording() {
  if (application.android) {
    var context = utils.ad.getApplicationContext();
    if (device.sdkVersion >= "26") {
      const jobScheduler = context.getSystemService(android.content.Context.JOB_SCHEDULER_SERVICE);
      jobScheduler.cancel(service);
      console.log("Canceled " + service);
      service = null;
      if (jobScheduler.getPendingJob(jobId) !== null) {
        jobScheduler.cancel(jobId);
        console.log(`Job Canceled: ${jobId}`);
      }
    } else {
      var intent = new android.content.Intent(context, com.oa.location.BackgroundService.class);
      context.stopService(intent);
    }
  }
}


function createNotification() {
  if (application.android) {

    var notificationManger = utils.ad.getApplicationContext().getSystemService(android.content.Context.NOTIFICATION_SERVICE);
    const channel_id = "fucking_work_id_new";
    const channel_name = "Fucking Channel Name";
    const description = "Fucking channel description";
    const importance = android.app.NotificationManager.IMPORTANCE_HIGH;
    const mChannel = new android.app.NotificationChannel(channel_id, channel_name, importance);
    mChannel.setDescription(description);
    notificationManger.createNotificationChannel(mChannel);


    var randomCode = Math.abs(new java.util.Random().nextInt()); //to be used later to associate the 2 things
    var intent = new android.content.Intent(application.android.foregroundActivity, com.tns.NativeScriptActivity.class);
    var pendingIntent = android.app.PendingIntent.getActivity(application.android.foregroundActivity, randomCode, intent, android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK);
    var builder = new android.app.Notification.Builder(application.android.foregroundActivity, mChannel.getId());
    builder.setDefaults(0);
    builder.setContentTitle("Overland America");
    builder.setContentText("Background Recording");
    builder.setContentIntent(pendingIntent);
    builder.setTicker("Persistent Notification");
    builder.setSmallIcon(application.android.nativeApp.getApplicationInfo().icon); //utils.ad.getApplicationContext().getApplicationInfo().icon); //application.android.nativeApp.getApplicationInfo().icon);
    builder.setPriority(android.app.Notification.PRIORITY_HIGH);
    builder.setOngoing(true); //this tells the OS that the notification is persistant
    // builder.setColor(0xff0000ff);



    builder.setChannelId(channel_id);

    var notification = builder.build();
    notificationManger.notify(randomCode, notification);
  }
}

function clearNotification() {
  if (application.android) {
    var notificationManger = utils.ad.getApplicationContext().getSystemService(android.content.Context.NOTIFICATION_SERVICE);
    notificationManger.cancelAll();
  }

}



exports.onMapLoaded = function (args) {
  var page = args.object.page;
  var m = page.getViewById("myMap");

  map = new mapbox.MapboxView();
  map.id = "themap";
  //console.log("going into map ready");

  map.on("mapReady", args => {


    // this will run when the application is suspended. This will (hopefully) pause the recording
    application.on(application.suspendEvent, args => {
      if (args.android) {
        // background recording
        //createNotification();
        //startBackgroundRecording();


        if (map) {
          m.removeChildren();
          map.destroy();
        }

        console.log("suspended from record page");
      }
    });

    vm.set("isLoading", false);
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
  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      //console.log(loc);
      location = loc;
      map.accessToken =
        "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
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

function startRecording(map) {
  map.removePolylines();
  map.removeMarkers();


  var curLineID = 1; // start at one just in case the app gets suspended

  var mtomi = 0.00062137;
  var lastLoc = null;
  if (resumed) {
    // redraw the previous recorded locations
    lastLoc = recordedLocations[recordedLocations.length - 1];
    resumed = false;
    map.addPolyline({
      id: 0,
      color: 0xffff0000,
      points: curCoords
    });

    // redraw the markers
    if (markers.length > 0)
      map.addMarkers(markers);
    else
      console.log("no markers to add.");
  }
  watchID = geolocation.watchLocation(
    function (loc) {
      if (loc) {

        map.trackUser({
          mode: "FOLLOW_WITH_HEADING", // "NONE" | "FOLLOW" | "FOLLOW_WITH_HEADING" | "FOLLOW_WITH_COURSE"
          animated: true
        });
        // console.log(loc);
        recordedLocations = [...recordedLocations, loc]; // save the location data
        elevations = [...elevations, loc.altitude];
        speeds = [...speeds, loc.speed];
        vm.set("elevation", loc.altitude.toFixed(2) + " m");

        // check and see if last loc is null
        if (lastLoc == null) {
          lastLoc = loc;

          // save the current coords
          curCoords = [
            ...curCoords,
            {
              lat: loc.latitude,
              lng: loc.longitude
            }
          ];
        } else if (geolocation.distance(lastLoc, loc) <= 1) {
          console.log("We havent moved, so we are not going to save it");
        }
        // else we want to calculate the distance and draw a polyline
        else {

          // calc distance in miles
          dist += geolocation.distance(lastLoc, loc) * mtomi;
          vm.set("distance", dist.toFixed(2) + " mi");

          // save the current coords
          curCoords = [
            ...curCoords,
            {
              lat: loc.latitude,
              lng: loc.longitude
            }
          ];
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
      }
    },
    function (err) {
      console.log(err);
    }, {
      // possibly set these dynamically based on battery optimization
      desiredAccuracy: Accuracy.high,
      updateDistance: 5
    }
  );

}

function batteryMonitor() {
  // if (iosApp) {
  //     iosUtils.getter(UIDevice, UIDevice.currentDevice).batteryMonitoringEnabled = true;
  //     vm.set("battery", +(iosUtils.getter(UIDevice, UIDevice.currentDevice).batteryLevel * 100));
  // } else {
  if (application.android) {
    androidApp.registerBroadcastReceiver(
      android.content.Intent.ACTION_BATTERY_CHANGED,
      (context, intent) => {
        let level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
        let scale = intent.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1);
        let percent = (level / scale) * 100.0;
        vm.set("battery", percent.toFixed(0));
      }
    );
  }
  //}
}

var recording = false;


var initMonitoring = true;

function recenterTap(args) {
  var btn = args.object;
  var page = btn.page;
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
      curTime = new Date(seconds * 1000).toISOString().substr(11, 8);
      vm.set("time", curTime);
    }, second);
  }
}

function endTimer() {
  timerModule.clearInterval(timerID);
}

function buttonStopWatch(args) {
  if (watchID) {
    var mainView = args.object;
    var context = {
      confirmText: "Are you sure you are done recording?"
    }
    mainView.showModal(confirmModal, context, (result) => {
      if (result) {
        // we confirmed, so save trail then navigate to endrecord page
        geolocation.clearWatch(watchID);
        timerStarted = false;
        timerModule.clearInterval(timerID);

        // calculate average speed 
        var avgSpeed = 0;
        for (var i = 0; i < speeds.length; i++) {
          avgSpeed += speeds[i];
        }
        avgSpeed /= speeds.length;

        // set the trail's data. 
        global.setCurrentTrailData(curCoords, dist, curTime, avgSpeed, elevations);
        global.currentTrail.vid = vid;
        global.currentTrail.creation_uid = uid;

        //global.currentTrailMarkers = markers;
        //console.log(JSON.stringify(markers));
        //global.postTrail(trailName, curCoords, dist);

        curCoords = []; // reset the coords if it was successfully added
        recordedLocations = [];
        map.removePolylines();
        map.removeMarkers();
        frameModule.topmost().navigate("endrecord/endrecord-page");
      } else {
        // we canceled the end recording, so resume recording
        console.log("Closed confirm");
      }
    }, false);

  }
}

exports.buttonStopWatch = buttonStopWatch;



function addCampTapped(args) {

  // close the popup
  var page = args.object.page;
  var popup = page.getViewById("trailNotesPopup");
  isShown = false;

  popup.animate({
    translate: {
      x: 0,
      y: 500
    },
    duration: 300,
    curve: enums.AnimationCurve.easeInOut
  });

  var mainView = args.object;
  var context = {};

  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      curLoc = loc;
    });

  mainView.showModal(campModal, context, addCampIcon, false);
}
exports.addCampTapped = addCampTapped;

function addCampIcon(didConfirm, data) {
  if (didConfirm) {

    markers = [...markers, {
      id: markerID,
      lat: curLoc.latitude,
      lng: curLoc.longitude,
      iconPath: "./icons/camp_trail_marker.png"
    }];


    map.addMarkers([{
      id: markerID,
      lat: curLoc.latitude,
      lng: curLoc.longitude,
      // icon: "res://campsite_icon"
      iconPath: "./icons/camp_trail_marker.png"
    }]);
    markerID++;
    global.AddMarker("camp", curLoc, data);
    //global.addMarkerData("camp", curLoc, data.rating, data.price, data.info);
  } else {
    console.log("closed");
  }
}

function addObsticalTapped(args) {

  // close the popup
  var page = args.object.page;
  var popup = page.getViewById("trailNotesPopup");
  isShown = false;

  popup.animate({
    translate: {
      x: 0,
      y: 500
    },
    duration: 300,
    curve: enums.AnimationCurve.easeInOut
  });

  var mainView = args.object;
  var context = {};

  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      curLoc = loc;
    });

  mainView.showModal(obsticalModal, context, addObsticalIcon, false);
}
exports.addObsticalTapped = addObsticalTapped;

function addObsticalIcon(didConfirm, data) {
  if (didConfirm) {

    markers = [...markers, {
      id: markerID,
      lat: curLoc.latitude,
      lng: curLoc.longitude,
      iconPath: "./icons/obstical_icon_marker.png"
    }];

    map.addMarkers([{
      id: markerID,
      lat: curLoc.latitude,
      lng: curLoc.longitude,
      //icon: "res://obstical_icon"
      iconPath: "./icons/obstical_icon_marker.png"
    }]);
    markerID++;

    global.AddMarker("obstical", curLoc, data);
    //    global.addMarkerData("camp", curLoc, data.rating, data.price, data.info);
  } else {
    console.log("closed");
  }
}


function addPoiTapped(args) {

  // close the popup
  var page = args.object.page;
  var popup = page.getViewById("trailNotesPopup");
  isShown = false;

  popup.animate({
    translate: {
      x: 0,
      y: 500
    },
    duration: 300,
    curve: enums.AnimationCurve.easeInOut
  });

  var mainView = args.object;
  var context = {};

  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      curLoc = loc;
    });

  mainView.showModal(poiModal, context, addPoiIcon, false);
}
exports.addPoiTapped = addPoiTapped;

function addPoiIcon(didConfirm, data) {
  if (didConfirm) {

    markers = [...markers, {
      id: markerID,
      lat: curLoc.latitude,
      lng: curLoc.longitude,
      iconPath: "./icons/poi_trail_marker.png"
    }];

    map.addMarkers([{
      id: markerID,
      lat: curLoc.latitude,
      lng: curLoc.longitude,
      // icon: "res://campsite_icon"
      iconPath: "./icons/poi_trail_marker.png"
    }]);
    markerID++;
    global.AddMarker("poi", curLoc, data);
    //global.addMarkerData("camp", curLoc, data.rating, data.price, data.info);
  } else {
    console.log("closed");
  }
}

function trailNotesPressed(args) {
  var page = args.object.page;
  var popup = page.getViewById("trailNotesPopup");

  if (isShown) {
    popup.animate({
      translate: {
        x: 0,
        y: 500
      },
      duration: 300,
      curve: enums.AnimationCurve.easeInOut
    });
  } else {
    popup.animate({
      translate: {
        x: 0,
        y: 0
      },
      duration: 650,
      curve: enums.AnimationCurve.easeInOut
    });
  }



  isShown = !isShown;
}

exports.trailNotesPressed = trailNotesPressed;

function onBackPressed(args) {
  var btn = args.object;
  var page = btn.page;
  page.frame.navigate("home/home-page");
}
exports.onBackPressed = onBackPressed;






/** =================================================================================== code gravyard 
 * 

// old recording start method 
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

    // old way or recording
        
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
        //map.page.getViewById("lastloc").text = "Left/right: " + deviceRotation.x + "; Forward/Back: " + deviceRotation.y;
 


        // old dialog system
        //   dialogs
    //     .confirm({
    //       title: "Are you sure you are done recording?",
    //       okButtonText: "Confirm",
    //       cancelButtonText: "Resume"
    //     })

    //     .then(res => {
    //       if (res) {
    //         // the user clicked save
    //         //trailName = res.text;
    //         geolocation.clearWatch(watchID);
    //         timerStarted = false;
    //         timerModule.clearInterval(timerID);
    //         global.setCurrentTrailData(curCoords, dist, curTime);
    //         //global.postTrail(trailName, curCoords, dist);

    //         curCoords = []; // reset the coords if it was successfully added
    //         recordedLocations = [];
    //         map.removePolylines();
    //         map.removeMarkers();
    //         frameModule.topmost().navigate("endrecord/endrecord-page");
    //       }
    //     });
    //   //recordBtn.text = "+";
    //   //savebtn.visibility = "collapsed";
    //   //global.addTrail(trailName, curCoords, recordedLocations);

    //   //console.log(res);



 */