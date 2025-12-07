function toggleFormVisibility() {
	const customerForm = document.getElementById('customerForm');
	const toFormButton = document.getElementById('toForm');

	toFormButton.addEventListener('click', () => {
		customerForm.style.display = customerForm.style.display === 'block' ? 'none' : 'block';
		toFormButton.textContent = customerForm.style.display === 'block' ? 'Отправить заказ' : 'Сформировать заказ';

		if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.MainButton) {
			if (customerForm.style.display === 'block') {
				window.Telegram.WebApp.MainButton.hide();
			} else {
				updateOrderTotal();
			}
		}
	});
}


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
	const toFormButton = document.getElementById('toForm');

	let totalSum = 0;

	menuItems.forEach(item => {
		const countSpan = item.querySelector('.count');
		const quantity = parseInt(countSpan.textContent, 10);
		const price = getItemPrice(item);

		totalSum += quantity * price;
	});
	totalPriceElement.textContent = `${totalSum} ₽`;

	if (toFormButton) {
			if (totalSum > 0) {
				toFormButton.removeAttribute('disabled');
			} else {
				toFormButton.setAttribute('disabled', 'disabled');
				const customerForm = document.getElementById('customerForm');
				if (customerForm) {
					customerForm.style.display = 'none';
					toFormButton.textContent = 'Сформировать заказ';
				}
			}
		}
	
	const customerForm = document.getElementById('customerForm');
	const isFormVisible = customerForm && customerForm.style.display === 'block';

	if (window.Telegram && widnow.Telegram.WebApp && !isFormVisible) {
		if (totalSum > 0) {
			window.Telegram.WebApp.MainButton.setText(`Сумма: ${totalSum} ₽`);
			window.Telegram.WebApp.MainButton.show();
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

		window.Telegram.WebApp.MainButton.setParams({
			text: 'Сформировать заказ',
            is_visible: false,
		});

		window.Telegram.WebApp.MainButton.onClick(() => {
			const customerForm = document.getElementById('customerForm');
			if (customerForm && customerForm.style.display === 'block') {
				document.getElementById('customerForm').dispatchEvent(new Event('submit'));
			} else {
				document.getElementById('toForm').click();
			}
		});
	}

	const menuContainer = document.querySelector('.container');
	if (menuContainer) {
		updateOrderTotal();

		toggleFormVisibility();

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

	const message = customerDetails +
        `СОСТАВ ЗАКАЗА (Сумма: ${order.total} ₽)\n` +
        orderSummary;

window.Telegram.WebApp.sendData(message);
    document.getElementById('customerForm').reset();
    document.getElementById('customerForm').style.display = 'none';
    document.getElementById('toForm').textContent = 'Сформировать заказ';
    document.querySelectorAll('.count').forEach(span => span.textContent = '0');
    updateOrderTotal();
};