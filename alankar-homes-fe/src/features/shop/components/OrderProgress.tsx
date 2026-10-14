import React from 'react';
import { Check } from 'lucide-react';
import type { OrderStatus } from '../shopTypes';
import { ORDER_STATUS_LABELS } from '../../../utils/constants';

const STEPS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export const OrderProgress: React.FC<{ status: OrderStatus }> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="glass-card rounded-xl p-5 text-sm text-red-300">
        This order was cancelled.
      </div>
    );
  }

  const current = STEPS.indexOf(status);

  return (
    <ol className="glass-card rounded-xl p-5 md:p-6 grid grid-cols-4">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 && (
              <span
                className={`absolute top-3.5 right-1/2 w-full h-[2px] -z-0 ${index <= current ? 'bg-[#caa060]' : 'bg-[#0e3f38]'}`}
              />
            )}
            <span
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                done ? 'bg-gold-gradient text-stone-950' : 'bg-[#011714] border border-[#0e3f38] text-stone-500'
              }`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>
            <span className={`text-[10px] md:text-xs ${done ? 'text-[#ecc588]' : 'text-stone-500'}`}>
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
