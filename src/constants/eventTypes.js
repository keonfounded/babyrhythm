export const EVENT_TYPES = {
  feed: {
    label: 'Feed',
    icon: '🍼',
    color: 'bg-pink-500',
    hasDuration: false,
    hasAmount: true, // NEW
    amountUnit: 'oz', // NEW - can be 'oz' or 'ml'
    metadataFields: ['method', 'side', 'amount']
  },
  sleep: {
    label: 'Sleep',
    icon: '😴',
    color: 'bg-indigo-500',
    hasDuration: true,
    hasAmount: false,
    metadataFields: ['quality', 'location']
  },
  diaper: {
    label: 'Diaper',
    icon: '💩',
    color: 'bg-yellow-500',
    hasDuration: false,
    hasAmount: false,
    metadataFields: ['contents', 'rash']
  },
  note: {
    label: 'Note',
    icon: '📝',
    color: 'bg-gray-500',
    hasDuration: false,
    hasAmount: false,
    metadataFields: []
  }
};