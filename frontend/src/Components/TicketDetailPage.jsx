import { useLocation, useNavigate } from "react-router-dom";
import icc from "../assets/img/icc.png";

const MiniQR = ({ value = "", size = 80 }) => {
  const cols = 11;
  const cells = Array.from({ length: cols * cols }, (_, i) => {
    const r = ((value.charCodeAt(i % value.length) || 37) ^ (i * 2654435761)) >>> 0;
    return (r % 3) !== 0;
  });
  const finderBlock = (row, col) => {
    const inB = (dr, dc) => row >= dr && row <= dr + 6 && col >= dc && col <= dc + 6;
    return inB(0, 0) || inB(0, cols - 7) || inB(cols - 7, 0);
  };
  const cell = size / cols;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="3" />
      {cells.map((on, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return (finderBlock(row, col) || on) ? (
          <rect key={i} x={col * cell + 0.5} y={row * cell + 0.5} width={cell - 1} height={cell - 1} fill="#0a0a0f" rx="0.4" />
        ) : null;
      })}
    </svg>
  );
};

const Barcode = ({ value = "", width = 116, height = 32 }) => {
  let x = 2;
  const rects = [];
  for (let i = 0; i < 60 && x < width - 4; i++) {
    const v = ((value.charCodeAt(i % value.length) || 41) ^ (i * 37)) & 0xff;
    const w = (v % 3) + 1;
    const gap = (v % 2) + 1;
    rects.push(<rect key={i} x={x} y={2} width={w} height={height - 4} fill="#111827" rx="0.3" />);
    x += w + gap;
  }
  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="white" rx="3" />
      {rects}
    </svg>
  );
};

const Field = ({ label, value, gold = false }) => (
  <div>
    <p className="text-white/30 text-[9px] font-700 uppercase tracking-[0.28em] mb-0.5">{label}</p>
    <p className={`font-800 text-[13px] uppercase tracking-wide ${gold ? "text-[#d4af37]" : "text-white"}`}>
      {value}
    </p>
  </div>
);

const TicketDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { ticket, booking } = state || {};

  if (!ticket || !booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-4">No ticket data found</p>
          <button onClick={() => navigate(-1)} className="text-[#d4af37] text-xs uppercase tracking-widest hover:underline">← Go Back</button>
        </div>
      </div>
    );
  }

  const m = booking.match_data || {};
  const qty = booking.quantity;
  const individualTicketIds = booking.individual_tickets || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif]">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-700 uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            <img src={icc} className="h-8 w-8 object-contain" alt="ICC" />
            <span className="text-white font-800 text-sm uppercase tracking-widest hidden sm:block">Cricket Vault</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Page Title */}
      <div className="border-b border-white/5 bg-gradient-to-r from-[#0d1117] via-[#111827] to-[#0d1117]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-[#d4af37] text-xs font-700 tracking-[0.4em] uppercase mb-1">
            Your Tickets · Match #{booking.match}
          </p>
          <h1 className="text-white font-900 text-3xl md:text-4xl uppercase leading-none tracking-tight">
            {m.team1} <span className="text-[#d4af37]">vs</span> {m.team2}
          </h1>
          <p className="text-white/30 text-xs mt-2 font-600 uppercase tracking-widest">
            {m.venue} · {m.date} · {booking.ticket_category} · {qty} {qty === 1 ? "Ticket" : "Tickets"}
          </p>
        </div>
      </div>

      {/* Tickets */}
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        {Array.from({ length: qty }, (_, i) => {
          const seatNum = i + 1;
          const ticketId = individualTicketIds[i]
            ?? `${ticket.booking_id?.slice(0, 8)?.toUpperCase()}-S${String(seatNum).padStart(2, "0")}`;

          return (
            <div key={seatNum} className="rounded-2xl overflow-hidden border border-white/7 shadow-[0_8px_40px_rgba(0,0,0,0.7)] hover:border-[#d4af37]/35 transition-all duration-300">
              <div className="flex">

                {/* Main Body */}
                <div className="flex-1 flex flex-col bg-[#0d1117]">
                  <div className="h-1 bg-gradient-to-r from-[#b8960c] via-[#f0d060] to-[#b8960c]" />
                  <div className="px-5 pt-4 pb-4">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1a4a8a] flex items-center justify-center text-[9px] text-[#d4af37] font-900">ICC</div>
                        <span className="text-white/35 text-[9px] font-700 uppercase tracking-[0.3em]">ICC Champions Trophy 2025</span>
                      </div>
                      <span className="bg-green-500/12 border border-green-500/20 text-green-400 text-[9px] font-800 uppercase tracking-[0.2em] px-2 py-0.5 rounded">● Confirmed</span>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                          <img src={m.img_team1} className="w-full h-full object-contain" alt={m.team1} />
                        </div>
                        <span className="text-white font-900 text-sm uppercase tracking-wider text-center">{m.team1}</span>
                      </div>
                      <span className="text-[#d4af37] font-900 text-lg tracking-widest px-2">VS</span>
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                          <img src={m.img_team2} className="w-full h-full object-contain" alt={m.team2} />
                        </div>
                        <span className="text-white font-900 text-sm uppercase tracking-wider text-center">{m.team2}</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 border-t border-white/6 pt-3 mb-3">
                      <Field label="Category"  value={booking.ticket_category} gold />
                      <Field label="Venue"     value={m.venue} />
                      <Field label="Date"      value={m.date} />
                      <Field label="Customer"  value={`${ticket.customer_first_name} ${ticket.customer_last_name}`} />
                      <Field label="Match No." value={`#${booking.match}`} />
                      <Field label="Ticket"    value={`${seatNum} / ${qty}`} gold />
                    </div>

                    {/* ID Bar */}
                    <div className="bg-white/3 border border-white/6 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white/28 text-[8px] font-700 uppercase tracking-[0.28em] mb-0.5">Ticket ID</p>
                        <p className="text-white/70 text-[11px] font-mono tracking-wide">{ticketId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/28 text-[8px] font-700 uppercase tracking-[0.28em] mb-0.5">Booking ID</p>
                        <p className="text-white/50 text-[11px] font-mono tracking-wide">{ticket.booking_id}</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Stub */}
                <div className="w-36 bg-[#0f1520] border-l border-dashed border-white/10 flex flex-col items-center justify-between py-4 px-3">
                  <div className="text-center">
                    <p className="text-white/28 text-[8.5px] font-700 uppercase tracking-[0.3em] mb-1">Match No.</p>
                    <p className="text-white font-900 text-[22px] leading-none tracking-wider">#{booking.match}</p>
                  </div>

                  <div className="w-4/5 border-t border-dashed border-white/10" />

                  <div className="text-center">
                    <div className="p-1 bg-white/4 rounded-md inline-block">
                      <MiniQR value={`${ticketId}-SEAT${seatNum}`} size={76} />
                    </div>
                    <p className="text-white/20 text-[7.5px] font-700 uppercase tracking-[0.2em] mt-1.5">Scan to verify</p>
                  </div>

                  <div className="text-center">
                    <Barcode value={ticketId} width={116} height={28} />
                    <p className="text-white/18 text-[7px] font-mono mt-1 tracking-wider">{ticketId?.slice(-12)}</p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default TicketDetailPage;
