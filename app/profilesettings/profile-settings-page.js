/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./profile-settings-view-model");
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
var ImageCropper = require("nativescript-imagecropper").ImageCropper;

var uid;
var currentUsername = "";

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();

  firebase.getCurrentUser().then(res => {
    uid = res.uid;
    loadImage();
    loadUsername();
  }, (err) => {
    console.log(err);
  });



  if (application.android) {
    // hide the status bar if the device is an android
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);


  }


  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.onNavigated = function (args) {
  if (application.android) {
    // get rid of the ugly actionbar
    var topmost = frameModule.topmost();
    topmost.android.showActionBar = true;
  }
}



exports.onReturnPressed = function (args) {
  var textbox = args.object;
  if (isValid(textbox.text)) {
    console.log("it was valid!");
    currentUsername = textbox.text;
    observ.set("usernameError", "Username is valid");
    //saveUsername();
  } else {
    currentUsername = "";
    observ.set("usernameError", "Invalid Username! Letters and numbers only. 4 to 24 characters");
    console.log("username error");
  }

}

function isValid(text = "") {
  if (text.length < 4) {
    return false;
  } else if (text.length > 24) {
    return false;
  } else if (!text.match(/^[0-9a-zA-Z]+$/)) {
    return false;
  } else {
    return true;
  }
}

function saveUsername() {

  const documents = fileSystemModule.knownFolders.documents();
  const folder = documents.getFolder("userdata");
  const file = folder.getFile("data.txt");
  file.readText().then(text => {
    if (text.length <= 0) {
      loadUsername();
    } else {
      var data = JSON.parse(text);
      data.username = currentUsername;
      console.dir(data);
      file.writeText(JSON.stringify(data)).then(() => {
        firebase.update("/userdata/" + data.id, data).then(function (fulfilled) {
          observ.set("usernameError", "Valid Username. Saved to database");
          navBar.goToProfile(false);
        }, function (err) {
          console.log(err);
        });
      }, (err) => console.log(err));
    }
  });
}

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
    console.log("set image from file");

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

    // load image cropper
    var imageCropper = new ImageCropper();
    imageCropper.show(image, {
      width: 400,
      height: 400,
      lockSquare: true
    }).then((args) => {
      if (args.response != "Success") {
        console.log("cancelled or error");
        return;
      }
      var croppedImage = args.image;
      var folderDest = fileSystemModule.knownFolders.documents();
      var pathDest = fileSystemModule.path.join(folderDest.path, "images/profileimage.png");
      var saved = croppedImage.saveToFile(pathDest, "png");
      if (saved) {
        console.log("File successfuly saved!");
        observ.set("profileImageSrc", croppedImage);
      }

      // observ.set("isImageLoading", true);
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
    }).catch(err => console.log(err));
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

  var textbox = args.object.page.getViewById("usernameTB");
  if (isValid(textbox.text)) {
    console.log("it was valid!");
    currentUsername = textbox.text;
    observ.set("usernameError", "Username is valid");
    saveUsername();
  } else {
    currentUsername = "";
    observ.set("usernameError", "Invalid Username! Letters and numbers only. 4 to 24 characters");
    console.log("username error");
  }
}