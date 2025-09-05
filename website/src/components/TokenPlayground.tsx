import React, {useState} from 'react';

export default function TokenPlayground() {
  const [brand, setBrand] = useState('#4f46e5');
  return (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <input
        type="color"
        aria-label="Brand color"
        value={brand}
        onChange={e => setBrand(e.target.value)}
      />
      <button
        style={{
          background: brand,
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: 'none'
        }}
      >
        Demo button
      </button>
    </div>
  );
}
