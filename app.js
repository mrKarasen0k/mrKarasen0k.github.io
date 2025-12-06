function getItemPrice(itemElement) {
	const priceElement = itemElement.querySelector('.price');
	if (!priceElement) return 0;

	const priceText = priceElement.textContent;
	const numericPrice = priceText.replace(/[^0-9]/g, '')
	
	return parseInt(numericPrice, 10) || 0;
}

function updateOrderTotal() {
	const menuItems = document.querySelectorAll('.menu .item');
	const totalPriceElement = document.getElementById('totalPrice');
	const checkoutButton = document.getElementById('checkoutButton');

	let totalSum = 0;

	menuItems.forEach(item => {
		const countSpan = item.querySelector('.count');
		const quantity = parseInt(countSpan.textContent, 10);
		const price = getItemPrice(item);

		totalSum += quantity * price;
	});
	totalPriceElement.textContent = `${totalSum} ₽`;

	if (totalSum > 0) {
        if (checkoutButton) {
             checkoutButton.removeAttribute('disabled');
        }
    } else {
        if (checkoutButton) {
            checkoutButton.setAttribute('disabled', 'disabled');
        }
    }
    if (window.Telegram && window.Telegram.WebApp) {
        if (totalSum > 0) {
             window.Telegram.WebApp.MainButton.setText(`Сумма: ${totalSum} ₽`);
        } else {
             window.Telegram.WebApp.MainButton.hide();
        }
    }
}

function getOrderDetails() {
	const menuItems = document.querySelectorAll('.menu .item');
	const orderItems = []
	let totalAmount = 0;

	menuItems.forEach(item => {
		const countSpan = item.querySelector('.count');
		const quantity = parseInt(countSpan.textContent, 10);

		if (quantity > 0) {
			const name = item.querySelector('.name').textContent;
			const price = getItemPrice(item);

			orderItems.push({
				name: name,
				quantity: quantity,
				price: price,
				subtotal: quantity * price
			});
			totalAmount += quantity * price;
		}
	});
	return {
		items: orderItems,
		total: totalAmount
	};
}


document.addEventListener('DOMContentLoaded', () => {

	if (window.Telegram && window.Telegram.WebApp) {
		window.Telegram.WebApp.ready();

		window.Telegram.WebApp.MainButton.hide();
	}

	const menuContainer = document.querySelector('.container');
	if (menuContainer) {
		updateOrderTotal();

		menuContainer.addEventListener('click', (event) => {
			const target = event.target;

			if (target.classList.contains('btn')) {
				const quantityBlock = target.closest('.quantity');

				if (quantityBlock) {
					const countSpan = quantityBlock.querySelector('.count');
					let currentCount = parseInt(countSpan.textContent, 10);

					if (target.classList.contains('plus')) {
						currentCount++;
					}
					else if (target.classList.contains('minus')) {
						if (currentCount > 0) {
							currentCount--;
						}
					}
					countSpan.textContent = currentCount;
					updateOrderTotal();
				}
			}
		});

		const customerForm = document.getElementById('customerForm');
		if (customerForm) {
			customerForm.addEventListener('submit', (event) => {
				event.preventDefault();
				sendOrderToBot();
			});
		}
	}
});

function sendOrderToBot() {
	const order = getOrderDetails();
	const name = document.getElementById('name').value.trim();
	const address = document.getElementById('address').value.trim();
	const phone = document.getElementById('phone').value.trim();
	const payment = document.getElementById('payment').value;

	if (order.total === 0) {
		window.Telegram.WebApp.showAlert('Корзина пуста!');
		return
	}

	if (!name || !address || !phone || !payment) {
		window.Telegram.WebApp.showAlert('Пожалуйста, заполните Ваше имя и адрес доставки.');
		return;
	}

	const customerDetails = 
	`Имя клиента: ${name}\n` +
	`Телефон: ${phone}\n` +
    `Адрес доставки: ${address}\n` +
    `Способ оплаты: ${payment === 'cash' ? 'Наличными' : payment === 'card_courier' ? 'Картой курьеру' : 'Онлайн-оплата'}\n\n`;

	const orderSummary = order.items.map(item =>
		`${item.name} x${item.quantity} (${item.subtotal} ₽)`
    ).join('\n');

	const message = `НОВЫЙ ЗАКАЗ\n\n` +
        customerDetails +
        `СОСТАВ ЗАКАЗА (Сумма: ${order.total} ₽)\n` +
        orderSummary;

	window.Telegram.WebApp.sendData(message);
};