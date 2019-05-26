const observableModule = require("tns-core-modules/data/observable");
let closeCallback;

// var data = {
//     rating: 0,
//     info: ""
// }
var rating = 0;
var stars = [];

function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    const page = args.object;

    stars[0] = page.getViewById("1");
    stars[1] = page.getViewById("2");
    stars[2] = page.getViewById("3");
    stars[3] = page.getViewById("4");
    stars[4] = page.getViewById("5");

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