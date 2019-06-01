/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/
const application = require("tns-core-modules/application");
var frameModule = require("ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;


var observ;

var makes = [
  "Jeep",
  "Ford",
  "Chevy"
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


var vehicle = {
  make: "",
  model: "",
  year: ""
}

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();

  for (var i = 2019; i > 1950; i--) {
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

  observ.set("makes", makes);
  observ.set("years", years);

  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.genderSelected = function (args) {
  var btn = args.object;
  var page = btn.page;
  var femaleBtn = page.getViewById("female");
  var maleBtn = page.getViewById("male");

  switch (btn.id) {
    case "male":
      userData.gender = "Male";
      maleBtn.backgroundColor = "#4B87A8";
      femaleBtn.backgroundColor = "";
      break;
    case "female":
      userData.gender = "Female";
      maleBtn.backgroundColor = "";
      femaleBtn.backgroundColor = "#E56DC5";
      break;
  }
}

exports.onNextPressed = function (args) {
  var page = args.object.page;
  var fname = page.getViewById("fnameField");
  var lname = page.getViewById("lnameField");
  var email = page.getViewById("emailField");
  var pass = page.getViewById("passField");
  var cpass = page.getViewById("confirmPassField");
  var zip = page.getViewById("zipField");

  userData.first_name = fname.text;
  userData.last_name = lname.text;
  userData.email = email.text;
  userData.password = pass.text;
  userData.zip = zip.text;
  console.log(JSON.stringify(userData));
  if (cpass.text != pass.text) {
    console.log("Passwords don't match");
  } else {
    console.log("Passwords match!");
  }
}