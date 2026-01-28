import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Archive, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface DefectLog {
    id: string;
    timestamp: string;
    quantity: number;
    status: 'Open' | 'Under Review' | 'Contained' | 'Closed';
    notes: string;
    defectType: { description: string; category: string; };
    machine: { name: string; };
    operator: { name: string; };
}

const QualityDashboard = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('Open');

    const { data: defects, isLoading } = useQuery<DefectLog[]>({
        queryKey: ['defects', filter],
        queryFn: async () => (await api.get(`/defects?status=${filter}`)).data,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
            return api.put(`/defects/${id}`, { status, notes });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['defects'] });
        }
    });

    const handleDisposition = (id: string, action: 'Scrap' | 'Rework' | 'Use As Is') => {
        let status = 'Closed';
        if (action === 'Rework') status = 'Contained';

        updateStatusMutation.mutate({
            id,
            status,
            notes: `Disposition: ${action}`
        });
    };

    const statusColors: Record<string, string> = {
        'Open': 'bg-red-500/20 text-red-500 border-red-500/50',
        'Closed': 'bg-green-500/20 text-green-500 border-green-500/50',
        'Under Review': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
        'Contained': 'bg-orange-500/20 text-orange-500 border-orange-500/50'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Defect Queue</h2>
                <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
                    {['Open', 'Closed', 'Under Review'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Loading defects...</div>
                ) : defects?.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
                        <Check className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                        <p>No defects found</p>
                    </div>
                ) : (
                    defects?.map(defect => (
                        <Card key={defect.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                            <div className="p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">

                                {/* Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[defect.status] || statusColors['Open']}`}>
                                            {defect.status}
                                        </span>
                                        <span className="text-slate-500 text-sm">
                                            {format(new Date(defect.timestamp), 'MMM d, HH:mm')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {defect.defectType.description}
                                        <span className="text-slate-500 font-normal text-lg ml-2">x{defect.quantity}</span>
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1"><Monitor className="w-4 h-4" /> {defect.machine.name}</span>
                                        <span className="flex items-center gap-1">User: {defect.operator.name}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {defect.status === 'Open' && (
                                    <div className="flex items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                                        <Button size="sm" variant="destructive" onClick={() => handleDisposition(defect.id, 'Scrap')}>
                                            <Archive className="w-4 h-4 mr-2" /> Scrap
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleDisposition(defect.id, 'Rework')}>
                                            <RotateCcw className="w-4 h-4 mr-2" /> Rework
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-green-400 hover:text-green-300 border-green-900/50 hover:bg-green-900/20" onClick={() => handleDisposition(defect.id, 'Use As Is')}>
                                            <Check className="w-4 h-4 mr-2" /> Use As Is
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

const Monitor = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
)

export default QualityDashboard;
