/**
 * @file popup.js
 */

function sendMessageToBackground(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.runtime.sendMessage({ ...message, tab: tabs[0] }, function (response) {
            if (chrome.runtime.lastError) {
                // console.log(chrome.runtime.lastError);
            } else {
                // Do whatever you want, background script is ready now
            }
            if (callback) callback(response);
        });
    });
}

function updateIntervalSeconds(intervalSeconds) {
    document.getElementById('intervalSeconds').innerHTML = intervalSeconds;
}

function isHttpsPage(cb) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        if (!url || !url.startsWith('https')) {
            cb(false);
        } else {
            cb(true);
        }
    });
}

function run() {
    console.log('popup open');
}

isHttpsPage(function (flag) {
    console.log('flag', flag);

    if (flag) {
        run();
    }
});