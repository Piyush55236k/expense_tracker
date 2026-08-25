import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Dynamically render Lucide Icon by name with fallback
 */
export default function CategoryIcon({ name, size = 20, color = 'currentColor', className = '' }) {
  const IconComponent = Icons[name] || Icons.Tag || Icons.HelpCircle;
  return <IconComponent size={size} color={color} className={className} />;
}
