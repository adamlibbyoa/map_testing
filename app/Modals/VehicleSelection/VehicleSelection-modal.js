const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require('tns-core-modules/data/observable-array').ObservableArray;

let closeCallback;

// var data = {
//     rating: 0,
//     info: ""
// }
var rating = 0;
var stars = [];


exports.onNavigatingTo = function (args) {
    var page = args.object;
    var vehiclelist = page.getViewById("vehiclelist");
    var vehicles = [{
            name: "2017, Jeep Wrangler"
        },
        {
            name: "2016, Chevy Camaro"
        }
    ];

    var obsarray = new ObservableArray();
    obsarray.push({
        name: "2017, Jeep Wrangler"
    });
    obsarray.push({
        name: "2016, Chevy Camaro"
    });
    vehiclelist.items = obsarray;
    vehiclelist.refresh();
}


function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    const page = args.object;

    page.bindingContext = observableModule.fromObject(context);
}
exports.onShownModally = onShownModally;

function onCancel(args) {
    closeCallback(false, {});
}
exports.onCancel = onCancel;

function onSubmit(args) {
    var page = args.object.page;
    var textField = page.getViewById("info");
    var data = {
        rating: rating,
        info: textField.text
    };
    closeCallback(true, data);
}
exports.onSubmit = onSubmit;

function onStarClicked(args) {
    var img = args.object;


    var id = img.id;

    for (var i = 0; i < id; i++) {
        stars[i].src = "res://star_filled";
    }
    for (var i = id; i < stars.length; i++) {
        stars[i].src = "res://star_grey";
    }

    console.log(id);
    rating = id;
}
exports.onStarClicked = onStarClicked;