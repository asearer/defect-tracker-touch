import { useAuth } from '@/context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Home, BarChart2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Operator', path: '/operator', icon: Home, roles: ['Operator', 'Supervisor', 'Admin', 'Engineer', 'Quality'] },
        // Everyone can see operator view for demo purposes, usually restricted
        { label: 'Quality API', path: '/quality', icon: ShieldCheck, roles: ['Quality', 'Supervisor', 'Engineer', 'Admin'] },
        { label: 'Analytics', path: '/analytics', icon: BarChart2, roles: ['Supervisor', 'Engineer', 'Admin'] },
        // { label: 'Admin', path: '/admin', icon: Settings, roles: ['Admin'] },
    ];

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
                <div>
                    <div className="h-16 flex items-center justify-center border-b border-slate-800">
                        <h1 className="text-xl font-bold text-blue-500 hidden lg:block">QES Touch</h1>
                        <h1 className="text-xl font-bold text-blue-500 lg:hidden">Q</h1>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            if (user && !item.roles.includes(user.role)) return null;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="hidden lg:block font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={logout}>
                        <LogOut className="w-5 h-5 mr-2" />
                        <span className="hidden lg:block">Logout</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-auto bg-slate-900 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
