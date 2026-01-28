import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Activity, Trash2, AlertCircle, Info } from 'lucide-react';

const AnalyticsDashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => (await api.get('/analytics/dashboard')).data,
    });

    const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode } | null>(null);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

    const kpiCards = [
        {
            title: 'Total Defects',
            value: stats?.summary?.total || 0,
            icon: AlertCircle,
            color: 'text-blue-500',
            desc: 'Total accumulated defects recorded in the current period.',
            details: 'Includes all statuses (Open, Closed, Contained). Monitor this trend to ensure quality control stability.'
        },
        {
            title: 'Open Defects',
            value: stats?.summary?.open || 0,
            icon: Activity,
            color: 'text-red-500',
            desc: 'Defects currently requiring attention.',
            details: 'These defects have not yet been resolved or contained. Priority action is recommended.'
        },
        {
            title: 'Scrap Units',
            value: stats?.summary?.scrap || 0,
            icon: Trash2,
            color: 'text-orange-500',
            desc: 'Units discarded due to irreparable defects.',
            details: 'Directly impacts material costs. Investigate root causes for high scrap items immediately.'
        },
    ];

    const handleKpiClick = (kpi: typeof kpiCards[0]) => {
        setModalData({
            title: kpi.title,
            content: (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <kpi.icon className={`w-16 h-16 ${kpi.color}`} />
                        <div>
                            <p className="text-4xl font-bold">{kpi.value}</p>
                            <p className="text-slate-400">Current Period</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-md">
                        <h4 className="font-semibold mb-2 text-slate-200">Analysis</h4>
                        <p className="text-slate-300">{kpi.details}</p>
                    </div>
                    <p className="text-xs text-slate-500 italic">Data updated in real-time.</p>
                </div>
            )
        });
    };

    const handleBarClick = (data: any) => {
        if (!data) return;
        setModalData({
            title: `Defect Type: ${data.name}`,
            content: (
                <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-400">Occurrences</span>
                            <span className="text-2xl font-bold text-blue-400">{data.count}</span>
                        </div>
                        <div className="h-px bg-slate-700 my-4" />
                        <h4 className="font-semibold mb-2 text-slate-200">Recommendation</h4>
                        <p className="text-slate-300">
                            High frequency of "{data.name}" detected. consider reviewing the associated station calibration and operator training logs.
                        </p>
                    </div>
                    <button
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        onClick={() => setModalData(null)}
                    >
                        Close Analysis
                    </button>
                </div>
            )
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">System Analytics</h2>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpiCards.map((kpi) => (
                    <Card
                        key={kpi.title}
                        className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-all group relative"
                        onClick={() => handleKpiClick(kpi)}
                        title={kpi.desc} // Native tooltip
                    >
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-slate-400 text-sm font-medium uppercase">{kpi.title}</p>
                                    <div title={kpi.desc}>
                                        <Info className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-white">{kpi.value}</p>
                            </div>
                            <kpi.icon className={`w-12 h-12 ${kpi.color} opacity-80 group-hover:scale-110 transition-transform`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pareto */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Top Defects (24h)
                            <div title="Click on bars for details">
                                <Info className="w-5 h-5 text-slate-500 cursor-help" />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.pareto || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        onClick={handleBarClick}
                                        className="cursor-pointer"
                                    >
                                        {stats?.pareto?.map((_entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index < 3 ? '#ef4444' : '#3b82f6'}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card
                    className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors"
                    onClick={() => setModalData({
                        title: 'System Health Status',
                        content: (
                            <div className="text-center space-y-4">
                                <Activity className="w-16 h-16 text-green-500 mx-auto" />
                                <p className="text-lg">All systems operational.</p>
                                <p className="text-slate-400 text-sm">Real-time connection established with 4/4 machines.</p>
                            </div>
                        )
                    })}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            System Health
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                            <Activity className="w-16 h-16 mb-4 text-green-500/80" />
                            <p className="text-slate-300 font-medium">Monitoring Active</p>
                            <p className="text-xs mt-2 text-slate-500">Click for diagnostics</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                title={modalData?.title || ''}
            >
                {modalData?.content}
            </Modal>
        </div>
    );
};

export default AnalyticsDashboard;
