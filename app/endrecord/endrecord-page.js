/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./endrecord-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;

var difficulty = 0;
var oneSelected = true;
var oneOff = "res://off_12";
var oneOn = "res://on_12";
var threeSelected = false;
var threeOff = "res://off_35";
var threeOn = "res://on_35";
var sixSelected = false;
var sixOff = "res://off_68";
var sixOn = "res://on_68";
var nineSelected = false;
var nineOff = "res://off_910";
var nineOn = "res://on_910";
var rating = 0;
var stars = [];

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


/**
 * community aspect for trailing. Like a buddy system. You can record trails with friends
 * and tag them before you record. Basically create a small community and sharing ability for 
 * trail recordings.  
 */


function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();


  observ.set("oneSelected", oneSelected ? oneOn : oneOff);
  observ.set("threeSelected", threeSelected ? threeOn : threeOff);
  observ.set("sixSelected", sixSelected ? sixOn : sixOff);
  observ.set("nineSelected", nineSelected ? nineOn : nineOff);

  observ.set("distance", global.currentTrail.distance);
  observ.set("duration", global.currentTrail.duration);

  stars[0] = page.getViewById("1");
  stars[1] = page.getViewById("2");
  stars[2] = page.getViewById("3");
  stars[3] = page.getViewById("4");
  stars[4] = page.getViewById("5");

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

exports.saveName = function (args) {
  var tf = args.object;
  global.setCurrentTrailName(tf.text);
}

exports.discardTrail = function (args) {
  dialogs.confirm("Are you sure you want to discard the recorded trail?").then(
    res => {
      if (res) {
        global.currentTrail = {};
        frameModule.topmost().navigate("home/home-page");
      }
    }
  )
}

function onStarClicked(args) {
  var img = args.object;


  var id = img.id;

  for (var i = 0; i < id; i++) {
    stars[i].src = "res://star_filled";
  }
  for (var i = id; i < stars.length; i++) {
    stars[i].src = "res://star_grey";
  }

  console.log(id);
  rating = id;
}
exports.onStarClicked = onStarClicked;

exports.goToHome = function (args) {
  var page = args.object.page;
  var name = page.getViewById("trailname");
  if (global.currentTrail.name == "") {
    global.setCurrentTrailName(name.text);
  }
  global.currentTrail.description = page.getViewById("traildesc").text;
  global.currentTrail.rating = rating;
  var str = "";
  switch (difficulty) {
    case 1:
      str = "1-2";
      break;
    case 3:
      str = "3-5";
      break;
    case 6:
      str = "6-8";
      break;
    case 9:
      str = "9-10";
      break;
    default:
      str = "3-5";
      break;
  }
  global.currentTrail.difficulty = str;
  global.postCurrentTrail();
  frameModule.topmost().navigate("home/home-page");
}


function onDifficultySelected(args) {
  var selectedID = args.object.id;

  switch (selectedID) {
    case "12":
      oneSelected = true;
      threeSelected = false;
      sixSelected = false;
      nineSelected = false;
      difficulty = 1;
      break;
    case "35":
      oneSelected = false;
      threeSelected = true;
      sixSelected = false;
      nineSelected = false;
      difficulty = 3;
      break;
    case "68":
      oneSelected = false;
      threeSelected = false;
      sixSelected = true;
      nineSelected = false;
      difficulty = 6;
      break;
    case "910":
      oneSelected = false;
      threeSelected = false;
      sixSelected = false;
      nineSelected = true;
      difficulty = 9;
      break;
  }
  observ.set("oneSelected", oneSelected ? oneOn : oneOff);
  observ.set("threeSelected", threeSelected ? threeOn : threeOff);
  observ.set("sixSelected", sixSelected ? sixOn : sixOff);
  observ.set("nineSelected", nineSelected ? nineOn : nineOff);

}
exports.onDifficultySelected = onDifficultySelected;