import { useLocation, useNavigate } from "react-router-dom";
import icc from "../assets/img/icc.png";

/* ─── deterministic QR-like grid from a string ─────────────────────────── */
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

/* ─── barcode lines from string ─────────────────────────────────────────── */
const Barcode = ({ value = "", width = 116, height = 30 }) => {
  let x = 2;
  const rects = [];
  for (let i = 0; i < 52 && x < width - 4; i++) {
    const v = ((value.charCodeAt(i % value.length) || 41) ^ (i * 37)) & 0xff;
    const w = (v % 3) + 1;
    const gap = (v % 2) + 1;
    rects.push(<rect key={i} x={x} y={2} width={w} height={height - 4} fill="#0a0a0f" rx="0.3" />);
    x += w + gap;
  }
  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="white" rx="3" />
      {rects}
    </svg>
  );
};

/* ─── single ticket stub ────────────────────────────────────────────────── */
const TicketStub = ({ ticket, booking, seatNum, totalSeats, unitPrice, ticketId }) => {
  const m = booking.match_data || {};

  const printThis = () => {
    const el = document.getElementById(`ptk-${seatNum}`);
    if (!el) return;
    const win = window.open("", "_blank", "width=800,height=440");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Ticket — ${m.team1} vs ${m.team2} — Seat ${seatNum}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&display=swap" rel="stylesheet">
      <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f0f0f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;}</style>
      </head><body>${el.innerHTML}
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>`);
    win.document.close();
  };

  /* shared render for both display + print */
  const body = (forPrint = false) => (
    <div style={{
      display: "flex",
      width: forPrint ? 740 : "100%",
      fontFamily: "'Barlow Condensed', sans-serif",
      background: "#0d1117",
      borderRadius: forPrint ? 14 : 0,
      overflow: "hidden",
      border: forPrint ? "1px solid #2a2a3a" : "none",
    }}>

      {/* ═══ LEFT: MAIN BODY ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* gold top bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#d4af37,#f0d060,#d4af37,#f0d060)" }} />

        <div style={{ padding: "16px 20px 14px", flex: 1 }}>
          {/* header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a4a8a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#d4af37", fontWeight: 900, letterSpacing: 0.5 }}>ICC</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" }}>ICC Champions Trophy 2025</div>
            </div>
            <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4 }}>
              ● Confirmed
            </div>
          </div>

          {/* teams row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, overflow: "hidden" }}>
                {forPrint
                  ? <span style={{ color: "#d4af37", fontWeight: 900, fontSize: 12 }}>{m.team1?.slice(0,3)}</span>
                  : <img src={m.img_team1} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt={m.team1} />}
              </div>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>{m.team1}</span>
            </div>

            <div style={{ textAlign: "center", padding: "0 6px" }}>
              <div style={{ color: "#d4af37", fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>VS</div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, overflow: "hidden" }}>
                {forPrint
                  ? <span style={{ color: "#d4af37", fontWeight: 900, fontSize: 12 }}>{m.team2?.slice(0,3)}</span>
                  : <img src={m.img_team2} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt={m.team2} />}
              </div>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>{m.team2}</span>
            </div>
          </div>

          {/* info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginBottom: 10 }}>
            {[
              { label: "Category",  val: booking.ticket_category, gold: true },
              { label: "Venue",     val: m.venue },
              { label: "Date",      val: m.date },
              { label: "Customer",  val: `${ticket.customer_first_name} ${ticket.customer_last_name}` },
              { label: "Price",     val: `$${unitPrice}` },
              { label: "Seat",      val: `${seatNum} / ${totalSeats}`, gold: true },
            ].map(({ label, val, gold }) => (
              <div key={label}>
                <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                <div style={{ color: gold ? "#d4af37" : "#fff", fontWeight: 800, fontSize: 12, textTransform: gold ? "uppercase" : "none" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* ticket ID bar */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 2 }}>Ticket ID</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10.5, fontFamily: "monospace", letterSpacing: 1 }}>{ticketId}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 2 }}>Booking ID</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9.5, fontFamily: "monospace" }}>{ticket.booking_id?.slice(0, 14)}…</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PERFORATION STRIP ═══ */}
      <div style={{ width: 20, background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", padding: "14px 0" }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }} />
        ))}
      </div>

      {/* ═══ RIGHT: STUB ═══ */}
      <div style={{ width: 148, background: "#0f1520", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "16px 12px 12px" }}>
        {/* gold top bar */}
        <div style={{ position: "absolute", display: "none" }} />

        {/* seat number */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 3 }}>Seat No.</div>
          <div style={{ color: "#d4af37", fontWeight: 900, fontSize: 44, lineHeight: 1, letterSpacing: 3 }}>{String(seatNum).padStart(2, "0")}</div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700, marginTop: 2 }}>of {totalSeats}</div>
        </div>

        {/* divider */}
        <div style={{ width: "80%", borderTop: "1px dashed rgba(255,255,255,0.1)", margin: "2px 0 10px" }} />

        {/* QR */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ padding: 4, background: "rgba(255,255,255,0.04)", borderRadius: 6, display: "inline-block" }}>
            <MiniQR value={`${ticketId}-SEAT${seatNum}`} size={74} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 5 }}>Scan to verify</div>
        </div>

        {/* barcode */}
        <div style={{ textAlign: "center" }}>
          <Barcode value={ticketId} width={114} height={26} />
          <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 7, fontFamily: "monospace", marginTop: 3, letterSpacing: 1 }}>{ticketId?.slice(-10)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={{ animationDelay: `${(seatNum - 1) * 0.09}s`, marginBottom: 22 }}>
      {/* hidden print clone */}
      <div id={`ptk-${seatNum}`} style={{ display: "none" }}>{body(true)}</div>

      {/* visible ticket */}
      <div style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.7)"; }}
      >
        {body(false)}
      </div>

      {/* print button */}
      <button
        onClick={printThis}
        style={{
          marginTop: 9,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          border: "1px solid rgba(212,175,55,0.2)",
          background: "transparent",
          color: "rgba(212,175,55,0.65)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          padding: "9px 0",
          borderRadius: 9,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4af37"; e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.background = "rgba(212,175,55,0.05)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; e.currentTarget.style.color = "rgba(212,175,55,0.65)"; e.currentTarget.style.background = "transparent"; }}
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

  const typeInfo = ticketTypes?.find((t) => t.label === booking.ticket_category);
  const unitPrice = typeInfo ? booking.match_data?.[typeInfo.priceKey] : 0;
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
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-700 uppercase tracking-widest">
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
          <p className="text-[#d4af37] text-xs font-700 tracking-[0.4em] uppercase mb-1">Your Tickets</p>
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
              unitPrice={unitPrice}
              ticketId={ticketId}
            />
          );
        })}
      </main>
    </div>
  );
};

export default TicketDetailPage;
