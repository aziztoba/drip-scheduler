'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Settings,
} from 'lucide-react';

type NavItem = {
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Members', icon: Users, badge: 7, badgeColor: '#6366F1' },
  { label: 'Drip Schedule', icon: CalendarDays },
  { label: 'Engagement', icon: TrendingUp },
  { label: 'Revenue', icon: DollarSign },
  { label: 'Churn Risk', icon: AlertTriangle, badge: 3, badgeColor: '#EF4444' },
  { label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const [active, setActive] = useState('Dashboard');

  return (
    <aside
      className="flex flex-col flex-shrink-0 py-4"
      style={{
        width: 220,
        background: '#0D1526',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {navItems.map((item) => {
        const isActive = item.label === active;
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-colors relative"
            style={{
              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: isActive ? '#E2E8F7' : '#94A3B8',
              borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
              marginLeft: isActive ? 8 : 10,
            }}
          >
            <Icon size={16} style={{ color: isActive ? '#A855F7' : '#475569' }} />
            <span>{item.label}</span>
            {item.badge && (
              <span
                className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: `${item.badgeColor}25`,
                  color: item.badgeColor,
                  border: `1px solid ${item.badgeColor}40`,
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
