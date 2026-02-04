import React from 'react';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryLabel
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">{icon}</span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
      {secondaryAction && (
        <button
          onClick={secondaryAction}
          className="mt-3 px-4 py-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
