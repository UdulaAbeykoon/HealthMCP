"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { I } from "./Icons";
import { USER } from "@/lib/seed";

const NAV = [
  { href: "/", label: "Chat", icon: I.home },
  { href: "/feed", label: "Action Feed", icon: I.feed, badge: true },
  { href: "/conductor", label: "Conductor", icon: I.cond },
  { href: "/recovery", label: "Recovery", icon: I.metrics },
  { href: "/nutrition", label: "Nutrition", icon: I.meal },
  { href: "/reflection", label: "Reflection", icon: I.reflect },
];
const NAV_FOOT = [
  { href: "/integrations", label: "Integrations", icon: I.link },
  { href: "/settings", label: "Settings", icon: I.cog },
];

function useTheme(): [string, () => void] {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const saved = (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) || "light";
    setTheme(saved);
  }, []);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("zenra-theme", next); } catch {}
  };
  return [theme, toggle];
}

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button className="zr-btn icon" onClick={toggle} aria-label="Toggle theme" style={{ color: "var(--text-dim)", width: 18, height: 18, boxSizing: "content-box" }}>
      {theme === "light" ? I.moon : I.sun}
    </button>
  );
}

function NavItem({ href, label, icon, badge, count, active, onClick }: {
  href: string; label: string; icon: ReactNode; badge?: boolean; count?: number; active: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} className={"zr-nav" + (active ? " is-active" : "")} onClick={onClick}>
      <span className="zr-nav-ic">{icon}</span>
      <span>{label}</span>
      {badge && count ? <span className="zr-nav-badge">{count}</span> : null}
    </Link>
  );
}

export function Shell({ children, topRight }: { children: ReactNode; topRight?: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/proposals").then((r) => r.json()).then((d) => {
      if (alive) setPending((d.proposals ?? []).filter((p: { status: string }) => p.status === "pending").length);
    }).catch(() => {});
    return () => { alive = false; };
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="zr-app">
      <aside className={"zr-side" + (open ? " open" : "")}>
        <Link href="/" className="zr-brand">
          <div className="zr-brand-mark" />
          <div>
            <div className="zr-brand-name">Zenra</div>
            <div className="zr-brand-sub">Energy agents</div>
          </div>
        </Link>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <NavItem key={n.href} {...n} count={pending} active={isActive(n.href)} onClick={() => setOpen(false)} />
          ))}
        </div>

        <div className="zr-promo">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: "var(--accent)", display: "grid", placeItems: "center", width: 16, height: 16 }}>{I.spark}</span>
            <span style={{ fontSize: 13 }}>The invisible team</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>
            Seven agents quietly organizing your life around your energy.
          </p>
          <Link href="/conductor" style={{ marginTop: 12, color: "var(--accent)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
            See them coordinate →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "auto" }}>
          {NAV_FOOT.map((n) => (
            <NavItem key={n.href} {...n} active={isActive(n.href)} onClick={() => setOpen(false)} />
          ))}
        </div>

        <div className="zr-side-foot" style={{ marginTop: 14 }}>
          <div className="zr-avatar">{USER.initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--text)" }}>{USER.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", overflow: "hidden", textOverflow: "ellipsis" }}>{USER.email}</div>
          </div>
          <span style={{ color: "var(--text-faint)" }}>{I.chevD}</span>
        </div>
      </aside>

      <main className="zr-main">
        <div className="zr-top">
          <button className="zr-btn icon zr-menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu"
            style={{ color: "var(--text-dim)" }}>
            {I.menu}
          </button>
          <div style={{ flex: 1 }} />
          <div className="zr-top-right">
            {topRight}
            <ThemeToggle />
          </div>
        </div>
        <div className="zr-content">{children}</div>
      </main>
    </div>
  );
}
