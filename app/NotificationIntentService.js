import {
    android
} from "tns-core-modules/application/application";


android.app.IntentService.extend("com.tns.notifications.NotificationIntentService", {
    onHandleIntent: function (intent) {
        var action = intent.getAction();
        if ("ACTION_START" == action) {
            postNotification();
        } else if ("ACTION_STOP" == action) {
            // do nothing at the moment
        }
        android.support.v4.content.WakefulBroadcastReceiver.completeWakefulIntent(intent);
    }
});

function postNotification() {
    // we can do something here apparently 

    var utils = require("tns-core-modules/utils/utils");
    var context = utils.ad.getApplicationContext();
    var builder = new android.app.Notification.Builder(context);
    builder.setContentTitle("Live Recording")
        .setAutoCancel(false)
        .setContentText("This is my test notification")
        .setSmallIcon("res://icon");
    var mainIntent = new android.content.Intent(context, com.tns.NativeScriptActivity.class);
    var pendingIntent = android.app.PendingIntent.getActivity(context, 1, mainIntent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);
    builder.setContentIntent(pendingIntent);
    builder.setDeleteIntent(getDeleteIntent(context));
    var manager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
    manager.notify(1, builder.build());
}

function getDeleteIntent(context) {
    var intent = new android.content.Intent(context, com.tns.broadcastreceivers.NotificationEventReceiver.class);
    intent.setAction("ACTION_DELETE_NOTIFICATION");
    return android.app.PendingIntent.getBroadcast(context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);
}

android.support.v4.content.WakefulBroadcastReceiver.extend("com.tns.broadcastreceivers.NotificationEventReceiver", {
    onReceive: function (context, intent) {
        var action = intent.getAction();
        var serviceIntent;
        if ("ACTION_START_NOTIFICATION_SERVICE" == action) {
            serviceIntent = createIntentStartNotificationService(context);
        } else if ("ACTION_DELETE_NOTIFICATION" == action) {
            serviceIntent = createIntentDeleteNotification(context);
        }
        if (serviceIntent) {
            android.support.v4.content.WakefulBroadcastReceiver.startWakefulService(context, serviceIntent);
        }
    }
});
var Intent = android.content.Intent;

function createIntentStartNotificationService(context) {
    var intent = new Intent(context, com.tns.notifications.NotificationIntentService.class);
    intent.setAction("ACTION_START");
    return intent;
}

function createIntentDeleteNotification(context) {
    var intent = new Intent(context, com.tns.notifications.NotificationIntentService.class);
    intent.setAction("ACTION_DELETE");
    return intent;
}