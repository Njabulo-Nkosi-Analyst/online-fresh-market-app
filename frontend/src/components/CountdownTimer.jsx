import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ hours = 8 }) => {
  const [target] = useState(() => new Date(Date.now() + hours * 3600 * 1000));
  const [left, setLeft] = useState(target - new Date());

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - new Date())), 1000);
    return () => clearInterval(t);
  }, [target]);

  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  const Unit = ({ v, label }) => (
    <div className="text-center">
      <div className="font-serif text-3xl text-[#f2f0e6] tabular-nums bg-[#262924] border border-[#2d302a] rounded-md px-3 py-2 min-w-[56px]">
        {String(v).padStart(2, '0')}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-[#75746c] mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div
      data-testid="countdown-timer"
      className="flex items-center gap-3"
    >
      <Unit v={h} label="hrs" />
      <span className="text-[#c36a4e] font-serif text-2xl">:</span>
      <Unit v={m} label="min" />
      <span className="text-[#c36a4e] font-serif text-2xl">:</span>
      <Unit v={s} label="sec" />
    </div>
  );
};

export default CountdownTimer;
