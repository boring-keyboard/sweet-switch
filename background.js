importScripts('constants.js');
importScripts('utils.js');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('background.js', request);
  if (request.type === 'hit') {
    webSocket.send(JSON.stringify(request));
  }
  if (request.type === 'miss') {
    webSocket.send(JSON.stringify(request));
  }
});

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


/**
 * 发送消息给popup
 */
function dispatchMessage(type, data) {
  chrome.runtime.sendMessage({
    type,
    data,
  }, (response) => {
    if (chrome.runtime.lastError) {
      // console.log(chrome.runtime.lastError);
    } else {
      // Do whatever you want, background script is ready now
    }
  });
}

function connect() {
  webSocket = new WebSocket(SERVER);

  webSocket.onopen = (event) => {
    console.log('websocket open');
  };

  webSocket.onmessage = (event) => {
    console.log(event);
    eventData = JSON.parse(event.data);
    if (eventData.type === 'ping') {
      webSocket.send('pong');
    }
    if (eventData.type === 'stats') {
      sendMessageToAllContentScriptOfActiveTab(eventData)
    }
    if (eventData.type === 'ready') {
      sendMessageToAllContentScriptOfActiveTab(eventData);
    }
  };

  webSocket.onclose = (event) => {
    console.log('websocket connection closed');
    webSocket = null;
    reconnect();
  };
}

function reconnect() {
  setTimeout(function () {
    console.log('reconnecting...');
    connect();
  }, 1000);
}

connect();
