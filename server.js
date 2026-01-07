const fetchStreamData = async () => {
  try {
    const response = await fetch('/api/stream');
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      setStreamData(data);
      setStats(prev => ({ ...prev, coinsAnalyzed: prev.coinsAnalyzed + data.length }));
    }
  } catch (error) {
    console.error('Stream fetch error:', error);
  }
};

useEffect(() => {
  // Fetch immediately
  fetchStreamData();
  
  // Fetch every 2 seconds for live updates
  const streamInterval = setInterval(fetchStreamData, 2000);
  
  // Timer for countdown
  const timer = setInterval(() => {
    setStats(prev => {
      const [h, m, s] = prev.nextClaim.split(':').map(Number);
      let totalSeconds = h * 3600 + m * 60 + s - 1;
      if (totalSeconds < 0) totalSeconds = 4 * 3600 + 22 * 60 + 18;
      return { 
        ...prev, 
        nextClaim: `${String(Math.floor(totalSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}` 
      };
    });
  }, 1000);
  
  return () => {
    clearInterval(streamInterval);
    clearInterval(timer);
  };
}, []);
