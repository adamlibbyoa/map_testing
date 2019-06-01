/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./login-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;


const accessToken =
  "pk.eyJ1IjoiYWRhbWxpYmJ5b2EiLCJhIjoiY2p1eGg3bG05MG40bzRjandsNTJnZHY3aiJ9.NkE4Wdj4dy3r_w18obRv8g";

var recordBtn;

var observ;
var map;

var deviceRotation = {
  x: 0, // roll
  y: 0, // pitch
  z: 0 // yaw  (we don't care about yaw)
};

var location;
var waypoint;
// 35.610295
//-97.4613617


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
  topmost.android.showActionBar = false;

  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.emailLoginPressed = function (args) {
  var page = args.object.page;
  var email = page.getViewById("emailField");
  var pass = page.getViewById("passField");
  console.log("E: " + email.text + ", P: " + pass.text);
}