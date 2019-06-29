/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./garage-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const firebase = require("nativescript-plugin-firebase");
const navBar = require("../navbar");
let builder = require("tns-core-modules/ui/builder");




var curUid;
var vehicles = [];

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();
  observ.set("isLoading", true);


  // hide the status bar if the device is an android
  if (application.android) {
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);

    // we are showing the action bar on this page, this will eventually be default
    var topmost = frameModule.topmost();
    topmost.android.showActionBar = true;
  }

  var obsArr = new ObservableArray();

  firebase.getCurrentUser().then(user => {
    var uid = user.uid;
    curUid = uid;
    firebase.query((result) => {
      if (!result.error) {
        vehicles = [];
        var scrollView = page.getViewById("mainview");
        for (var i in result.value) {
          // console.log(i + ": " + JSON.stringify(result.value[i]));
          var v = result.value[i];
          v.vid = i;
          vehicles.push(v);
          obsArr.push(result.value[i]);
          let vehicleCard = builder.load({
            path: "~/components/garagecard",
            name: "garagecard",
            page: "garage-page" // use this for the css file
          });

          vehicleCard.vehicle = v;
          scrollView.addChild(vehicleCard);
        }
        //page.getViewById("infolist").items = obsArr;
        //page.getViewById("myvehiclelist").items = obsArr;
        // get rid of the ugly actionbar
        observ.set("isLoading", false);

      }
    }, "/vehicles", {
      singleEvent: true,
      orderBy: {
        type: firebase.QueryOrderByType.CHILD,
        value: "uid"
      },
      range: {
        type: firebase.QueryRangeType.EQUAL_TO,
        value: uid
      }
    });
  }).catch(err => console.log(err));


  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.goToAddVehicle = function (args) {
  var navigationEntry = {
    moduleName: "addvehicle/addvehicle-page",
    context: {
      uid: curUid
    },
    animated: true,
    transistion: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }
  frameModule.topmost().navigate(navigationEntry);
}

exports.goToMap = function (args) {
  navBar.goToMap(false);
}

exports.goToFeed = function (args) {
  navBar.goToFeed(false);
}

exports.goToDiscover = function (args) {
  navBar.goToDiscover(false);
}

exports.goToBlog = function (args) {
  navBar.goToBlog(false);
}

exports.goToProfile = function (args) {
  navBar.goToProfile(false);
}