import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}
    >
      ✅ App.tsx BUILD SUCCESS<br />
      {new Date(time).toLocaleTimeString()}
    </div>
  );
};

export default App;
