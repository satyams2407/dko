"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Facebook,
  Instagram,
  Leaf,
  Linkedin,
  Mic,
  Twitter
} from "lucide-react";

const farmFieldImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&auto=format&fit=crop";
const wheatFieldImage =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80&auto=format&fit=crop";
const tractorImage =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80&auto=format&fit=crop";
const cropCloseupImage =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop";
const farmerPhoneImage =
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80&auto=format&fit=crop";
const greenHillsImage =
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=80&auto=format&fit=crop";
const heroRenewablesVideo =
  "https://cdn.pixabay.com/video/2024/09/09/230545_large.mp4";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Reviews", href: "#reviews" },
  { label: "Products", href: "#products" },
  { label: "Blog", href: "#blog" }
];

const stats = [
  { value: 50, suffix: "+", label: "Years Of Experience" },
  { value: 200, suffix: "+", label: "Fields in Progress" },
  { value: 10000, suffix: "+", label: "Farmers Around India" },
  { value: 85, suffix: "%", label: "AI Confidence Rate" }
];

const productCards = [
  { number: "01", label: "Technology Irrigation", image: farmFieldImage },
  { number: "02", label: "Organic Fertilizer", image: wheatFieldImage },
  { number: "03", label: "Field Intelligence", image: cropCloseupImage },
  { number: "04", label: "Agricultural Maintain", image: tractorImage }
];

const solutions = [
  {
    title: "Farming Precision",
    description:
      "Our AI farming employs state-of-the-art technology to optimize every aspect of farm operations.",
    image: cropCloseupImage,
    featured: false
  },
  {
    title: "Crop Surveillance",
    description:
      "Track your crops' health and growth in real-time with our AI monitoring solutions.",
    image: farmerPhoneImage,
    featured: true
  },
  {
    title: "Automated Advisory",
    description:
      "Enhance farm efficiency with our cutting-edge AI advisory solutions.",
    image: null,
    featured: false
  }
];

export default function LandingPage() {
  return (
    <main className="relative bg-white text-[#0A0A0A]">
      <NavigationBar />
      <HeroSection />
      <HeroPhotoPanel />
      <StatsBar />
      <EditorialStatementSection />
      <ProductCarouselSection />
      <DarkBannerSection />
      <FeaturesSection />
      <GameChangerSection />
      <EmailCaptureBanner />
      <FooterSection />
    </main>
  );
}

