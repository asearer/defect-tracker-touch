import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, BarChart2, Settings, Wrench } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Quick login for demo purposes
    const handleLogin = async (role: string) => {
        setLoading(true);
        try {
            const accounts: Record<string, string> = {
                'Operator': 'op1@factory.com',
                'Quality': 'quality@factory.com',
                'Supervisor': 'super@factory.com',
                'Engineer': 'eng@factory.com',
                'Admin': 'admin@factory.com',
            };

            await login(accounts[role], 'password');

            if (role === 'Operator') navigate('/operator');
            else if (role === 'Quality') navigate('/quality');
            else navigate('/analytics');

        } catch (error) {
            alert('Login failed. Did you seed the database?');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { name: 'Operator', icon: User, color: 'text-blue-400' },
        { name: 'Quality', icon: Shield, color: 'text-green-400' },
        { name: 'Supervisor', icon: BarChart2, color: 'text-purple-400' },
        { name: 'Engineer', icon: Wrench, color: 'text-orange-400' },
        { name: 'Admin', icon: Settings, color: 'text-red-400' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl bg-slate-900 border-slate-800">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-4xl font-bold text-white mb-2">Defect Tracker Touch</CardTitle>
                    <p className="text-slate-400 text-lg">Select a role to enter the demo</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {roles.map((role) => (
                            <button
                                key={role.name}
                                disabled={loading}
                                onClick={() => handleLogin(role.name)}
                                className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-blue-500 transition-all group h-40"
                            >
                                <role.icon className={`w-12 h-12 mb-4 ${role.color} group-hover:scale-110 transition-transform`} />
                                <span className="font-semibold text-lg text-slate-200">{role.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-slate-500 text-sm">
                        <p>Credentials pre-filled for demo convenience.</p>
                        <p className="mt-2">Backend must be running with seeded users.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
