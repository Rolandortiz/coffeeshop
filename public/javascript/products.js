document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('add-to-cart-button')) {
            event.preventDefault();
            const button = event.target;
            const productId = button.getAttribute('data-product-id');
            fetch(`/products/${productId}/cart`, {
                method: 'POST',
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Product added to cart successfully');

                    if (
                        data.image &&
                        data.category &&
                        data.title &&
                        data.price &&
                        data.quantity &&
                        data.productTotalPrice
                    ) {

                        const newProductHTML = `
              <div class="row mb-4 d-flex justify-content-between align-items-center">
                <div class="col-md-2 col-lg-2 col-xl-2">
                  <img src="${data.image}" class="img-fluid rounded-3" alt="">
                </div>
                <div class="col-md-3 col-lg-3 col-xl-3 title">
                  <p class="text-muted">${data.category}</p>
                  <p class="text-black mb-0">${data.title}</p>
                </div>
                <div class="col-md-6 col-lg-3 col-xl-2 d-flex">
                  <form onsubmit="updateCart(event, '${data.product}')">
                    <button class="btn btn-link px-2" onclick="this.parentNode.querySelector('input[type=number]').stepDown()">
                      <i class="fas fa-minus"></i>
                    </button>
                    <input type="hidden" name="originalQuantity" value="${data.quantity}">
                    <input id="update-quantity" min="1" name="quantity" value="${data.quantity}" type="number" class="update-quantity form-control form-control-sm" />
                    <button class="btn btn-link px-2" onclick="this.parentNode.querySelector('input[type=number]').stepUp()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </form>
                </div>
                <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                  <p class="price mb-0">$${data.price.toFixed(2)}</p>
                </div>
                <div class="col-md-1 col-lg-1 col-xl-1 text-end me-3 del">
                  <form onsubmit="deleteCart(event, '${data.product}')">
                    <button id="delete-product" type="submit"><i class="fas fa-times"></i></button>
                  </form>
                </div>
                <p class="total-product">Product Total Price: $${data.productTotalPrice.toFixed(2)}</p>
              </div>
              <hr class="border my-4">
            `;
                        const cartContainer = document.querySelector('.product');
                        const emptyCartMessage = document.querySelector('.cart-empty');
                        if (emptyCartMessage) {
                            emptyCartMessage.remove();
                        }
                        cartContainer.insertAdjacentHTML('beforebegin', newProductHTML);


                        const subTotalElement = document.getElementById('subTotal');
                        const currentTotalPrice = parseFloat(subTotalElement.textContent.replace('Total Price: $', ''));
                        const newTotalPrice = currentTotalPrice + data.productTotalPrice;
                        subTotalElement.textContent = `Total Price: $${newTotalPrice.toFixed(2)}`;
 const cartCountElement = document.querySelector('.notif');
            if (cartCountElement) {
              const currentCount = parseInt(cartCountElement.textContent);
              cartCountElement.textContent = (currentCount + 1).toString();
            }

                    } else {
                        console.error('Invalid response format:', data);
                    }
updateCart()
                })
                .catch((error) => {
                    console.error('An error occurred while adding the product to the cart:', error);
                });
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
  const updateCartForms = document.querySelectorAll('.update-cart-form');

  updateCartForms.forEach(function(updateCartForm) {
    const productId = updateCartForm.getAttribute('data-product-id');
 const originalQuantityInput = updateCartForm.querySelector('input[name="originalQuantity"]');


 const savedQuantity = localStorage.getItem(productId);
    if (savedQuantity) {
      originalQuantityInput.value = savedQuantity;
    }
    const decrementButtons = updateCartForm.querySelectorAll('.decrement-button');
    const incrementButtons = updateCartForm.querySelectorAll('.increment-button');

  decrementButtons.forEach(function(decrementButton) {
  decrementButton.addEventListener('click', function(event) {
    event.preventDefault();
    const quantityInput = event.currentTarget.parentNode.querySelector('.update-quantity');
    const currentValue = parseInt(quantityInput.value, 10);
    const newValue = currentValue - 1 >= 1 ? currentValue - 1 : 1;
    quantityInput.value = newValue;
 localStorage.setItem(productId, newValue);
    updateCart(event, productId);
  });
});

incrementButtons.forEach(function(incrementButton) {
  incrementButton.addEventListener('click', function(event) {
    event.preventDefault();
    const quantityInput = event.currentTarget.parentNode.querySelector('.update-quantity');
    const currentValue = parseInt(quantityInput.value, 10);
    const newValue = currentValue + 1;
    quantityInput.value = newValue;
  localStorage.setItem(productId, newValue);
    updateCart(event, productId);
  });
});

    updateCartForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const originalQuantityInput = updateCartForm.querySelector('input[name="originalQuantity"]');
      updateCart(event, productId, originalQuantityInput.value);
    });
  });

 function updateCart(event, productId, originalQuantity) {
  try {
    event.preventDefault();

    const form = event.target;
    const productContainer = form.closest('.cart-products');

    const quantityInput = productContainer.querySelector('.update-quantity');
        const quantity = parseInt(quantityInput.value, 10);


    const productPriceElement = form.closest('.row').querySelector('.price');
    const productPrice = parseFloat(productPriceElement.innerText.replace('$', ''));
    const productTotalPriceElement = form.closest('.row').querySelector('.total-product');
    const newProductTotalPrice = productPrice * quantity;


    productTotalPriceElement.innerText = `Product Total Price: $${newProductTotalPrice.toFixed(2)}`;


    const productTotalPriceElements = document.querySelectorAll('.total-product');
    let subTotal = 0;
    productTotalPriceElements.forEach((element) => {
        const price = parseFloat(element.innerText.replace('Product Total Price: $', ''));
        subTotal += price;
    });


    const subTotalElement = document.querySelector('.sub-total');
    const totalPrice = subTotal;
    subTotalElement.innerText = `Total Price: $${totalPrice.toFixed(2)}`;


    $.ajax({
      type: 'POST',
      url: `/cart/${productId}/update`,
      data: {quantity: quantity, totalPrice: totalPrice},
      success: function(response) {
        console.log('Cart updated successfully');
        fetch('/cart/update', {
          method: 'PATCH',
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Cart updated successfully');
          })
          .catch((error) => {
            console.error('An error occurred while updating the cart:', error);
          });
      },
      error: function(error) {
        console.error('An error occurred during cart update:', error);
      },
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

});



   const icon = document.querySelector('.icon')
                const container = document.querySelector('.cart-products')

                if (container && container.childElementCount > 0) {
                    icon.classList.add('active');
                }

const deleteForms = document.querySelectorAll('.delete-form');
deleteForms.forEach((form) => {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const productId= form.getAttribute('data-product-id');
console.log(productId)
    deleteCart(event, productId);
  });
});

