import { faqGroups } from "../features/faq/faqItems";
import { usePublicSettings } from "../features/shop/queries";
import { buttonClasses } from "../components/ui/buttonClasses";
import { whatsappChatUrl } from "../lib/whatsapp";

export default function FAQ() {
  const { data: settings } = usePublicSettings();
  const groups = faqGroups(settings);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Frequently asked questions</h1>

      {groups.map((group, index) => (
        <section key={group.title} aria-labelledby={`faq-group-${index}`} className="mt-10">
          <h2 id={`faq-group-${index}`} className="text-3xl">
            {group.title}
          </h2>
          <div className="mt-3 border-t border-sand">
            {group.items.map((item) => (
              <details key={item.id} className="border-b border-sand py-1">
                <summary className="flex min-h-[2.75rem] cursor-pointer items-center py-2 text-lg font-medium">{item.question}</summary>
                <div className="max-w-prose pb-4">{item.answer}</div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="more-title" className="mt-12 bg-sand p-6">
        <h2 id="more-title" className="text-2xl">Still have a question?</h2>
        <p className="mt-2">Message the owner on WhatsApp and we will help.</p>
        <a href={whatsappChatUrl("Hello VSS Hair, I have a question.")} target="_blank" rel="noopener noreferrer" className={`${buttonClasses()} mt-4`}>
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
}