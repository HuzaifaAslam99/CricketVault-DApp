import Ticket from "./Components/Ticket";
import Dashboard from "./Components/Dashboard";
import CustomerTicket from "./Components/CustomerTicket";
 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TicketProvider } from "./TicketContext";
 
const NotFound = () => <div className="p-10 text-white">404 - Page Not Found</div>;
 
function App() {
  return (
    <TicketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/match/:match" element={<Ticket />} />
          <Route path="/my-tickets" element={<CustomerTicket />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TicketProvider>
  );
}
 
export default App;
 