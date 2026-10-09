import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { buttonClass } from "@/components/members/account";
import { useCopy } from "@/lib/i18n";
import { accountLink, homeLink, legalLink, memberPageLink } from "@/lib/lang-path";
import { legalCopy } from "@/lib/legal-copy";
import { pagesCopy } from "@/lib/members/pages-copy";
import {
  PAYMENT,
  currencyFor,
  isPeriod,
  paymentOn,
  periodsFor,
  price,
  type Period,
} from "@/lib/members/plans";
import type { Lang } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

const outlineButton =
  "inline-flex min-h-11 items-center justify-center border border-ink px-5 text-sm text-ink hover:bg-ink hover:text-paper";

/** Same column and way back as the About page. */
function Page({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  const lang = useLang();
  const copy = useCopy(lang);
  return (
    <Shell>
      <main className="px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="flex items-center justify-between gap-4 text-sm">
            <Link {...homeLink(lang)} className="inline-flex min-h-11 items-center text-pine">
              {copy.back}
            </Link>
          </div>
          <div className="flex max-w-2xl flex-col gap-4">
            <h1 className="text-4xl md:text-5xl">{title}</h1>
            <p className="text-pretty text-lg text-muted">{lead}</p>
          </div>
          {children}
        </div>
      </main>
    </Shell>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item} className="flex gap-3 border-t border-line py-3 text-[17px] leading-snug">
          <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-ink" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The supporting membership's prices: the first large, the others after it. */
function PriceList({ lang }: { lang: Lang }) {
  const words = pagesCopy(lang).membership;
  const [first, ...rest] = periodsFor(lang);
  if (!first) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl leading-none tabular-nums">{price(first, lang)}</span>
        <span className="text-muted">/ {words.per[first]}</span>
      </p>
      {rest.length ? (
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-muted">
          {rest.map((period, i) => (
            <span key={period} className="inline-flex items-baseline gap-x-2">
              {i === 0 ? <span>{words.or}</span> : <span aria-hidden="true">·</span>}
              <span className="text-xl leading-none text-ink tabular-nums">
                {price(period, lang)}
              </span>
              <span>/ {words.per[period]}</span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

/** /membership: the free and the supporting membership side by side, stacked on a phone. */
export function MembershipPage() {
  const lang = useLang();
  const words = pagesCopy(lang).membership;
  const label = "text-[11px] uppercase tracking-[0.14em] text-muted";
  return (
    <Page title={words.title} lead={words.lead}>
      <div className="grid border-y border-rule md:grid-cols-2">
        <section className="flex flex-col gap-5 py-8 md:pe-10">
          <h2 className={label}>{words.free.name}</h2>
          <p className="text-4xl leading-none">{words.free.price}</p>
          <Points items={words.free.points} />
          <Link {...accountLink(lang)} className={`${outlineButton} mt-auto self-start`}>
            {words.free.action}
          </Link>
        </section>
        <section className="flex flex-col gap-5 border-t border-rule py-8 md:border-t-0 md:border-s md:ps-10">
          <h2 className={label}>{words.paid.name}</h2>
          <PriceList lang={lang} />
          <Points items={words.paid.points} />
          <Link
            {...memberPageLink(lang, "payment")}
            className={`${buttonClass} mt-auto self-start`}
          >
            {words.paid.action}
          </Link>
        </section>
      </div>
      <p className="text-sm text-muted">
        {words.haveAccount}{" "}
        <Link {...accountLink(lang)} className="text-pine underline-offset-4 hover:underline">
          {words.signIn}
        </Link>
      </p>
    </Page>
  );
}

/** The period in the address (?plan=yearly), read after the page opens; else the first offered. */
function usePeriod(lang: Lang): [Period, (period: Period) => void] {
  const offered = periodsFor(lang);
  const [period, setPeriod] = useState<Period>(offered[0] ?? "yearly");
  useEffect(() => {
    try {
      const plan = new URLSearchParams(window.location.search).get("plan");
      if (isPeriod(plan) && periodsFor(lang).includes(plan)) setPeriod(plan);
    } catch {
      /* the default period stands */
    }
  }, [lang]);
  return [period, setPeriod];
}

function checkoutHref(period: Period, lang: Lang): string {
  const url = new URL(PAYMENT.checkoutUrl);
  url.searchParams.set("plan", period);
  url.searchParams.set("lang", lang);
  url.searchParams.set("currency", currencyFor(lang));
  return url.toString();
}

/** /payment: choose a period, see the total, go on to the provider's checkout. */
export function PaymentPage() {
  const lang = useLang();
  const all = pagesCopy(lang);
  const words = all.payment;
  const legal = legalCopy(lang);
  const [period, setPeriod] = usePeriod(lang);
  const per = all.membership.per[period];

  const option = (value: Period, name: string, note?: string) => (
    <label
      key={value}
      className="flex min-h-14 cursor-pointer items-center gap-4 border-t border-line py-3 first:border-t-0"
    >
      <input
        type="radio"
        name="period"
        value={value}
        checked={period === value}
        onChange={() => setPeriod(value)}
        className="size-4 shrink-0 accent-[var(--color-ink)]"
      />
      <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[17px]">
          {name}
          {note ? <span className="ms-3 text-sm text-pine">{note}</span> : null}
        </span>
        <span className="tabular-nums">
          {price(value, lang)} <span className="text-muted">/ {all.membership.per[value]}</span>
        </span>
      </span>
    </label>
  );

  return (
    <Page title={words.title} lead={words.lead}>
      <div className="grid gap-10 md:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col border-y border-rule">
            <legend className="sr-only">{words.period}</legend>
            {periodsFor(lang).map((value) =>
              option(
                value,
                words.periods[value],
                value === "yearly" ? words.yearlyNote[currencyFor(lang)] : undefined,
              ),
            )}
          </fieldset>
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted">{words.includes}</h2>
            <Points items={all.membership.paid.points} />
          </section>
        </div>

        <aside className="flex flex-col gap-5 self-start border-y border-rule py-6">
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted">{words.summary}</h2>
          <div className="flex flex-col gap-1">
            <p className="text-[17px]">{words.plan}</p>
            <p className="text-sm text-muted">{words.periods[period]}</p>
          </div>
          <p className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span>{words.total}</span>
            <span className="tabular-nums">
              <span className="text-2xl">{price(period, lang)}</span>{" "}
              <span className="text-muted">/ {per}</span>
            </span>
          </p>
          {paymentOn ? (
            <a href={checkoutHref(period, lang)} className={buttonClass}>
              {words.pay}
            </a>
          ) : (
            <>
              <button
                type="button"
                disabled
                aria-describedby="payment-waiting"
                className={buttonClass}
              >
                {words.pay}
              </button>
              <p id="payment-waiting" className="text-sm text-muted">
                {words.waiting}
              </p>
            </>
          )}
          <p className="text-sm text-muted">
            {legal.agree[0]}{" "}
            <Link
              {...legalLink(lang, "terms")}
              className="text-pine underline-offset-4 hover:underline"
            >
              {legal.terms.title.toLocaleLowerCase(lang)}
            </Link>{" "}
            {legal.agree[1]}{" "}
            <Link
              {...legalLink(lang, "refunds")}
              className="text-pine underline-offset-4 hover:underline"
            >
              {legal.refunds.title.toLocaleLowerCase(lang)}
            </Link>
            {lang === "tr" ? " " : ""}
            {legal.agree[2]}
          </p>
        </aside>
      </div>
      <Link
        {...memberPageLink(lang, "membership")}
        className="inline-flex min-h-11 items-center self-start text-pine"
      >
        {words.back}
      </Link>
    </Page>
  );
}

/** /newsletter: what the newsletter will be, and that it opens soon. */
export function NewsletterPage() {
  const lang = useLang();
  const words = pagesCopy(lang).newsletter;
  return (
    <Page title={words.title} lead={words.lead}>
      <div className="flex max-w-2xl gap-4 border-y border-rule py-7">
        <span
          aria-hidden="true"
          className="relative mt-1 inline-flex h-10 w-3 shrink-0 justify-center"
        >
          <span className="absolute h-10 w-px bg-ink" />
          <span className="mt-[15px] size-2 rounded-full bg-ink" />
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-xl md:text-2xl">{words.soon}</p>
          <p className="text-muted">{words.soonNote}</p>
        </div>
      </div>
    </Page>
  );
}
