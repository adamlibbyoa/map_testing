const ObservableArray = require("tns-core-modules/data/observable-array");
const Observable = require("tns-core-modules/data/observable").Observable;
exports.onNavigatingTo = function (args) {

}
var currentVehicle;

exports.onLoaded = function (args) {
    var view = args.object;
    var vehicle = view.vehicle;
    currentVehicle = vehicle;
    var vm = new Observable();
    vm.set("model", vehicle.model);
    vm.set("make", vehicle.make);
    vm.set("year", vehicle.year);

    var obsArr = new ObservableArray.ObservableArray();
    var info = [{
            name: "Lift Size: " + vehicle.liftSize
        },
        {
            name: "Tire Size: " + vehicle.tireSize
        },
        {}, {}
    ];
    obsArr.push(info);
    var list = view.getViewById("infolist");
    list.items = obsArr;


    view.bindingContext = vm;
    // console.log(context.message);
    // var page = args.object.page;

    // var infolist = page.getViewById("infolist");
    // var arr = new ObservableArray.ObservableArray();

    // arr.push([{}, {}, {}, {}]);
    // infolist.items = arr;
}

exports.selectItemTemplate = function (item, index, items) {
    return index % 2 === 0 ? "even" : "odd";
}

exports.onTap = function (args) {
    console.dir(args.object.vehicle);
}