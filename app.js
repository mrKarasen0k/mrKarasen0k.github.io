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
	let totalSum = 0;

	menuItems.forEach(item => {
		const countSpan = item.querySelector('.count');
		const quantity = parseInt(countSpan.textContent, 10);
		const price = getItemPrice(item);

		totalSum += quantity * price;
	});
	totalPriceElement.textContent = `${totalSum} ₽`;

	if (totalSum > 0) {
		checkoutButton.removeAttribute('disabled');
		
		if (window.Telegram.WebApp.MainButton.isVisible) {
			window.Telegram.WebApp.MainButton.setText(`Заказать на ${totalSum} ₽`);
		}
		else {
			checkoutButton.setAttribute('disabled', 'disabled');
			windows.Telegram.WebApp.MainButton.hide();
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

		window.Telegram.WebApp.MainButton.text="Сформировать заказ";
		window.Telegram.WebApp.MainButton.show();

		window.Telegram.WebApp.MainButton.onClick(() => {
			sendOrderToBot();
		});
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
	}
});

function sendOrderToBot() {
	const order = getOrderDetails();

	if (order.total === 0) {
		window.Telegram.WebApp.showAlert('Корзина пуста!');
		return
	}

	const orderSummary = order.items.map(item =>
		`${item.name} x${item.quantity} (${item.subtotal} ₽)`
    ).join('\n');

	const message = `Заказ на сумму: ${order.total} ₽:\n\n${orderSummary}`;

	window.Telegram.WebApp.sendData(message);
};
