const faqs = [
  {
    question: "When do I pay?",
    answer:
      "Half the order total is paid on this site before the workshop packs the goods. The other half is paid on the tracking page after the shipment arrives and the status changes to Arrived. Both amounts are shown before you enter a card. Nothing else is collected in between.",
  },
  {
    question: "Why does delivery take 8–15 business days?",
    answer:
      "These goods ship from the workshop in China, not from a domestic warehouse. After a 1–2 business day quality check, the parcel moves by tracked international line-haul and then a local carrier. Most orders land inside 8–15 business days. We print that window because it is the real one.",
  },
  {
    question: "When does the tracking number show up?",
    answer:
      "When the workshop hands the parcel to the line-haul carrier. The order status changes to Shipped, and the international tracking number appears on the tracking page. We do not publish a placeholder number before that scan.",
  },
  {
    question: "What can make it longer than 15 business days?",
    answer:
      "Customs inspections, a missed line-haul cutoff, or a local-carrier delay. Those extra days sit outside the workshop. If a parcel is held, the tracking page still shows the last status we have, including the supplier reference once the workshop has accepted the order.",
  },
  {
    question: "What is the supplier reference?",
    answer:
      "It is the China order ID on the workshop’s own books. Pending orders often do not have one yet. Processing and shipped orders do. If a carton needs to be found in the workshop, that ID is how it is found.",
  },
  {
    question: "Why do you publish weight and carton size?",
    answer:
      "Freight is priced on the packed carton, not on the object sitting on a table. Weight is the packed shipping weight. Dimensions are the carton. Both are on the product page so the import cost is visible before you buy.",
  },
  {
    question: "Does the $12 shipping line cover duties?",
    answer:
      "No. The $12 is a flat contribution toward tracked international line-haul. It is not a carrier quote, and heavier cartons are already reflected in the product price. If your country charges duty or tax, customs bills you. Oriel does not collect that amount.",
  },
];

export function FaqList() {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base sm:text-lg [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <span
              aria-hidden
              className="mt-0.5 h-2 w-2 shrink-0 rotate-45 border-b border-r border-current transition group-open:-translate-y-0.5 group-open:rotate-[225deg]"
            />
          </summary>
          <p className="max-w-3xl pb-5 text-sm leading-relaxed text-muted sm:text-base">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
