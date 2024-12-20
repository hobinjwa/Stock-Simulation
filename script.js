const stock_window = document.getElementById('stock-window');
const selectSpeed = document.getElementById('select-speed');
const remainGraph = document.getElementById('remain-graph');
const stockPrice = document.getElementById('stock-price');

const blocks = [];
let graph_num = 100;
let interval;
let to_right = 0;
let lastTop = 200;
let Price = 100;
let balance = 10000;
let shares = 0;
let Variance = 0;

// 통계 변수
let totalBuy_num = 0;
let totalSell_num = 0;
let totalSpent = 0;
let totalEarned = 0;

// 입력창
const inputWindow = document.getElementById('input-window');
const inputWindowClose = document.getElementById('input-window-close');
const tradingTitle = document.getElementById('trading-title');
const availableAmount = document.getElementById('available-amount');
const ownedShares = document.getElementById('owned-shares');
const inputAmount = document.getElementById('input-amount');
const inputPrice = document.getElementById('input-price');
const decreaseQuantity = document.getElementById('decrease-quantity');
const increaseQuantity = document.getElementById('increase-quantity');
const quantityInput = document.getElementById('quantity-input'); 
const quantitySlider = document.getElementById('quantity-slider');
const sliderDisplay = document.getElementById('slider-display');
const confirm = document.getElementById('confirm');
const cancel = document.getElementById('cancel');

// 알림창
const noticeWindow = document.getElementById('notice-window');
const noticeConfirm = document.getElementById('notice-confirm');
const noticeWindowClose = document.getElementById('notice-window-close');
const noticeTitle = document.getElementById('notice-title');
const noticeContent = document.getElementById('notice-content');

let inputQuantity = 0;
let buttonType;

// 매수 매도 입력창 열기
function openInputWindow() {
    stopGame(); 
    inputWindow.style.display = "block";
    tradingTitle.innerText = buttonType;
    availableAmount.innerText = `${balance.toFixed(2)}원`;
    ownedShares.innerText = `${shares}주`;
    inputPrice.innerText = buttonType + ` 금액: ${Price.toFixed(2)}원`;
    inputAmount.innerText = buttonType + ` 가격: ${(Price * inputQuantity).toFixed(2)}원`;
    inputQuantity = 0;
    quantityInput.value = inputQuantity;
    quantitySlider.value = 0;
    sliderDisplay.innerText = "0%";
}

function openNoticeWindow(title, content) {
    stopGame(); 
    noticeWindow.style.display = "block";
    noticeTitle.innerText = title;
    noticeContent.innerHTML = content;
}

// 매수/매도 버튼 이벤트 리스너
document.getElementById('buy-button').addEventListener('click', () => {
    if (balance >= Price) {
        buttonType = "매수";
        openInputWindow();
    } else {
        openNoticeWindow("알림", "잔액이 부족합니다.");
    }
});

document.getElementById('sell-button').addEventListener('click', () => {
    if (shares > 0) {
        buttonType = "매도";
        openInputWindow();
    } else {
        openNoticeWindow("알림", "보유 주식이 없습니다.");
    }
});

// 매도 매수 입력창 닫기
inputWindowClose.addEventListener('click', () => {
    inputWindow.style.display = "none";
    reStartGame();
});

cancel.addEventListener('click', () => {
    inputWindow.style.display = "none";
    reStartGame();
});

noticeWindowClose.addEventListener('click', () => {
    noticeWindow.style.display = "none";
    reStartGame();
});

// 수량 증가/감소 버튼 이벤트 리스너
decreaseQuantity.addEventListener('click', () => {
    if (inputQuantity > 0) {
        inputQuantity--;
        checkLimit();
        updateInput();
    }
});

increaseQuantity.addEventListener('click', () => {
    inputQuantity++;
    checkLimit();
    updateInput();
});

// 수량 입력 필드 이벤트 리스너
quantityInput.addEventListener('input', () => {
    inputQuantity = parseInt(quantityInput.value);
    checkLimit();
    updateInput();
});

// 슬라이더 이벤트 리스너
quantitySlider.addEventListener('input', () => {
    const percentage = quantitySlider.value;
    sliderDisplay.innerText = `${percentage}%`;
    if (buttonType === '매수') {
        inputQuantity = Math.floor((balance / Price) * (percentage / 100));
    } else if (buttonType === '매도') {
        inputQuantity = Math.floor(shares * (percentage / 100));
    }
    checkLimit();
    updateInput();
});

// 수량 한도 확인 함수
function checkLimit() {
    if (buttonType === '매수' && inputQuantity * Price > balance) {
        inputQuantity = Math.floor(balance / Price);
    } else if (buttonType === '매도' && inputQuantity > shares) {
        inputQuantity = shares;
    }
}

// 거래 정보 업데이트 함수
function updateInput() {
    quantityInput.value = inputQuantity;
    inputAmount.innerText = buttonType + ` 가격:${(Price * inputQuantity).toFixed(2)}원`;
}

