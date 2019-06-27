/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./blank-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;


function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();

  // hide the status bar if the device is an android
  if (application.android) {
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
  }

  // get rid of the ugly actionbar
  var topmost = frameModule.topmost();
  if (application.ios)
  {
    topmost.ios.showActionBar = false;
  } else 
  {
    topmost.android.showActionBar = false;
  }
  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;



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