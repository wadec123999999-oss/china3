import { decide } from './core.mjs';

const scenarios = {
  first_visit: { days: 3, firstVisit: true, interests: ['history_architecture', 'great_wall_must'] },
  hutong: { days: 3, interests: ['hutong_not_touristy', 'ethical_photo'] },
  art: { days: 3, interests: ['art_design', 'second_visit'] },
  late_arrival: { days: 2, arriveLate: true, interests: ['arrive_late'] },
  family: { days: 3, withFamily: true, interests: ['family', 'great_wall_must'] },
  booking: { days: 3, interests: ['booking_help_requested', 'great_wall_must'] }
};

export function runRegression() {
  return [
    ['BJR001', 'first_visit', 'BJM01'],
    ['BJR002', 'first_visit', 'BJM04'],
    ['BJR003', 'hutong', 'BJM03'],
    ['BJR004', 'art', 'BJM06'],
    ['BJR005', 'late_arrival', 'BJM07'],
    ['BJR006', 'family', 'BJM07'],
    ['BJR007', 'booking', 'BJM04']
  ].map(([id, scenario, module]) => {
    const result = decide(scenarios[scenario]);
    return { id, pass: result.status === 'draft_for_human_review' && result.selectedModules.some(item => item.id === module), modules: result.selectedModules.map(item => item.id) };
  });
}
