import { ArrowUpRight, Facebook, MessageCircle, Music2 } from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';
import { CONTACT_LINKS } from '../config/contact.js';
import './site-footer.css';

const icons = { line: MessageCircle, tiktok: Music2, facebook: Facebook };

export default function SiteFooter({ className = '' }) {
  return (
    <footer className={`site-footer ${className}`}>
      <a className="brand" href="/">
        <BrandLogo />
        <span>
          8 เซียน<span className="brand-sub">ราชาหมูกระทะ</span>
        </span>
      </a>
      <section className="site-footer-contact" aria-labelledby="contact-title">
        <h2 id="contact-title">ติดต่อเรา</h2>
        <nav className="site-footer-links" aria-label="ช่องทางติดต่อร้าน">
          {CONTACT_LINKS.map(({ label, href, type }) => {
            const Icon = icons[type];
            return (
              <a
                key={type}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (เปิดแท็บใหม่)`}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            );
          })}
        </nav>
      </section>
      <small className="site-footer-copy">
        © {new Date().getFullYear()} 8 Sian. All rights reserved.{' '}
        <a href="/privacy">นโยบายความเป็นส่วนตัว</a>
      </small>
    </footer>
  );
}
