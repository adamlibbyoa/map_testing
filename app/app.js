/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const application = require("tns-core-modules/application");
const filesystemModule = require("tns-core-modules/file-system");
const geolocation = require("nativescript-geolocation");
const documents = filesystemModule.knownFolders.documents();
const fname = "gpscoords";
const folder = documents.getFolder("GPSTESTING" || "GPStesting");
const file = folder.getFile("data.txt" || "gpsdata.txt");
var mtomi = 0.00062137;
var curID = 0;


var firebase = require("nativescript-plugin-firebase");

firebase
  .init({
    //    persist: true
  })
  .then(
    function () {
      console.log("firebase.init done");

    },
    function (error) {
      console.log("firebase.init error: " + error);
    }
  );

/** trail structure
{

    name: "",
    trailColor: 0xffff0000,
    coordinates: [{
            lat: 0,
            lng: 0
        },
        {
            lat: 1,
            lng: 2
        }
    ],
    distance: 0,
    duration: hh:mm:ss
} 


***** Marker Structure ****
{
  trail_id: akj234kv9, // generated by firebase
  type: camp, // obsticle | poi 
  locaton: {
    lat: 0,
    lng: 0
  },
  rating: 0, // 0 through 5
  price: free, // paid | unknown
  info: ""
}



 */

global.trails = [];
global.trailHeads = [];

global.currentTrail = {};

global.currentTrailMarkers = [];

global.markers = [];

global.AddMarker = (type, location, data) => {
  var m = {
    type: type,
    location: {
      lat: location.latitude,
      lng: location.longitude
    },
    data: data
  };
  global.currentTrailMarkers.push(m);
  console.log(JSON.stringify(global.currentTrailMarkers));
  //currentTrailMarkers = [...currentTrailMarkers, m];
};

global.addMarkerData = (type, location, rating, price, info) => {
  var m = {
    type: type,
    location: {
      lat: location.latitude,
      lng: location.longitude
    },
    data: {
      rating: rating,
      price: price,
      info: info
    },
    trail_id: ""
  };
  currentTrailMarkers = [...currentTrailMarkers, m];
};

//36.6707
//-95.82672
global.addTrail = (name, coords, locations) => {
  var dist = 0;
  for (var i = 0; i < locations.length - 1; i += 2) {
    dist += geolocation.distance(locations[i], locations[i + 1]);
    console.log(dist);
  }
  dist *= mtomi; // convert to mile

  trails = [
    ...trails,
    {
      id: curID,
      name: name,
      trailColor: 0xffff0000,
      coordinates: coords,
      distance: dist
    }
  ];

  //global.saveTrails();
  curID++;
};

global.getAllTrails = () => {
  return trails;
};

global.setCurrentTrailData = (coords, distance, time, avgSpeed, elevations) => {
  global.currentTrail = {
    name: "",
    trailColor: 0xffff0000,
    coordinates: coords,
    distance: distance,
    duration: time,
    averageSpeed: avgSpeed,
    elevations: elevations
  };
};

global.setCurrentTrailName = name => {
  global.currentTrail.name = name;
};


global.postCurrentTrail = () => {
  firebase.push("/trails", global.currentTrail).then(result => {
    console.log("Created key: " + result.key);
    if (global.currentTrailMarkers.length > 0) {
      // assign all the markers' trail id with the one that was generated above.
      for (var i = 0; i < global.currentTrailMarkers.length; i++) {
        global.currentTrailMarkers[i].trail_id = result.key;
      }
      pushMarkers(0); // start with index 0
    }
  });
};

// var type = {
//   CAMP: 0,
//   OBSTICLE: 1,
//   POI: 2
// }

// type.CAMP

function pushMarkers(curIndex) {
  if (curIndex >= global.currentTrailMarkers.length) {
    return;
  }

  firebase
    .push("/markers", global.currentTrailMarkers[curIndex])
    .then(result => {
      console.log("pushed marker: " + JSON.stringify(global.currentTrailMarkers[curIndex]) + ", with key: " + result.key);
      var i = curIndex + 1;

      pushMarkers(i);
    })
    .catch(err => {
      console.log("Failed to push " + curIndex + " marker. Error: " + err);
    });
}

