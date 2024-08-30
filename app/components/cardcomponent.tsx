import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle } from 'lucide-react';

function CartComponent({ item }) {
    const [cart, setCart] = useState([]);

    const addItemToCart = () => {
        setCart(prev => [...prev, item]);

        toast.success(<div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="green" size={24} strokeWidth={1.5} style={{ marginRight: 8 }} />
            Item added to cart
        </div>, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    return (
        <button onClick={addItemToCart} className="p-2 bg-blue-500 text-white rounded">
            Add to Cart
        </button>
    );
}

export default CartComponent;
