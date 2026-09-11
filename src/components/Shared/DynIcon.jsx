import React from 'react';
import * as Lucide from 'lucide-react';

/** Renders a Lucide icon by its PascalCase name, e.g. <DynIcon name="Dumbbell" /> */
export default function DynIcon({ name, size = 18, color, style, strokeWidth = 2, className }) {
  const Cmp = Lucide[name] || Lucide.Circle;
  return <Cmp size={size} color={color} style={style} strokeWidth={strokeWidth} className={className} />;
}
