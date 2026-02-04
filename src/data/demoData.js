/**
 * Demo data for a 1-year-old baby named "Demo Baby"
 * Shows what the app looks like with extensive use
 */

// Helper to generate date keys
const getDateKey = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Helper to generate random time within range
const randomTime = (minHour, maxHour) => {
  const hour = minHour + Math.random() * (maxHour - minHour);
  return Math.round(hour * 4) / 4; // Round to 15 min
};

// Generate sleep events for a day (1 year old pattern: 1-2 naps + night sleep)
const generateDaySleepEvents = (isWeekday) => {
  const events = [];

  // Morning nap (sometimes)
  if (Math.random() > 0.6) {
    const start = randomTime(9, 10);
    events.push({
      type: 'sleep',
      startTime: start,
      endTime: start + randomTime(0.5, 1.5),
      note: Math.random() > 0.7 ? 'Short morning nap' : ''
    });
  }

  // Afternoon nap (usually)
  if (Math.random() > 0.2) {
    const start = randomTime(12.5, 14);
    events.push({
      type: 'sleep',
      startTime: start,
      endTime: start + randomTime(1, 2.5),
      note: Math.random() > 0.8 ? 'Good nap!' : ''
    });
  }

  // Night sleep (always) - represented as ending in morning
  events.push({
    type: 'sleep',
    startTime: randomTime(19, 20.5),
    endTime: randomTime(6, 7.5) + 24, // Next day
    note: Math.random() > 0.9 ? 'Slept through the night!' : ''
  });

  return events;
};

// Generate feed events for a day (1 year old: 3 meals + snacks + maybe bottle)
const generateDayFeedEvents = () => {
  const events = [];
  const feedTypes = ['bottle', 'solids', 'snack'];

  // Breakfast
  events.push({
    type: 'feed',
    startTime: randomTime(7, 8),
    feedType: 'solids',
    amount: Math.random() > 0.5 ? Math.round(Math.random() * 4 + 4) : null,
    note: Math.random() > 0.8 ? 'Oatmeal with fruit' : ''
  });

  // Morning milk/snack
  if (Math.random() > 0.3) {
    events.push({
      type: 'feed',
      startTime: randomTime(9.5, 10.5),
      feedType: Math.random() > 0.5 ? 'bottle' : 'snack',
      amount: Math.random() > 0.5 ? Math.round(Math.random() * 3 + 4) : null,
      note: ''
    });
  }

  // Lunch
  events.push({
    type: 'feed',
    startTime: randomTime(11.5, 12.5),
    feedType: 'solids',
    amount: null,
    note: Math.random() > 0.85 ? 'Tried new food - loved it!' : ''
  });

  // Afternoon snack
  events.push({
    type: 'feed',
    startTime: randomTime(15, 16),
    feedType: 'snack',
    amount: null,
    note: ''
  });

  // Dinner
  events.push({
    type: 'feed',
    startTime: randomTime(17.5, 18.5),
    feedType: 'solids',
    amount: null,
    note: Math.random() > 0.9 ? 'Family dinner' : ''
  });

  // Bedtime bottle
  if (Math.random() > 0.4) {
    events.push({
      type: 'feed',
      startTime: randomTime(18.5, 19.5),
      feedType: 'bottle',
      amount: Math.round(Math.random() * 2 + 6),
      note: ''
    });
  }

  return events;
};

// Generate diaper events for a day
const generateDayDiaperEvents = () => {
  const events = [];
  const count = Math.floor(Math.random() * 3) + 5; // 5-7 diapers

  for (let i = 0; i < count; i++) {
    const hour = 7 + (i * 2) + Math.random();
    const types = ['wet', 'wet', 'wet', 'dirty', 'both'];
    events.push({
      type: 'diaper',
      startTime: Math.round(hour * 4) / 4,
      diaperType: types[Math.floor(Math.random() * types.length)],
      note: ''
    });
  }

  return events;
};

// Generate note events
const generateDayNotes = (daysAgo) => {
  const notes = [];

  // Occasional notes
  if (Math.random() > 0.85) {
    const noteOptions = [
      'Pediatrician visit - all good!',
      'Started walking more confidently',
      'Said "mama" clearly!',
      'Tried avocado - made a face',
      'Played at the park',
      'First tooth coming in',
      'Seems fussy today',
      'Bath time was fun!',
      'Grandparents visited',
      'Very happy today!'
    ];
    notes.push({
      type: 'note',
      startTime: randomTime(10, 16),
      note: noteOptions[Math.floor(Math.random() * noteOptions.length)]
    });
  }

  return notes;
};

