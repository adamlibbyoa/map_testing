/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./trail-details-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const firebase = require("nativescript-plugin-firebase").crashlytics;
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const imageModule = require("tns-core-modules/ui/image");

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();
  var trail = args.context;

  console.log(JSON.stringify(args.context));
  // add all the stars to the panel
  var starRatings = page.getViewById("starRating");
  for (var i = 0; i < trail.rating; i++) {
    var img = new imageModule.Image();
    img.row = "0";
    img.col = i.toString();
    img.src = "res://star_filled";
    img.id = i.toString();
    starRatings.addChild(img);
  }
  observ.set("ratingNumber", trail.rating);
  observ.set("trailName", trail.name);
  observ.set("duration", trail.duration);
  observ.set("distance", trail.distance.toFixed(2));
  observ.set("description", trail.description);
  observ.set("difficulty", trail.difficulty);


  // hide the status bar if the device is an android
  if (application.android) {
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
  }

  // get rid of the ugly actionbar
  var topmost = frameModule.topmost();
  topmost.android.showActionBar = false;

  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.onVisualsLoaded = function (args) {
  var collectionID = 827743;
  var w = 140;
  var h = 140;
  var numImages = 15;
  var grid = args.object;
  for (var i = 0; i < numImages; i++) {
    var randIndex = Math.floor(Math.random() * 692);
    // fetch("https://source.unsplash.com/collection/" + collectionID + "/" + w + "x" + h + "/?sig=" + randIndex)
    // fetch("http://lorempixel.com/140/140")
    // .then((response) => {
    var img = new imageModule.Image();
    // console.log(JSON.stringify(response));
    img.src = "https://loremflickr.com/140/140/outdoors?random=" + i;
    img.width = w;
    img.height = h;
    img.row = Math.floor(i / 3);
    img.col = i % 3;
    grid.addChild(img);
    // }).catch(err => console.log(err));
  }
}

exports.onBackPressed = function (args) {
  // firebase.sendCrashLog(new java.lang.Exception("test exception"));
  frameModule.topmost().navigate("home/home-page");
}

exports.goToMap = function (args) {
  var navigationEntry = {
    moduleName: "home/home-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}

exports.goToFeed = function (args) {
  var navigationEntry = {
    moduleName: "feedpage/feed-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}


exports.goToDiscover = function (args) {
  var navigationEntry = {
    moduleName: "discoverpage/discover-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}

exports.goToBlog = function (args) {
  var navigationEntry = {
    moduleName: "blogpage/blog-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}

exports.goToProfile = function (args) {
  var navigationEntry = {
    moduleName: "profilepage/profile-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}