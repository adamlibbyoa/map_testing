/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const firebase = require("nativescript-plugin-firebase");
const appSettings = require("tns-core-modules/application-settings");

var observ;



function onNavigatingTo(args) {
  var page = args.object;
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

exports.onLoaded = function (args) {
  var userID = appSettings.getString("userID", "");
  var navigationEntry = {
    moduleName: "",
    animated: true,
    transistion: {
      name: "fade",
      duration: 500
    }
  };

  if (userID.length > 0) {
    navigationEntry.moduleName = "home/home-page";
  } else {
    navigationEntry.moduleName = "login/login-page";
  }

  frameModule.topmost().navigate(navigationEntry);
}