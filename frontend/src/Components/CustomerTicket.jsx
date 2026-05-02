import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ticketCart } from "../TicketContext";
import icc from "../assets/img/icc.png";

const CustomerTicket = () => {
    const { URL } = ticketCart();
    const { bookingId } = useParams(); // or ipfsHash
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // Adjust this endpoint based on your backend logic
                const response = await axios.get(`${URL}/api/bookings/${bookingId}`);
                setBooking(response.data);
            } catch (error) {
                console.error("Error fetching booking", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, URL]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
            <p className="text-white/40 uppercase tracking-widest mb-4">Ticket Not Found</p>
            <button onClick={() => navigate('/')} className="text-[#d4af37] border border-[#d4af37] px-6 py-2 rounded-sm hover:bg-[#d4af37] hover:text-black transition-all">Go Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif] pb-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;600&display=swap');
                .ticket-cutout { clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 95% 75%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 5% 75%, 0% 70%); }
            `}</style>

            {/* Header */}
            <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <img src={icc} className="h-8 w-8" alt="ICC" />
                    <span className="text-white font-900 tracking-widest uppercase text-sm">Cricket Vault</span>
                </div>
                <button onClick={() => window.print()} className="bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-700 uppercase tracking-[0.2em] px-4 py-2 border border-white/10 rounded-sm transition-all">
                    Download PDF
                </button>
            </header>

            <main className="max-w-md mx-auto px-6 mt-8">
                {/* Status Badge */}
                <div className="text-center mb-8">
                    <div className="inline-block px-4 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-800 uppercase tracking-[0.3em] mb-2">
                        Confirmed & Verified
                    </div>
                    <h2 className="text-white text-2xl font-900 uppercase tracking-tight">Your Digital Entry</h2>
                </div>

                {/* The Ticket Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#d4af37]/20 to-transparent rounded-2xl blur opacity-30"></div>
                    
                    <div className="relative bg-[#111118] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        {/* Top Section */}
                        <div className="bg-[#d4af37] px-6 py-4 flex justify-between items-center">
                            <span className="text-black font-900 text-lg uppercase tracking-tighter">Match Ticket</span>
                            <span className="text-black/60 font-800 text-xs uppercase tracking-widest">#{booking.bookingId?.slice(-6) || 'N/A'}</span>
                        </div>

                        <div className="p-8">
                            {/* Match Info */}
                            <div className="flex justify-between items-center mb-8">
                                <div className="text-center">
                                    <img src={booking.img_team1} className="w-16 h-16 object-contain mb-2" alt={booking.team1} />
                                    <div className="text-white font-800 text-sm uppercase">{booking.team1}</div>
                                </div>
                                <div className="text-[#d4af37] font-900 text-xl italic">VS</div>
                                <div className="text-center">
                                    <img src={booking.img_team2} className="w-16 h-16 object-contain mb-2" alt={booking.team2} />
                                    <div className="text-white font-800 text-sm uppercase">{booking.team2}</div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-white/5 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/30 text-[10px] font-600 uppercase tracking-widest">Venue</p>
                                        <p className="text-white font-700 text-sm">{booking.venue}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/30 text-[10px] font-600 uppercase tracking-widest">Category</p>
                                        <p className="text-[#d4af37] font-700 text-sm uppercase">{booking.category}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/30 text-[10px] font-600 uppercase tracking-widest">Date</p>
                                        <p className="text-white font-700 text-sm">{booking.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/30 text-[10px] font-600 uppercase tracking-widest">Customer</p>
                                        <p className="text-white font-700 text-sm">{booking.customerName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Placeholder */}
                            <div className="mt-10 flex flex-col items-center">
                                <div className="bg-white p-3 rounded-lg mb-4">
                                    {/* Replace with actual QR component using booking.ipfsHash */}
                                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-black text-[10px] text-center font-bold">
                                        [QR CODE SCAN]
                                    </div>
                                </div>
                                <p className="text-white/20 text-[9px] font-mono break-all text-center">
                                    IPFS: {booking.ipfsHash}
                                </p>
                            </div>
                        </div>

                        {/* Footer Strip */}
                        <div className="bg-white/5 p-4 text-center border-t border-white/5">
                            <p className="text-white/40 text-[10px] font-600 tracking-[0.2em] uppercase">
                                Scan at Gate for Entry
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-8 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-[#d4af37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div>
                            <p className="text-white font-700 text-xs uppercase tracking-wider mb-1">Blockchain Secured</p>
                            <p className="text-white/40 text-[10px] leading-relaxed" style={{fontFamily: "'Barlow', sans-serif"}}>
                                This ticket is cryptographically signed and stored on IPFS. Any alteration will invalidate the digital signature.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerTicket;