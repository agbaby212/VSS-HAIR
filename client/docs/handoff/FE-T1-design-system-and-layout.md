# FE-T1: Design system and layout

Purpose: brand tokens, fonts, base components and the site layout that every page uses.

## What was built
- Tokens in `client/src/styles/index.css` (CSS variables) and mapped in `client/tailwind.config.ts`
- Fonts: Bodoni Moda (`font-display`) and Hanken Grotesk (`font-sans`, the default), loaded in `client/index.html`
- `components/ui/`: `Button`, `buttonClasses`, `Photo`
- `components/layout/`: `Layout`, `Header`, `Footer`, `MobileBar`, `LogoBadge`, `navLinks`
- `lib/format.ts` (`naira`), `lib/whatsapp.ts` (`whatsappChatUrl`)
- Pages: `Home` (temporary), `ComingSoon`, `StyleGuide` (dev only, route `/styleguide`)
- `client/public/logo.jpg`, used unaltered

## How other parts use it
- Colours: `bg-espresso`, `bg-cocoa`, `bg-ivory`, `bg-sand`, `text-gold-deep`, `text-gold-light`, `border-gold`. No opacity shortcuts like `bg-gold/50`
- Dark sections: add the class `on-dark` so focus rings use gold-light
- Foil: classes `foil-divider`, `foil-text`, `bg-foil`
- Button: `<Button variant="primary|secondary|gold" size="md|lg" loading loadingText="Sending order">`. Pass `type="submit"` for forms. A link that looks like a button: `<Link className={buttonClasses({ variant: "gold" })}>`
- Photo: `<Photo src alt width height shape="circle|arch|rect" rings={0|1|2} className="w-40" />`
- Money: `naira(4500000)` returns "₦45,000". Input is kobo
- New pages go inside the `<Route element={<Layout />}>` in `App.tsx`. Unbuilt paths show `ComingSoon`

## How to test it
Run `npm run dev` and open `/styleguide`. Check at 360px and on desktop. Tab through the page.

## Assumptions and known limitations
- Fonts come from Google Fonts (a self-hosted option needs approval)
- The logo has no explicit width and height yet (only `h-12 w-auto`)
- The mobile menu has no focus trap. Escape and the Close button work
- The Bag link has no item count until FE-T6 adds the cart
- `/styleguide` is not in production builds

## Related tasks
- Previous: [FE-T0](./FE-T0-project-setup.md)
- Next: [FE-T2](./FE-T2-contract-api-mocks.md)