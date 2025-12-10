const items = Array.from(document.querySelectorAll('.item'));
const toFormBtn = document.querySelector('.toForm');
const backBtn = document.querySelector('.back');
const menu = document.querySelector('.menu');
const checkout = document.querySelector('.checkout');
const form = document.querySelector('.checkout-form');
const summaryValue = document.querySelector('.summary-value');

const cart = {};

function updateCount(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
}

function sendCartToBot() {
    const tg = window.Telegram && Telegram.WebApp;
    if (!tg || typeof tg.sendData !== 'function') return;
    tg.sendData(JSON.stringify({ cart }));
}

items.forEach(item => {
    const id = item.dataset.id;
    const countEl = item.querySelector('.count');
    item.querySelector('.plus').addEventListener('click', () => {
        updateCount(id, 1);
        countEl.textContent = cart[id] || 0;
    });
    item.querySelector('.minus').addEventListener('click', () => {
        updateCount(id, -1);
        countEl.textContent = cart[id] || 0;
    });
});

toFormBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    checkout.style.display = 'block';
});

backBtn.addEventListener('click', () => {
    checkout.style.display = 'none';
    menu.style.display = 'block';
});

checkout.addEventListener('click', () => {
    sendCartToBot();
});