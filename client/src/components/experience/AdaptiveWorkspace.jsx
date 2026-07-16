import { useState, useMemo } from 'react';
import { Layout, GripVertical, Eye, EyeOff } from 'lucide-react';

const WIDGET_REGISTRY = {
  'ai-coach': { label: 'AI Coach', defaultVisible: true, minReadiness: 0, maxReadiness: 100 },
  'daily-mission': { label: 'Daily Mission', defaultVisible: true, minReadiness: 0, maxReadiness: 100 },
  'readiness': { label: 'Readiness', defaultVisible: true, minReadiness: 0, maxReadiness: 100 },
  'goal-progress': { label: 'Goal Progress', defaultVisible: true, minReadiness: 0, maxReadiness: 100 },
  'weekly-review': { label: 'Weekly Review', defaultVisible: true, minReadiness: 0, maxReadiness: 100 },
  'focus-banner': { label: 'Focus Banner', defaultVisible: true, minReadiness: 0, maxReadiness: 100 },
};

function getContextualPriority(studentContext) {
  const priority = [];

  const readiness = studentContext?.readinessScore ?? 50;
  const goals = studentContext?.goals?.length || 0;
  const missionActive = !!studentContext?.dailyMission;
  const overdueTasks = studentContext?.overdueTasks || 0;
  const daysToPlacement = studentContext?.daysToPlacement;

  if (overdueTasks > 0) priority.push('daily-mission');
  if (readiness < 40) priority.push('readiness', 'goal-progress');
  if (goals > 0) priority.push('goal-progress');
  if (missionActive) priority.push('daily-mission');
  if (daysToPlacement != null && daysToPlacement <= 60) priority.push('readiness');
  if (readiness >= 60) priority.push('weekly-review');

  return priority;
}

export default function AdaptiveWorkspace({
  studentContext,
  widgets: widgetProps,
  children,
}) {
  const [customOrder, setCustomOrder] = useState(null);
  const [hidden, setHidden] = useState(new Set());

  const prioritizedOrder = useMemo(() => {
    if (customOrder) return customOrder;
    return getContextualPriority(studentContext || {});
  }, [customOrder, studentContext]);

  const toggleWidget = (key) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return null; // This is a logical wrapper — widgets are rendered inline in LivingSurface
}

export function useAdaptiveLayout(studentContext) {
  const [customOrder, setCustomOrder] = useState(null);

  const order = useMemo(() => {
    if (customOrder) return customOrder;

    const priority = [];
    const readiness = studentContext?.readinessScore ?? 50;
    const goals = studentContext?.goals?.length || 0;
    const missionActive = !!studentContext?.dailyMission;
    const overdueTasks = studentContext?.overdueTasks || 0;
    const daysToPlacement = studentContext?.daysToPlacement;

    if (overdueTasks > 0) priority.push('daily-mission', 'focus-banner');
    if (readiness < 60) priority.push('readiness', 'ai-coach');
    if (goals > 0) priority.push('goal-progress');
    if (missionActive) priority.push('daily-mission');
    if (daysToPlacement != null && daysToPlacement <= 60) priority.push('readiness');
    priority.push('weekly-review');

    const all = [...new Set(priority)];
    const remaining = ['ai-coach', 'daily-mission', 'readiness', 'goal-progress', 'weekly-review', 'focus-banner']
      .filter((w) => !all.includes(w));
    return [...all, ...remaining];
  }, [customOrder, studentContext]);

  return { order, setCustomOrder };
}
