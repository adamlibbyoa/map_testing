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
var uid;

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();

  loadImage();

  // get username
  const documents = fileSystemModule.knownFolders.documents();
  const folder = documents.getFolder("userdata");
  const file = folder.getFile("data.txt");
  file.readText().then(text => {
    var data = JSON.parse(text);
    console.log(JSON.stringify(data));
    observ.set("username", data.first_name + " " + data.last_name);
  }, err => console.log(err));

  // firebase.getCurrentUser().then(res => {
  //   uid = res.uid;
  //   console.log(res.photoURL);
  //   if (!res.photoURL) {
  //     observ.set("profileImageSrc", "res://oa_logo_createaccount"); // default image
  //   } else {
  //     observ.set("profileImageSrc", res.photoURL);
  //     console.log("loaded from online");
  //   }
  // }, (err) => {
  //   console.log(err);
  // });



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

function loadImage() {
  // get the documents folder
  const folder = fileSystemModule.knownFolders.documents();
  // get the path to the profile image
  const path = fileSystemModule.path.join(folder.path, "images/profileimage.png");
  // attempt to get a profile image from the user's device
  try {
    var image = imageSourceModule.fromFile(path);
    observ.set("profileImageSrc", image);
    //console.dir(saved);
  } // if there was an error finding file, then load a default image and create a new file for a saved image
  catch (err) {
    console.log("No file found");
    // because there was no file, we now need to create one
    var file = folder.getFolder("images").getFile("profileimage.png");

    observ.set("profileImageSrc", "res://oa_logo_createaccount");
  }
}


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

    var imgPath = results[0].file;
    var image = imageSourceModule.fromFile(imgPath);

    var folderDest = fileSystemModule.knownFolders.documents();
    var pathDest = fileSystemModule.path.join(folderDest.path, "images/profileimage.png");
    var saved = image.saveToFile(pathDest, "png");
    if (saved) {
      console.log("File successfuly saved!");
      observ.set("profileImageSrc", image);
    }


    firebase.storage.uploadFile({
      remoteFullPath: "uploads/images/profiles/" + uid,
      localFullPath: results[0].file,
      onProgress: function (status) {
        console.log("Uploaded Fraction: " + status.fractionCompleted.toString());
      }
    }).then(
      function (uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
      }).catch(err => {
      console.log(err);
    });
  });
  mediaPicker.on("error", function (err) {
    console.log(err.object.get("msg"));
  });
  mediaPicker.on("cancel", function (res) {
    console.log(res.object.get("msg"));
  });
}

exports.goToMyGarage = function (args) {
  var navigationEntry = {
    moduleName: "garagepage/garage-page",
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