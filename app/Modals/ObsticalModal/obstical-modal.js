const observableModule = require("tns-core-modules/data/observable");
let closeCallback;

var data = {
    difficulty: 0,
    info: ""
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
    data.info = textField.text;
    closeCallback(true, data);
}
exports.onSubmit = onSubmit;

function onDifficultySelected(args) {
    // border-bottom-width: 4; border-bottom-color: black;
    var page = args.object.page;
    var selectedID = args.object.id;



}
exports.onDifficultySelected = onDifficultySelected;