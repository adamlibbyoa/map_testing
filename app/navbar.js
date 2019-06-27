const application = require("tns-core-modules/application");
var frameModule = require("tns-core-modules/ui/frame");
const Observable = require("tns-core-modules/data/observable").Observable;

// no animation for map due to crashing bug
var mapNavigationEntry = {
    moduleName: "",
    clearHistory: true,
    animated: false
}

var normalNavigationEntry = {
    moduleName: "",
    clearHistory: true,
    animated: true,
    transition: {
        name: "fade",
        duration: 60,
        curve: "easeIn"
    }
}

exports.goToMap = function (isMap) {
    var navigationEntry;
    if (isMap) {
        navigationEntry = mapNavigationEntry;
    } else {
        navigationEntry = normalNavigationEntry;
    }

    navigationEntry.moduleName = "home/home-page";
    frameModule.topmost().navigate(navigationEntry);
}

exports.goToFeed = function (isMap) {

    var navigationEntry;
    if (isMap) {
        navigationEntry = mapNavigationEntry;
    } else {
        navigationEntry = normalNavigationEntry;
    }

    navigationEntry.moduleName = "feedpage/feed-page";
    frameModule.topmost().navigate(navigationEntry);
}


exports.goToDiscover = function (isMap) {


    var navigationEntry;
    if (isMap) {
        navigationEntry = mapNavigationEntry;
    } else {
        navigationEntry = normalNavigationEntry;
    }
    navigationEntry.moduleName = "discoverpage/discover-page";

    frameModule.topmost().navigate(navigationEntry);
}

exports.goToBlog = function (isMap) {
    var navigationEntry;
    if (isMap) {
        navigationEntry = mapNavigationEntry;
    } else {
        navigationEntry = normalNavigationEntry;
    }
    navigationEntry.moduleName = "blogpage/blog-page";


    frameModule.topmost().navigate(navigationEntry);
}

exports.goToProfile = function (isMap) {
    var navigationEntry;
    if (isMap) {
        navigationEntry = mapNavigationEntry;
    } else {
        navigationEntry = normalNavigationEntry;
    }
    navigationEntry.moduleName = "profilepage/profile-page";

    frameModule.topmost().navigate(navigationEntry);
}