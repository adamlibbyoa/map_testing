/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./trail-details-view-model");
const geolocation = require("nativescript-geolocation");
const mapbox = require("nativescript-mapbox");
const firebase = require("nativescript-plugin-firebase").crashlytics;
const dialogs = require("tns-core-modules/ui/dialogs");
const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;
const imageModule = require("tns-core-modules/ui/image");
const animationModule = require("tns-core-modules/ui/animation");
const navBar = require("../navbar");
const gestures = require("tns-core-modules/ui/gestures");
var isCollapsed = false;

function onNavigatingTo(args) {
  const page = args.object;
  observ = new Observable();
  var trail = args.context;
  if (!trail) {
    trail = {
      rating: 3,
      name: "No Data",
      duration: "NA",
      description: "na",
      difficulty: "1-3",
      distance: 0
    }
  }

  // add all the stars to the panel
  var starRatings = page.getViewById("starRating");
  for (var i = 0; i < trail.rating; i++) {
    var img = new imageModule.Image();
    img.row = "0";
    img.col = i.toString();
    img.src = "res://star_filled";
    img.id = i.toString();
    starRatings.addChild(img);
  }
  observ.set("ratingNumber", trail.rating);
  observ.set("trailName", trail.name);
  observ.set("duration", trail.duration);
  observ.set("distance", trail.distance.toFixed(2));
  observ.set("description", trail.description);
  observ.set("difficulty", trail.difficulty);


  if (application.android) {
    // hide the status bar if the device is an android
    const activity = application.android.startActivity;
    const win = activity.getWindow();
    win.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);


  }


  page.bindingContext = observ;

}
exports.onNavigatingTo = onNavigatingTo;

exports.onLoadedPage = function (args) {
  if (application.android) {
    var topmost = frameModule.topmost();
    topmost.android.showActionBar = true;
  }
}

exports.onLoaded = function (args) {
  var page = args.object.page;

  var overviewpanel = page.getViewById("overviewpanel");
  overviewpanel.on(gestures.GestureTypes.pan, function (args) {
    console.log(Math.round(args.deltaY));
    if (Math.round(args.deltaY) < -100 && !isCollapsed) {
      isCollapsed = !isCollapsed;
      //parallaxOn(page);
      return;
    }
    if (Math.round(args.deltaY) > 100 && isCollapsed) {
      isCollapsed = !isCollapsed;
      //parallaxOff(page);
      return;
    }


  });
}

function parallaxOn(page) {
  var theimage = page.getViewById("theimage");
  var namepanel = page.getViewById("namepanel");
  var distdiffpanel = page.getViewById("distdiffpanel");
  var definitions = new Array();
  var imgAnim = {
    target: theimage,
    translate: {
      x: 0,
      y: -250
    },
    duration: 500
  }
  var nameAnim = {
    target: namepanel,
    translate: {
      x: 0,
      y: -250
    },
    duration: 500
  }

  var distdiffAnim = {
    target: distdiffpanel,
    translate: {
      x: 0,
      y: -250
    },
    duration: 500
  }
  definitions.push(imgAnim);
  definitions.push(nameAnim);
  definitions.push(distdiffAnim);
  var animationSet = new animationModule.Animation(definitions);
  animationSet.play().then(function () {
    theimage.visibility = "collapsed";
    namepanel.visibility = "collapsed";
    distdiffpanel.visibility = "collapsed";
  });


}

function parallaxOff(page) {
  var theimage = page.getViewById("theimage");
  var namepanel = page.getViewById("namepanel");
  var distdiffpanel = page.getViewById("distdiffpanel");
  theimage.visibility = "visible";
  namepanel.visibility = "visible";
  distdiffpanel.visibility = "visible";
  var definitions = new Array();
  var imgAnim = {
    target: theimage,
    translate: {
      x: 0,
      y: 0
    },
    duration: 500
  }
  var nameAnim = {
    target: namepanel,
    translate: {
      x: 0,
      y: 0
    },
    duration: 500
  }

  var distdiffAnim = {
    target: distdiffpanel,
    translate: {
      x: 0,
      y: 0
    },
    duration: 500
  }
  definitions.push(imgAnim);
  definitions.push(nameAnim);
  definitions.push(distdiffAnim);
  var animationSet = new animationModule.Animation(definitions);
  animationSet.play().then(function () {

  });


}

exports.onScrolled = function (args) {
  var scrollView = args.object;
  console.log(scrollView.verticalOffset);
  var page = args.object.page;
  var img = page.getViewById("theimage");
  var namepanel = page.getViewById("namepanel");
  var distdiffpanel = page.getViewById("distdiffpanel");
  var tabpanel = page.getViewById("tabviewpanel");



  // if (scrollView.verticalOffset > 10) {
  //   img.visibility = "collapsed";
  //   distdiffpanel.visibility = "collapsed";
  //   namepanel.visibility = "collapsed";
  // }
  // else {
  //   img.visibility = "visible";
  //   distdiffpanel.visibility = "visible";
  // }



  // failed animations
  var definitions = new Array();
  var imgAnim = {
    target: img,
    translate: {
      x: 0,
      y: scrollView.verticalOffset * -1
    }
  }
  var nameAnim = {
    target: namepanel,
    translate: {
      x: 0,
      y: scrollView.verticalOffset * -1
    }
  }
  var tabAnim = {
    target: tabpanel,
    translate: {
      x: 0,
      y: scrollView.verticalOffset * -1
    }
  }
  var distdiffAnim = {
    target: distdiffpanel,
    translate: {
      x: 0,
      y: scrollView.verticalOffset * -1
    }
  }
  definitions.push(imgAnim);
  definitions.push(nameAnim);
  definitions.push(tabAnim);
  definitions.push(distdiffAnim);
  // var animationSet = new animationModule.Animation(definitions);
  // animationSet.play().then(function () {
  //   console.log("done");
  // })


}

exports.onVisualsLoaded = function (args) {
  var collectionID = 827743;
  var w = 140;
  var h = 140;
  var numImages = 15;
  var grid = args.object;
  for (var i = 0; i < numImages; i++) {
    var randIndex = Math.floor(Math.random() * 692);
    // fetch("https://source.unsplash.com/collection/" + collectionID + "/" + w + "x" + h + "/?sig=" + randIndex)
    // fetch("http://lorempixel.com/140/140")
    // .then((response) => {
    var img = new imageModule.Image();
    // console.log(JSON.stringify(response));
    img.src = "https://loremflickr.com/140/140/outdoors?random=" + i;
    img.width = w;
    img.height = h;
    img.row = Math.floor(i / 3);
    img.col = i % 3;
    grid.addChild(img);
    // }).catch(err => console.log(err));
  }
}

// this will need to be updated once we can go to this page from multiple pages, but for now it just goes back home
exports.onBackPressed = function (args) {
  navBar.goToMap(false);
  // // firebase.sendCrashLog(new java.lang.Exception("test exception"));
  // frameModule.topmost().navigate("home/home-page");
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