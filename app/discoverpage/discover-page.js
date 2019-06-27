/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./discover-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const navBar = require("../navbar");


function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();

  if (application.android) {
    // hide the status bar if the device is an android
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);

    // get rid of the ugly actionbar
    var topmost = frameModule.topmost();
    topmost.android.showActionBar = false;
  }

  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;
exports.goToMap = function (args) {
  navBar.goToMap(false);
}

exports.goToFeed = function (args) {
  navBar.goToFeed(false);
}

exports.goToBlog = function (args) {
  navBar.goToBlog(false);
}

exports.goToProfile = function (args) {
  navBar.goToProfile(false);
}