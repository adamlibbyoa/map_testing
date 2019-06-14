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


function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();

  firebase.storage.getDownloadUrl({
    remoteFullPath: "uploads/images/profiles/testing"
  }).then(
    function (url) {
      observ.set("profileImageSrc", url);
    },
    function (err) {
      observ.set("profileImageSrc", "res://oa_logo_createaccount"); // default image
      console.log("error fetching url: " + err);
    }
  );

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

exports.onImageUploadSelected = function (args) {
  var imageOptions = {
    android: {
      isCaptureMood: false,
      isNeedCamera: true,
      maxNumberFiles: 1,
      isNeedFolderList: true
    },
    ios: {
      isCaptureMood: false,
      maxNumberFiles: 1
    }
  }

  var mediaPicker = new mPicker.Mediafilepicker();
  mediaPicker.openImagePicker(imageOptions);
  mediaPicker.on("getFiles", function (res) {
    var results = res.object.get("results");
    console.dir(results);
    firebase.storage.uploadFile({
      remoteFullPath: "uploads/images/profiles/testing/one",
      localFullPath: results[0].file,
      onProgress: function (status) {
        console.log("Uploaded Fraction: " + status.fractionCompleted);
      }
    }).then(
      function (uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
        // after upload, then set the change the profile image 
        firebase.storage.getDownloadUrl({
          remoteFullPath: "uploads/images/profiles/testing/one"
        }).then(
          function (url) {
            observ.set("profileImageSrc", url);
          },
          function (err) {
            observ.set("profileImageSrc", "res://oa_logo_createaccount"); // default image
            console.log("error fetching url: " + err);
          }
        );
      },
      function (error) {
        console.log("File upload error! ---- " + error);
      }
    );
  });
  mediaPicker.on("error", function (err) {
    console.log(err.object.get("msg"));
  });
  mediaPicker.on("cancel", function (res) {
    console.log(res.object.get("msg"));
  });
}

exports.goToMap = function (args) {
  var navigationEntry = {
    moduleName: "home/home-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}

exports.goToFeed = function (args) {
  var navigationEntry = {
    moduleName: "feedpage/feed-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}


exports.goToDiscover = function (args) {
  var navigationEntry = {
    moduleName: "discoverpage/discover-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}

exports.goToBlog = function (args) {
  var navigationEntry = {
    moduleName: "blogpage/blog-page",
    animated: true,
    transition: {
      name: "fade",
      duration: 60,
      curve: "easeIn"
    }
  }

  frameModule.topmost().navigate(navigationEntry);
}