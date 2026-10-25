# Mobile layout and input checks

Verified using headless Edge (Chromium), touch/mobile emulation, with mocked API responses. No production database or real member records were used.

- Viewports: 320×740, 360×740, 390×844, 430×932, 768×1024 and landscape 740×360.
- Registration: numeric phone input limited to 10 digits; rejects invalid names; checks real birth dates; rejects all-space passwords; two-step form and privacy dialog remain reachable.
- Coupon shortcut: unauthenticated requests redirect to login; successful login returns to coupons; long member names and coupon descriptions fit; barcode dialog stays within the viewport and scrolls; logout returns home.
- 24 document-width checks passed across registration, wallet, barcode and home. Login throttling (429) disables submit and shows the retry countdown. Admin login was checked at 320×740, 390×844 and 740×360.
- Inputs use at least 16px text on mobile, focus outlines remain inside fields, and primary controls have a minimum 44px height. Initial focus is skipped for touch devices to avoid opening the keyboard automatically.

These checks cover browser emulation; physical iOS/Android keyboards, autofill overlays and scanning a barcode with the shop's actual reader still need device checks. Barcodes are visualized with fixture data, not valid redemption codes.
