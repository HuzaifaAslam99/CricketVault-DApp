import { useEffect, useState } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { ticketCart } from "../TicketContext";
import BookingCart from "./BookingCart";
import icc from "../assets/img/icc.png";

const Ticket = () => {
    const { bookingCart, setShowCart, showMessage, showAlert, setAlert, ticket, setTicket, addToCart, URL } = ticketCart();
    const { match } = useParams();
    const navigate = useNavigate();

    const ticketTypes = [
        { label: "General",     priceKey: "general_price",    seatKey: "total_general_seats",    color: "#6b7280", accent: "#9ca3af" },
        { label: "Standard",    priceKey: "standard_price",   seatKey: "total_standard_seats",   color: "#3b82f6", accent: "#60a5fa" },
        { label: "First Class", priceKey: "firstClass_price", seatKey: "total_firstClass_seats", color: "#8b5cf6", accent: "#a78bfa" },
        { label: "VIP",         priceKey: "VIP_price",        seatKey: "total_VIP_seats",        color: "#d4af37", accent: "#f0d060" },
    ];

    useEffect(() => {
        if (!match) return;
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`${URL}/api/tickets/match`, { params: { match } });
                setTicket(response.data);
            } catch (err) {
                console.error("Error fetching Ticket details", err);
            }
        };
        fetchOrderDetails();
    }, [match]);

    const totalCartItems = bookingCart.reduce((sum, item) => sum + item.quantity, 0);

    const handleAddToCart = (ticket, category) => {
        addToCart(ticket, category);
        setAlert(true);
        // We set message through context if desired — using inline toast instead
    };

    if (!ticket) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center font-['Barlow_Condensed',sans-serif]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500&display=swap');`}</style>
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/40 text-sm font-600 uppercase tracking-widest">Loading Match Details...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500&display=swap');
                .ticket-row { animation: fadeUp 0.4s ease both; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .added-ring { animation: ringPop 0.4s cubic-bezier(0.34,1.5,0.64,1); }
                @keyframes ringPop { from { box-shadow: 0 0 0 0px rgba(212,175,55,0.6); } to { box-shadow: 0 0 0 12px rgba(212,175,55,0); } }
            `}</style>

            {/* Alert Toast */}
            <div className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] ${showAlert ? 'top-5' : '-top-20'}`}>
                <div className="bg-[#111] border border-[#d4af37]/40 rounded-lg px-5 py-3 flex items-center gap-3 shadow-2xl">
                    <span className="text-[#d4af37] text-lg">✓</span>
                    <span className="text-white text-sm font-600">{showMessage || "Added to cart!"}</span>
                    <button onClick={() => setAlert(false)} className="text-white/30 hover:text-white ml-2 text-xs">✕</button>
                </div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-600 uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        <img src={icc} className="h-8 w-8 object-contain" alt="ICC" />
                        <span className="text-white font-800 text-sm uppercase tracking-widest hidden sm:block">Cricket Vault</span>
                    </div>

                    <button
                        onClick={() => setShowCart(true)}
                        className="relative flex items-center gap-2 bg-[#d4af37] hover:bg-[#e8c547] text-black font-800 text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Cart</span>
                        {totalCartItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-900 w-5 h-5 rounded-full flex items-center justify-center">
                                {totalCartItems}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Match Hero */}
            <div className="relative bg-gradient-to-b from-[#0f1f3d] to-[#0a0a0f] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,51,135,0.3),transparent_70%)]"></div>
                {/* decorative stripes */}
                <div className="absolute right-0 top-0 h-full w-48 opacity-[0.03]">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute h-full w-px bg-white" style={{right: `${i * 32}px`}}></div>
                    ))}
                </div>
                <div className="max-w-5xl mx-auto px-6 py-14 relative z-10">
                    <p className="text-[#d4af37] text-[10px] font-700 tracking-[0.4em] uppercase mb-6">ICC Champions Trophy 2025</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-8">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden p-2">
                                <img src={ticket.img_team1} className="w-full h-full object-contain" alt={ticket.team1} />
                            </div>
                            <span className="text-white font-900 text-xl sm:text-2xl uppercase tracking-widest">{ticket.team1}</span>
                        </div>

                        <div className="text-center">
                            <div className="text-[#d4af37] font-900 text-3xl sm:text-4xl tracking-widest">VS</div>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden p-2">
                                <img src={ticket.img_team2} className="w-full h-full object-contain" alt={ticket.team2} />
                            </div>
                            <span className="text-white font-900 text-xl sm:text-2xl uppercase tracking-widest">{ticket.team2}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/50 text-xs sm:text-sm" style={{fontFamily:"'Barlow',sans-serif"}}>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {ticket.venue}, {ticket.city}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {ticket.date}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ticket Categories */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-white font-900 text-2xl uppercase tracking-widest">Select Category</h2>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {ticketTypes.map((cat, index) => {
                        const seatsLeft = ticket[cat.seatKey];
                        const isAvailable = seatsLeft > 0;
                        const inCart = bookingCart.find(i => i.ticket.match === ticket.match && i.category.label === cat.label);

                        return (
                            <div
                                key={index}
                                className={`ticket-row relative rounded-xl overflow-hidden border transition-all duration-300 ${
                                    isAvailable
                                        ? 'border-white/8 hover:border-opacity-60 bg-[#111118]'
                                        : 'border-white/4 bg-[#0d0d12] opacity-60'
                                }`}
                                style={{
                                    animationDelay: `${index * 0.08}s`,
                                    borderColor: isAvailable && inCart ? cat.color + '60' : undefined
                                }}
                            >
                                {/* Color accent bar */}
                                <div className="h-1 w-full" style={{background: isAvailable ? `linear-gradient(90deg, ${cat.color}, ${cat.accent})` : '#333'}}></div>

                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-900 text-lg uppercase tracking-wider">{cat.label}</span>
                                                {inCart && (
                                                    <span className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[9px] font-800 tracking-widest uppercase px-2 py-0.5 rounded-sm">
                                                        In Cart ({inCart.quantity})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/30 text-xs font-600 uppercase tracking-widest" style={{fontFamily:"'Barlow',sans-serif"}}>
                                                {isAvailable ? `${seatsLeft} seats left` : 'Sold Out'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-900 leading-none" style={{color: isAvailable ? cat.accent : '#555'}}>
                                                ${ticket[cat.priceKey]}
                                            </div>
                                            <div className="text-white/30 text-[10px] font-600 uppercase tracking-widest mt-0.5">per ticket</div>
                                        </div>
                                    </div>

                                    {/* Features per tier */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {cat.label === "VIP" && ["Premium Lounge", "Catering", "Best View"].map(f => (
                                            <span key={f} className="text-[10px] font-700 uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/5 text-white/40">{f}</span>
                                        ))}
                                        {cat.label === "First Class" && ["Covered Stand", "F&B Access", "Priority Entry"].map(f => (
                                            <span key={f} className="text-[10px] font-700 uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/5 text-white/40">{f}</span>
                                        ))}
                                        {cat.label === "Standard" && ["Reserved Seat", "General Entry"].map(f => (
                                            <span key={f} className="text-[10px] font-700 uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/5 text-white/40">{f}</span>
                                        ))}
                                        {cat.label === "General" && ["Open Stand", "Ground View"].map(f => (
                                            <span key={f} className="text-[10px] font-700 uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/5 text-white/40">{f}</span>
                                        ))}
                                    </div>

                                    {isAvailable ? (
                                        <button
                                            onClick={() => { addToCart(ticket, cat); }}
                                            className="w-full py-3 rounded-lg font-800 text-sm uppercase tracking-widest transition-all duration-200 active:scale-95 cursor-pointer"
                                            style={{
                                                background: inCart ? `${cat.color}22` : `linear-gradient(135deg, ${cat.color}, ${cat.accent})`,
                                                color: inCart ? cat.accent : '#000',
                                                border: inCart ? `1px solid ${cat.color}50` : 'none'
                                            }}
                                        >
                                            {inCart ? `+ Add Another` : `Add to Cart`}
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-3 rounded-lg font-800 text-sm uppercase tracking-widest bg-white/5 text-white/20 cursor-not-allowed">
                                            Sold Out
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View Cart CTA */}
                {totalCartItems > 0 && (
                    <div className="mt-8 sticky bottom-4">
                        <button
                            onClick={() => setShowCart(true)}
                            className="w-full bg-[#d4af37] hover:bg-[#e8c547] text-black font-900 text-base uppercase tracking-widest py-4 rounded-xl shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            View Cart · {totalCartItems} {totalCartItems === 1 ? 'Ticket' : 'Tickets'}
                        </button>
                    </div>
                )}
            </main>

            <BookingCart />
        </div>
    );
};

export default Ticket;
