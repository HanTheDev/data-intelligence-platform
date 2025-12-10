import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Database, Activity } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/scrapers', icon: Settings, label: 'Scrapers' },
    { path: '/data', icon: Database, label: 'Scraped Data' },
    { path: '/logs', icon: Activity, label: 'Activity Logs' }
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;