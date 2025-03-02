import React, { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Menu, X, ChevronDown, ChevronRight,
  Users, FileText, DollarSign, CheckCircle,
  Settings, Home, Globe, CreditCard,
  RefreshCw, BarChart2, Bell, ScrollText, Dock, AppWindow
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';

interface SubmenuItem {
  name: string;
  route: string;
  icon: React.ReactNode;
}

interface MenuItem {
  name: string;
  route?: string;
  icon: React.ReactNode;
  submenu?: SubmenuItem[];
}

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
  const { url } = usePage();
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', route: 'admin.dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Users', route: 'admin.users', icon: <Users className="w-5 h-5" /> },
    {
      name: 'Transactions',
      icon: <DollarSign className="w-5 h-5" />,
      submenu: [
        { name: 'All Transactions', route: 'admin.transactions', icon: <FileText className="w-4 h-4" /> },
        { name: 'Pending', route: 'admin.transactions.pending', icon: <RefreshCw className="w-4 h-4" /> },
        { name: 'Completed', route: 'admin.transactions.completed', icon: <CheckCircle className="w-4 h-4" /> }
      ]
    },
    { name: 'Remittances', route: 'admin.remittances', icon: <Globe className="w-5 h-5" /> },
    { name: 'KYC Approvals', route: 'admin.kyc', icon: <CheckCircle className="w-5 h-5" /> },
    {
      name: 'Reports',
      icon: <BarChart2 className="w-5 h-5" />,
      submenu: [
        { name: 'Transaction Reports', route: 'admin.reports.transactions', icon: <FileText className="w-4 h-4" /> },
        { name: 'User Reports', route: 'admin.reports.users', icon: <Users className="w-4 h-4" /> },
        { name: 'Revenue Reports', route: 'admin.reports.revenue', icon: <DollarSign className="w-4 h-4" /> }
      ]
    },
    {
        name: 'Content M.S.',
        icon: <AppWindow className="w-5 h-5" />,
        submenu: [
        { name: 'Blogs', route: 'admin.blogs', icon: <FileText className="w-5 h-5" /> },
        { name: 'Roadmap', route: 'admin.roadmaps', icon: <ScrollText className="w-5 h-5" /> },
        { name: 'Landing Page', route: 'admin.sections', icon: <Dock className="w-5 h-5" /> },
        { name: 'Teams', route: 'admin.teams', icon: <Users className="w-5 h-5" /> },

        ]
    },

    { name: 'Stellar Network', route: 'admin.stellar', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Settings', route: 'admin.settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Fixed isActive function to properly check current route in Inertia
  const isActive = (routeName?: string) => {
    if (!routeName) return false;

    // Get the current route from the URL path
    const currentPath = url;

    // Convert route name to expected path
    // This is a simplified version - you may need to adjust based on your route naming conventions
    const routePath = routeName.replace(/\./g, '/');

    // Check if the current path includes the route path
    return currentPath.includes(routePath);
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = item.route ? isActive(item.route) : false;
    const isExpanded = expandedMenus[item.name] || false;

    return (
      <li key={item.name} className="mb-1">
        {item.submenu ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.name)}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {isExpanded && (
              <ul className="pl-10 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={`/${subItem.route.replace(/\./g, '/')}`}
                      className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                        isActive(subItem.route) ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white'
                      }`}
                    >
                      <span className="mr-2">{subItem.icon}</span>
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <Link
            href={item.route ? `/${item.route.replace(/\./g, '/')}` : '#'}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              active ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`bg-white dark:bg-gray-800 w-64 shadow-lg fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <ApplicationLogo className="h-8 w-auto text-blue-600 dark:text-blue-400" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {menuItems.map(renderMenuItem)}
            </ul>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <nav className="bg-white dark:bg-gray-800 shadow-md z-20">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{header}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <Dropdown>
                <Dropdown.Trigger>
                  <button type="button" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                    <span className="mr-1">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                  <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                  <Dropdown.Link href="/logout" method="post" as="button">Log Out</Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
