// import React from 'react';
import {useEffect, useState} from "react"
import axios from "axios"
import { Link} from "react-router-dom"; 
import { ticketCart } from "../TicketContext";
import icc from "../assets/img/icc.png";

const TicketCard = () => {

    const {URL} = ticketCart()

    const [TicketArray, setTicketArray] = useState([])

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${URL}/api/tickets`)
                setTicketArray(response.data);
            } catch (error) {
                console.error("Error fetching Tickets", error);
            }
        };
        fetchTickets();
    }, []);


     return (

        
        // <div className="bg-black w-full min-h-screen p-10 flex flex-row flex-wrap content-start justify-start">
        <div className="bg-black w-full min-h-screen p-10 flex flex-row flex-wrap gap-8 justify-center content-start">
        

        {TicketArray.map((match, index) => {

            return(

    //    <Link key={index} to={`/tickets/${TicketArray.match}`} className="relative w-75 mx-auto flex-col h-45  overflow-hidden rounded-xl bg-white shadow-lg">
       <Link key={index} to={`match/${match.match}`} className="relative w-75 flex-col h-45  overflow-hidden rounded-xl bg-white shadow-lg cursor-pointer">

         
         {/* Top Section: Logo Slots */}
         <div className="bg-blue-500 flex h-1/4 flex-row items-center justify-center gap-3 py-3 border-r-2 border-dashed border-gray-300 text-white">
    
           <img src={icc} className="w-10" alt="" />
           <div className=" text-[12px] font-bold tracking-widest ">
             ICC CHAMPIONS TROPHY
           </div>
   
         </div>
   
         {/* Bottom Section: Content */}
   
           <div className="h-3/4 flex flex-col  px-3 justify-center gap-3">
   
   
   
             <div className=" text-2xl h-auto font-bold uppercase text-gray-900 flex flex-row gap-2 justify-center items-center">
               <img src={match.img_team1} className="h-8" alt="" />
               {/* {matchName || "Pak vs Aus"} */}
               <p>{match.team1}</p>
                    vs
               <p>{match.team2}</p>
               <img src={match.img_team2} className="h-8" alt="" />
             </div>
   
             <div className="flex flex-col justify-center items-center gap-[2px] text-xs text-gray-600">
               <p><strong>VENUE:</strong> {match.venue}</p>
               <p><strong>DATE:</strong> {match.date}</p>
                
                <p className="mt-1">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider bg-blue-500 rounded-[5px] shadow-sm">
                    Verify Booking Price
                  </span>
                </p>

             </div>
   
           </div> 
        </Link>

        )})}


       </div>
     );
};

export default TicketCard;



        //     <div className=" flex flex-row  justify-between ">
   
        //      <div className="h-8 w-24 bg-[repeating-linear-gradient(90deg,#333,#333_2px,#fff_2px,#fff_4px)]"></div>
        //      <div className="text-lg font-bold text-gray-900">
        //        1000.00 PKR
        //      </div>
        //    </div>