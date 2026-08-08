import React from 'react';
import type { NavPage } from '../types';
import {
  LayoutDashboard, Briefcase, FileCheck,
  Sparkles, User, Settings,
  Compass
} from 'lucide-react';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  followUpCount: number;
  draftCount: number;
}

const NAV_MAIN = [
  { id: 'dashboard'    as NavPage, label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'jobs'         as NavPage, label: 'Target Jobs',  icon: Briefcase },
  { id: 'applications' as NavPage, label: 'Applications', icon: FileCheck },
  { id: 'generator'   as NavPage, label: 'AI Generator', icon: Sparkles },
];

const NAV_BOTTOM = [
  { id: 'profile'  as NavPage, label: 'My Profile', icon: User },
  { id: 'settings' as NavPage, label: 'Settings',   icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, followUpCount, draftCount }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Compass size={20} strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <h2>JobPilot</h2>
          <span>AI Outreach</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main</span>
        {NAV_MAIN.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const badge = item.id === 'applications' && (followUpCount + draftCount) > 0
            ? followUpCount + draftCount
            : item.id === 'generator' ? null : null;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={2} className="nav-icon" />
              <span>{item.label}</span>
              {badge !== null && badge > 0 && (
                <span className="nav-badge" aria-label={`${badge} unread items`}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="sidebar-bottom" role="navigation" aria-label="Secondary navigation">
        {NAV_BOTTOM.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={2} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
