import { ticketCart } from "../TicketContext";
import BookingItems from "./BookingItems";
import EmptyCart from "./EmptyCart";

function BookingCart() {
    const { displayCart, showCart } = ticketCart();

    if (!showCart) return null;

    return (
        <>
            {displayCart ? <BookingItems /> : <EmptyCart />}
        </>
    );
}

export default BookingCart;