function deleteCart(event, productId) {
  try {
    const form = event.target;
    const row = form.closest('.row');
    const hrElement = row.nextElementSibling;
    const deleting = document.querySelectorAll('.delete-product');
    if (!deleting) {
      console.error('There is nothing to delete');
      return;
    }

    row.remove();
    if (hrElement && hrElement.classList.contains('border')) {
      hrElement.remove();
    }

    const productTotalPriceElements = document.querySelectorAll('.total-product');
    let subTotal = 0;
    productTotalPriceElements.forEach((element) => {
      const price = parseFloat(element.innerText.replace('Product Total Price: $', ''));
      subTotal += price;
    });

    const subTotalElement = document.querySelector('.sub-total');
    const totalPrice = Math.max(0, subTotal);
    subTotalElement.innerText = `Total Price: $${totalPrice.toFixed(2)}`;

    $.ajax({
      type: 'POST',
      url: `/cart/${productId}/delete`,
      success: function (response) {
        console.log('Product deleted successfully');

 const cartCountElement = document.querySelector('.notif');
            if (cartCountElement) {
              const currentCount = parseInt(cartCountElement.textContent);
              cartCountElement.textContent = (currentCount - 1).toString();
            }
        updateCart();
      },
      error: function (error) {
        console.error('An error occurred during product deletion:', error);

      },
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function updateCart() {
  fetch('/cart/update', {
    method: 'PATCH',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Cart updated successfully');
    })
    .catch((error) => {
      console.error('An error occurred while updating the cart:', error);
    });
}





(function ($) {
    "use strict";
    var fullHeight = function () {
        $(".js-fullheight").css("height", $(window).height());
        $(window).resize(function () {
            $(".js-fullheight").css("height", $(window).height());
        });
    };
    fullHeight();
    $("#sidebarCollapse").on("click", function () {
        $("#sidebar").toggleClass("active");
    });
})(jQuery);




