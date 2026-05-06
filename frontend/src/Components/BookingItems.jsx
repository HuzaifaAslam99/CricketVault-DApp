import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { ticketCart } from "../TicketContext";
import { contract_address, ticket_abi } from "../constants";

const BookingItems = () => {
    const { bookingCart, setShowCart, setMessage, setAlert, removeFromCart, updateQuantity, clearCart, URL } = ticketCart();

    const [step, setStep] = useState("cart"); // "cart" | "form" | "processing"
    const [processingMessage, setProcessingMessage] = useState("Initiating booking...");
    const [customer, setCustomer] = useState({
        firstName: "", lastName: "", email: "", phone: "", city: "", address: ""
    });

    const handleChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });

    const grandTotal = bookingCart.reduce((sum, item) => sum + item.ticket[item.category.priceKey] * item.quantity, 0);
    const totalTickets = bookingCart.reduce((sum, item) => sum + item.quantity, 0);

    const fetchEthPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            return data.ethereum.usd;
        } catch {
            return 2340;
        }
    };

    
const handleCheckout = async (e) => {
    e.preventDefault();
    setStep("processing");

    if (!window.ethereum) {
        setMessage("Please install MetaMask!");
        setAlert(true);
        setStep("form");
        return;
    }

    try {
        // 1. Ensure correct network
        const targetChainId = "0x14a34";
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        if (currentChainId !== targetChainId) {
            await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainId }] });
        }

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const contract = new ethers.Contract(contract_address, ticket_abi, signer);

        setProcessingMessage("Initiating secure booking...");

        // console.log("Match: ",item.ticket.match)

        // 2. Single API Call for the entire cart
        const response = await axios.post(`${URL}/api/customersBooking/initiate`, {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            city: customer.city,
            address: customer.address,
            wallet_address: signer.address,
            amount: grandTotal, 
            bookings: bookingCart.map(item => ({
                match: item.ticket.match,
                ticket_category: item.category.label,
                quantity: item.quantity
            }))
        });

        const { booking_id, ipfs_hash } = response.data;

        // 3. Convert Grand Total USD to ETH
        const currentPrice = await fetchEthPrice();
        const ethValue = (grandTotal / currentPrice).toFixed(18);
        const amountEthWei = ethers.parseEther(ethValue);

        // 4. Single Blockchain Transaction
        setProcessingMessage(`Confirming total payment in MetaMask...`);
        const tx = await contract.buyTicket(booking_id, ipfs_hash, { 
            value: amountEthWei,
            gasLimit: 800000 
        });

        setProcessingMessage("Finalizing on blockchain...");
        const receipt = await tx.wait();

        // 5. Verify & Cleanup
        const verifyPayment = (booking_id) => {
            const interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${URL}/api/bookingVerify/${booking_id}`);
                    if (res.data.status === "paid") clearInterval(interval);
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 2000);
        };
        verifyPayment(booking_id);

        clearCart();
        setShowCart(false);
        setMessage("All Tickets Successfully Booked!");
        setAlert(true);

    } catch (error) {
        console.error("Booking error:", error);
        setStep("form");
        setMessage(error.message.includes("rejected") ? "Transaction Rejected" : "Booking Failed");
        setAlert(true);
    }
};

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 font-['Barlow_Condensed',sans-serif]">

            <div className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                    <div>
                        <h3 className="text-white font-900 text-lg uppercase tracking-widest">
                            {step === "cart" ? "Booking Cart" : step === "form" ? "Your Details" : "Processing"}
                        </h3>
                        <p className="text-white/30 text-xs font-600 uppercase tracking-wider">
                            {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"} · ${grandTotal}
                        </p>
                    </div>
                    <button
                        onClick={() => { if (step !== "processing") setShowCart(false); }}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-lg leading-none"
                        disabled={step === "processing"}
                    >
                        ✕
                    </button>
                </div>

                {/* ── STEP: CART ── */}
                {step === "cart" && (
                    <>
                        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
                            {bookingCart.map((item, i) => (
                                <div key={i} className="bg-white/3 border border-white/6 rounded-xl p-4 flex gap-4">
                                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-800 uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#d4af37]/15 text-[#d4af37]">
                                                {item.category.label}
                                            </span>
                                            <span className="text-white/30 text-[10px] font-600 uppercase truncate" style={{fontFamily:"'Barlow',sans-serif"}}>
                                                {item.ticket.team1} vs {item.ticket.team2}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/40 text-xs" style={{fontFamily:"'Barlow',sans-serif"}}>
                                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                            <span className="truncate">{item.ticket.venue}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.ticket.match, item.category.label, item.quantity - 1)}
                                                    className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-base font-900 transition-all active:scale-90"
                                                >−</button>
                                                <span className="text-white font-800 text-sm w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.ticket.match, item.category.label, item.quantity + 1)}
                                                    className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-base font-900 transition-all active:scale-90"
                                                >+</button>
                                            </div>
                                            <div className="text-white font-900 text-base">
                                                ${item.ticket[item.category.priceKey] * item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.ticket.match, item.category.label)}
                                        className="self-start text-white/20 hover:text-red-400 transition-colors text-sm leading-none mt-0.5"
                                    >✕</button>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 pb-6 pt-3 border-t border-white/5 shrink-0 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 font-700 text-sm uppercase tracking-widest">Total</span>
                                <span className="text-white font-900 text-2xl">${grandTotal}</span>
                            </div>
                            <button
                                onClick={() => setStep("form")}
                                className="w-full bg-[#d4af37] hover:bg-[#e8c547] text-black font-900 text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Proceed to Checkout →
                            </button>
                            <button
                                onClick={() => setShowCart(false)}
                                className="w-full text-white/30 font-700 text-xs uppercase tracking-widest py-2 hover:text-white/60 transition-colors cursor-pointer"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP: FORM ── */}
                {step === "form" && (
                    <form onSubmit={handleCheckout} className="flex flex-col flex-1 overflow-hidden">
                        <div className="overflow-y-auto flex-1 px-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { name: "firstName", label: "First Name", type: "text", col: 1 },
                                    { name: "lastName",  label: "Last Name",  type: "text", col: 1 },
                                    { name: "email",     label: "Email",       type: "email", col: 2 },
                                    { name: "phone",     label: "Phone",       type: "tel",  col: 1 },
                                    { name: "city",      label: "City",        type: "text", col: 1 },
                                ].map(field => (
                                    <div key={field.name} className={`col-span-${field.col}`}>
                                        <label className="block text-[10px] font-800 uppercase tracking-[0.2em] text-white/40 mb-1.5">{field.label}</label>
                                        <input
                                            name={field.name}
                                            type={field.type}
                                            onChange={handleChange}
                                            required={["firstName","lastName","email","phone"].includes(field.name)}
                                            className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors placeholder:text-white/20"
                                            style={{fontFamily:"'Barlow',sans-serif"}}
                                        />
                                    </div>
                                ))}
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-800 uppercase tracking-[0.2em] text-white/40 mb-1.5">Address</label>
                                    <textarea
                                        name="address"
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors resize-none"
                                        style={{fontFamily:"'Barlow',sans-serif"}}
                                    />
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-5 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-xl p-4">
                                <p className="text-[#d4af37] text-[10px] font-800 uppercase tracking-widest mb-3">Order Summary</p>
                                {bookingCart.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs mb-1.5" style={{fontFamily:"'Barlow',sans-serif"}}>
                                        <span className="text-white/50">{item.category.label} × {item.quantity} — {item.ticket.team1} vs {item.ticket.team2}</span>
                                        <span className="text-white font-700">${item.ticket[item.category.priceKey] * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                                    <span className="text-white/60 font-700 text-sm uppercase tracking-wider">Total</span>
                                    <span className="text-white font-900 text-lg">${grandTotal}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-3 border-t border-white/5 shrink-0 space-y-3">
                            <button
                                type="submit"
                                className="w-full bg-[#d4af37] hover:bg-[#e8c547] text-black font-900 text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                                </svg>
                                Confirm & Pay with MetaMask
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep("cart")}
                                className="w-full text-white/30 font-700 text-xs uppercase tracking-widest py-2 hover:text-white/60 transition-colors cursor-pointer"
                            >
                                ← Back to Cart
                            </button>
                        </div>
                    </form>
                )}

                {/* ── STEP: PROCESSING ── */}
                {step === "processing" && (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-800 text-base uppercase tracking-widest mb-2">Processing</p>
                            <p className="text-white/40 text-sm" style={{fontFamily:"'Barlow',sans-serif"}}>{processingMessage}</p>
                        </div>
                        <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-xl px-6 py-3 text-center">
                            <p className="text-[#d4af37] text-xs font-700 uppercase tracking-wider">Do not close this window</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingItems;
