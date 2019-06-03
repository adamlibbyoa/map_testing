/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/
const application = require("tns-core-modules/application");
var frameModule = require("ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const firebase = require("nativescript-plugin-firebase");
const dropdown = require("nativescript-drop-down");

var observ;

var v = [{
    make: "Jeep",
    models: [{
        model_name: "name"
      },
      {
        model_name: "name"
      }
    ]
  },
  {
    make: "Chevrolet",
    models: [{
        model_name: "name"
      },
      {
        model_name: "name"
      }
    ]
  }
]


var makes = [
  "Jeep",
  "Ford",
  "Chevrolet",
  "Toyota",
  "Nissan",
  "BMW",
  "Land Rover",

];

var jeepModels = [
  "Wrangler",
  "Limited",
  "Wranger"
];
var fordModels = [
  "Truck",
  "Bigger Truck",
  "Meh"
];
var chevyModels = [
  "Camero",
  "Some truck",
  "Another Truck",
  "Bigger Truck"
]
var years = []

var dbmakes = [];
var dbmodels = [];

var vehicle = {
  make: "",
  model: "",
  year: "",
  liftSize: "",
  tireSize: ""
}
var uid;

function onNavigatingTo(args) {
  const page = args.object;
  const context = args.context;
  if (context != null || context != undefined)
    uid = context.uid;
  else {
    uid = "z0chJXpIPERA1CzM154lOV2usI22"; // this is the testing account's uid
  }

  observ = new Observable();
  observ.set("isLoading", true);

  for (var i = 2019; i > 1900; i--) {
    years.push(i.toString());
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

  firebase.getValue("/vehiclelist/-LgPi5NaAey9wS7GUdvT").then(result => {
    for (var i in result.value) {
      dbmakes.push(result.value[i].make);
    }
    observ.set("isLoading", false);
    observ.set("makes", dbmakes);
  });

  observ.set("years", years);

  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.onMakeChanged = function (args) {
  observ.set("isLoading", true);
  vehicle.make = dbmakes[args.newIndex];

  firebase.getValue("/vehiclelist/-LgPi5NaAey9wS7GUdvT/" + args.newIndex).then(result => {
    // console.log(JSON.stringify(result.value));
    dbmodels = result.value.models.map(x => {
      return x.model_name;
    });
    observ.set("isLoading", false);
    observ.set("models", dbmodels);
  });

  // var temp = makes[args.newIndex];
  // switch (temp) {
  //   case "Jeep":
  //     observ.set("models", jeepModels);
  //     observ.set("modelSelectedIndex", 0);
  //     break;
  //   case "Ford":
  //     observ.set("models", fordModels);
  //     observ.set("modelSelectedIndex", 0);
  //     break;
  //   case "Chevy":
  //     observ.set("models", chevyModels);
  //     observ.set("modelSelectedIndex", 0);
  //     break;
  // }

  // vehicle.year = years[0];
}

exports.onModelChanged = function (args) {
  var temp = observ.get("models");
  vehicle.model = temp[args.newIndex];
}

exports.onYearChanged = function (args) {
  vehicle.year = years[args.newIndex];
}

// white - rgba(255, 255, 255, 0.5) 
// orange - rgba(255, 140, 40, 0.5)
exports.onLiftSelected = function (args) {
  var page = args.object.page;
  var none = page.getViewById("liftnone");
  var small = page.getViewById("liftsmall");
  var medium = page.getViewById("liftmedium");
  var large = page.getViewById("liftlarge");
  var orange = "rgba(253, 162, 83, 0.651)";
  var white = "rgba(255, 255, 255, 0.5)";


  switch (args.object.id) {
    case "liftnone":
      none.backgroundColor = orange;
      small.backgroundColor = white;
      medium.backgroundColor = white;
      large.backgroundColor = white;
      vehicle.liftSize = "0";
      break;
    case "liftsmall":
      none.backgroundColor = white;
      small.backgroundColor = orange;
      medium.backgroundColor = white;
      large.backgroundColor = white;
      vehicle.liftSize = "1-2";
      break;
    case "liftmedium":
      none.backgroundColor = white;
      small.backgroundColor = white;
      medium.backgroundColor = orange;
      large.backgroundColor = white;
      vehicle.liftSize = "3-4";
      break;
    case "liftlarge":
      none.backgroundColor = white;
      small.backgroundColor = white;
      medium.backgroundColor = white;
      large.backgroundColor = orange;
      vehicle.liftSize = "4+";
      break;
  }
}

exports.onTireSelected = function (args) {
  var page = args.object.page;
  var small = page.getViewById("tiresmall");
  var medium = page.getViewById("tiremedium");
  var big = page.getViewById("tirebig");
  var biggest = page.getViewById("tirebiggest");
  var orange = "rgba(253, 162, 83, 0.651)";
  var white = "rgba(255, 255, 255, 0.5)";


  switch (args.object.id) {
    case "tiresmall":
      small.backgroundColor = orange;
      medium.backgroundColor = white;
      big.backgroundColor = white;
      biggest.backgroundColor = white;
      vehicle.tireSize = "29-33";
      break;
    case "tiremedium":
      small.backgroundColor = white;
      medium.backgroundColor = orange;
      big.backgroundColor = white;
      biggest.backgroundColor = white;
      vehicle.tireSize = "34-35";
      break;
    case "tirebig":
      small.backgroundColor = white;
      medium.backgroundColor = white;
      big.backgroundColor = orange;
      biggest.backgroundColor = white;
      vehicle.tireSize = "36-38";
      break;
    case "tirebiggest":
      small.backgroundColor = white;
      medium.backgroundColor = white;
      big.backgroundColor = white;
      biggest.backgroundColor = orange;
      vehicle.tireSize = "38+";
      break;
  }
}

exports.onNextPressed = function (args) {
  vehicle.uid = uid;
  firebase.push("/vehicles", vehicle).then(res => {
    console.log("Success!");
    vehicle = null;
    frameModule.topmost().navigate("./login/login-page");
  }).catch(err => console.log("Error pushing vehicle: " + err));
}