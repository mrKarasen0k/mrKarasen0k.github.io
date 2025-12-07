document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const menuContainer = document.querySelector('.menu');
    const totalPriceElement = document.getElementById('totalPrice');
    const toFormButton = document.getElementById('toForm');
    const customerForm = document.getElementById('customerForm');
    const itemElements = document.querySelectorAll('.item');

    const checkoutButton = document.getElementById('checkoutButton');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const paymentInput = document.getElementById('payment');

    if (customerForm) {
        customerForm.style.display = 'none';
    }

    const parsePrice = (priceText) => {
        return parseInt(priceText.replace(/[^\d]/g, ''), 10);
    }

    const updateTotal = () => {
        let total = 0;
        let hasItems = false;

        itemElements.forEach(item => {
            const countSpan = item.querySelector('.count');
            const priceElement = item.querySelector('.price');

            if (countSpan && priceElement) {
                const count = parseInt(countSpan.textContent, 10);
                const price = parsePrice(priceElement.textContent);
                total += count * price;
                if (count > 0) hasItems = true;
            }
        });
        
        totalPriceElement.textContent = `${total} ₽`;
        if (toFormButton) {
            toFormButton.disabled = total === 0;
        }

        if (checkoutButton) {
            checkoutButton.disabled = total === 0;
        }
    }

    if (menuContainer) {
        menuContainer.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.classList.contains('btn')) {
                const quantityBlock = target.closest('.quantity');

                if (quantityBlock) {
                    const countSpan = quantityBlock.querySelector('.count');
                    let currentCount = parseInt(countSpan.textContent, 10);

                    if (target.classList.contains('plus')) {
                        currentCount++;
                    } else if (target.classList.contains('minus')) {
                        if (currentCount > 0) {
                            currentCount--;
                        }
                    }
                    countSpan.textContent = currentCount;
                    updateTotal();
                }
            }
        });
    }

    if (toFormButton && menuContainer && customerForm) {
        toFormButton.addEventListener('click', () => {
            menuContainer.style.display = 'none';
            customerForm.style.display = 'block';
            toFormButton.textContent = 'Подтвердить заказ';
        });
    }

    const collectData = () => {
        const items = []
        let total = 0;

        itemElements.forEach(item => {
            const countSpan = item.querySelector('.count');
            const nameElement = item.querySelector('.name');
            const priceElement = item.querySelector('.price');

            const count = parseInt(countSpan.textContent, 10);

            if (count > 0) {
                const price = parsePrice(priceElement.textContent);
                items.push({
                    name: nameElement.textContent,
                    count: count,
                    price: price,
                    sum: count * price
                });
                total += count * price;
            }
        });

        const customer = {
            name: nameInput.value,
            phone: phoneInput.value,
            address: addressInput.value,
            paymentMethod: paymentInput.value
        };

        return {
            items: items,
            customer: customer,
            totalPrice: total
        };
    };
        
        
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const data = collectData();

                if (data.items.length === 0) {
                    alert("Корзина пуста!");
                    return;
                }

                tg.sendData(JSON.stringify(data));

                tg.close();
            });
        }

    updateTotal();
});