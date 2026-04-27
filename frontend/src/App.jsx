
import Ticket from "./Components/Ticket"
import Dashboard from "./Components/Dashboard"


import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { TicketProvider } from "./TicketContext";

const NotFound = () => <div className="p-10">404 - Page Not Found</div>;


function App() {
  return (

    <TicketProvider>
      <BrowserRouter>
        <Routes>

            {/* <Route element={<Layout />}> */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/match/:match" element={<Ticket />} />
              <Route path="/match/:match" element={<Ticket />} />
              {/* <Rout path='/checkout/:match/:' */}

            {/* </Route> */}

          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
      </TicketProvider>

  );
}

export default App;
