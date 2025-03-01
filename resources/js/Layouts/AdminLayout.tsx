import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Menu, Users, FileText, DollarSign, CheckCircle, Settings } from 'lucide-react';

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className={`bg-white dark:bg-gray-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition duration-200 ease-in-out md:relative md:translate-x-0`}>
                <div className="flex items-center space-x-3 px-4">
                    <ApplicationLogo className="h-9 w-auto text-gray-800 dark:text-gray-200" />
                </div>
                <nav>
                    <div className="px-4 py-4">
                            <span className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Admin Panel</span>

                    </div>

                    <ul className="space-y-2">
                        <li>
                            <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <DollarSign className="inline-block w-5 h-5 mr-2 text-gray-800 dark:text-gray-200"/> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('admin.users')} active={route().current('admin.users')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <Users className="inline-block w-5 h-5 mr-2"/> Users
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('admin.transactions')} active={route().current('admin.transactions')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <FileText className="inline-block w-5 h-5 mr-2"/> Transactions
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('admin.kyc')} active={route().current('admin.kyc')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <CheckCircle className="inline-block w-5 h-5 mr-2"/> KYC Approvals
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('admin.blogs')} active={route().current('admin.blogs')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <FileText className="inline-block w-5 h-5 mr-2"/> Blogs
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('admin.sections')} active={route().current('admin.sections')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <FileText className="inline-block w-5 h-5 mr-2"/> Manage Content Sections
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('admin.settings')} active={route().current('admin.settings')} className="hover:bg-blue-500 hover:text-white transition-colors">
                                <Settings className="inline-block w-5 h-5 mr-2"/> Settings
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <nav className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 shadow-md">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                        <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{header}</h2>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button type="button" className="text-gray-500 dark:text-gray-400">
                                {user.name}
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </nav>
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
