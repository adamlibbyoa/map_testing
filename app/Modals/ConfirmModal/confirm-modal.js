const observableModule = require("tns-core-modules/data/observable");
let closeCallback;



function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    const page = args.object;

    //const vm = new observableModule.Observable();
    //vm.set("confirmText", "Are you sure you are done recording?");
    //page.bindingContext = vm;

    page.bindingContext = observableModule.fromObject(context);
}
exports.onShownModally = onShownModally;

function onCancel(args) {
    closeCallback(false);
}
exports.onCancel = onCancel;

function onSubmit(args) {

    closeCallback(true);
}
exports.onSubmit = onSubmit;