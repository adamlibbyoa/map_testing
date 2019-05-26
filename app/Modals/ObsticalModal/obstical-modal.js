const observableModule = require("tns-core-modules/data/observable");
let closeCallback;

var difficulty = 0;
var oneSelected = true;
var oneOff = "res://off_12";
var oneOn = "res://on_12";
var threeSelected = false;
var threeOff = "res://off_35";
var threeOn = "res://on_35";
var sixSelected = false;
var sixOff = "res://off_68";
var sixOn = "res://on_68";
var nineSelected = false;
var nineOff = "res://off_910";
var nineOn = "res://on_910";

var vm;

// exports.onNavigating = function (args) {
//     const page = args.object;
//     vm = new observableModule.Observable();

//     vm.set("oneSelected", oneSelected ? oneOn : oneOff);
//     vm.set("threeSelected", threeSelected ? threeOn : threeOff);
//     vm.set("sixSelected", sixSelected ? sixOn : sixOff);
//     vm.set("nineSelected", nineSelected ? nineOn : nineOff);

//     page.bindingContext = vm;
// }

function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    const page = args.object;

    vm = observableModule.fromObject(context);
    vm.set("oneSelected", oneSelected ? oneOn : oneOff);
    vm.set("threeSelected", threeSelected ? threeOn : threeOff);
    vm.set("sixSelected", sixSelected ? sixOn : sixOff);
    vm.set("nineSelected", nineSelected ? nineOn : nineOff);

    page.bindingContext = vm;
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
        difficulty: difficulty,
        info: textField.text
    }
    closeCallback(true, data);
}
exports.onSubmit = onSubmit;

function onDifficultySelected(args) {
    var selectedID = args.object.id;

    switch (selectedID) {
        case "12":
            oneSelected = true;
            threeSelected = false;
            sixSelected = false;
            nineSelected = false;
            difficulty = 1;
            break;
        case "35":
            oneSelected = false;
            threeSelected = true;
            sixSelected = false;
            nineSelected = false;
            difficulty = 3;
            break;
        case "68":
            oneSelected = false;
            threeSelected = false;
            sixSelected = true;
            nineSelected = false;
            difficulty = 6;
            break;
        case "910":
            oneSelected = false;
            threeSelected = false;
            sixSelected = false;
            nineSelected = true;
            difficulty = 9;
            break;
    }
    vm.set("oneSelected", oneSelected ? oneOn : oneOff);
    vm.set("threeSelected", threeSelected ? threeOn : threeOff);
    vm.set("sixSelected", sixSelected ? sixOn : sixOff);
    vm.set("nineSelected", nineSelected ? nineOn : nineOff);

}
exports.onDifficultySelected = onDifficultySelected;