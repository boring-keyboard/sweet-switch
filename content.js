// @ts-check
/**
 * @file content.js
 */

let appConfigs;
let intervalSeconds = 30;

class ItemPage {

    static match() {
        return /item\.taobao\.com\/item\.htm/.test(document.URL);
    }

    run() {
        return new Promise((resolve) => {
            this._onReady(async (ret) => {
                console.log('onReady', ret);
            });
        })
    }

    _onReady(callback) {
        loop((stop) => {
            if (!this._isReady()) {
                return;
            }
            stop();
            if (!$('div[class*="purchasePanel--"] button[class*="leftBtn--"]').get(0).textContent.match(/下架/)) {
                chrome.runtime.sendMessage({
                    type: 'hit',
                    data: {
                        html: $('div[class*="summaryInfoWrap--"]').get(0).innerHTML,
                        url: document.URL
                    }
                });
            } else {
                chrome.runtime.sendMessage({
                    type: 'miss',
                    data: document.URL 
                });
                setTimeout(() => {
                    window.location.reload();
                }, intervalSeconds * 1000);
            }
        });
    }

    _isReady() {
        return $(PRICE_SELECTOR).text().trim().length > 0;
    }
}

class CartPage {

    static match() {
        return /cart\.taobao\.com/.test(document.URL);
    }

    run() {
        $('div[class*="btnWrap--"] div[class*="btn--"]').get(0).click();
    }
}

class BuyPage {
    static match() {
        return /buy\.taobao\.com/.test(document.URL);
    }

    run() {
        $('div[class*="SettlementSubmit--"] div[class*="btn--"]').get(0).click();
    }
}

function loop(callback) {
    const timer = setInterval(() => {
        callback(() => clearInterval(timer));
    }, LOOP_SPEED);
}

function main() {
    if (ItemPage.match()) {
        new ItemPage().run();
    }
    if (BuyPage.match()) {
        new BuyPage().run();
    }
}

let isCartRuning = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'ready') {
        if (CartPage.match() && !isCartRuning) {
            isCartRuning = true;
            new CartPage().run();
        }
    }

    if (CartPage.match()) {
        if (request.type === 'stats') {
            let mask = document.getElementById('boring-switch-mask');
            if (!mask) {
                mask = document.createElement('div');
                mask.style.position = 'fixed';
                mask.style.top = '0';
                mask.style.width = '120px';
                mask.style.left = '0';
                mask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                mask.style.color = '#fff';
                mask.style.padding = '5px';
                mask.style.textAlign = 'left';
                mask.style.fontSize = '13px';
                mask.style.zIndex = '9999';
                mask.id = 'boring-switch-mask';
                document.body.appendChild(mask);
            }
            mask.innerHTML = `连接:${request.data.connNum}, 频率:${request.data.freq.toFixed(2)}`;
        }
    }
});

main();