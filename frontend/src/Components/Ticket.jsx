import { useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ticketCart } from "../TicketContext";
import BookingCart from "./BookingCart";
import icc from "../assets/img/icc.png";

const Ticket = () => {
    const { 
        bookingCart, 
        setShowCart, 
        showAlert, 
        showMessage,
        setAlert, 
        ticket, 
        setTicket, 
        addToCart, 
        URL 
    } = ticketCart();

    const { match } = useParams();
    const navigate = useNavigate();

    const ticketTypes = [
        {
            label: "General",
            priceKey: "general_price",
            seatKey: "total_general_seats",
            borderColor: "border-white/10",
            hoverBorder: "hover:border-white/30",
            priceColor: "text-white/70",
            badgeBg: "bg-white/5",
            badgeText: "text-white/50",
            btnBg: "bg-white/10 hover:bg-white/20 text-white/80",
            icon: "⚪",
        },
        {
            label: "Standard",
            priceKey: "standard_price",
            seatKey: "total_standard_seats",
            borderColor: "border-blue-500/20",
            hoverBorder: "hover:border-blue-400/50",
            priceColor: "text-blue-400",
            badgeBg: "bg-blue-500/10",
            badgeText: "text-blue-400",
            btnBg: "bg-blue-600 hover:bg-blue-500 text-white",
            icon: "🔵",
        },
        {
            label: "First Class",
            priceKey: "firstClass_price",
            seatKey: "total_firstClass_seats",
            borderColor: "border-purple-500/20",
            hoverBorder: "hover:border-purple-400/50",
            priceColor: "text-purple-400",
            badgeBg: "bg-purple-500/10",
            badgeText: "text-purple-400",
            btnBg: "bg-purple-600 hover:bg-purple-500 text-white",
            icon: "💜",
        },
        {
            label: "VIP",
            priceKey: "VIP_price",
            seatKey: "total_VIP_seats",
            borderColor: "border-[#d4af37]/30",
            hoverBorder: "hover:border-[#d4af37]/70",
            priceColor: "text-[#d4af37]",
            badgeBg: "bg-[#d4af37]/10",
            badgeText: "text-[#d4af37]",
            btnBg: "bg-[#d4af37] hover:bg-[#e8c547] text-black",
            icon: "⭐",
        },
    ];

    useEffect(() => {
        if (!match) return;
        const fetchMatch = async () => {
            try {
                const response = await axios.get(`${URL}/api/tickets/match`, { params: { match } });
                setTicket(response.data);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchMatch();
    }, [match, URL, setTicket]);

    const totalCartItems = bookingCart.reduce((sum, item) => sum + item.quantity, 0);

    const handleAdd = (category) => {
        addToCart(ticket, category);
        setAlert(true);
    };

    if (!ticket) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white font-['Barlow_Condensed',sans-serif]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white/40 text-sm tracking-widest uppercase">Loading match...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif] text-white">

            {/* Alert Toast — only show "Added to cart", not booking confirmation */}
            <div className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] ${showAlert ? 'top-5' : '-top-20'}`}>
                <div className="bg-[#111] border border-[#d4af37]/40 rounded-lg px-5 py-3 flex items-center gap-3 shadow-2xl whitespace-nowrap">
                    <span className="text-[#d4af37] text-lg">✓</span>
                    <span className="text-white text-sm font-600">Added to cart!</span>
                    <button onClick={() => setAlert(false)} className="text-white/30 hover:text-white ml-2 text-xs cursor-pointer">✕</button>
                </div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-600 uppercase tracking-widest cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        <img src={icc} className="h-8 w-8 object-contain" alt="ICC" />
                        <span className="text-white font-800 text-sm uppercase tracking-widest hidden sm:block">Cricket Vault</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/my-tickets"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-800 text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-all active:scale-95 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                            </svg>
                            <span className="hidden sm:inline">My Tickets</span>
                        </Link>

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
                </div>
            </header>

            {/* Match Hero */}
            <div className="relative bg-gradient-to-b from-[#0f1f3d] to-[#0a0a0f] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,51,135,0.3),transparent_70%)]"></div>
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
                    <p className="text-white/40 text-xs font-600 uppercase tracking-widest" style={{fontFamily: "'Barlow', sans-serif"}}>
                        Select Category
                    </p>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {ticketTypes.map((cat, index) => {
                        const seatsLeft = ticket[cat.seatKey];
                        const isAvailable = seatsLeft > 0;
                        const inCart = bookingCart.find(i => i.match_id === ticket.match_id && i.ticket_category === cat.label);

                        return (
                            <div
                                key={index}
                                className={`group relative bg-[#111118] border rounded-xl overflow-hidden transition-all duration-300 ${
                                    isAvailable
                                        ? `${cat.borderColor} ${cat.hoverBorder}`
                                        : 'border-white/5 opacity-50'
                                }`}
                            >
                                {/* Top accent line */}
                                {isAvailable && (
                                    <div className={`absolute top-0 left-0 right-0 h-px`}
                                        style={{background: `linear-gradient(90deg, transparent, ${
                                            cat.label === 'VIP' ? '#d4af37' :
                                            cat.label === 'First Class' ? '#8b5cf6' :
                                            cat.label === 'Standard' ? '#3b82f6' : '#ffffff33'
                                        }, transparent)`}}
                                    ></div>
                                )}

                                <div className="p-6">
                                    {/* Header row */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] font-700 tracking-[0.3em] uppercase ${cat.badgeText}`}>
                                                {cat.label === 'General' ? 'Entry Level' :
                                                 cat.label === 'Standard' ? 'Mid Tier' :
                                                 cat.label === 'First Class' ? 'Premium' : 'Exclusive'}
                                            </span>
                                            <h3 className="text-white font-900 text-2xl uppercase tracking-wider leading-none">
                                                {cat.label}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-900 text-3xl leading-none ${cat.priceColor}`}>
                                                ${ticket[cat.priceKey]}
                                            </div>
                                            <div className="text-white/30 text-[10px] font-600 tracking-widest uppercase mt-1" style={{fontFamily:"'Barlow',sans-serif"}}>
                                                per ticket
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seats info */}
                                    <div className={`flex items-center gap-2 mb-5 px-3 py-2 rounded-lg ${cat.badgeBg}`}>
                                        <svg className={`w-3.5 h-3.5 ${cat.badgeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className={`text-xs font-600 ${cat.badgeText}`} style={{fontFamily:"'Barlow',sans-serif"}}>
                                            {isAvailable ? `${seatsLeft} seats available` : 'Sold Out'}
                                        </span>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        disabled={!isAvailable}
                                        onClick={() => handleAdd(cat)}
                                        className={`w-full py-3 rounded-lg font-800 text-sm uppercase tracking-[0.2em] transition-all duration-200 active:scale-95 ${
                                            isAvailable
                                                ? `${cat.btnBg} cursor-pointer`
                                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                                        }`}
                                    >
                                        {!isAvailable
                                            ? 'Sold Out'
                                            : inCart
                                            ? `Add Another · ${inCart.quantity} in Cart`
                                            : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <footer className="border-t border-white/5 mt-4 py-8 text-center">
                <p className="text-white/20 text-xs font-600 tracking-widest uppercase" style={{fontFamily: "'Barlow', sans-serif"}}>
                    © 2025 Cricket Vault · Blockchain Ticketing · ICC Champions Trophy
                </p>
            </footer>

            <BookingCart />
        </div>
    );
};

export default Ticket;