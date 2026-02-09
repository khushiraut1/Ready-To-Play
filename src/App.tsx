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
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center'
      }}
    >
      ✅ READY TO PLAY<br />
      {new Date(time).toLocaleTimeString()}
    </div>
  );
};

export default App;
