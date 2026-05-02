import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ticketCart } from "../TicketContext";
import icc from "../assets/img/icc.png";

const Dashboard = () => {
    const { URL, bookingCart, setShowCart } = ticketCart();
    const [TicketArray, setTicketArray] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${URL}/api/tickets`);
                setTicketArray(response.data);
            } catch (error) {
                console.error("Error fetching Tickets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const totalCartItems = bookingCart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif]">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500&display=swap');
                
                .card-glow:hover {
                    box-shadow: 0 0 40px rgba(212, 175, 55, 0.15), 0 20px 60px rgba(0,0,0,0.5);
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .ticket-card {
                    animation: fadeUp 0.5s ease both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .badge-pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                .cart-bounce {
                    animation: bounce 0.4s cubic-bezier(0.34,1.5,0.64,1);
                }
                @keyframes bounce {
                    from { transform: scale(0.7); }
                    to { transform: scale(1); }
                }
                .noise-bg::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 0;
                }
            `}</style>

            <div className="noise-bg">
                {/* ── HEADER ── */}
                <header className="relative border-b border-white/5 backdrop-blur-md bg-black/40 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={icc} className="h-10 w-10 object-contain" alt="ICC" />
                            <div>
                                <div className="text-[10px] font-600 tracking-[0.3em] text-[#d4af37] uppercase">ICC</div>
                                <div className="text-white font-900 text-xl leading-none tracking-wider uppercase">Champions Trophy</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-1 text-white/40 text-xs font-600 tracking-widest uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] badge-pulse inline-block mr-1"></span>
                                Tickets Live
                            </div>

                            {/* Cart Button */}
                            <button
                                onClick={() => setShowCart(true)}
                                className="relative flex items-center gap-2 bg-[#d4af37] hover:bg-[#e8c547] text-black font-800 text-sm uppercase tracking-widest px-5 py-2.5 rounded-sm transition-all duration-200 active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Cart</span>
                                {totalCartItems > 0 && (
                                    <span className="cart-bounce absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-900 w-5 h-5 rounded-full flex items-center justify-center">
                                        {totalCartItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* ── HERO STRIP ── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1117] via-[#111827] to-[#0d1117] border-b border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]"></div>
                    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                        <p className="text-[#d4af37] text-xs font-700 tracking-[0.4em] uppercase mb-3">2025 Edition</p>
                        <h1 className="text-white font-900 text-4xl md:text-6xl uppercase leading-none tracking-tight mb-4">
                            Select Your<br />
                            <span className="text-[#d4af37]">Match</span>
                        </h1>
                        <p className="text-white/40 font-400 text-sm max-w-md" style={{fontFamily: "'Barlow', sans-serif"}}>
                            Secure your seat at the biggest cricket event of the year. Blockchain-verified tickets, instant delivery.
                        </p>
                    </div>
                    {/* Decorative lines */}
                    <div className="absolute right-0 top-0 h-full w-64 opacity-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="absolute h-full w-px bg-white" style={{right: `${i * 32}px`}}></div>
                        ))}
                    </div>
                </div>

                {/* ── MATCH GRID ── */}
                <main className="max-w-7xl mx-auto px-6 py-12">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 rounded-xl bg-white/5 shimmer"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-white/40 text-xs font-600 uppercase tracking-widest" style={{fontFamily: "'Barlow', sans-serif"}}>
                                    {TicketArray.length} Matches Available
                                </p>
                                <div className="h-px flex-1 bg-white/5 mx-4"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {TicketArray.map((match, index) => (
                                    <Link
                                        key={index}
                                        to={`match/${match.match}`}
                                        className="ticket-card card-glow group block bg-[#111118] border border-white/8 rounded-xl overflow-hidden hover:border-[#d4af37]/40 transition-all duration-300 cursor-pointer"
                                        style={{ animationDelay: `${index * 0.07}s` }}
                                    >
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-[#0f3460] to-[#1a4a8a] px-5 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <img src={icc} className="h-6 w-6 object-contain opacity-90" alt="ICC" />
                                                <span className="text-white/70 text-[10px] font-700 tracking-[0.25em] uppercase">ICC Champions Trophy</span>
                                            </div>
                                            <span className="text-[#d4af37] text-[10px] font-700 tracking-widest uppercase">2025</span>
                                        </div>

                                        {/* Teams */}
                                        <div className="px-5 py-6">
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <div className="flex flex-col items-center gap-2 flex-1">
                                                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1 group-hover:border-[#d4af37]/30 transition-colors">
                                                        <img src={match.img_team1} className="w-full h-full object-contain" alt={match.team1} />
                                                    </div>
                                                    <span className="text-white font-800 text-sm uppercase tracking-wider leading-none text-center">{match.team1}</span>
                                                </div>

                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="text-[#d4af37] font-900 text-lg uppercase">VS</div>
                                                    <div className="w-8 h-px bg-white/10"></div>
                                                </div>

                                                <div className="flex flex-col items-center gap-2 flex-1">
                                                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1 group-hover:border-[#d4af37]/30 transition-colors">
                                                        <img src={match.img_team2} className="w-full h-full object-contain" alt={match.team2} />
                                                    </div>
                                                    <span className="text-white font-800 text-sm uppercase tracking-wider leading-none text-center">{match.team2}</span>
                                                </div>
                                            </div>

                                            {/* Match Info */}
                                            <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-white/50 text-xs" style={{fontFamily: "'Barlow', sans-serif"}}>
                                                    <svg className="w-3.5 h-3.5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="font-600">{match.venue}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/50 text-xs" style={{fontFamily: "'Barlow', sans-serif"}}>
                                                    <svg className="w-3.5 h-3.5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-600">{match.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="px-5 pb-5">
                                            <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg py-2.5 text-center group-hover:bg-[#d4af37]/20 transition-all">
                                                <span className="text-[#d4af37] font-800 text-xs uppercase tracking-[0.2em]">View Tickets →</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </main>

                {/* ── FOOTER ── */}
                <footer className="border-t border-white/5 mt-12 py-8 text-center">
                    <p className="text-white/20 text-xs font-600 tracking-widest uppercase" style={{fontFamily: "'Barlow', sans-serif"}}>
                        © 2025 Cricket Vault · Blockchain Ticketing · ICC Champions Trophy
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
