/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./home-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
var firebase = require("nativescript-plugin-firebase");
const application = require("tns-core-modules/application");
const imageModule = require("tns-core-modules/ui/image");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const fromObject = require("tns-core-modules/data/observable").fromObject;
const Accuracy = require("tns-core-modules/ui/enums").Accuracy;
const utils = require("tns-core-modules/utils/utils");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const navBar = require("../navbar");


const accessToken =
  "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
var recordBtn;
var watchID; // used for background recording
var justScrolled = false;
var observ;
var map;
var selectedTrail = null;
var trailInfoPanel;
var trailHeads = [];
var trailHeadMarkers = [];
var uid;
// var com;


var deviceRotation = {
  x: 0, // roll
  y: 0, // pitch
  z: 0 // yaw  (we don't care about yaw)
};

var location;
var waypoint;
// 35.610295
//-97.4613617




exports.onNavigatingFrom = function (args) {
  //console.log("removing home page suspendEvent Listener");
  application.off(application.suspendEvent);
  //console.log("removing home page resumeEvent Listener");
  application.off(application.resumeEvent);
  if (map != null) {
    map.destroy();
  }
}

function onNavigatingTo(args) {
  var m = args.object.getViewById("myMap");

  firebase.getCurrentUser().then(res => {
    uid = res.uid;
  }, (err) => {
    console.log(err);
  });

  if (application.android) {
    // hide the status bar if the device is an android
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);

    // get rid of the ugly actionbar
    var topmost = frameModule.topmost();
    topmost.android.showActionBar = false;
  }

  // when the application is resumed, this will be caused. I'm thinking about doing background recording. We will see.
  application.on(application.resumeEvent, args => {
    if (args.android) {
      //geolocation.clearWatch(watchID);
      console.log("resumed");
      clearNotification();
    }
  });



  const page = args.object;
  trailInfoPanel = page.getViewById("trailinfopanel");
  trailInfoPanel.visibility = "collapsed";
  observ = new Observable();
  observ.set("isLoading", true);

  observ.set("justScrolled", "collapsed");
  page.bindingContext = observ;
}
exports.onNavigatingTo = onNavigatingTo;

exports.goToFeed = function (args) {
  navBar.goToFeed(true);
}

exports.goToDiscover = function (args) {
  navBar.goToDiscover(true);
}

exports.goToBlog = function (args) {
  navBar.goToBlog(true);
}

exports.goToProfile = function (args) {
  navBar.goToProfile(true);
}

exports.startBackground = function (args) {
  console.log("start background tapped");
  if (application.android) {
    var context = utils.ad.getApplicationContext();
    var component = new android.content.ComponentName(context, com.oa.location.BackgroundService26.class);
    var builder = new android.app.job.JobInfo.Builder(1, component);
    builder.setRequiredNetworkType(android.app.job.JobInfo.NETWORK_TYPE_ANY);
    //builder.setPeriodic(30);
    const jobScheduler = context.getSystemService(android.content.Context.JOB_SCHEDULER_SERVICE);
    const service = jobScheduler.schedule(builder.build());
    console.log(`Job Scheduled: ${jobScheduler.schedule(builder.build())}`);
    // var intent = new android.content.Intent(context, com.oa.location.BackgroundService26.class);
    // context.startService(intent);
  }
}

