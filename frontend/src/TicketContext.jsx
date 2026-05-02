import React, { createContext, useState, useContext } from 'react';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {

    const [bookingCart, setBookingCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showMessage, setMessage] = useState("");
    const [showAlert, setAlert] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [category, setCategory] = useState(null);

    const displayCart = bookingCart.length > 0;

    const URL = "https://cricket-vault-dapp-backend.vercel.app";

    const addToCart = (ticket, category) => {
        setBookingCart(prev => {
            const existing = prev.find(
                item => item.ticket.match === ticket.match && item.category.label === category.label
            );
            if (existing) {
                return prev.map(item =>
                    item.ticket.match === ticket.match && item.category.label === category.label
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ticket, category, quantity: 1 }];
        });
    };

    const removeFromCart = (matchId, categoryLabel) => {
        setBookingCart(prev =>
            prev.filter(item => !(item.ticket.match === matchId && item.category.label === categoryLabel))
        );
    };

    const updateQuantity = (matchId, categoryLabel, quantity) => {
        if (quantity < 1) return;
        setBookingCart(prev =>
            prev.map(item =>
                item.ticket.match === matchId && item.category.label === categoryLabel
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setBookingCart([]);

    return (
        <TicketContext.Provider value={{
            bookingCart, setBookingCart,
            showCart, setShowCart,
            showMessage, setMessage,
            showAlert, setAlert,
            ticket, setTicket,
            category, setCategory,
            displayCart,
            addToCart, removeFromCart, updateQuantity, clearCart,
            URL
        }}>
            {children}
        </TicketContext.Provider>
    );
};

export const ticketCart = () => useContext(TicketContext);
