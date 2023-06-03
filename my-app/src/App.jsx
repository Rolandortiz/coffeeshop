
// import "./App.css"
// import "./cart.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [cartProducts, setCartProducts] = useState([{}]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetch('http://localhost:3000/cart')
      .then(response => response.json())
      .then(data => {
        setCartProducts(data.cartProducts);
        setTotalPrice(data.totalPrice);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <>
      <div className="wrapper d-flex justify-content-center align-items-center">
        <div className="Sidebar">
          <h1>Cart</h1>
          {cartProducts.map(product => (
            <div key={product.id}>
              <h3>{product.title}</h3>
              <p>Quantity: {product.quantity}</p>
              <p>Price: ${product.price}</p>
              <p>Total Price: ${product.productTotalPrice}</p>
            </div>
          ))}
          <p>Total Price: ${totalPrice}</p>
        </div>
      </div>
    </>
  );
}

export default App;