function createNotification() {
  if (application.android) {

    var randomCode = new java.util.Random().nextInt(); //to be used later to associate the 2 things
    var intent = new android.content.Intent(application.android.foregroundActivity, com.tns.NativeScriptActivity.class);
    var pendingIntent = android.app.PendingIntent.getActivity(application.android.foregroundActivity, randomCode, intent, android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK);
    var builder = new android.app.Notification.Builder(application.android.foregroundActivity, "some_id");
    builder.setDefaults(0);
    builder.setContentTitle("NativeScript Running");
    builder.setContentText("This notification cannot be cleared");
    builder.setContentIntent(pendingIntent);
    builder.setTicker("Persistent Notification");
    builder.setSmallIcon(application.android.nativeApp.getApplicationInfo().icon);
    builder.setPriority(android.app.Notification.PRIORITY_HIGH);
    builder.setOngoing(true); //this tells the OS that the notification is persistant


    var notificationManger = utils.ad.getApplicationContext().getSystemService(android.content.Context.NOTIFICATION_SERVICE);
    const channel_id = "fucking_work_id";
    const channel_name = "Fucking Channel Name";
    const description = "Fucking channel description";
    const importance = android.app.NotificationManager.IMPORTANCE_HIGH;
    const mChannel = new android.app.NotificationChannel(channel_id, channel_name, importance);
    mChannel.setDescription(description);
    notificationManger.createNotificationChannel(mChannel);

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


function onMapLoaded(args) {
  var page = args.object.page;
  // get the map container (not the actual map though). This is where the map is going to be 'spawned' in.
  var m = page.getViewById("myMap");
  map = new mapbox.MapboxView();
  map.id = "themap";

  map.on("mapReady", args => {

    map.setOnMapClickListener((point) => {
      map.removePolylines();
      selectedTrail = null;
      trailInfoPanel.visibility = "collapsed";
    });

    application.on(application.suspendEvent, args => {

      //createNotification();


      if (args.android) {
        if (map != null) {
          m.removeChildren();
          map.destroy();
        }
        console.log("suspended");
      }
    });

    map.setOnScrollListener((point) => {
      if (selectedTrail == null) {
        justScrolled = true;
        observ.set("justScrolled", "visible");
      }
    });


    console.log("map is ready");

    loadTrailHeads(location.latitude, location.longitude).then(() => {
      drawTrailHeads();
    }).catch(err => console.log(err));
    observ.set("isLoading", false);


  });

  // global.loadAllTrails().then(() => {
  //   global.loadAllMarkers().then(() => {
  geolocation
    .getCurrentLocation({
      desiredAccuracy: Accuracy.high
    })
    .then(loc => {
      // console.log(loc);
      location = loc;
      map.accessToken = "pk.eyJ1Ijoib3ZlcmxhbmRhbWVyaWNhIiwiYSI6ImNqdXljZTVtZzB3ZHozem1mMzdrZG5vbHUifQ.f7z1aKyX2hI71TtdiuK5yQ";
      //"pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";
      map.latitude = location.latitude;
      map.longitude = location.longitude;
      map.showUserLocation = true;
      map.hideCompass = "false";
      map.zoomLevel = 19;

      map.mapStyle = "mapbox://styles/overlandamerica/cjuydk6c61yym1hmg082g957s"; //"satellite_streets"; // satellite_streets | mapbox://styles/mapbox/outdoors-v11
      m.addChild(map);

      page.bindingContext = observ;
    });
  //   }).catch(err => console.log(err));
  // }).catch(err => console.log(err));

}
exports.onMapLoaded = onMapLoaded;

exports.onSearchAreaPressed = function (args) {
  map.getCenter().then(
    function (result) {
      justScrolled = false;
      map.removeMarkers();
      observ.set("justScrolled", "collapsed");
      observ.set("isLoading", true);
      console.log("map is at: " + JSON.stringify(result));
      loadTrailHeads(result.lat, result.lng).then(() => {
        drawTrailHeads();
        observ.set("isLoading", false);
      }).catch(err => console.log(err));
    },
    function (error) {
      console.log(error);
    }
  );

}


function drawTrailHeads() {
  trailHeadMarkers = []; // set it to null
  for (var i = 0; i < trailHeads.length; i++) {
    //console.log("adding marker: " + JSON.stringify(trailHeads[i]));
    var tempMarker = {
      id: trailHeads[i].id,
      lat: trailHeads[i].location.lat,
      lng: trailHeads[i].location.lng,
      iconPath: "./icons/trail_start_end.png",
      //title: "Trail head: " + trailHeads[i].name,
      //subtitle: "Trail is: " + global.trails[i].distance + "m",
      onTap: function (marker) {
        observ.set("justScrolled", "collapsed");
        map.setZoomLevel({
          level: 17,
          animated: true
        });
        map.setCenter({
          lat: marker.lat,
          lng: marker.lng,
          animated: true
        });
        firebase.getValue("/trails/" + marker.id).then(res => {
          //console.log(JSON.stringify(res.value));
          map.removePolylines();

          selectedTrail = res.value; // save the currently selected trail. 
          if (selectedTrail != null) {
            map.addPolyline({
              id: selectedTrail.id,
              color: "#FF8C28",
              points: selectedTrail.coordinates
            });
            trailInfoPanel.visibility = "visible";
            observ.set("selectedTrailName", selectedTrail.name);
          }

        });
      } // end onTap function
    } // end tempMarker def
    trailHeadMarkers = [...trailHeadMarkers, tempMarker];
  }
  //console.log("Loaded" + JSON.stringify(trailHeadMarkers));
  map.removeMarkers();
  map.addMarkers(trailHeadMarkers);
}

exports.onTrailInfoTapped = function (args) {
  var trailDetails = {
    name: selectedTrail.name,
    duration: selectedTrail.duration,
    distance: selectedTrail.distance,
    //elevations: selectedTrail.elevations,
    description: selectedTrail.description != null || selectedTrail.description != undefined ? selectedTrail.description : "No description added!",
    // we need to also get the trail notes
    rating: selectedTrail.rating != null || selectedTrail.rating != undefined ? selectedTrail.rating : 3,
    difficulty: selectedTrail.difficulty != null || selectedTrail.difficulty != undefined ? selectedTrail.difficulty : "3-4"
  }
  var navigationEntry = {
    moduleName: "traildetails/trail-details-page",
    context: trailDetails,
    animated: false
  }
  frameModule.topmost().navigate(navigationEntry);
  //console.log(JSON.stringify(trailDetails));
}

// load only the trail heads into memory that are with in 25 miles from the center of the map
function loadTrailHeads(curLat, curLng) {
  return new Promise((resolve, reject) => {
    firebase.getValue("/trails").then(result => {
      trailHeads = [];
      for (var i in result.value) {
        var curLoc = new geolocation.Location();
        curLoc.latitude = curLat;
        curLoc.longitude = curLng;
        var tempLoc = new geolocation.Location();
        tempLoc.latitude = result.value[i].coordinates[0].lat;
        tempLoc.longitude = result.value[i].coordinates[0].lng;
        var mtomi = 0.00062137;
        var dist = geolocation.distance(curLoc, tempLoc);
        dist *= mtomi; // convert meters to miles;
        if (dist <= 25.0) {
          //console.log(dist);
          trailHeads = [...trailHeads, {
            id: i,
            name: result.value[i].name,
            location: {
              lat: result.value[i].coordinates[0].lat,
              lng: result.value[i].coordinates[0].lng
            }
          }];
        }
      }
      resolve(trailHeads);
    }).catch(err => reject(err));
  })
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

    });
}
exports.recenterTap = recenterTap;


