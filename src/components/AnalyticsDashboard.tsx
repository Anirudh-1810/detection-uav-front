import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Wifi } from "lucide-react";

interface AnalyticsDashboardProps {
    data: any;
    riskScore: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Yellow, Red

export const AnalyticsDashboard = ({ data, riskScore }: AnalyticsDashboardProps) => {
    // Generate mock time-series data based on the single input for visualization
    // In a real app, this would be historical data or multiple live points
    const signalData = useMemo(() => {
        return Array.from({ length: 10 }, (_, i) => ({
            time: `T-${10 - i}s`,
            strength: Math.max(-100, Math.min(-20, (data?.signal_strength_dbm || -50) + (Math.random() * 10 - 5))),
            confidence: Math.random() * 100
        }));
    }, [data]);

    const riskData = useMemo(() => [
        { name: 'Safe', value: Math.max(0, 100 - (riskScore * 100)) },
        { name: 'Risk', value: riskScore * 100 }
    ], [riskScore]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. Signal Stability Chart */}
            <Card className="bg-card border-border-subtle col-span-1 md:col-span-2 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <Wifi className="w-6 h-6 text-primary" />
                        Signal Strength Stability (dBm)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={signalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#9ca3af" fontSize={14} tickLine={false} tickMargin={10} />
                            <YAxis stroke="#9ca3af" fontSize={14} tickLine={false} domain={[-100, -20]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px' }}
                                itemStyle={{ color: '#f3f4f6' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="strength"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 2. Risk Distribution Pie Chart */}
            <Card className="bg-card border-border-subtle shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-primary" />
                        Threat Probability
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 0 ? '#3b82f6' : (riskScore > 0.7 ? '#ef4444' : '#f59e0b')}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px' }}
                                itemStyle={{ color: '#f3f4f6' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Central Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-5xl font-extrabold text-foreground tracking-tighter">
                            {(riskScore * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm font-medium text-foreground-muted mt-2 uppercase tracking-wide">
                            RISK LEVEL
                        </span>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
};