global.loadTrailHeads = (curLat, curLng) => {
  return new Promise((resolve, reject) => {
    firebase
      .getValue("/trails")
      .then(result => {
        //console.log(JSON.stringify(result.value));
        for (var i in result.value) {
          var temp = {
            id: i,
            name: result.value[i].name,
            trailColor: result.value[i].trailColor,
            distance: result.value[i].distance
          };
          global.trailHeads = [...global.trailHeads, temp];
        }
        resolve(global.trails)
        //console.log(JSON.stringify(trails));
      })
      .catch(error => reject(error));
  });
}

global.loadAllTrails = () => {
  return new Promise((resolve, reject) => {
    firebase
      .getValue("/trails")
      .then(result => {
        //console.log(JSON.stringify(result.value));
        for (var i in result.value) {
          var temp = {
            id: i,
            coordinates: result.value[i].coordinates,
            name: result.value[i].name,
            trailColor: result.value[i].trailColor,
            distance: result.value[i].distance
          };
          global.trails = [...global.trails, temp];
        }
        resolve(global.trails)
        //console.log(JSON.stringify(trails));
      })
      .catch(error => reject(error));
  });
}

global.loadAllMarkers = () => {
  return new Promise((resolve, reject) => {
    firebase
      .getValue("/markers")
      .then(result => {
        global.markers = []; // reset the array
        for (var i in result.value) {
          var temp = {
            id: i,
            location: result.value[i].location,
            trail_id: result.value[i].trail_id,
            type: result.value[i].type,
            data: result.value[i].data
          };
          global.markers = [...global.markers, temp];
        }
        resolve(global.markers);
      })
      .catch(err => reject(err));
  });
}

application.on(application.uncaughtErrorEvent, args => {
  console.log("Error: " + args.error);
});

application.run({
  moduleName: "app-root"
});

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/




/** code graveyard
 
// global.postTrail = (name, coords, distance) => {
//   firebase
//     .push("/trails", {
//       name: name,
//       trailColor: 0xffff0000,
//       coordinates: coords,
//       distance: distance
//     })
//     .then(result => {
//       console.log("Created key: " + result.key);
//     });
// };

// global.saveTrails = () => {
//   file
//     .writeText(JSON.stringify(trails))
//     .then(result => {
//       file.readText().then(res => {
//         console.log("we wrote: " + res);
//       });
//     })
//     .catch(err => console.log(err));
// };




global.loadTrails = () => {
  firebase
    .getValue("/trails")
    .then(result => {
      //console.log(JSON.stringify(result.value));
      for (var i in result.value) {
        var temp = {
          id: i,
          coordinates: result.value[i].coordinates,
          name: result.value[i].name,
          trailColor: result.value[i].trailColor,
          distance: result.value[i].distance
        };
        global.trails = [...global.trails, temp];
      }
      //console.log(JSON.stringify(trails));
    })
    .catch(error => console.log("error: " + error));

  firebase
    .getValue("/markers")
    .then(result => {
      global.markers = []; // reset the array
      for (var i in result.value) {
        var temp = {
          id: i,
          location: result.value[i].location,
          trail_id: result.value[i].trail_id,
          type: result.value[i].type,
          data: result.value[i].data
        };
        global.markers = [...global.markers, temp];
      }
    })
    .catch(err => console.log("error fetching markers: " + err));

  // old code, this is saving to a file. dont delete just yet
  // file.readText().then((res) => {
  //     trails = JSON.parse(res);
  //     resolve(trails);
  // }).catch(err => {
  //     console.log("error reading file");
  //     reject("Failed to read file");
  // });
};

// application.on(application.suspendEvent, args => {
//   if (args.android) {
//     console.log("suspended");
//   }
// });

// application.on(application.resumeEvent, args => {
//   if (args.android) {
//     console.log("resumed");
//   }
// });










 */