import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import { ticketCart } from "../TicketContext";
import TicketDetailPage from "./pages/TicketDetailPage";
import icc from "../assets/img/icc.png";

const CustomerTicket = () => {
  const { URL } = ticketCart();
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setError(null);
    setConnecting(true);
    try {
      if (!window.ethereum) {
        setError("MetaMask not found. Please install it to view your tickets.");
        setConnecting(false);
        return;
      }

      // Switch to correct network
      const targetChainId = "0x14a34";
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (currentChainId !== targetChainId) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = signer.address;
      setWalletAddress(address);

      // Fetch tickets for this wallet
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/customersBooking/wallet/${address}`,
      );
      setTickets(response.data);
      console.log("Tickets: ",response.data);
      console.log("Booking: ",tickets[0].bookings);
      console.log("Team1: ",tickets[0].bookings.match_data.team1);


    } catch (err) {
      console.error("Wallet connect / fetch error:", err);
      setError("Failed to connect wallet or fetch tickets. Please try again.");
    } finally {
      setConnecting(false);
      setLoading(false);
    }
  };

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

    const ticketTypes = [
        { label: "General",     priceKey: "general_price" },
        { label: "Standard",    priceKey: "standard_price" },
        { label: "First Class", priceKey: "firstClass_price" },
        { label: "VIP",         priceKey: "VIP_price" },
    ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif]">


      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-700 uppercase tracking-widest"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-3">
            <img src={icc} className="h-8 w-8 object-contain" alt="ICC" />
            <span className="text-white font-800 text-sm uppercase tracking-widest hidden sm:block">
              Cricket Vault
            </span>
          </div>

          {walletAddress ? (
            <div className="flex items-center gap-2 border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-700 uppercase tracking-widest px-3 py-2 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              {shortAddress(walletAddress)}
            </div>
          ) : (
            <div className="w-24" /> /* spacer */
          )}
        </div>
      </header>

      {/* ── PAGE TITLE ── */}
      <div className="border-b border-white/5 bg-gradient-to-r from-[#0d1117] via-[#111827] to-[#0d1117]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-[#d4af37] text-xs font-700 tracking-[0.4em] uppercase mb-2">
            ICC Champions Trophy 2025
          </p>
          <h1 className="text-white font-900 text-4xl md:text-5xl uppercase leading-none tracking-tight">
            My <span className="text-[#d4af37]">Tickets</span>
          </h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* ── NOT CONNECTED ── */}
        {!walletAddress && (
          <div className="fade-up flex flex-col items-center justify-center text-center py-24 gap-8">
            <div className="w-24 h-24 rounded-full bg-white/3 border border-white/8 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-900 text-xl uppercase tracking-widest mb-2">
                Connect Your Wallet
              </p>
              <p
                className="text-white/30 text-sm max-w-xs mx-auto"
                style={{ fontFamily: "'Barlow',sans-serif" }}
              >
                Connect your MetaMask wallet to view all tickets purchased with
                that address.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-700 uppercase tracking-widest px-5 py-3 rounded-lg max-w-sm">
                {error}
              </div>
            )}

            <button
              onClick={connectWallet}
              disabled={connecting}
              className="flex items-center gap-3 bg-[#d4af37] hover:bg-[#e8c547] disabled:opacity-50 text-black font-900 text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95"
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                  </svg>
                  Connect MetaMask
                </>
              )}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {walletAddress && loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/40 text-sm font-600 uppercase tracking-widest">
              Fetching your tickets...
            </p>
          </div>
        )}

        {/* ── EMPTY STATE (connected but no tickets) ── */}
        {walletAddress && !loading && tickets.length === 0 && (
          <div className="fade-up flex flex-col items-center justify-center text-center py-24 gap-6">
            <div className="w-20 h-20 rounded-full bg-white/3 border border-white/8 flex items-center justify-center">
              <svg
                className="w-9 h-9 text-white/15"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-900 text-lg uppercase tracking-widest mb-1">
                No Tickets Found
              </p>
              <p
                className="text-white/30 text-xs"
                style={{ fontFamily: "'Barlow',sans-serif" }}
              >
                No purchases found for{" "}
                <span className="text-white/50 font-mono">
                  {shortAddress(walletAddress)}
                </span>
              </p>
            </div>
            <Link
              to="/"
              className="bg-[#d4af37] hover:bg-[#e8c547] text-black font-900 text-xs uppercase tracking-widest px-8 py-3 rounded-lg transition-all active:scale-95"
            >
              Browse Matches
            </Link>
          </div>
        )}

        {/* ── TICKET LIST ── */}
        {walletAddress && !loading && tickets.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <p
                className="text-white/40 text-xs font-600 uppercase tracking-widest"
                style={{ fontFamily: "'Barlow',sans-serif" }}
              >
                {tickets.length} {tickets.length === 1 ? "Ticket" : "Tickets"}{" "}
                found for {shortAddress(walletAddress)}
              </p>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket, tIndex) =>
                /* We map through bookings, but pull the team info from ticket.match_details */
                ticket.bookings.map((booking, bIndex) => (
                  <div
                    key={`${tIndex}-${bIndex}`}
                    className="fade-up relative bg-[#111118] border border-white/8 rounded-xl overflow-hidden hover:border-[#d4af37]/30 transition-all duration-300"
                    style={{ animationDelay: `${bIndex * 0.07}s` }}
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-[#d4af37] to-[#f0d060]"></div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0f3460] to-[#1a4a8a] px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={icc}
                          className="h-5 w-5 object-contain opacity-80"
                          alt="ICC"
                        />
                        <span className="text-white/60 text-[10px] font-700 tracking-[0.25em] uppercase">
                          ICC Champions Trophy
                        </span>
                      </div>
                      <span className="text-[10px] font-800 uppercase tracking-widest px-2 py-0.5 rounded-sm bg-green-500/20 text-green-400 border border-green-500/20">
                        Confirmed
                      </span>
                    </div>

                    <div className="p-5">
                      {/* Teams - Pulling from match_details */}
                      <div className="flex items-center justify-center gap-4 mb-5">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1">
                            <img
                              src={booking.match_data?.img_team1}
                              className="w-full h-full object-contain"
                              alt={booking.match_data?.team1}
                            />
                          </div>
                          <span className="text-white font-800 text-xs uppercase tracking-wider text-center">
                            {booking.match_data?.team1}
                          </span>
                        </div>

                        <div className="text-[#d4af37] font-900 text-base">
                          VS
                        </div>

                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1">
                            <img
                              src={booking.match_data?.img_team2}
                              className="w-full h-full object-contain"
                              alt={booking.match_data?.team2}
                            />
                          </div>
                          <span className="text-white font-800 text-xs uppercase tracking-wider text-center">
                            {booking.match_data?.team2}
                          </span>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 mb-4">
                        <div>
                          <p className="text-white/30 text-[10px] font-700 uppercase tracking-widest mb-0.5">
                            Category
                          </p>
                          <p className="text-[#d4af37] font-800 text-sm uppercase">
                            {booking.ticket_category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/30 text-[10px] font-700 uppercase tracking-widest mb-0.5">
                            Qty
                          </p>
                          <p className="text-white font-800 text-sm">
                            {booking.quantity}{" "}
                            {booking.quantity === 1 ? "Ticket" : "Tickets"}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/30 text-[10px] font-700 uppercase tracking-widest mb-0.5">
                            Venue
                          </p>
                          <p className="text-white font-700 text-xs">
                            {booking.match_data?.venue}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/30 text-[10px] font-700 uppercase tracking-widest mb-0.5">
                            Date
                          </p>
                          <p className="text-white font-700 text-xs">
                            {booking.match_data?.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/30 text-[10px] font-700 uppercase tracking-widest mb-0.5">
                            Customer
                          </p>
                          <p className="text-white font-700 text-xs">
                            {ticket.customer_first_name}{" "}
                            {ticket.customer_last_name}
                          </p>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-white/30 text-[10px] font-700 uppercase tracking-widest mb-0.5">
                                Total Paid
                            </p>
                            <p className="text-white font-800 text-sm">
                                ${(() => {
                                    // 1. Find the ticket type object that matches this booking's category
                                    const typeInfo = ticketTypes.find(t => t.label === booking.ticket_category);
      
                                    // 2. Get the price using the priceKey (e.g., match_data['general_price'])
                                    const unitPrice = typeInfo ? booking.match_data?.[typeInfo.priceKey] : 0;
      
                                    // 3. Multiply by quantity
                                    return (unitPrice * booking.quantity); 
                                })()}
                            </p>
                        </div>

                      </div>

                      {/* Booking ID */}//
                       <Link to="/my-tickets/detail" state={{ ticket, booking, ticketTypes }} onClick={(e) => e.stopPropagation()}
                        className="bg-white/3 border border-white/5 hover:border-[#d4af37]/30 rounded-lg px-3 py-2 flex items-center justify-between gap-2 transition-all group/link"
                        >
                          <div className="min-w-0">
                            <p className="text-white/30 text-[9px] font-700 uppercase tracking-widest mb-0.5">
                              Booking ID
                            </p>
                            <p className="text-white/50 text-[10px] font-mono truncate">
                              {ticket.booking_id}
                            </p>
                          </div>
                          <span className="shrink-0 border border-white/10 group-hover/link:border-[#d4af37]/40 text-white/30 group-hover/link:text-[#d4af37] text-[10px] font-700 uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all">
                              View →
                          </span>
                        </Link>
                    </div>
                  </div>
                )),
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CustomerTicket;