// Generate daily schedule with events
const generateDailySchedules = (days = 60) => {
  const schedules = {};

  for (let i = 0; i < days; i++) {
    const dateKey = getDateKey(i);
    const isWeekday = new Date(dateKey).getDay() > 0 && new Date(dateKey).getDay() < 6;

    const sleepEvents = generateDaySleepEvents(isWeekday);
    const feedEvents = generateDayFeedEvents();
    const diaperEvents = generateDayDiaperEvents();
    const noteEvents = generateDayNotes(i);

    const allEvents = [...sleepEvents, ...feedEvents, ...diaperEvents, ...noteEvents]
      .map((event, idx) => ({
        ...event,
        id: `demo-${dateKey}-${idx}`,
        date: dateKey
      }))
      .sort((a, b) => a.startTime - b.startTime);

    schedules[dateKey] = {
      date: dateKey,
      loggedEvents: allEvents
    };
  }

  return schedules;
};

// Generate weight history for a 1 year old (born ~365 days ago)
const generateWeightHistory = () => {
  const history = [];
  const birthWeight = 3.4; // kg

  // Weight gain pattern: rapid first 6 months, then slower
  const weights = [
    { daysAgo: 365, weight: birthWeight, note: 'Birth weight' },
    { daysAgo: 358, weight: 3.2, note: 'Lost some weight (normal)' },
    { daysAgo: 351, weight: 3.5, note: 'Regained birth weight' },
    { daysAgo: 335, weight: 4.2, note: '1 month checkup' },
    { daysAgo: 305, weight: 5.1, note: '2 month checkup' },
    { daysAgo: 275, weight: 5.9, note: '3 month checkup' },
    { daysAgo: 245, weight: 6.5, note: '4 month checkup' },
    { daysAgo: 185, weight: 7.4, note: '6 month checkup' },
    { daysAgo: 120, weight: 8.2, note: '9 month checkup' },
    { daysAgo: 30, weight: 9.1, note: '12 month checkup' },
    { daysAgo: 7, weight: 9.3, note: 'Home measurement' },
  ];

  return weights.map(w => ({
    date: getDateKey(w.daysAgo),
    weight: w.weight,
    note: w.note
  }));
};

// Generate milestones achieved
const generateMilestones = () => {
  return {
    // Motor skills
    'holds_head_up': { achieved: true, date: getDateKey(320), note: 'During tummy time' },
    'rolls_over': { achieved: true, date: getDateKey(280), note: 'Back to tummy first' },
    'sits_unsupported': { achieved: true, date: getDateKey(220), note: '' },
    'crawls': { achieved: true, date: getDateKey(170), note: 'Army crawl at first' },
    'pulls_to_stand': { achieved: true, date: getDateKey(120), note: '' },
    'first_steps': { achieved: true, date: getDateKey(45), note: '3 steps to daddy!' },
    'walks_well': { achieved: false, date: null, note: '' },

    // Social
    'first_smile': { achieved: true, date: getDateKey(330), note: 'Smiled at mommy' },
    'laughs': { achieved: true, date: getDateKey(300), note: '' },
    'recognizes_family': { achieved: true, date: getDateKey(270), note: '' },
    'stranger_anxiety': { achieved: true, date: getDateKey(180), note: '' },
    'waves_bye': { achieved: true, date: getDateKey(90), note: '' },
    'plays_peekaboo': { achieved: true, date: getDateKey(150), note: '' },

    // Language
    'coos': { achieved: true, date: getDateKey(310), note: '' },
    'babbles': { achieved: true, date: getDateKey(240), note: 'Ba-ba-ba!' },
    'responds_to_name': { achieved: true, date: getDateKey(200), note: '' },
    'first_word': { achieved: true, date: getDateKey(60), note: 'Said "dada"' },
    'says_mama': { achieved: true, date: getDateKey(30), note: '' },

    // Cognitive
    'tracks_objects': { achieved: true, date: getDateKey(340), note: '' },
    'reaches_for_toys': { achieved: true, date: getDateKey(280), note: '' },
    'object_permanence': { achieved: true, date: getDateKey(180), note: 'Looks for hidden toy' },
    'points_at_things': { achieved: true, date: getDateKey(80), note: '' },
    'uses_pincer_grasp': { achieved: true, date: getDateKey(160), note: 'Picks up cheerios' }
  };
};

// Demo baby profile
export const demoBabyProfile = {
  name: 'Demo Baby',
  birthDate: getDateKey(365), // 1 year old
  sex: 'girl',
  weightUnit: 'kg',
  feedingType: 'mixed',
  weightHistory: generateWeightHistory(),
  pediatrician: 'Dr. Smith, Sunshine Pediatrics',
  allergies: 'None known',
  medications: 'Vitamin D drops'
};

// Generate all demo data
export const generateDemoData = () => {
  return {
    profile: demoBabyProfile,
    dailySchedules: generateDailySchedules(60), // 60 days of data
    milestones: generateMilestones()
  };
};

export default generateDemoData;
