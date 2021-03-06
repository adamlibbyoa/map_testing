/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const firebase = require("nativescript-plugin-firebase");

var observ;
var userData = {
  gender: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  zip: ""
}

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

  firebase.createUser({
    email: email.text,
    password: pass.text,
    displayName: fname.text + " " + lname.text
  }).then(userRecord => {
    console.log("Successfully created a new user! " + userRecord.uid);
    firebase.push("/userdata/", {
      uid: userRecord.uid,
      email: email.text,
      first_name: fname.text,
      last_name: lname.text,
      gender: userData.gender,
      zip: zip.text
    }).then(res => {
      userData = null;
      frameModule.topmost().navigate({
        moduleName: "createaccount/vehicleinfo/vehicleinfo-page",
        clearHistory: true,
        context: {
          uid: userRecord.uid
        },
        backstackVisible: false
      });
    }).catch(err => console.log("error pushing data: " + err));
  }).catch(error => {
    console.log("Error creating account: " + error);
  });
}