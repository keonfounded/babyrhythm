/**
 * Developmental Milestones
 *
 * Primary Source: CDC "Learn the Signs. Act Early" (Updated 2022)
 * URL: https://www.cdc.gov/act-early/milestones/index.html
 *
 * IMPORTANT NOTES:
 * - Ages represent when MOST children (75%+) achieve the milestone (2022 CDC update)
 * - The 2022 update shifted from 50th to 75th percentile for earlier identification of delays
 * - Individual children develop at their own pace - these are guidelines, not deadlines
 * - Some milestones (like crawling) are optional - many babies skip them entirely
 * - Always consult a pediatrician if you have developmental concerns
 *
 * Changes from pre-2022 guidelines:
 * - Rolling moved from 4 months to 6 months
 * - Walking alone moved from 12 months to 15 months
 * - Crawling removed as a required milestone (many babies skip it)
 */

export const MILESTONE_CATEGORIES = {
  motor: {
    label: 'Motor Skills',
    icon: '💪',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500'
  },
  social: {
    label: 'Social & Emotional',
    icon: '❤️',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500'
  },
  language: {
    label: 'Language & Communication',
    icon: '🗣️',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500'
  },
  cognitive: {
    label: 'Cognitive',
    icon: '🧠',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500'
  }
};

export const MILESTONES = {
  // Motor Skills (0-24 months progression)
  // Source: CDC Milestones 2022 - https://www.cdc.gov/act-early/milestones/index.html
  motor: [
    { id: 'holds_head_up', label: 'Holds head up when on tummy', typicalAge: '2 months' },
    { id: 'pushes_up_on_arms', label: 'Pushes up on arms when on tummy', typicalAge: '4 months' },
    { id: 'pushes_up_straight_arms', label: 'Pushes up with straight arms when on tummy', typicalAge: '6 months' },
    { id: 'rolls_over', label: 'Rolls over in both directions', typicalAge: '6 months' },
    { id: 'sits_without_support', label: 'Sits without support', typicalAge: '9 months' },
    { id: 'pulls_to_stand', label: 'Pulls to standing', typicalAge: '12 months' },
    { id: 'crawls', label: 'Crawls (optional - some babies skip)', typicalAge: '9-12 months', optional: true },
    { id: 'cruises', label: 'Walks holding onto furniture', typicalAge: '12 months' },
    { id: 'first_steps', label: 'Takes a few steps on own', typicalAge: '15 months' },
    { id: 'walks_well', label: 'Walks well independently', typicalAge: '18 months' },
    { id: 'runs', label: 'Runs', typicalAge: '2 years' },
    { id: 'climbs_stairs', label: 'Walks up stairs with help', typicalAge: '18 months' },
    { id: 'kicks_ball', label: 'Kicks a ball', typicalAge: '2 years' }
  ],

  // Social & Emotional
  // Source: CDC Milestones 2022
  social: [
    { id: 'calms_when_spoken_to', label: 'Calms down when spoken to or picked up', typicalAge: '2 months' },
    { id: 'first_smile', label: 'Smiles at people', typicalAge: '2 months' },
    { id: 'laughs', label: 'Laughs out loud', typicalAge: '4 months' },
    { id: 'looks_at_self', label: 'Likes to look at self in mirror', typicalAge: '6 months' },
    { id: 'stranger_anxiety', label: 'May be afraid of strangers', typicalAge: '9 months' },
    { id: 'has_favorite_things', label: 'Has favorite toys and people', typicalAge: '9 months' },
    { id: 'waves_bye', label: 'Waves bye-bye', typicalAge: '12 months' },
    { id: 'plays_games', label: 'Plays games like pat-a-cake', typicalAge: '12 months' },
    { id: 'shows_affection', label: 'Shows affection to familiar people', typicalAge: '15 months' },
    { id: 'plays_pretend', label: 'Plays simple pretend (feeds doll)', typicalAge: '18 months' },
    { id: 'parallel_play', label: 'Notices other children and joins them', typicalAge: '2 years' },
    { id: 'shows_defiance', label: 'Shows defiant behavior', typicalAge: '2 years' }
  ],

  // Language & Communication
  // Source: CDC Milestones 2022
  language: [
    { id: 'coos', label: 'Coos and makes sounds', typicalAge: '2 months' },
    { id: 'babbles', label: 'Babbles (strings of sounds)', typicalAge: '6 months' },
    { id: 'responds_to_name', label: 'Responds to own name', typicalAge: '9 months' },
    { id: 'understands_no', label: 'Understands "no"', typicalAge: '9 months' },
    { id: 'mama_dada', label: 'Says "mama" or "dada"', typicalAge: '12 months' },
    { id: 'simple_gestures', label: 'Uses simple gestures (shaking head no)', typicalAge: '12 months' },
    { id: 'tries_to_say_words', label: 'Tries to say 1-2 words besides mama/dada', typicalAge: '15 months' },
    { id: 'points_to_show', label: 'Points to show you something', typicalAge: '15 months' },
    { id: 'says_several_words', label: 'Says at least 3 words', typicalAge: '18 months' },
    { id: 'follows_simple_commands', label: 'Follows 1-step directions without gestures', typicalAge: '18 months' },
    { id: 'two_word_phrases', label: 'Says at least 2 words together', typicalAge: '2 years' },
    { id: 'points_in_book', label: 'Points to things in a book when asked', typicalAge: '2 years' },
    { id: 'knows_body_parts', label: 'Points to at least 2 body parts', typicalAge: '2 years' }
  ],

  // Cognitive
  // Source: CDC Milestones 2022
  cognitive: [
    { id: 'watches_you', label: 'Watches you as you move', typicalAge: '2 months' },
    { id: 'looks_at_toy', label: 'Looks at a toy for several seconds', typicalAge: '2 months' },
    { id: 'reaches_for_toy', label: 'Reaches for a toy they want', typicalAge: '4 months' },
    { id: 'puts_things_in_mouth', label: 'Puts things in mouth to explore', typicalAge: '6 months' },
    { id: 'looks_for_dropped', label: 'Looks for objects when dropped out of sight', typicalAge: '9 months' },
    { id: 'bangs_two_things', label: 'Bangs two things together', typicalAge: '9 months' },
    { id: 'follows_simple_directions', label: 'Follows simple directions', typicalAge: '12 months' },
    { id: 'uses_things_correctly', label: 'Uses things correctly (phone, cup)', typicalAge: '15 months' },
    { id: 'stacks_blocks', label: 'Stacks at least 2 small objects', typicalAge: '18 months' },
    { id: 'copies_you', label: 'Copies you doing chores', typicalAge: '18 months' },
    { id: 'plays_with_more_than_one_toy', label: 'Plays with more than one toy at a time', typicalAge: '2 years' },
    { id: 'kicks_ball_forward', label: 'Kicks a ball', typicalAge: '2 years' }
  ]
};

/**
 * Get all milestones as a flat array with category info
 */
export const getAllMilestones = () => {
  const all = [];
  Object.entries(MILESTONES).forEach(([category, milestones]) => {
    milestones.forEach(milestone => {
      all.push({
        ...milestone,
        category
      });
    });
  });
  return all;
};

/**
 * Get milestone by ID
 */
export const getMilestoneById = (id) => {
  for (const [category, milestones] of Object.entries(MILESTONES)) {
    const milestone = milestones.find(m => m.id === id);
    if (milestone) {
      return { ...milestone, category };
    }
  }
  return null;
};
