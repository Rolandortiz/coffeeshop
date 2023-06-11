function addToCart(event, productId) {
    event.preventDefault();

    const form = event.target;


    const addToCart = document.getElementById('addToCart');
    if (!addToCart) {
        console.error('There is nothing to delete');
        return;
    }


    $.ajax({
        type: 'POST',
        url: `/products/${id}/cart`,
        success: function (response) {
            console.log('Cart Added');
        },
        error: function (error) {
            console.error('An error occurred during product adding:', error);
        }
    });
}


