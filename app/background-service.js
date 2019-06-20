const geolocation = require("nativescript-geolocation");
const Accuracy = require("tns-core-modules/ui/enums").Accuracy;
const application = require("tns-core-modules/application");
const device = require("tns-core-modules/platform");

var watchID;
var locations = [];

function clearWatch() {
    if (watchID) {
        geolocation.clearWatch(watchID);
        watchID = null;
    }
}

function startWatch() {
    console.log("starting watch??");
    clearWatch();
    watchID = geolocation.watchLocation(
        function (loc) {
            console.log("repeat?");
            if (loc) {
                locations = [...locations, loc];
                console.log("Background location: " + loc.latitude + ", " + loc.longitude);
            }
        },
        function (err) {
            console.log(err);
        }, {
            desiredAccuracy: Accuracy.high,
            updateDistance: 5,
            updateTime: 1000
        }
    );
}

application.on(application.exitEvent, clearWatch);

if (application.android) {
    if (device.device.sdkVersion < "26") {
        android.app.Service.extend("com.oa.location.BackgroundService", {
            onStartCommand: function (intent, flags, startId) {
                this.super.onStartCommand(intent, flags, startId);
                return android.app.Service.START_STICKY;
            },
            onCreate: function () {
                startWatch();
            },
            onBind: function (intent) {
                console.log("on Bind Service");
            },
            onUnbind: function (intent) {
                console.log("on Unbind Service");
            },
            onDestroy: function () {
                console.log("on destroy service");
                clearWatch();
            }
        });
    } else {
        android.app.job.JobService.extend("com.oa.location.BackgroundService26", {
            onStartJob() {
                console.log("service onStartJob");
                startWatch();
                return true;
            },
            onStopJob(jobParams) {
                console.log("service onStopJob");
                console.dir(locations);
                global.backgroundLocations = locations;
                this.jobFinished(jobParams, false);
                clearWatch();
                return false;
            },
        });
    }

}