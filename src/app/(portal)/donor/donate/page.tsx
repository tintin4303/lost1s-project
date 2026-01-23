'use client';

import { useState } from 'react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Heart, DollarSign, Gift, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DonorDonatePage() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('GENERAL');
    const [frequency, setFrequency] = useState('ONE_TIME');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    type,
                    frequency
                })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/donor/dashboard');
                }, 3000);
            } else {
                alert('Failed to process donation. Please try again.');
            }
        } catch (error) {
            console.error('Donation error:', error);
            alert('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-pink-50">
                <PortalNav />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
                        <p className="text-gray-600 mb-8">
                            Your generous donation of ${amount} has been received. Your support makes a world of difference for our pets.
                        </p>
                        <Button onClick={() => router.push('/donor/dashboard')} className="w-full">
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-pink-900 mb-2">Make a Donation</h1>
                        <p className="text-lg text-gray-600">Support our mission to find loving homes for every pet.</p>
                    </div>

                    <Card className="shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-6 h-6 fill-current" />
                                Donation Details
                            </CardTitle>
                            <CardDescription className="text-pink-100">
                                Secure payment processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-lg">Donation Amount</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[25, 50, 100].map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setAmount(val.toString())}
                                                className={`py-3 rounded-lg border-2 font-semibold transition-all ${amount === val.toString()
                                                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                                                        : 'border-gray-200 hover:border-pink-300 text-gray-600'
                                                    }`}
                                            >
                                                ${val}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3  text-gray-400 w-5 h-5" />
                                        <Input
                                            type="number"
                                            placeholder="Other Amount"
                                            className="pl-10 text-lg py-6"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Campaign / Type</Label>
                                        <select
                                            className="w-full h-12 rounded-md border border-gray-200 px-3"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="GENERAL">General Support</option>
                                            <option value="MEDICAL">Medical Fund</option>
                                            <option value="FOOD">Food & Supplies</option>
                                            <option value="SPONSOR">Sponsor a Pet</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Frequency</Label>
                                        <select
                                            className="w-full h-12 rounded-md border border-gray-200 px-3"
                                            value={frequency}
                                            onChange={(e) => setFrequency(e.target.value)}
                                        >
                                            <option value="ONE_TIME">One-time Donation</option>
                                            <option value="MONTHLY">Monthly Recurring</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3 text-sm text-gray-600">
                                    <Gift className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                                    <p>
                                        Your donation is tax-deductible. A receipt will be sent to your email address immediately after processing.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-lg py-6 bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-xl transition-all"
                                    disabled={submitting || !amount}
                                >
                                    {submitting ? 'Processing...' : `Donate ${amount ? '$' + amount : ''} Now`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
