export const EVENT_TYPES = {
  feed: {
    label: 'Feed',
    icon: '🍼',
    color: 'bg-pink-500',
    hasDuration: false,
    hasAmount: true,
    amountUnit: 'oz',
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
  pump: {
    label: 'Pump',
    icon: '🧴',
    color: 'bg-purple-500',
    hasDuration: true,
    hasAmount: true,
    amountUnit: 'oz',
    metadataFields: ['side', 'amount', 'duration']
  },
  medication: {
    label: 'Medication',
    icon: '💊',
    color: 'bg-red-500',
    hasDuration: false,
    hasAmount: false,
    metadataFields: ['name', 'dosage']
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