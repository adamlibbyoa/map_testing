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

firebase.init({
    persist: true
}).then(
    function () {
        console.log("firebase.init done");
    },
    function (error) {
        console.log("firebase.init error: " + error);
    }
);

/** trail structure
{

    id: 0,
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
    distance: 0
} 

 */


global.trails = [];

//36.6707
//-95.82672
global.addTrail = (name, coords, locations) => {

    var dist = 0;
    for (var i = 0; i < locations.length - 1; i += 2) {
        dist += geolocation.distance(locations[i], locations[i + 1]);
        console.log(dist);

    }
    dist *= mtomi; // convert to mile

    trails = [...trails, {
        id: curID,
        name: name,
        trailColor: 0xffff0000,
        coordinates: coords,
        distance: dist
    }];

    //global.saveTrails();
    curID++;
}

global.getAllTrails = () => {
    return trails;
}

global.postTrail = (name, coords, distance) => {
    firebase.push('/trails', {
        name: name,
        trailColor: 0xffff0000,
        coordinates: coords,
        distance: distance
    }).then((result) => {
        console.log("Created key: " + result.key);
    });
}


global.saveTrails = () => {
    file.writeText(JSON.stringify(trails)).then((result) => {
        file.readText().then((res) => {
            console.log("we wrote: " + res);
        });
    }).catch(err => console.log(err));

}

global.loadTrails = () => {



    firebase.getValue('/trails').then((result) => {
        //console.log(JSON.stringify(result.value));
        for (var i in result.value) {
            var temp = {
                id: i,
                coordinates: result.value[i].coordinates,
                name: result.value[i].name,
                trailColor: result.value[i].trailColor,
                distance: result.value[i].distance
            }
            trails = [...trails, temp];
        }
        console.log(JSON.stringify(trails));


    }).catch(error => console.log("error: " + error));

    // old code, this is saving to a file. dont delete just yet
    // file.readText().then((res) => {
    //     trails = JSON.parse(res);
    //     resolve(trails);
    // }).catch(err => {
    //     console.log("error reading file");
    //     reject("Failed to read file");
    // });
}


application.run({
    moduleName: "app-root"
});

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/