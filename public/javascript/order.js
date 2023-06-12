var stripe = Stripe('pk_test_51NBUeuKIAap6PevkXRO1FHavYGMCu5nPcc3GQGeBSHmnzhg6qZjvDwhTYotdKXmiiGypNVcY4YLTNOZ4rcs3s9dy00qgHaIJxR');
var checkoutButton = document.getElementById('checkout-button');

    checkoutButton.addEventListener('click', function (event) {
 const button = event.target;
            const orderId = button.getAttribute('data-product-id');
var requestBody = {
        orderId: orderId,
    };
        fetch('/payment', {
method: "POST",
    headers: { "Content-type": "application/json" },

    body: JSON.stringify(requestBody),
})
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Request failed with status: " + response.status);
        }
        return response.json();
    })
    .then(function (session) {
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function (result) {
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(function (error) {
        console.log("Error", error);
    });

    });


    let url_to_head = (url) => {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = url;
            script.onload = function() {
                resolve();
            };
            script.onerror = function() {
                reject('Error loading script.');
            };
            document.head.appendChild(script);
        });
    };

    let handle_close = (event) => {
        event.target.closest(".ms-alert").remove();
    };

    let handle_click = (event) => {
        if (event.target.classList.contains("ms-close")) {
            handle_close(event);
        }
    };

    document.addEventListener("click", handle_click);

    const paypal_sdk_url = "https://www.paypal.com/sdk/js";
    const client_id = "ARWl3thZ7jIojKvDMT_abu_PK9gLQUKIsZtPOS30BH6pnrPE5eRonnxECNSgcFFDPLreS4UoX7rflFYI";
    const currency = "USD";
    const intent = "capture";
    let alerts = document.getElementById("alerts");

    // Function to extract the order ID from the payment_options element
    function getOrderID() {
        const paymentOptions = document.getElementById("payment_options");
        return paymentOptions.dataset.productId; // Retrieve the order ID from the data-product-id attribute
    }


    //PayPal Code
    url_to_head(
        `${paypal_sdk_url}?client-id=${client_id}&enable-funding=venmo&currency=${currency}&intent=${intent}`
    )
        .then(() => {
            document.getElementById("loading").classList.add("hide");
            document.getElementById("content").classList.remove("hide");
            let alerts = document.getElementById("alerts");
            let paypal_buttons = paypal.Buttons({
                onClick: (data) => {
                    // Custom JS here
                },
                style: {
                    shape: 'rect',
                    color: 'white',
                    layout: 'vertical',
                    label: 'paypal'
                },

    createOrder: function(data, actions) {

  const orderId = getOrderID();
  if (!orderId) {
    throw new Error('Expected an order ID to be passed');
  }
 const totalPriceElement = document.getElementById('total_price');
  const totalPriceString = totalPriceElement.textContent.replace('$', ''); // Remove the dollar sign
  const totalPrice = parseFloat(totalPriceString);
  return actions.order.create({
    purchase_units: [{
      reference_id: orderId,
      amount: {
        currency_code: currency,  // Use the currency variable from client-side code
        value:  totalPrice.toString(),  // Pass the total price value from the server-side code
      }
    }]
  });
},
                onApprove: function(data, actions) {
                    let order_id = data.orderId;

                    return fetch("http://localhost:3000/complete_order", {
                        method: "post",
                        headers: { "Content-Type": "application/json; charset=utf-8" },
                        body: JSON.stringify({
                            "intent": intent,
                            "order_id": order_id
                        })
                    })
                        .then((response) => response.json())
                        .then((order_details) => {
                            let intent_object = intent === "authorize" ? "authorizations" : "captures";
                            alerts.innerHTML = `<div class='ms-alert ms-action'>Thank you ${order_details.payer.name.given_name} ${order_details.payer.name.surname} for your payment of ${order_details.purchase_units[0].payments[intent_object][0].amount.value} ${order_details.purchase_units[0].payments[intent_object][0].amount.currency_code}!</div>`;
                            paypal_buttons.close();
                        })
                        .catch((error) => {
                            console.log(error);
                            alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>An Error Occurred!</p></div>`;
                        });
                },

                onCancel: function(data) {
                    alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>Order cancelled!</p></div>`;
                },

                onError: function(err) {
                    console.log(err);
                }
            });
            paypal_buttons.render('#payment_options');
        })
        .catch((error) => {
            console.error(error);
        });

