import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Monitor } from 'lucide-react';

interface Machine {
    id: string;
    name: string;
    location: string;
}

interface DefectType {
    id: string;
    category: string;
    code: string;
    description: string;
}

const OperatorDashboard = () => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDefect, setSelectedDefect] = useState<DefectType | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Fetch Data
    const { data: machines } = useQuery<Machine[]>({
        queryKey: ['machines'],
        queryFn: async () => (await api.get('/defects/machines')).data,
    });

    const { data: defectTypes } = useQuery<DefectType[]>({
        queryKey: ['defectTypes'],
        queryFn: async () => (await api.get('/defects/types')).data,
    });

    const categories = defectTypes
        ? Array.from(new Set(defectTypes.map(d => d.category)))
        : [];

    // Mutation
    const logDefectMutation = useMutation({
        mutationFn: async () => {
            return api.post('/defects', {
                machineId: selectedMachine,
                defectTypeId: selectedDefect?.id,
                quantity,
                station: 'Station-1', // Hardcoded for demo
            });
        },
        onSuccess: () => {
            setStep(4);
            queryClient.invalidateQueries({ queryKey: ['analytics'] }); // Update stats if we had them
            setTimeout(() => {
                resetFlow();
            }, 3000);
        }
    });

    const resetFlow = () => {
        setStep(1);
        setSelectedMachine(null);
        setSelectedCategory(null);
        setSelectedDefect(null);
        setQuantity(1);
    };

    // --- Steps ---

    const SelectMachine = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {machines?.map(m => (
                <Button
                    key={m.id}
                    size="touch"
                    variant={selectedMachine === m.id ? 'default' : 'outline'}
                    className="h-32 text-xl flex flex-col gap-2"
                    onClick={() => {
                        setSelectedMachine(m.id);
                        setStep(2);
                    }}
                >
                    <Monitor className="w-8 h-8" />
                    {m.name}
                </Button>
            ))}
        </div>
    );

    const SelectCategory = () => (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
                <Button
                    key={cat}
                    size="touch"
                    variant="outline"
                    className="h-32 text-xl bg-slate-800 hover:bg-slate-700 border-slate-700"
                    onClick={() => {
                        setSelectedCategory(cat);
                        setStep(3);
                    }}
                >
                    {cat}
                </Button>
            ))}
        </div>
    );

    // Quantity Step
    const QuantityStep = () => (
        <div className="flex flex-col items-center justify-center space-y-8 py-10">
            <h2 className="text-3xl font-bold text-white">{selectedDefect?.description}</h2>
            <div className="flex items-center gap-8">
                <Button
                    size="icon"
                    className="h-24 w-24 rounded-full text-4xl bg-slate-700 hover:bg-slate-600"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</Button>
                <span className="text-8xl font-mono font-bold text-blue-400">{quantity}</span>
                <Button
                    size="icon"
                    className="h-24 w-24 rounded-full text-4xl bg-slate-700 hover:bg-slate-600"
                    onClick={() => setQuantity(quantity + 1)}
                >+</Button>
            </div>
            <div className="flex gap-4 w-full max-w-md mt-8">
                <Button variant="outline" size="lg" className="flex-1 h-16 text-xl" onClick={() => setStep(3)}>Back</Button>
                <Button
                    variant="destructive"
                    size="lg"
                    className="flex-1 h-16 text-xl"
                    onClick={() => logDefectMutation.mutate()}
                    disabled={logDefectMutation.isPending}
                >
                    {logDefectMutation.isPending ? 'Submitting...' : 'SUBMIT DEFECT'}
                </Button>
            </div>
        </div>
    );

    // Modified Selection to go to Quantity
    const SelectDefectModified = () => (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {defectTypes
                ?.filter(d => d.category === selectedCategory)
                .map(d => (
                    <Button
                        key={d.id}
                        size="touch"
                        variant="destructive"
                        className="h-32 text-lg text-wrap px-2 bg-red-900/40 hover:bg-red-800 border-red-900"
                        onClick={() => {
                            setSelectedDefect(d);
                            setQuantity(1);
                            setStep(5); // 5 is Quantity Step
                        }}
                    >
                        {d.description}
                    </Button>
                ))}
        </div>
    );


    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {step > 1 && step < 4 && (
                        <Button variant="ghost" size="icon" onClick={() => setStep(step === 5 ? 3 : (step - 1) as any)}>
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    )}
                    <h2 className="text-2xl font-bold text-slate-100">
                        {step === 1 && 'Select Machine'}
                        {step === 2 && `Machine: ${machines?.find(m => m.id === selectedMachine)?.name || ''}`}
                        {step === 3 && `Category: ${selectedCategory}`}
                        {step === 5 && 'Confirm Quantity'}
                        {step === 4 && 'Success'}
                    </h2>
                </div>
                {selectedMachine && step !== 1 && (
                    <div className="text-slate-500 font-mono text-lg">{machines?.find(m => m.id === selectedMachine)?.name}</div>
                )}
            </div>

            {/* Content Swapper */}
            <Card className="min-h-[60vh] bg-slate-900/50 border-slate-800">
                <CardContent className="h-full p-6 flex flex-col justify-center">
                    {step === 1 && <SelectMachine />}
                    {step === 2 && <SelectCategory />}
                    {step === 3 && <SelectDefectModified />}
                    {step === 5 && <QuantityStep />}

                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
                            <CheckCircle className="w-32 h-32 text-green-500" />
                            <h3 className="text-4xl font-bold text-green-400">Defect Logged</h3>
                            <p className="text-slate-400">Returning to start...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OperatorDashboard;
