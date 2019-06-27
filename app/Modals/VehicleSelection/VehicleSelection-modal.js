const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require('tns-core-modules/data/observable-array').ObservableArray;

let closeCallback;
var vm;

// var data = {
//     rating: 0,
//     info: ""
// }
var rating = 0;
var stars = [];
var vehicles = [{
        name: "2017, Jeep Wrangler",
        isSelected: false
    },
    {
        name: "2016, Chevy Camaro",
        isSelected: false
    }
];

exports.onNavigatingTo = function (args) {
    var page = args.object;
    var vehiclelist = page.getViewById("vehiclelist");


    var obsarray = new ObservableArray();
    obsarray.push(vehicles);
    // obsarray.push({
    //     name: "2017, Jeep Wrangler"
    // });
    // obsarray.push({
    //     name: "2016, Chevy Camaro"
    // });
    vehiclelist.items = obsarray;
    vehiclelist.refresh();
}

exports.onItemTap = function (args) {
    var index = args.index;
    var page = args.object.page;
    var vehiclelist = page.getViewById("vehiclelist");
    for (var i = 0; i < vehicles.length; i++) {
        if (i == index) {
            vehicles[i].isSelected = true;
            vm.set("letsgo", "true");
        } else {
            vehicles[i].isSelected = false;
        }
    }

    var obsarray = new ObservableArray();
    obsarray.push(vehicles);
    vehiclelist.items = obsarray;
    vehiclelist.refresh();

}

function onShownModally(args) {
    const context = args.context;
    const page = args.object;
    var vehiclelist = page.getViewById("vehiclelist");
    var obsarray = new ObservableArray();
    page.bindingContext = observableModule.fromObject(context);
    vm = page.bindingContext;
    vm.set("letsgo", "false");


    var temparr = [];
    console.log(context.vehicles.length);
    for (var i in context.vehicles) {
        var vehicle = context.vehicles[i];
        var temp = {
            name: vehicle.year + ", " + vehicle.make + " " + vehicle.model,
            vid: vehicle.vid,
            isSelected: false
        }
        temparr.push(temp);
    }
    vehicles = temparr;
    obsarray.push(vehicles);
    vehiclelist.items = obsarray;

    closeCallback = args.closeCallback;

}
exports.onShownModally = onShownModally;

function onCancel(args) {
    closeCallback(false, {});
}
exports.onCancel = onCancel;

exports.goToRecord = function (args) {
    var v;
    for (var i = 0; i < vehicles.length; i++) {
        if (vehicles[i].isSelected) {
            v = vehicles[i];
            break;
        }
    }

    closeCallback(true, {
        vid: v.vid
    });
}

exports.addNewVehicle = function (args) {
    closeCallback(false, {}, true);
}