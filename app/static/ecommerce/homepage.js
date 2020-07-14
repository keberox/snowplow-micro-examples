var userCart = []; // [ {itemTitle:title, itemPrice: price, itemQuant:quantity}, {...},... ]

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (let i = 0; i < removeCartItemButtons.length; i++) {
        let button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (let i = 0; i < quantityInputs.length; i++) {
        let input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (let i = 0; i < addToCartButtons.length; i++) {
        let button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', toCheckout);

}

function purchaseClicked() {
    alert('Thank you for your purchase')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    while (cartItems.hasChildNodes()) {
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
}

function removeCartItem(event) {
    var buttonClicked = event.target
    var cartItem = buttonClicked.parentElement.parentElement

    var title = cartItem.getElementsByClassName('cart-item-title')[0].innerText
    var price = cartItem.getElementsByClassName('cart-price cart-column')[0].innerText.slice(2) // £ price
    var quantity = cartItem.getElementsByClassName('cart-quantity-input')[0].value
    var sku = cartItem.getElementsByClassName('cart-item-sku')[0].innerText;
    // console.log(sku);

    window.snowplow('trackRemoveFromCart',
                    sku,
                    title,
                    null,
                    parseFloat(price),
                    parseInt(quantity),
                    null);

    buttonClicked.parentElement.parentElement.remove()

    updateCartTotal()
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal();
    //input.parentElement.parentElement.getElementsByClassName('shop-item-button')[0].disabled = false;
}

function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('product-title')[0].innerText
    var price = shopItem.getElementsByClassName('product-price')[0].innerText.slice(2) // £ price
    var imageSrc = shopItem.getElementsByClassName('product_img')[0].src

    var quantity = shopItem.getElementsByClassName('cart-quantity-input')[0].value
    quantity = quantity ? quantity : 1;

    var sku = shopItem.getElementsByClassName('product-sku')[0].innerText;

    addItemToCart(title, price, imageSrc, quantity, sku)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, quantity, sku) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
            <span class="cart-item-sku" style="display:none;">${sku}</span>
        </div>
        <span class="cart-price cart-column">£ ${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="${quantity ? quantity : 1}">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)

    userCart.push({
        itemTitle: title,
        itemPrice: parseFloat(price),
        itemQuant: quantity === "" ? 1 : parseInt(quantity)
    });

    window.snowplow('trackAddToCart',
                    sku,
                    title,
                    null,
                    parseFloat(price),
                    parseInt(quantity),
                    null);
}


function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('£', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)

        var title = cartRow.getElementsByClassName('cart-item-title')[0];
        userCart.forEach( function (elt) {
            if (title.innerText == elt['itemTitle']) {
                elt['itemQuant'] = quantity;
            }
        });
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '£' + total
}

function calcSubtotal (cart) {
    let prices = cart.map(function (elt) {
        return elt['itemPrice'] * elt['itemQuant'];
    });
    const summing = (acc, curr) => acc + curr;

    return prices.reduce(summing, 0);
}

function toUrlParams (obj) {
    var urlParams = new URLSearchParams(obj);

    return urlParams.toString();
}

function toCheckout () {
    if (userCart.length === 0) {
        alert("No items in your basket");

        return;
    } else {
        var res = {
            "subtotal": Math.round(calcSubtotal(userCart) * 100) / 100
        };
        var qString = toUrlParams(res);
        var action = 'checkout' + '?' + qString;

        window.location.href= window.location.href + action;
    }
}
