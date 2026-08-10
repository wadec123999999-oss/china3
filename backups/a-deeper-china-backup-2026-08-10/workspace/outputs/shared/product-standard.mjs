export const productCatalog = {
  version: '1.0',
  status: 'founder_test_and_internal_quote_only',
  currency: 'USD',
  legalNote: 'Prices are internal test guidance, not a public offer. Confirm payment, tax, consumer notice and refund rules for the selling entity and jurisdiction before launch.',
  products: [
    {
      id: 'route_preview',
      name: 'Free Route Preview',
      price: { launch: 0, standard: 0 },
      use: 'Lead generation and fit check.',
      includes: ['One route direction', 'One or two candidate modules', 'Unresolved questions'],
      excludes: ['Complete day-by-day roadbook', 'Human operational review', 'Bookings or experience quotes'],
      paymentAllowed: false
    },
    {
      id: 'deep_roadbook',
      name: 'Deep City Roadbook',
      price: { launch: 49, standard: 69 },
      use: 'A clear independent trip for one city, normally 2–4 days, when constraints are relatively simple.',
      fieldVerificationRequiredForPayment: false,
      humanCheckedLabelAllowed: false,
      includes: ['English or bilingual digital roadbook', 'Route thesis and daily questions', 'Selection and deletion reasons', 'Low-energy and rain alternatives', 'Dynamic-check list'],
      excludes: ['Bookings, tickets, hotels, transport, guiding, live support and third-party experiences'],
      paymentAllowed: true
    },
    {
      id: 'human_checked_roadbook',
      name: 'Human-Checked City Roadbook',
      price: { founder_test: 49, launch: 99, validated: 129 },
      use: 'First-time China visitors, families, older travellers, architecture/art clients, complex arrival windows or meaningful accessibility/food/weather constraints.',
      fieldVerificationRequiredForPayment: true,
      humanCheckedLabelAllowed: true,
      includes: ['Structured intake and latent-need review', 'Database-driven route selection', 'Human operational and boundary check', 'Main route plus conditional alternatives', 'One asynchronous revision', 'Delivery date and verification boundary'],
      excludes: ['Bookings, tickets, hotels, transport, guiding, medical advice, accessibility guarantees and third-party experience fees'],
      paymentAllowed: true
    }
  ],
  rules: {
    routePreviewNeverIncludesCompleteRoute: true,
    humanReviewRequiredBeforePaidDelivery: true,
    experienceInventoryNeverIncluded: true,
    noPublicPricePromiseUntilPaymentAndRefundPolicyApproved: true,
    scopeChangeIsNewQuote: true
  }
};