exports.goToRecording = function (args) {
  // clear up memory
  trailHeads = [];
  trailHeadMarkers = [];
  map.destroy();

  // navigate to the recording page. 
  frameModule.topmost().navigate({
    moduleName: "recordpage/record-page",
    context: {},
    animated: true
  });
};
var currentSuggestedItems;
var currentSelectedItem = {};
var justTapped = false;

exports.onSuggestedTapped = function (args) {
  justTapped = true;
  currentSelectedItem = currentSuggestedItems[args.index];
  var page = args.object.page;
  var sb = page.getViewById("thesearchbar");
  sb.text = currentSelectedItem.placename;
  var suggestionBox = page.getViewById("suggestionBox");
  suggestionBox.items = "";
}

exports.onSearchPressed = function (args) {
  var suggestionBox = args.object.page.getViewById("suggestionBox");
  suggestionBox.items = "";
  map.setZoomLevel({
    level: 12,
    animated: false
  });
  map.setCenter({
    lat: currentSelectedItem.location.lat,
    lng: currentSelectedItem.location.lng,
    animated: true
  });

}

exports.onSearchLoaded = function (args) {
  var sb = args.object;
  sb.on("textChange", (data) => {
    if (data.value.length <= 2) {
      var suggestionBox = sb.page.getViewById("suggestionBox");
      suggestionBox.items = "";
    } else if (justTapped) {
      justTapped = false;
    } else {
      fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/" + data.value + ".json?access_token=" + accessToken).then(result => {
        return result.json();
      }).then(data => {
        var searchItems = [];
        for (var i = 0; i < data.features.length; i++) {
          searchItems = [...searchItems, {
            //sb.page.bindingContext.searchItems.push({
            placename: data.features[i].place_name,
            location: {
              lat: data.features[i].center[1],
              lng: data.features[i].center[0]
            }
            // });
          }];
          console.log(data.features[i]);
        }
        var items = new ObservableArray();
        items.push(searchItems);
        currentSuggestedItems = searchItems;

        var suggestionBox = sb.page.getViewById("suggestionBox");
        suggestionBox.items = items;
        suggestionBox.refresh();

      });
    }
  });
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

