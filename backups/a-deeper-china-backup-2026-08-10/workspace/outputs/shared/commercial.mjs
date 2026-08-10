const experienceSignals = new Set([
  'experience_booking_requested','workshop','artist_visit','maker_experience','tea_farmer_visit','tea_ceremony',
  'tai_chi','martial_arts_training','wellness_healing','private_master_access','factory_visit','sourcing',
  'booking_help_requested'
]);
import { productCatalog } from './product-standard.mjs';

export function commercialFor(input = {}, followUps = []) {
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const experienceRequested = interests.some(item => experienceSignals.has(item));
  const intakeComplete = followUps.length === 0;
  return {
    mayQuote: false,
    mayTakePayment: false,
    mayPromiseAvailability: false,
    digitalRoadbook: {
      product: 'tailored research roadbook',
      mayOffer: true,
      mayTakePayment: intakeComplete,
      requiresHumanReview: true,
      fieldVerificationRequiredForPayment: false,
      humanScopeReviewRequiredForDelivery: true,
      fieldVerificationRequiredForHumanCheckedLabel: true,
      boundary: 'Payment, if accepted, is for a tailored research-based digital roadbook and scope review. It does not buy field verification, a guide, ticket, transport, venue, meal or third-party experience.'
    },
    productCatalog,
    recommendedProduct: interests.some(item => ['family','limited_mobility','tai_chi','wellness_healing','tea_farmer_visit','maker_experience','factory_visit','sourcing'].includes(item)) ? 'human_checked_roadbook' : 'deep_roadbook',
    quoteState: intakeComplete ? 'eligible_for_human_scope_quote' : 'intake_required_before_quote',
    thirdPartyExperience: {
      requested: experienceRequested,
      mayQuote: false,
      mayTakePayment: false,
      mayPromiseAvailability: false,
      state: experienceRequested ? 'research_candidate_release_required' : 'not_requested',
      reason: 'Experience inventory requires separate dated field evidence, provider consent, safety checks, price/cancellation terms and a release decision.'
    },
    policy: 'Research leads and supplier self-descriptions never become booking, quotation or payment authority.'
  };
}
