import { ticketCart } from "../TicketContext";

const EmptyCart = () => {
    const { setShowCart } = ticketCart();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-['Barlow_Condensed',sans-serif]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&display=swap');`}</style>
            <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div>
                        <h3 className="text-white font-900 text-lg uppercase tracking-widest">Booking Cart</h3>
                        <p className="text-white/30 text-xs font-600 uppercase tracking-wider">0 items</p>
                    </div>
                    <button
                        onClick={() => setShowCart(false)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-lg leading-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Empty State */}
                <div className="px-6 py-14 flex flex-col items-center text-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-white/3 border border-white/8 flex items-center justify-center">
                            <svg className="w-9 h-9 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center">
                            <span className="text-[#d4af37] text-xs font-900">0</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-white font-800 text-base uppercase tracking-widest mb-1">Your Cart is Empty</p>
                        <p className="text-white/30 text-xs" style={{fontFamily:"'Barlow',sans-serif"}}>
                            Browse matches and add tickets to get started
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCart(false)}
                        className="bg-[#d4af37] hover:bg-[#e8c547] text-black font-800 text-xs uppercase tracking-widest px-8 py-3 rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                        Browse Matches
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmptyCart;
