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
  observ.set("errorMsg", "");
  observ.set("isLoading", false);
  if (appSettings.hasKey("userInfo")) {
    var user = JSON.parse(appSettings.getString("userInfo"));
    page.getViewById("emailField").text = user.email;
    page.getViewById("passField").text = user.password;

    // dont delete yet. This is "auto logging in"
    // observ.set("isLoading", true);
    // firebase.login({
    //   type: firebase.LoginType.PASSWORD,
    //   passwordOptions: {
    //     email: user.email,
    //     password: user.password
    //   }
    // }).then(result => {
    //   observ.set("isLoading", false);
    //   frameModule.topmost().navigate("./home/home-page");
    // }).catch(error => {
    //   observ.set("isLoading", false);
    //   observ.set("errorMsg", "Failed to auto-signin");
    // });
  }

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
  // console.log("E: " + email.text + ", P: " + pass.text);
  observ.set("isLoading", true);
  firebase.login({
    type: firebase.LoginType.PASSWORD,
    passwordOptions: {
      email: email.text,
      password: pass.text
    }
  }).then(result => {
    observ.set("isLoading", false);

    appSettings.setString("userInfo", JSON.stringify({
      email: email.text,
      password: pass.text
    }));
    frameModule.topmost().navigate("home/home-page");
  }).catch(error => {
    observ.set("isLoading", false);
    observ.set("errorMsg", "Invalid Email or Password");
  });
}

exports.signUpPressed = function (args) {
  frameModule.topmost().navigate("createaccount/userinfo/userinfo-page");
}