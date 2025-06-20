import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

export default function StorageBreadcrumbs({ breadcrumbs, onNavigate }) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path || 'root'}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon 
                  className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" 
                  aria-hidden="true" 
                />
              )}
              
              <button
                onClick={() => onNavigate(crumb.path)}
                className={`text-sm font-medium hover:text-gray-900 focus:outline-none focus:underline ${
                  index === breadcrumbs.length - 1
                    ? 'text-gray-500 cursor-default hover:text-gray-500'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
                disabled={index === breadcrumbs.length - 1}
              >
                {index === 0 ? (
                  <div className="flex items-center">
                    <HomeIcon className="flex-shrink-0 h-4 w-4 mr-1" aria-hidden="true" />
                    {crumb.name}
                  </div>
                ) : (
                  crumb.name
                )}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 