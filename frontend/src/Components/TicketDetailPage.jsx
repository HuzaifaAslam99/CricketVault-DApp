import { useLocation, useNavigate } from "react-router-dom";
import icc from "../assets/img/icc.png";

/* ── deterministic QR grid ── */
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

/* ── barcode ── */
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

/* ── label + value pair ── */
const Field = ({ label, value, gold = false, mono = false }) => (
  <div>
    <p className="text-white/30 text-[9px] font-700 uppercase tracking-[0.28em] mb-0.5">{label}</p>
    <p className={`font-800 text-[13px] uppercase ${gold ? "text-[#d4af37]" : "text-white"} ${mono ? "font-mono tracking-wide" : "tracking-wide"}`}>
      {value}
    </p>
  </div>
);

/* ── print-only field (dark text on white) ── */
const PrintField = ({ label, value, gold = false, mono = false }) => (
  <div>
    <p className="text-gray-500 text-[8px] font-700 uppercase tracking-[0.28em] mb-0.5">{label}</p>
    <p className={`font-800 text-[13px] uppercase tracking-wide ${gold ? "text-[#7a6010]" : "text-gray-900"} ${mono ? "font-mono" : ""}`}>
      {value}
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SINGLE TICKET STUB
═══════════════════════════════════════════════════════════════════════════ */
const TicketStub = ({ ticket, booking, seatNum, totalSeats, ticketId }) => {
  const m = booking.match_data || {};

  const printThis = () => {
    const el = document.getElementById(`ptk-${seatNum}`);
    if (!el) return;
    const win = window.open("", "_blank", "width=860,height=420");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Ticket — ${m.team1} vs ${m.team2} — ${seatNum} of ${totalSeats}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #e5e7eb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; font-family: 'Barlow Condensed', sans-serif; }
        .ticket { display: flex; width: 780px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #d1d5db; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
        .gold-bar { height: 5px; background: linear-gradient(90deg,#b8960c,#d4af37,#f0d060,#d4af37,#b8960c); }
        .main { flex: 1; display: flex; flex-direction: column; }
        .main-body { padding: 18px 22px 16px; flex: 1; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .icc-badge { width: 28px; height: 28px; border-radius: 50%; background: #1e3a6e; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #d4af37; font-weight: 900; letter-spacing: 0.5px; }
        .icc-title { color: #6b7280; font-size: 9px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; margin-left: 8px; }
        .confirmed { background: #dcfce7; border: 1px solid #86efac; color: #15803d; font-size: 9px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
        .teams { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
        .team { flex: 1; text-align: center; }
        .team-logo { width: 52px; height: 52px; border-radius: 50%; background: #f3f4f6; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 14px; font-weight: 900; color: #b8960c; }
        .team-name { color: #111827; font-weight: 900; font-size: 15px; letter-spacing: 0.1em; text-transform: uppercase; }
        .vs { color: #b8960c; font-weight: 900; font-size: 18px; letter-spacing: 2px; padding: 0 8px; }
        .divider { border-top: 1px solid #e5e7eb; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 14px; margin-bottom: 12px; }
        .field label { display: block; color: #9ca3af; font-size: 8px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 2px; }
        .field span { color: #111827; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
        .field span.gold { color: #92700a; }
        .id-bar { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .id-bar label { display: block; color: #9ca3af; font-size: 8px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 2px; }
        .id-bar span { color: #374151; font-size: 11px; font-family: monospace; letter-spacing: 1px; }
        .perf { width: 20px; background: #e5e7eb; display: flex; flex-direction: column; align-items: center; justify-content: space-around; padding: 14px 0; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #ffffff; border: 1px solid #d1d5db; flex-shrink: 0; }
        .stub { width: 150px; background: #f9fafb; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 18px 14px 14px; border-left: 1px dashed #d1d5db; }
        .stub-ticket-no label { display: block; color: #9ca3af; font-size: 8px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 3px; text-align: center; }
        .stub-ticket-no span { display: block; color: #92700a; font-weight: 900; font-size: 13px; text-align: center; letter-spacing: 1px; }
        .match-no { text-align: center; margin-top: 4px; }
        .match-no label { display: block; color: #9ca3af; font-size: 8px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 2px; }
        .match-no span { color: #374151; font-weight: 800; font-size: 13px; }
        .qr-wrap { padding: 4px; background: #f3f4f6; border-radius: 6px; display: inline-block; }
        .scan-label { color: #9ca3af; font-size: 7px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 5px; text-align: center; }
        .barcode-val { color: #9ca3af; font-size: 7px; font-family: monospace; margin-top: 3px; letter-spacing: 1px; text-align: center; }
        .stub-dashed { width: 80%; border-top: 1px dashed #d1d5db; margin: 6px 0 10px; }
      </style>
      </head><body>
      <div class="ticket">
        <div class="main">
          <div class="gold-bar"></div>
          <div class="main-body">
            <div class="header">
              <div style="display:flex;align-items:center;">
                <div class="icc-badge">ICC</div>
                <span class="icc-title">ICC Champions Trophy 2025</span>
              </div>
              <span class="confirmed">● Confirmed</span>
            </div>
            <div class="teams">
              <div class="team">
                <div class="team-logo">${m.team1?.slice(0,3)}</div>
                <div class="team-name">${m.team1}</div>
              </div>
              <div class="vs">VS</div>
              <div class="team">
                <div class="team-logo">${m.team2?.slice(0,3)}</div>
                <div class="team-name">${m.team2}</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="grid">
              <div class="field"><label>Category</label><span class="gold">${booking.ticket_category}</span></div>
              <div class="field"><label>Venue</label><span>${m.venue}</span></div>
              <div class="field"><label>Date</label><span>${m.date}</span></div>
              <div class="field"><label>Customer</label><span>${ticket.customer_first_name} ${ticket.customer_last_name}</span></div>
              <div class="field"><label>Match No.</label><span>${booking.match}</span></div>
              <div class="field"><label>Ticket</label><span class="gold">${seatNum} / ${totalSeats}</span></div>
            </div>
            <div class="id-bar">
              <div><label>Ticket ID</label><span>${ticketId}</span></div>
              <div style="text-align:right"><label>Booking ID</label><span>${ticket.booking_id}</span></div>
            </div>
          </div>
        </div>
        <div class="perf">${Array.from({ length: 16 }).map(() => `<div class="dot"></div>`).join("")}</div>
        <div class="stub">
          <div class="stub-ticket-no">
            <label>Ticket</label>
            <span>${seatNum} of ${totalSeats}</span>
          </div>
          <div class="match-no">
            <label>Match No.</label>
            <span>${booking.match}</span>
          </div>
          <hr class="stub-dashed" />
          <div>
            <div class="qr-wrap">${document.getElementById(`qr-svg-${seatNum}`)?.innerHTML ?? `<svg width="74" height="74"><rect width="74" height="74" fill="white"/></svg>`}</div>
            <div class="scan-label">Scan to verify</div>
          </div>
          <div>
            ${document.getElementById(`bc-svg-${seatNum}`)?.innerHTML ?? `<svg width="114" height="26"><rect width="114" height="26" fill="white"/></svg>`}
            <div class="barcode-val">${ticketId?.slice(-12)}</div>
          </div>
        </div>
      </div>
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className="fade-up mb-5" style={{ animationDelay: `${(seatNum - 1) * 0.09}s` }}>

      {/* ── VISIBLE TICKET ── */}
      <div className="rounded-2xl overflow-hidden border border-white/7 shadow-[0_8px_40px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-[#d4af37]/35 hover:shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
        <div className="flex font-['Barlow_Condensed',sans-serif]">

          {/* ════ MAIN BODY ════ */}
          <div className="flex-1 flex flex-col bg-[#0d1117]">
            {/* gold bar */}
            <div className="h-1 bg-gradient-to-r from-[#b8960c] via-[#f0d060] to-[#b8960c]" />

            <div className="flex-1 px-5 pt-4 pb-4">
              {/* header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1a4a8a] flex items-center justify-center text-[9px] text-[#d4af37] font-900 tracking-tight">ICC</div>
                  <span className="text-white/35 text-[9px] font-700 uppercase tracking-[0.3em]">ICC Champions Trophy 2025</span>
                </div>
                <span className="bg-green-500/12 border border-green-500/20 text-green-400 text-[9px] font-800 uppercase tracking-[0.2em] px-2 py-0.5 rounded">● Confirmed</span>
              </div>

              {/* teams */}
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

              {/* info grid */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 border-t border-white/6 pt-3 mb-3">
                <Field label="Category"  value={booking.ticket_category} gold />
                <Field label="Venue"     value={m.venue} />
                <Field label="Date"      value={m.date} />
                <Field label="Customer"  value={`${ticket.customer_first_name} ${ticket.customer_last_name}`} />
                <Field label="Match No." value={`#${booking.match}`} />
                <Field label="Ticket"    value={`${seatNum} / ${totalSeats}`} gold />
              </div>

              {/* ID bar */}
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

          {/* ════ PERFORATION ════ */}
          <div className="w-5 bg-[#0a0a0f] flex flex-col items-center justify-around py-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#0d1117] border border-white/7 shrink-0" />
            ))}
          </div>

          {/* ════ RIGHT STUB ════ */}
          <div className="w-36 bg-[#0f1520] flex flex-col items-center justify-between py-4 px-3">
            {/* ticket number */}
            <div className="text-center">
              <p className="text-white/28 text-[8.5px] font-700 uppercase tracking-[0.3em] mb-1">Ticket</p>
              <p className="text-[#d4af37] font-900 text-[13px] uppercase tracking-widest">{seatNum} of {totalSeats}</p>
            </div>

            {/* match number */}
            <div className="text-center">
              <p className="text-white/28 text-[8.5px] font-700 uppercase tracking-[0.3em] mb-1">Match No.</p>
              <p className="text-white font-900 text-[22px] leading-none tracking-wider">#{booking.match}</p>
            </div>

            {/* dashed divider */}
            <div className="w-4/5 border-t border-dashed border-white/10" />

            {/* QR */}
            <div className="text-center">
              <div id={`qr-svg-${seatNum}`} className="p-1 bg-white/4 rounded-md inline-block">
                <MiniQR value={`${ticketId}-SEAT${seatNum}`} size={76} />
              </div>
              <p className="text-white/20 text-[7.5px] font-700 uppercase tracking-[0.2em] mt-1.5">Scan to verify</p>
            </div>

            {/* barcode */}
            <div className="text-center">
              <div id={`bc-svg-${seatNum}`}>
                <Barcode value={ticketId} width={116} height={28} />
              </div>
              <p className="text-white/18 text-[7px] font-mono mt-1 tracking-wider">{ticketId?.slice(-12)}</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── PRINT BUTTON ── */}
      <button
        onClick={printThis}
        className="mt-2.5 w-full flex items-center justify-center gap-2 border border-[#d4af37]/20 hover:border-[#d4af37] bg-transparent hover:bg-[#d4af37]/5 text-[#d4af37]/65 hover:text-[#d4af37] text-[11px] font-800 uppercase tracking-[0.28em] py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Ticket {seatNum} of {totalSeats}
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const TicketDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { ticket, booking, ticketTypes } = state || {};

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

  const qty = booking.quantity;
  const individualTicketIds = booking.individual_tickets || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-['Barlow_Condensed',sans-serif]">
      <style>{`
        .fade-up { animation: fu 0.45s ease both; }
        @keyframes fu { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* HEADER */}
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

      {/* PAGE TITLE */}
      <div className="border-b border-white/5 bg-gradient-to-r from-[#0d1117] via-[#111827] to-[#0d1117]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-[#d4af37] text-xs font-700 tracking-[0.4em] uppercase mb-1">Your Tickets · Match #{booking.match}</p>
          <h1 className="text-white font-900 text-3xl md:text-4xl uppercase leading-none tracking-tight">
            {booking.match_data?.team1} <span className="text-[#d4af37]">vs</span> {booking.match_data?.team2}
          </h1>
          <p className="text-white/30 text-xs mt-2 font-600 uppercase tracking-widest" style={{ fontFamily: "'Barlow', sans-serif" }}>
            {booking.match_data?.venue} · {booking.match_data?.date} · {booking.ticket_category} · {qty} {qty === 1 ? "Ticket" : "Tickets"}
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {Array.from({ length: qty }, (_, i) => {
          const seatNum = i + 1;
          const ticketId = individualTicketIds[i]
            ?? `${ticket.booking_id?.slice(0, 8)?.toUpperCase()}-S${String(seatNum).padStart(2, "0")}`;
          return (
            <TicketStub
              key={seatNum}
              ticket={ticket}
              booking={booking}
              seatNum={seatNum}
              totalSeats={qty}
              ticketId={ticketId}
            />
          );
        })}
      </main>
    </div>
  );
};

export default TicketDetailPage;
