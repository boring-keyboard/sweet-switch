function sendMessageToAllContentScriptOfActiveTab(message, callback) {
    chrome.tabs.query({ active: true }, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, message, function (response) {
                if (chrome.runtime.lastError) {
                    // console.log(chrome.runtime.lastError);
                } else {
                    // Do whatever you want, background script is ready now
                }
                if (callback) callback(response, tabs.length);
            });
        }
    });
};