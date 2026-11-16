import type { ReactNode } from "react";
import { LogoBadge } from "../components/layout/LogoBadge";
import { Button } from "../components/ui/Button";
import { Photo } from "../components/ui/Photo";
import { naira } from "../lib/format";

const colours = [
  { name: "espresso", hex: "#2B231C", use: "Body text, header, footer, dramatic sections" },
  { name: "cocoa", hex: "#4F3B2D", use: "Primary buttons, secondary dark sections" },
  { name: "ivory", hex: "#FCF9F3", use: "Page background, shopping areas" },
  { name: "sand", hex: "#F4E9D6", use: "Soft panels, forms, image placeholders" },
  { name: "gold", hex: "#C1A26B", use: "Rings, borders, ornaments. Decoration only on ivory" },
  { name: "gold-light", hex: "#F5D99A", use: "Gold text and highlights on dark sections" },
  { name: "gold-deep", hex: "#78581D", use: "Gold-coloured text on ivory, prices" },
] as const;

// Ratios are the checked values from Section 3 of the project prompt
const pairs = [
  { label: "espresso on ivory", fg: "espresso", bg: "ivory", ratio: "14.7:1" },
  { label: "gold-deep on ivory", fg: "gold-deep", bg: "ivory", ratio: "6.2:1" },
  { label: "gold-light on espresso", fg: "gold-light", bg: "espresso", ratio: "11.2:1" },
  { label: "ivory on cocoa", fg: "ivory", bg: "cocoa", ratio: "10.0:1" },
  { label: "espresso on gold", fg: "espresso", bg: "gold", ratio: "6.4:1" },
  { label: "gold on ivory (never for text)", fg: "gold", bg: "ivory", ratio: "2.3:1" },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-10">
      <h2 className="text-3xl">{title}</h2>
      <div className="foil-divider my-4 max-w-xs" />
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Style guide</h1>
      <p className="mt-2 max-w-prose">
        Every colour, type style and component in one place. This page only exists while you run
        npm run dev.
      </p>

      <Section title="Colours">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colours.map((c) => (
            <li key={c.name} className="overflow-hidden rounded-sm border border-sand">
              <div className="h-20" style={{ backgroundColor: `var(--color-${c.name})` }} />
              <div className="p-3">
                <p className="font-medium">
                  {c.name} <span className="font-normal">{c.hex}</span>
                </p>
                <p className="text-sm">{c.use}</p>
              </div>
            </li>
          ))}
          <li className="overflow-hidden rounded-sm border border-sand">
            <div className="h-20" style={{ backgroundImage: "var(--foil)" }} />
            <div className="p-3">
              <p className="font-medium">foil</p>
              <p className="text-sm">Monogram, button hover edge, thin dividers</p>
            </div>
          </li>
        </ul>
      </Section>

      <Section title="Contrast pairs">
        <ul className="grid gap-3 sm:grid-cols-2">
          {pairs.map((p) => (
            <li
              key={p.label}
              className="flex items-center justify-between gap-4 border border-sand px-4 py-3"
              style={{ backgroundColor: `var(--color-${p.bg})`, color: `var(--color-${p.fg})` }}
            >
              <span>{p.label}</span>
              <span className="font-medium">{p.ratio}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <div className="space-y-5">
          <p className="font-display text-5xl font-medium leading-[1.05] lg:text-6xl">
            Frontals that lay flat
          </p>
          <p className="text-4xl font-display font-medium">Heading 1, Bodoni Moda</p>
          <p className="text-3xl font-display font-medium">Heading 2, Bodoni Moda</p>
          <p className="text-2xl font-display font-medium">Heading 3, Bodoni Moda</p>
          <p className="max-w-prose">
            Body text is Hanken Grotesk. Lines stay under about 80 characters, so they are easy to
            read on a phone and on a big screen. Prices and totals use the heading font in
            gold-deep.
          </p>
          <p className="max-w-prose text-sm">Small text is still at least 14px.</p>
          <a href="#colours" className="text-gold-deep underline underline-offset-4">
            A link in gold-deep. Press Tab to see the focus ring
          </a>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Add to bag</Button>
          <Button variant="secondary">Track my order</Button>
          <Button size="lg">Send order on WhatsApp</Button>
          <Button loading loadingText="Sending order">
            Send order on WhatsApp
          </Button>
          <Button disabled>Sold out</Button>
        </div>
        <div className="on-dark mt-6 flex flex-wrap items-center gap-4 bg-espresso p-6">
          <Button variant="gold" size="lg">
            Book bridal date
          </Button>
          <Button variant="gold" loading loadingText="Saving booking">
            Book bridal date
          </Button>
        </div>
      </Section>

      <Section title="Photos">
        <div className="flex flex-wrap items-end gap-8">
          <Photo shape="circle" rings={2} width={400} height={400} alt="Photo placeholder" className="w-40" />
          <Photo shape="circle" rings={1} width={400} height={400} alt="Photo placeholder" className="w-32" />
          <Photo shape="circle" width={400} height={400} alt="Photo placeholder" className="w-24" />
          <Photo shape="arch" width={300} height={400} alt="Photo placeholder" className="w-32" />
          <Photo shape="rect" width={400} height={300} alt="Photo placeholder" className="w-40" />
        </div>
      </Section>

      <Section title="Logo and foil">
        <div className="on-dark flex flex-wrap items-center gap-6 bg-espresso p-6">
          <LogoBadge className="h-12" />
          <LogoBadge className="h-20" />
        </div>
        <div className="foil-divider mt-6" />
        <p className="foil-text mt-4 font-display text-5xl">Gold foil text</p>
      </Section>

      <Section title="Money">
        <p className="font-display text-3xl text-gold-deep">{naira(4500000)}</p>
        <p className="mt-1 text-gold-deep">{naira(125050)}</p>
      </Section>
    </div>
  );
}