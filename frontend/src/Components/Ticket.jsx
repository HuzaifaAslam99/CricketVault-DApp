import { useEffect, useState } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { ticketCart } from "../TicketContext";
import BookingCart from "./Booking"; // Import the new component
import icc from "../assets/img/icc.png";

const TicketEnvelope = () => {
    // Accessing context
    const { showCart, setShowCart, showMessage, showAlert, setAlert, ticket, setTicket, setCategory, URL } = ticketCart();

    const { match } = useParams();

    const ticketTypes = [
        { label: "General", priceKey: "general_price", seatKey: "total_general_seats" },
        { label: "Standard", priceKey: "standard_price", seatKey: "total_standard_seats" },
        { label: "First Class", priceKey: "firstClass_price", seatKey: "total_firstClass_seats" },
        { label: "VIP", priceKey: "VIP_price", seatKey: "total_VIP_seats" }
    ];

    useEffect(() => {
        if (!match) return; 
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`${URL}/api/tickets/match`, {
                    params: { match }
                });
                setTicket(response.data);
            } catch (err) {
                console.error("Error fetching Ticket details", err);
            } 
        };
        fetchOrderDetails();
    }, [match]);

  
    if (!ticket) return <div className="p-10 text-center text-white">Loading Match Details...</div>;

    return (
  
        <div className="relative w-full min-h-screen bg-zinc-900 p-10 flex flex-row flex-wrap gap-8 justify-center content-start">


        <div
            className={`w-80 h-20 bg-red-500 z-50 text-white fixed flex justify-center items-center left-1/2 -translate-x-1/2 rounded-[8px]
              transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)]
              ${ showAlert ? 'top-5 translate-y-0' : 'top-0 -translate-y-full'}`}
          >
            <h1 onClick={()=>{setAlert(false)}} 
            className="absolute top-2 right-3 cursor-pointer text-sm font-bold opacity-70 hover:opacity-100">
              X
            </h1>
            <p>{showMessage}</p>
        </div>

            
            {ticketTypes.map((category, index) => {
                const seatsLeft = ticket[category.seatKey];
                const isAvailable = seatsLeft > 0;

                return (
                    <div key={index} className="flex h-64 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
                        {/* Left Section */}
                        <div className="bg-blue-600 flex w-1/3 flex-col items-center justify-between py-4 border-r-2 border-dashed border-gray-300 text-white">
                            <img src={icc} className="w-12" alt="ICC" />
                            <div className="text-[13px] font-bold tracking-widest [writing-mode:vertical-rl] uppercase opacity-80">
                                ICC CHAMPIONS TROPHY
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="w-2/3 flex flex-col px-5 justify-around py-4">
                            <div className="flex items-center justify-between">
                                <span className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white uppercase">{category.label} TICKET</span>
                                {isAvailable ? (
                                    <span className="text-[10px] font-bold text-green-600">● AVAILABLE</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-red-500">● SOLD OUT</span>
                                )}
                            </div>

                            <div className="text-2xl font-black uppercase text-gray-900 flex flex-row gap-2 items-center">
                                <img src={ticket.img_team1} className="h-8" alt="" />
                                <p>{ticket.team1}</p> 
                                <span className="text-gray-400 text-sm">vs</span> 
                                <p>{ticket.team2}</p>
                                <img src={ticket.img_team2} className="h-8" alt="" />
                            </div>

                            <div className="flex flex-col gap-[2px] text-xs text-gray-600">
                                <p><strong>VENUE:</strong> {ticket.venue}</p>
                                <p><strong>CITY:</strong> {ticket.city}</p>
                                <p><strong>DATE:</strong> {ticket.date}</p>
                                <p><strong>Ticket Category:</strong> {category.label}</p>
                            </div>

                            <div className="flex flex-row justify-between items-center border-t pt-3">
                                <div className="flex flex-row justify-center items-center text-xl font-bold text-gray-900">
                                    {ticket[category.priceKey]} 
                                    <div className="text-[16px] text-gray-500">$</div>
                                </div>

                                {isAvailable ? (
                                    <button 
                                        onClick={() => {setShowCart(true), setTicket(ticket), setCategory(category)}} // Fixed function call
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                                    >
                                        BUY NOW
                                    </button>
                                ) : (
                                    <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed">
                                        SOLD OUT
                                    </button>
                                )}
                            </div>
                        </div> 
                    </div>
                );
            })}

            {showCart && (
                <BookingCart/>
            )}

        </div>
    );
};

export default TicketEnvelope;