// graveyard
/**
for (var i = 0; i < global.trails.length; i++) {
        var tMarker = {
          id: global.trails[i].id,
          lat: global.trails[i].coordinates[0].lat,
          lng: global.trails[i].coordinates[0].lng,
          iconPath: "./icons/trail_start_end.png",
          //title: "Trail head: " + global.trails[i].name,
          //subtitle: "Trail is: " + global.trails[i].distance + "m",
          onTap: function (marker) {
            map.removePolylines();
            var crds = global.trails.find(x => x.id == marker.id);
            selectedTrail = crds; // save the currently selected trail. 
            if (crds != null) {
              map.addPolyline({
                id: crds.id,
                color: "#FF8C28",
                points: crds.coordinates
              });
              trailInfoPanel.visibility = "visible";
              observ.set("selectedTrailName", selectedTrail.name);
              // var trailnotes = global.markers.filter(x => x.trail_id == selectedTrail.id);
              // var tempMarkers = [];
              // for (var marker in trailnotes) {
              //   var icon;
              //   if (marker.type == "obstical") {
              //     icon = "./icons/obstical_icon_marker.png";
              //   } else if (marker.type == "camp") {
              //     icon = "./icons/camp_trail_marker.png";
              //   } else if (marker.type == "poi") { 
              //     icon = "./icons/poi_trail_marker.png";
              //   }
              //   var temp = {
              //     id: marker.id,
              //     lat: marker.location.lat,
              //     lng: marker.location.lng, 
              //     iconPath: icon,
              //     title: marker.type,
              //     subtitle: JSON.stringify(marker.data), 
              //     onTap: function (marker) {
              //       //console.log(global.markers.find(x => x.id == marker.id));
              //     }
              //   }
              //   tempMarkers = [...tempMarkers, temp]
              // }

              // console.log(JSON.stringify(trailnotes));
              // var trailinforating = page.getViewById("trailinforating");
              // if (selectedTrail.rating == null)
              // {

              // }
              // for (var i = 0; i < selectedTrail.rating; i++)
              // {
              //   var img = new imageModule.Image();
              //   img.src = "res://star_filled";
              //   trailinforating.addChild(img);
              // }
              // observ.set("selectedTrailDifficulty", selectedTrail.difficulty);
            }
            map.setZoomLevel({
              level: 17,
              animated: true
            });
            map.setCenter({
              lat: marker.lat,
              lng: marker.lng,
              animated: true
            });

          }
        };
        trailHeads = [...trailHeads, tMarker];


      }
 var trailHeads = [];
      
      map.addMarkers(trailHeads);
      // var trailMarkers = [];
      // for (var i = 0; i < global.markers.length; i++) {
      //   var marker = global.markers[i];
      //   var icon;
      //   if (marker.type == "obstical") {
      //     icon = "./icons/obstical_icon_marker.png";
      //   } else if (marker.type == "camp") {
      //     icon = "./icons/camp_trail_marker.png";
      //   } else if (marker.type == "poi") {
      //     icon = "./icons/poi_trail_marker.png";
      //   }
      //   var temp = {
      //     id: marker.id,
      //     lat: marker.location.lat,
      //     lng: marker.location.lng,
      //     iconPath: icon,
      //     title: marker.type,
      //     subtitle: JSON.stringify(marker.data),
      //     onTap: function () {
      //       console.log(marker.data);
      //     }
      //   }
      //   trailMarkers = [...trailMarkers, temp];
      // }
      // map.addMarkers(trailMarkers);



 */