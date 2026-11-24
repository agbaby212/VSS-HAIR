import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { PublicSettings } from "../../shared";

export type FaqItem = { id: string; question: string; answer: ReactNode };
export type FaqGroup = { title: string; items: FaqItem[] };

const link = "text-gold-deep underline underline-offset-4";

// Every number comes from the public settings. Before they load, the sentences still read fine
export function faqGroups(settings?: PublicSettings): FaqGroup[] {
  const orderHold = settings ? `${settings.orderHoldHours} hours` : "a set time";
  const bookingHold = settings ? `${settings.bookingHoldHours} hours` : "a set time";
  const bridalHold = settings ? `${settings.bridalHoldHours} hours` : "a set time";
  const deposit = settings ? `${settings.deposit.bridalPercent}% deposit` : "deposit";
  const notice = settings ? `${settings.minNoticeHoursHome} hours` : "enough time";

  return [
    {
      title: "Ordering and paying",
      items: [
        {
          id: "order-how",
          question: "How do I order?",
          answer: (
            <p>
              Choose what you want and open your bag. At checkout, give your name and phone number and press Send order on WhatsApp. We save your
              order and open WhatsApp with your message ready. Send it to the owner.
            </p>
          ),
        },
        {
          id: "pay-how",
          question: "How do I pay?",
          answer: (
            <p>
              After you send your order, the owner replies with her account details. You pay by bank transfer. When she sees your payment she marks
              your order paid. This site never takes payment and never asks for card details.
            </p>
          ),
        },
        {
          id: "hold",
          question: "How long do you keep my items while I pay?",
          answer: (
            <p>
              We keep your items for {orderHold}. If the order is not paid in that time, it is cancelled and the items go back on sale.
            </p>
          ),
        },
        {
          id: "sold-out",
          question: "What if something sells out?",
          answer: (
            <p>
              Sold-out choices are crossed out on the product page and cannot be added. If something sells out while it is in your bag, your bag
              tells you.
            </p>
          ),
        },
      ],
    },
    {
      title: "Delivery and pickup",
      items: [
        {
          id: "track",
          question: "How do I track my order?",
          answer: (
            <p>
              Open{" "}
              <Link to="/track" className={link}>
                Track an order
              </Link>{" "}
              and enter your order number and the phone number you used. You see if your order is awaiting payment, paid, processing, shipped or
              delivered, and the courier number when we have it.
            </p>
          ),
        },
        {
          id: "delivery",
          question: "How much is delivery, and how long does it take?",
          answer: (
            <p>
              The fee and the estimated time depend on your state. You see them at checkout before you send your order, and on the{" "}
              <Link to="/delivery" className={link}>
                Delivery and returns
              </Link>{" "}
              page.
            </p>
          ),
        },
        {
          id: "pickup",
          question: "Can I pick up my order?",
          answer: <p>Yes. Choose Pickup at checkout. There is no delivery fee.</p>,
        },
        {
          id: "returns",
          question: "Can I return something?",
          answer: (
            <p>
              Our rules for returns and exchanges are on the{" "}
              <Link to="/delivery" className={link}>
                Delivery and returns
              </Link>{" "}
              page.
            </p>
          ),
        },
      ],
    },
    {
      title: "Appointments",
      items: [
        {
          id: "book-how",
          question: "How do I book an appointment?",
          answer: (
            <p>
              Choose a service or package, then a date and time, and say if you want the salon or a home visit. Press Send booking on WhatsApp to
              send it to the owner. We hold your time for {bookingHold} while she confirms it. If it is not confirmed in that time, the time goes back
              on offer.
            </p>
          ),
        },
        {
          id: "home",
          question: "Do you come to my place?",
          answer: (
            <p>
              Some services can be done at your place. Choose Home visit when you book, and your area. A travel fee applies and depends on the area.
              Please book at least {notice} ahead. See the{" "}
              <Link to="/services#home-visits" className={link}>
                home visit areas and fees
              </Link>
              .
            </p>
          ),
        },
        {
          id: "change",
          question: "How do I change or cancel a booking?",
          answer: (
            <>
              <p>Use the link in your booking message to reschedule or cancel.</p>
              {settings && <p className="mt-2">{settings.cancellationPolicy.text}</p>}
            </>
          ),
        },
      ],
    },
    {
      title: "Bridal",
      items: [
        {
          id: "bridal-deposit",
          question: "How does bridal booking work?",
          answer: (
            <p>
              Tell us your event date, venue, call time and party size, and if you want a trial session. We hold your date for {bridalHold} while you
              pay the {deposit} by bank transfer to the owner. Once she confirms it, nobody else can book that date. See{" "}
              <Link to="/services#bridal" className={link}>
                bridal packages
              </Link>
              .
            </p>
          ),
        },
      ],
    },
  ];
}