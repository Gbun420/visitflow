'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket } from 'lucide-react';

interface UpgradeButtonProps {
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export function UpgradeButton({ tier }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data);
        alert('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      alert('Failed to connect to billing server.');
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleUpgrade} 
      disabled={isLoading} 
      className="w-full font-bold h-12"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing Checkout...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-4 w-4" />
          Upgrade to {tier}
        </>
      )}
    </Button>
  );
}
