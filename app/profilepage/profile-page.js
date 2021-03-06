/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./profile-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
var mPicker = require("nativescript-mediafilepicker");
const firebase = require("nativescript-plugin-firebase");
const connectionModule = require("tns-core-modules/connectivity");
const fileSystemModule = require("tns-core-modules/file-system");
const imageSourceModule = require("tns-core-modules/image-source");
const navBar = require("../navbar");
var uid;

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();


  // // get username
  // const documents = fileSystemModule.knownFolders.documents();
  // const folder = documents.getFolder("userdata");
  // const file = folder.getFile("data.txt");
  // file.readText().then(text => {
  //   var data = JSON.parse(text);
  //   console.log(JSON.stringify(data));
  //   observ.set("username", data.first_name + " " + data.last_name);
  // }, err => console.log(err));

  firebase.getCurrentUser().then(res => {
    uid = res.uid;
    loadImage();
    loadUsername();
    // console.log(res.photoURL);
    // if (!res.photoURL) {
    //   observ.set("profileImageSrc", "res://oa_logo_createaccount"); // default image
    // } else {
    //   observ.set("profileImageSrc", res.photoURL);
    //   console.log("loaded from online");
    // }
  }, (err) => {
    console.log(err);
  });



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


function loadUsername() {
  // get username
  const documents = fileSystemModule.knownFolders.documents();
  const folder = documents.getFolder("userdata");
  const file = folder.getFile("data.txt");
  file.readText().then(text => {
    if (text.length <= 0) {
      console.log("no user data found, fetching online data");

      firebase.query((userData) => {
        for (var i in userData.value) {
          console.log(i);
          var user = userData.value[i];
          var data = {
            id: i,
            uid: user.uid,
            zip: user.zip,
            gender: user.gender,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username ? user.username : user.first_name + "" + user.last_name,
            email: user.email
          };
          observ.set("username", data.first_name + "" + data.last_name);
          console.log("found user data");
          file.writeTextSync(JSON.stringify(data), (err) => {
            console.log("error writing data");
          });

        }

      }, "/userdata", {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.CHILD,
          value: "uid"
        },
        range: {
          type: firebase.QueryRangeType.EQUAL_TO,
          value: uid
        }
      }).catch(err => console.log("ERror fetching user data (line 49)"));
    } else {

      var data = JSON.parse(text);
      console.log(JSON.stringify(data));
      observ.set("username", data.username);
    }


  }, err => console.log(err));
}


function loadImage() {
  // get the documents folder
  const folder = fileSystemModule.knownFolders.documents();
  // get the path to the profile image
  const path = fileSystemModule.path.join(folder.path, "images/profileimage.png");
  observ.set("isImageLoading", true);
  try {
    observ.set("isImageLoading", false);

    observ.set("profileImageSrc", imageSourceModule.fromFile(path));
  } catch (err) {


    firebase.storage.downloadFile({
      bucket: "gs://testing-oa-7294c.appspot.com/",
      remoteFullPath: "uploads/images/profiles/" + uid,
      localFile: fileSystemModule.File.fromPath(path)
    }).then(
      function (uploadedFile) {
        observ.set("isImageLoading", false);
        console.log("file downloaded");
        observ.set("profileImageSrc", imageSourceModule.fromFile(path));

      },
      function (error) {
        console.log("error downloading file, using default image: " + error);
        observ.set("isImageLoading", false);
        observ.set("profileImageSrc", "res://oa_logo_createaccount");

      }
    );
  }
}

exports.goToSettings = function (args) {
  var navigationEntry = {
    moduleName: "profilesettings/profile-settings-page",
    clearHistory: true,
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}

exports.goToMyGarage = function (args) {
  var navigationEntry = {
    moduleName: "garagepage/garage-page",
    clearHistory: true,
    animated: true,
    transition: {
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