// 거래 확인 버튼 이벤트 리스너
confirm.addEventListener('click', () => {
    if (buttonType === '매수') {
        let totalCost = Price * inputQuantity;
        if (balance >= totalCost) {
            balance -= totalCost;
            shares += inputQuantity;
            totalBuy_num += inputQuantity;  // 총 매수 주식 수 증가
            totalSpent += totalCost;             // 총 지출 금액 증가
            updateinformation();
        } else {
            alert("잔액 부족");
        }
    } else if (buttonType === '매도') {
        if (shares >= inputQuantity) {
            balance += Price * inputQuantity;
            shares -= inputQuantity;
            totalSell_num += inputQuantity;   // 총 매도 주식 수 증가
            totalEarned += Price * inputQuantity; // 총 수익 금액 증가
            updateinformation();
        } else {
            alert("주식 부족");
        }
    }
    inputWindow.style.display = "none";
    reStartGame();
});

// 알림 확인 버튼 이벤트 리스너
noticeConfirm.addEventListener('click', () => {
    noticeWindow.style.display = "none";
    reStartGame();
});

// 잔고와 보유 주식 업데이트
function updateinformation() {
    document.getElementById('balance').innerText = `잔고: $${balance.toFixed(2)}`;
    document.getElementById('shares').innerText = `보유 주식: ${shares}`;
    availableAmount.innerText = `${balance.toLocaleString()}원`;
    ownedShares.innerText = `${shares.toLocaleString()}주`;
}

// 가격 변동
function priceChange() {
    const volatility = Math.random() * (Math.random() * (Math.random() * 100 + 10) + 10) + 10;
    const randomChange = (Math.random() * 2 - 1) * volatility;
    Price += randomChange / 10;
    Variance = (randomChange / Price) * 10;
    if (randomChange > 0) {
        createBlock('red', true, randomChange);
    } else {
        createBlock('blue', false, randomChange);
    }

    adjustBlocks();
    if (Variance > 0) {
        stockPrice.innerHTML = `현재 가격: $${Price.toFixed(2)}<span style="color: red;"> +${(Variance).toFixed(2)}%</span>`;
    } else {
        stockPrice.innerHTML = `현재 가격: $${Price.toFixed(2)} <span style="color: blue;">${(Variance).toFixed(2)}%</span>`;
    }
    graph_num -= 1;
    remainGraph.innerText = `남은 그래프: ${graph_num}`;
    if (graph_num <= 0) {
        stopGame();
        openNoticeWindow("게임종료", `게임이 종료되었습니다.<br><br><b>통계</b><br>총 매수 주식 수: ${totalBuy_num}주<br>총 매도 주식 수: ${totalSell_num}주<br>총 지출 금액: ${totalSpent.toFixed(2)}원<br>총 수익 금액: ${totalEarned.toFixed(2)}원`);
    }
}

// 그래프 블록 생성
function createBlock(color, isUp, height) {
    const block = document.createElement('div');
    block.className = `block ${color}-block`;
    block.style.width = '8px';
    height = Math.abs(height);

    if (isUp) {
        lastTop -= height;
    }

    block.style.top = `${lastTop}px`;
    block.style.height = `${height}px`;
    block.style.left = `${to_right}px`;
    stock_window.appendChild(block);
    blocks.push(block);

    if (!isUp) {
        lastTop += height;
    }

    if (to_right > 400) {
        adjustBlocks();
    } else {
        to_right += 8;
    }
}

// 그래프 블록 위치 가운대로 조정 및 왼쪽으로 이동
function adjustBlocks() {
    const offset = 200 - parseInt(blocks[blocks.length - 1].style.top);
    blocks.forEach(block => block.style.top = `${parseInt(block.style.top) + offset}px`);
    lastTop += offset;

    if (to_right > 400) {
        blocks.forEach(block => block.style.left = `${parseInt(block.style.left) - 8}px`);
        to_right -= 8;
    }
}

// 게임 초기화
function initGame() {
    while (stock_window.firstChild) {
        stock_window.removeChild(stock_window.firstChild);
    }
    blocks.length = 0;
    Price = 100;
    to_right = 0;
    lastTop = 200;
    graph_num = 100;
}

// 게임 시작
function startGame() {
    initGame();
    interval = setInterval(priceChange, 2000);
}

// 게임 재시작
function reStartGame() {
    interval = setInterval(priceChange, 2000 / parseFloat(selectSpeed.value));
}

// 게임 속도 조절 이벤트 리스너
selectSpeed.addEventListener('change', () => {
    if (selectSpeed.value == '0') {
        clearInterval(interval);
    } else {
        clearInterval(interval);
        interval = setInterval(priceChange, 2000 / parseFloat(selectSpeed.value));
    }
});

// 게임 멈추기
function stopGame() {
    clearInterval(interval);
}

// 게임 시작
startGame();


