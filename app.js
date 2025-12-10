const items = Array.from(document.querySelectorAll('.item'));
const toFormBtn = document.querySelector('.toForm');
const backBtn = document.querySelector('.back');
const menu = document.querySelector('.menu');
const checkout = document.querySelector('.checkout');
const form = document.querySelector('.checkout-form');
const summaryValue = document.querySelector('.summary-value');
const addressInput = form.querySelector('.address');
const phoneInput = form.querySelector('.phone');
const paymentSelect = form.querySelector('select[name="payment"]');

// Храним количество по id товара
const cart = {};

// Достаём числовую цену из строки "1500 ₽"
function parsePrice(text) {
    return Number(text.replace(/[^\d]/g, '')) || 0;
}

// Обновляем количество выбранного товара
function updateCount(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    updateSummary();
}

// Считаем итоговую сумму и выводим на экран
function updateSummary() {
    let total = 0;
    items.forEach(item => {
        const id = item.dataset.id;
        const count = cart[id] || 0;
        if (!count) return;
        const price = parsePrice(item.querySelector('.price').textContent);
        total += price * count;
    });
    summaryValue.textContent = `${total} ₽`;
    return total;
}

// Собираем корзину в удобный формат
function collectCartItems() {
    return items
        .map(item => {
            const id = item.dataset.id;
            const quantity = cart[id] || 0;
            if (!quantity) return null;
            const name = item.querySelector('.name').textContent.trim();
            const price = parsePrice(item.querySelector('.price').textContent);
            return {
                id,
                name,
                price,
                quantity,
                lineTotal: price * quantity,
            };
        })
        .filter(Boolean);
}

// Отправляем заказ в Telegram; при ошибке показываем алерт
function sendCartToBot(payload) {
    const webApp = window.Telegram?.WebApp;
    try {
        // Лёгкая вибрация, если доступна
        webApp?.HapticFeedback?.impactOccurred?.('light');
        webApp?.sendData(JSON.stringify(payload));
        alert('Заявка отправлена в бот');
    } catch (err) {
        alert('Ошибка отправки. Проверьте Telegram.WebApp.sendData.');
    }
}

// Обработчики +/- на товарах
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

// Переход к форме только если есть товары
toFormBtn.addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
        alert('Добавьте товары перед оформлением');
        return;
    }
    menu.style.display = 'none';
    checkout.style.display = 'block';
});

// Возврат к меню
backBtn.addEventListener('click', () => {
    checkout.style.display = 'none';
    menu.style.display = 'block';
});

// Отправляем заявку при submit формы
form.addEventListener('submit', event => {
    event.preventDefault();
    if (Object.keys(cart).length === 0) {
        alert('Корзина пуста');
        return;
    }

    const itemsPayload = collectCartItems();
    const total = updateSummary();

    const payload = {
        type: 'order',
        address: addressInput.value.trim(),
        phone: phoneInput.value.trim(),
        payment: paymentSelect.value,
        items: itemsPayload,
        total,
        createdAt: new Date().toISOString(),
    };

    sendCartToBot(payload);
});

// Первичное обновление суммы
updateSummary();
