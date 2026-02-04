/**
 * Predefined developmental milestones organized by category
 * Based on common pediatric developmental guidelines
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
  motor: [
    { id: 'holds_head_up', label: 'Holds head up', typicalAge: '1-2 months' },
    { id: 'pushes_up_on_arms', label: 'Pushes up on arms when on tummy', typicalAge: '2-3 months' },
    { id: 'rolls_tummy_to_back', label: 'Rolls from tummy to back', typicalAge: '3-4 months' },
    { id: 'rolls_back_to_tummy', label: 'Rolls from back to tummy', typicalAge: '4-5 months' },
    { id: 'sits_with_support', label: 'Sits with support', typicalAge: '4-5 months' },
    { id: 'sits_unsupported', label: 'Sits without support', typicalAge: '6-7 months' },
    { id: 'crawls', label: 'Crawls', typicalAge: '7-10 months' },
    { id: 'pulls_to_stand', label: 'Pulls to standing', typicalAge: '8-10 months' },
    { id: 'cruises', label: 'Cruises along furniture', typicalAge: '9-12 months' },
    { id: 'stands_alone', label: 'Stands alone briefly', typicalAge: '10-12 months' },
    { id: 'first_steps', label: 'First steps', typicalAge: '11-14 months' },
    { id: 'walks_well', label: 'Walks well', typicalAge: '12-15 months' },
    { id: 'runs', label: 'Runs', typicalAge: '18-24 months' },
    { id: 'climbs_stairs', label: 'Climbs stairs with help', typicalAge: '18-24 months' },
    { id: 'kicks_ball', label: 'Kicks a ball', typicalAge: '18-24 months' }
  ],

  // Social & Emotional
  social: [
    { id: 'first_smile', label: 'First social smile', typicalAge: '6-8 weeks' },
    { id: 'laughs', label: 'Laughs out loud', typicalAge: '3-4 months' },
    { id: 'recognizes_parents', label: 'Recognizes parents', typicalAge: '3-4 months' },
    { id: 'enjoys_peek_a_boo', label: 'Enjoys peek-a-boo', typicalAge: '6-9 months' },
    { id: 'stranger_anxiety', label: 'Shows stranger anxiety', typicalAge: '6-9 months' },
    { id: 'waves_bye', label: 'Waves bye-bye', typicalAge: '9-12 months' },
    { id: 'shows_affection', label: 'Shows affection to familiar people', typicalAge: '12-18 months' },
    { id: 'plays_pretend', label: 'Plays simple pretend games', typicalAge: '18-24 months' },
    { id: 'parallel_play', label: 'Plays alongside other children', typicalAge: '18-24 months' },
    { id: 'shows_defiance', label: 'Shows independence/defiance', typicalAge: '18-24 months' }
  ],

  // Language & Communication
  language: [
    { id: 'coos', label: 'Coos and makes sounds', typicalAge: '2-3 months' },
    { id: 'babbles', label: 'Babbles (ba-ba, da-da)', typicalAge: '4-6 months' },
    { id: 'responds_to_name', label: 'Responds to name', typicalAge: '6-9 months' },
    { id: 'understands_no', label: 'Understands "no"', typicalAge: '9-12 months' },
    { id: 'first_word', label: 'First word (besides mama/dada)', typicalAge: '10-14 months' },
    { id: 'mama_dada', label: 'Says "mama" or "dada" with meaning', typicalAge: '10-14 months' },
    { id: 'points_at_things', label: 'Points at things', typicalAge: '12-14 months' },
    { id: 'follows_simple_commands', label: 'Follows simple commands', typicalAge: '12-18 months' },
    { id: 'says_several_words', label: 'Says 5+ words', typicalAge: '15-18 months' },
    { id: 'two_word_phrases', label: 'Two-word phrases', typicalAge: '18-24 months' },
    { id: 'knows_body_parts', label: 'Points to body parts', typicalAge: '18-24 months' }
  ],

  // Cognitive
  cognitive: [
    { id: 'tracks_objects', label: 'Tracks moving objects with eyes', typicalAge: '1-2 months' },
    { id: 'reaches_for_objects', label: 'Reaches for objects', typicalAge: '3-4 months' },
    { id: 'transfers_objects', label: 'Transfers objects between hands', typicalAge: '5-6 months' },
    { id: 'object_permanence', label: 'Understands object permanence', typicalAge: '8-12 months' },
    { id: 'finds_hidden_objects', label: 'Finds hidden objects', typicalAge: '8-12 months' },
    { id: 'uses_objects_correctly', label: 'Uses objects correctly (phone, cup)', typicalAge: '12-18 months' },
    { id: 'stacks_blocks', label: 'Stacks 2-3 blocks', typicalAge: '12-18 months' },
    { id: 'scribbles', label: 'Scribbles with crayon', typicalAge: '12-18 months' },
    { id: 'sorts_shapes', label: 'Sorts shapes and colors', typicalAge: '18-24 months' },
    { id: 'completes_simple_puzzles', label: 'Completes simple puzzles', typicalAge: '18-24 months' }
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
