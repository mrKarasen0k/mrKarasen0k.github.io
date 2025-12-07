document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.querySelector('.menu');
    const totalPriceElement = document.getElementById('totalPrice');
    const toFormButton = document.getElementById('toForm');
    const customerForm = document.getElementById('customerForm');
    const itemElements = document.querySelectorAll('.item')

    if (customerForm) {
        customerForm.style.display = 'none';
    }

    const parsePrice = (priceText) => {
        return parseInt(priceText.replace(/[^\d]/g, ''), 10);
    }

    const updateTotal = () => {
        let total = 0;

        itemElements.forEach(item => {
            const countSpan = item.querySelector('.count');
            const priceElement = item.querySelector('.price');

            if (countSpan && priceElement) {
                const count = parseInt(countSpan.textContent, 10);
                const price = parsePrice(priceElement.textContent);
                total += count * price;
            }
        });
        
        totalPriceElement.textContent = `${total} ₽`;

        toFormButton.disabled = total === 0;
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
    updateTotal();
});