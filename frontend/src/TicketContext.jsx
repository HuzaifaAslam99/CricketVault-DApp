import React, { createContext, useEffect, useState, useContext } from 'react';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {

    const [showCart, setShowCart] = useState(false) 
    const [showMessage, setMessage] = useState("")
    const [showAlert, setAlert] = useState(false)

    const [ticket, setTicket] = useState(null);
    const [category, setCategory] = useState(null);

  return (
    <TicketContext.Provider value={{ showCart, setShowCart, showMessage, setMessage, showAlert, setAlert,
        ticket, setTicket, category, setCategory
     }}>
      {children}
    </TicketContext.Provider>
  );

};

export const ticketCart = () => useContext(TicketContext);