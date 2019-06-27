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
const connectionModule = require("tns-core-modules/connectivity");
const filesystemModule = require("tns-core-modules/file-system");

var observ;



function onNavigatingTo(args) {
  var page = args.object;
  // hide the status bar if the device is an android
  if (application.android) {
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    // get rid of the ugly actionbar
    var topmost = frameModule.topmost();
    
      topmost.android.showActionBar = false;
    
  }



  // if (appSettings.getBoolean("isFirst", true))
  // {
  //   observ.set("message", "Loading")
  // }


  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.onLoaded = function (args) {

  var connectionStatus = connectionModule.getConnectionType();
  switch (connectionStatus) {
    case connectionModule.connectionType.none:
      // Denotes no Internet connection.
      console.log("No connection");
      offline();
      break;
    case connectionModule.connectionType.wifi:
      // Denotes a WiFi connection.
      console.log("WiFi connection");
      online();
      break;
    case connectionModule.connectionType.mobile:
      // Denotes a mobile connection, i.e. cellular network or WAN.
      console.log("Mobile connection");
      online();
      break;
    case connectionModule.connectionType.ethernet:
      // Denotes a ethernet connection.
      console.log("Ethernet connection");
      online();
      break;
    case connectionModule.connectionType.bluetooth:
      // Denotes a bluetooth connection.
      console.log("Bluetooth connection");
      offline();
      break;
    default:
      break;
  }


}

function online() {
  // for now just calling offline stuff
  offline();
}

function offline() {
  var userID = appSettings.getString("userID", "");
  var navigationEntry = {
    moduleName: "",
    animated: true,
    clearHistory: true,
    transistion: {
      name: "fade",
      duration: 500
    }
  };

  if (userID.length > 0) {
    const documents = filesystemModule.knownFolders.documents();
    const folder = documents.getFolder("userdata");
    const file = folder.getFile("data.txt");
    file.readText().then(
      function (result) {
        if (result.length <= 0) {
          console.log("No data has been saved");
          firebase.getValue("/userdata").then(result => {
            for (var i in result.value) {
              var user = result.value[i];
              if (user.uid == userID) {
                var data = {
                  id: i,
                  uid: user.uid,
                  zip: user.zip,
                  gender: user.gender,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email
                };
                console.log("found user data");
                file.writeTextSync(JSON.stringify(data), (err) => {
                  console.log("error writing data");
                });
                break;
              }
            }
            navigationEntry.moduleName = "home/home-page";
            frameModule.topmost().navigate(navigationEntry);

          }).catch(err => console.log(err));
        } else {
          console.log(result);
          navigationEntry.moduleName = "home/home-page";
          frameModule.topmost().navigate(navigationEntry);
        }

      },
      function (err) {
        console.log(err);
      });
  } else {
    navigationEntry.moduleName = "login/login-page";
    frameModule.topmost().navigate(navigationEntry);
  }

}