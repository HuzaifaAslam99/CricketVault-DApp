import React, { useState } from 'react';
import { ticketCart } from "../TicketContext";
import axios from "axios";
import { ethers } from "ethers";
import { contract_address, ticket_abi } from "../constants";


const Booking = () => {
    const { setShowCart, showMessage, setMessage, setAlert, ticket, category, URL} = ticketCart();

    
    const [customer, setCustomer] = useState({ firstName:"", lastName:"", email:"", phone:"", city:"",
           address:"", quantity: 1, category:"", amount:""});

    const handleChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };


    const buyTickets = async (e) => {
        e.preventDefault();

        const total_amount = ticket[category.priceKey] * customer.quantity

        const CONTRACT_ADDRESS = contract_address;
        const ABI = ticket_abi;

        if (!window.ethereum) {
            setMessage("Please install MetaMask!");
            setAlert(true);
            // setProcessing(false);
            return;
        }

        const targetChainId = "0x14a34"; 
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        if (currentChainId !== targetChainId) {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: targetChainId }],
            });
        }

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        const fetchEthPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const data = await response.json();
                return data.ethereum.usd;    
            } catch (error) {
                console.error("Price fetch failed", error);
                return 2340;
            }
        };

        try {

            const response = await axios.post(`${URL}/api/customersBooking/initiate`, {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                city: customer.city,
                address: customer.address,
                quantity: customer.quantity,
                category: category.label,
                amount: total_amount,
                wallet_address : signer.address,
                // transaction_hash: transaction_hash,
            });

            const ticketId = response.data.ticket_id
            const ipfsHash = response.data.ipfs_hash;

            const currentPrice = await fetchEthPrice();
            const ethValue = (total_amount / currentPrice).toFixed(18);
            const amountEthWei = ethers.parseEther(ethValue);

            const balance = await browserProvider.getBalance(signer.address);

            if (balance < amountEthWei){
                // setProcessing(false)
                setMessage("Low ETH balance")
                setAlert(true)
                return
            } 

            // setProcessingMessage("Confirming ETH Payment...")

            const tx = await contract.buyTicket(ticketId, ipfsHash, { value: amountEthWei, gasLimit: 300000 });
            const receipt = await tx.wait();

            console.log("Transaction confirmed:", receipt.hash);
            // const transaction_hash = receipt.hash;



        const verifyPaymentStatus = (ticketId) => {
            // 1. Create the interval
            const interval = setInterval(async () => {
              try {
                console.log("Polling database for order:", ticketId);

                const response = await axios.get(`${URL}/api/bookingVerify/${ticketId}`)
                console.log("Response Data: ",response.data.status);
                
          
                if (response.data.status === "paid") {
                  console.log("Payment Confirmed! Breaking loop.");
          
                  clearInterval(interval);
                  setProcessing(false);
                  setConfirmOrder(true);
  
                }
              } catch (error) {
                console.error("Polling error:", error);

              }
            }, 1000);

            setTimeout(() => {
                clearInterval(interval);
                if (isProcessing) {
                  setProcessing(false);
                  setMessage("Verification took too long. Please check your orders.");
                  setAlert(true);
                }
            }, 60000);

        };

            setProcessingMessage("Verifying database storage...");
            verifyPaymentStatus(orderId);


            setShowCart(false); 
            setMessage("Tickets Successfully Booked")
            setAlert(true)
            
        } catch (error) {
            console.error("Error fetching Tickets", error);
            setShowCart(false); 
            setMessage("Booking Failed. Please try again")
            setAlert(true)
        }
    };

    return (
        

        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="bg-blue-700 p-4 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg uppercase">{category.label} Booking</h3>
                        <p className="text-[10px] opacity-80">{ticket.team1} vs {ticket.team2}</p>
                    </div>
                    <button onClick={() => setShowCart(false)} className="text-2xl hover:text-red-400">&times;</button>
                </div>

                {/* 2. Added onSubmit to the form */}
                <form onSubmit={buyTickets} className="p-6 grid grid-cols-2 gap-3 max-h-[80vh] overflow-y-auto">
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400">FIRST NAME</label>
                        <input name="firstName" onChange={handleChange} required className="w-full border-b p-1 text-sm outline-none focus:border-blue-600" />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400">LAST NAME</label>
                        <input name="lastName" onChange={handleChange} required className="w-full border-b p-1 text-sm outline-none focus:border-blue-600" />
                    </div>
                    
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400">EMAIL</label>
                        <input name="email" type="email" onChange={handleChange} required className="w-full border-b p-1 text-sm outline-none focus:border-blue-600" />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400">PHONE</label>
                        <input name="phone" type="tel" onChange={handleChange} required className="w-full border-b p-1 text-sm outline-none focus:border-blue-600" />
                    </div>

                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400">City</label>
                        <input name="city" type="text" onChange={handleChange} className="w-full border-b p-1 text-sm outline-none focus:border-blue-600" />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400">TICKET QUANTITY</label>
                        <input name="quantity" type="number" min="1" defaultValue="1" onChange={handleChange} className="w-full border-b p-1 text-sm outline-none focus:border-blue-600" />
                    </div>

                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400">FULL ADDRESS</label>
                        <textarea name="address" onChange={handleChange} className="w-full border p-2 text-sm rounded outline-none h-20" />
                    </div>

                    <div className="col-span-2 bg-gray-50 p-4 rounded-xl flex justify-between items-center mt-2">
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Total Bill</p>
                            <p className="text-xl font-black text-blue-700">
                                {ticket[category.priceKey] * customer.quantity} $
                            </p>
                        </div>
                        {/* 3. Button type is "submit", so it triggers handleSubmit */}
                        <button type="submit" className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all cursor-pointer">
                            PAY NOW
                        </button>
                    </div>
                </form>
            </div>
        </div>
    
    );
};

export default Booking;