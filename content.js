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
            if (!$('div[class*="purchasePanel--"] button[class*="leftBtn--"]').get(0).textContent.match(/下架|即将/)) {
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

    static init() {
        const mask = document.createElement('div');
        document.createElement('div');
        mask.style.position = 'fixed';
        mask.style.top = '0';
        mask.style.width = '200px';
        mask.style.left = '0';
        mask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        mask.style.color = '#fff';
        mask.style.padding = '5px';
        mask.style.textAlign = 'left';
        mask.style.fontSize = '13px';
        mask.style.zIndex = '9999';
        mask.id = 'boring-switch-mask';
        document.body.appendChild(mask);

        // 给提单按钮增加一个彩色流光border的动画
        const style = document.createElement('style');
        style.innerHTML = `
        .boring-switch-border {
            animation: boring-switch-border 3s infinite;
            border: 3px solid #f00;
        }
        @keyframes boring-switch-border {
            0% {
                border-color: #f00;
            }
            25% {
                border-color: #0f0;
            }
            50% {
                border-color: #00f;
            }
            75% {
                border-color: #ff0;
            }
            100% {
                border-color: #f00;
            }
        }
        `;
        document.head.appendChild(style);
        const btn = $('div[class*="btnWrap--"] div[class*="btn--"]').get(0);
        btn.classList.add('boring-switch-border');
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
    if (CartPage.match()) {
        CartPage.init();
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
            const mask = document.getElementById('boring-switch-mask');
            if (mask) {
                mask.innerHTML = `连接:${request.data.connNum}, 过去1分钟探测次数:${request.data.freq.toFixed(0)}`;
            }
        }
    }
});

main();