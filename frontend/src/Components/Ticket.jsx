import { useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ticketCart } from "../TicketContext";
import BookingCart from "./BookingCart";
import icc from "../assets/img/icc.png";

const Ticket = () => {
    // Simplified context usage
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
        { label: "General",     priceKey: "general_price",     seatKey: "total_general_seats",    color: "#6b7280", accent: "#9ca3af" },
        { label: "Standard",    priceKey: "standard_price",    seatKey: "total_standard_seats",   color: "#3b82f6", accent: "#60a5fa" },
        { label: "First Class", priceKey: "firstClass_price",  seatKey: "total_firstClass_seats", color: "#8b5cf6", accent: "#a78bfa" },
        { label: "VIP",         priceKey: "VIP_price",         seatKey: "total_VIP_seats",        color: "#d4af37", accent: "#f0d060" },
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

    // Schema-aligned Add To Cart
    const handleAdd = (category) => {
        addToCart(ticket, category);
        setAlert(true);
    };

    if (!ticket) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif] text-white">
            
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
                        {/* My Tickets */}
                        <Link
                            to="/my-tickets"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-800 text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-all active:scale-95"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                            </svg>
                            <span className="hidden sm:inline">My Tickets</span>
                        </Link>
 
                        {/* Cart */}
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
            

            
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {ticketTypes.map((cat, index) => {
                        const seatsLeft = ticket[cat.seatKey];
                        const isAvailable = seatsLeft > 0;
                        // Checking if this specific match and category is in the cart
                        const inCart = bookingCart.find(i => i.match_id === ticket.match_id && i.ticket_category === cat.label);

                        return (
                            <div key={index} className={`p-5 rounded-xl border ${isAvailable ? 'border-white/10' : 'opacity-50'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold uppercase">{cat.label}</h3>
                                    <span className="text-2xl font-black" style={{color: cat.accent}}>${ticket[cat.priceKey]}</span>
                                </div>
                                
                                <button
                                    disabled={!isAvailable}
                                    onClick={() => handleAdd(cat.label)}
                                    className="w-full py-3 rounded-lg font-bold uppercase tracking-widest transition-all"
                                    style={{
                                        background: isAvailable ? `linear-gradient(135deg, ${cat.color}, ${cat.accent})` : '#333',
                                        color: isAvailable ? '#000' : '#666'
                                    }}
                                >
                                    {isAvailable ? (inCart ? `Add Another (${inCart.quantity})` : 'Add to Cart') : 'Sold Out'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </main>
            <BookingCart />
        </div>
    );
};

export default Ticket;