function NavigationBar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-6 px-4 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <a className="flex items-center gap-2" href="#home">
          <Leaf className="h-5 w-5 text-[#2E7D32]" />
          <span className="text-base font-bold tracking-tight text-[#0A0A0A]">DKO</span>
        </a>

        <div className="hidden items-center justify-center md:flex">
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[11px] font-medium text-[#6B7280]">
              Top Notch Webinar Platform
            </span>
            <nav className="flex items-center gap-6 text-sm text-[#6B7280]">
              {navLinks.map((link, index) => (
                <a
                  key={link.label}
                  className={`transition hover:text-[#0A0A0A] ${index === 0 ? "font-medium text-[#0A0A0A]" : ""}`}
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 justify-self-end">
          <a className="hidden text-sm text-[#6B7280] transition hover:text-[#0A0A0A] sm:inline-flex" href="/farmer/login">
            Sign In
          </a>
          <motion.a
            className="inline-flex h-9 items-center rounded-full bg-[#0A0A0A] px-4 text-sm font-medium text-white"
            href="/farmer/login"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up Free <ArrowRight className="ml-1 h-4 w-4" />
          </motion.a>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const heroLines = ["Bring Fresh Growth", "To Agriculture."];

  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-8 md:py-28" id="home">
      <div className="absolute inset-0 overflow-hidden bg-[#0B180E]">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          poster={farmFieldImage}
        >
          <source src={heroRenewablesVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,9,0.36)_0%,rgba(7,16,9,0.5)_35%,rgba(7,16,9,0.66)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(170,255,188,0.18),transparent_32%),linear-gradient(90deg,rgba(7,16,9,0.44)_0%,rgba(7,16,9,0.12)_42%,rgba(7,16,9,0.44)_100%)]" />
      </div>

      <DecorativePlus className="left-[8%] top-12 hidden text-white/35 md:block" />
      <DecorativePlus className="right-[12%] top-24 hidden text-white/35 md:block" />
      <DecorativePlus className="bottom-24 left-[16%] hidden text-white/35 md:block" />
      <DecorativePlus className="bottom-16 right-[18%] hidden text-white/35 md:block" />

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-6xl flex-col items-center justify-center text-center">
        <motion.div
          className="rounded-full border border-white/24 bg-white/12 px-4 py-2 text-[12px] font-medium text-white backdrop-blur [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Agricultural Advisory Platform
        </motion.div>

        <div className="mt-8 space-y-1">
          {heroLines.map((line, index) => (
            <motion.h1
              key={line}
              className="mx-auto max-w-[780px] text-[48px] font-bold leading-[1.05] tracking-[-1.5px] text-white [text-shadow:0_8px_30px_rgba(0,0,0,0.45)] md:text-[72px] md:tracking-[-2px]"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {line}
            </motion.h1>
          ))}
        </div>

        <motion.p
          className="mx-auto mt-4 max-w-[560px] text-base leading-7 text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.38)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Experience AI guidance against a live backdrop of modern agriculture,
          where clean energy and productive fields move together.
        </motion.p>

        <motion.a
          className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 text-base font-medium text-[#0A0A0A] shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
          href="/farmer/query/text"
          whileHover={{ scale: 1.03, boxShadow: "0 22px 46px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </motion.a>
      </div>
    </section>
  );
}

function HeroPhotoPanel() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [-20, 20]);

  return (
    <section className="relative h-[480px] w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          y,
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.05) 100%), url('${farmFieldImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div className="relative z-10 flex h-full items-end justify-between gap-6 px-6 py-10 md:px-10">
        <div className="max-w-md text-white">
          <p className="text-[32px] font-light leading-tight">The Journey to a</p>
          <p className="text-[36px] font-bold leading-tight md:text-[40px]">Perfection.</p>
        </div>
        <a className="mb-2 hidden items-center text-sm text-white md:inline-flex" href="/farmer/query/text">
          Try the live text advisory <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="border-b border-[#E5E7EB] bg-white py-12" id="reviews">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 md:grid-cols-4 md:px-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center px-4 text-center ${index < stats.length - 1 ? "md:border-r md:border-[#E5E7EB]" : ""}`}
          >
            <CountUpStat value={stat.value} suffix={stat.suffix} />
            <p className="mt-2 text-[13px] text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EditorialStatementSection() {
  const linkTags = [
    { label: "AI-Powered Response", href: "/farmer/query/text" },
    { label: "Voice-First Design", href: "/farmer/query" }
  ];
  const pills = ["Text Query", "Voice Query", "Image Query"];

  return (
    <section className="bg-white px-4 py-16 md:px-16 md:py-20" id="about">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.32fr_0.68fr]">
        <div>
          <p className="text-[12px] uppercase tracking-[2px] text-[#6B7280]">2026</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {pills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] text-[#6B7280]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2
            className="max-w-4xl text-[32px] font-semibold leading-[1.3] text-[#0A0A0A] md:text-[36px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Despite Advances In Agri-Tech, Farmers Still Lack Immediate, Reliable
            Advisory Access.
          </h2>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-[#6B7280]">
            {linkTags.map((tag) => (
              <a key={tag.label} className="inline-flex items-center transition hover:underline" href={tag.href}>
                {tag.label} <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCarouselSection() {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollCards = (direction: "left" | "right") => {
    railRef.current?.scrollBy({
      left: direction === "right" ? 240 : -240,
      behavior: "smooth"
    });
  };

  return (
    <section className="bg-white px-4 py-12 md:px-16" id="products">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:gap-12">
        <div className="md:w-[200px] md:flex-shrink-0">
          <h3 className="text-[28px] font-bold text-[#0A0A0A]">Get Started Now</h3>
          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            Explore the Day 3 product experience: sign in, ask a text question, and get AI guidance.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white"
              onClick={() => scrollCards("left")}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white"
              onClick={() => scrollCards("right")}
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {productCards.map((card, index) => (
            <motion.a
              key={card.number}
              className="relative h-[280px] min-w-[200px] snap-start overflow-hidden rounded-3xl"
              href={index === 0 ? "/farmer/query/text" : index === 1 ? "/farmer/login" : index === 2 ? "/farmer/query" : "/dashboard/login"}
              whileHover={{ scale: 1.02, y: -4, boxShadow: "0 24px 48px rgba(10,10,10,0.18)" }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.05) 55%), url('${card.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="text-[12px] uppercase tracking-[2px] opacity-80">{card.number}</div>
                <div className="mt-2 text-sm font-bold">{card.label}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkBannerSection() {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(bannerRef, { once: true, margin: "-120px" });

  return (
    <section className="relative h-[420px] w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(26,46,26,0.72) 0%, rgba(26,46,26,0.45) 100%), url('${greenHillsImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <motion.div
        ref={bannerRef}
        className="relative z-10 flex h-full flex-col justify-between px-6 py-12 md:px-16 md:py-16"
        initial={{ opacity: 0, x: -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div>
          <p className="text-[12px] uppercase tracking-[2px] text-[#4CAF50]">
            AI Advisory Platform
          </p>
          <h2
            className="mt-4 max-w-[600px] text-[36px] font-bold leading-[1.1] text-white md:text-[52px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Collaborate And Learn From Agricultural Experts And Enthusiasts
          </h2>
        </div>

        <div className="flex items-end justify-between gap-6">
          <span className="inline-flex rounded-full bg-[#4CAF50] px-4 py-2 text-[12px] font-medium text-white">
            AI Powered
          </span>

          <motion.a
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6D00] text-white shadow-xl"
            href="/dashboard/login"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRight className="h-6 w-6" />
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });

  return (
    <section className="bg-white px-4 py-16 md:px-16 md:py-20" id="blog">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <h2
            className="text-[34px] font-bold leading-[1.1] text-[#0A0A0A] md:text-[40px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Next-Gen Solutions For Optimal Crop Growth
          </h2>
          <p className="max-w-xl text-base leading-7 text-[#6B7280]">
            We provide cutting-edge AI services to help farmers maximize crop yields.
            Our precision farming, real-time disease monitoring, and automation tools
            aim to revolutionize Indian agriculture.
          </p>
        </div>

        <div ref={sectionRef} className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3">
          {solutions.map((solution, index) => (
            <motion.article
              key={solution.title}
              className={`rounded-[24px] border p-4 ${solution.featured ? "border-[#C8E6C9] bg-[#F8FFF5]" : "border-[#E5E7EB] bg-white"}`}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: index * 0.12 }}
            >
              {solution.image ? (
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    alt={solution.title}
                    className="h-[180px] w-full object-cover"
                    src={solution.image}
                  />
                  {solution.featured ? (
                    <span className="absolute right-3 top-3 rounded-full bg-[#2E7D32] px-3 py-1 text-[11px] font-medium text-white">
                      AI Powered
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-[180px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1A2E1A_0%,#2E7D32_100%)]">
                  <div className="flex items-center gap-4">
                    {[Leaf, Mic, Camera].map((Icon, iconIndex) => (
                      <div
                        key={iconIndex}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur"
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="mt-4 text-[20px] font-semibold text-[#0A0A0A]">{solution.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{solution.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GameChangerSection() {
  return (
    <section className="bg-white px-4 py-16 md:px-16 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.35fr_0.65fr] md:items-center">
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#1A2E1A_0%,#2E7D32_65%,#6FA75B_100%)] p-8 text-white">
          <div className="grid min-h-[300px] grid-cols-2 gap-4">
            <div className="flex items-center justify-center rounded-3xl bg-white/8">
              <Leaf className="h-10 w-10" />
            </div>
            <div className="flex items-center justify-center rounded-3xl bg-white/10">
              <Mic className="h-10 w-10" />
            </div>
            <div className="col-span-2 flex items-center justify-center rounded-3xl bg-black/10">
              <Camera className="mr-3 h-10 w-10" />
              <span className="text-lg font-medium">Text · Voice · Image</span>
            </div>
          </div>
        </div>

        <div>
          <h2
            className="max-w-4xl text-[34px] font-bold leading-[1.2] text-[#0A0A0A] md:text-[44px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Changing The Game In Farming With AI-Powered Advisory And Smart
            Technologies, Shaping The Future Of Agriculture
          </h2>
        </div>
      </div>
    </section>
  );
}

function EmailCaptureBanner() {
  return (
    <section className="bg-white px-4 py-8 md:px-8 md:py-10">
      <div
        className="relative mx-auto h-[320px] max-w-[calc(100%-0px)] overflow-hidden rounded-[28px]"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.28)), url('${greenHillsImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <h2
            className="text-[34px] font-bold leading-[1.1] text-white md:text-[48px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Join the Agricultural Revolution Today!
          </h2>

          <div className="mt-8 flex w-full max-w-[520px] flex-col overflow-hidden rounded-full shadow-xl sm:flex-row">
            <input
              className="h-[52px] flex-1 bg-white px-6 text-base text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Email address"
              type="email"
            />
            <a
              className="inline-flex h-[52px] items-center justify-center bg-[#0A0A0A] px-7 text-base font-bold text-white"
              href="/farmer/login"
            >
              Subscribe <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const footerColumns = useMemo(
    () => [
      {
        title: "COMPANY",
        links: ["Features", "Pricing", "About Us", "Contact", "Blog"]
      },
      {
        title: "RESOURCE",
        links: ["Blog", "Customer Stories", "Information", "Legal", "Payments"]
      },
      {
        title: "CAREER",
        links: ["Jobs", "Hiring", "Talents"]
      },
      {
        title: "HELP",
        links: ["FAQ", "Help Center", "Support"]
      }
    ],
    []
  );

  const socials = [Twitter, Facebook, Instagram, Linkedin];

  return (
    <footer className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-4 py-16 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr]">
          <div>
            <a className="flex items-center gap-2" href="#home">
              <Leaf className="h-5 w-5 text-[#2E7D32]" />
              <span className="text-base font-bold text-[#0A0A0A]">DKO</span>
            </a>
            <p className="mt-3 max-w-sm text-sm leading-7 text-[#6B7280]">
              We are AI-powered agricultural advisors helping Indian farmers access
              expert guidance instantly.
            </p>
            <div className="mt-5 flex items-center gap-4">
              {socials.map((Icon, index) => (
                <button key={index} className="text-[#6B7280] transition hover:text-[#0A0A0A]" type="button">
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-[12px] font-semibold uppercase tracking-[2px] text-[#0A0A0A]">
                {column.title}
              </h4>
              <div className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <button
                    key={link}
                    className="block text-left text-sm leading-8 text-[#6B7280] transition hover:text-[#0A0A0A]"
                    type="button"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[#E5E7EB] pt-6 text-[13px] text-[#9CA3AF] md:flex-row md:items-center">
          <p>© 2026 Digital Krishi Officer. Built for farmers, powered by AI.</p>
          <p>Privacy Policy · Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}

function DecorativePlus({ className }: { className: string }) {
  return (
    <span className={`absolute text-[20px] font-light text-[#CBD5E1] ${className}`}>
      +
    </span>
  );
}

function CountUpStat({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    let frame = 0;
    const totalFrames = 40;
    const step = () => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (frame < totalFrames) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-[36px] font-extrabold leading-none tracking-[-1px] text-[#0A0A0A] md:text-[56px]">
      {displayValue.toLocaleString("en-IN")}
      {suffix}
    </div>
  );
}
