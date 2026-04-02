import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState({
    frequency: 5.820,
    battery: 84.1,
    speed: 45.2,
    signal: 92
  });

  // Mission States: 'outbound' | 'returning' | 'report'
  const [missionState, setMissionState] = useState('outbound');
  const [currentNode, setCurrentNode] = useState(1);
  const [reportIndex, setReportIndex] = useState(0);
  const [freqHistory, setFreqHistory] = useState(Array(60).fill(5.820));

  const images = [
    { path: '/assets/atrium.png', label: 'OBJECT: PERSONNEL ATRIUM SITE' },
    { path: '/assets/construction.png', label: 'OBJECT: CONSTRUCT TRENCH INFRA' },
    { path: '/assets/night_building.png', label: 'OBJECT: PERIMETER NIGHT SECTOR' }
  ];

  useEffect(() => {
    // 1. High-frequency telemetry 
    const dataInterval = setInterval(() => {
      setData(prev => {
        const nextFreq = 5.8 + (Math.random() * 0.1 - 0.05);
        setFreqHistory(hist => [...hist.slice(1), nextFreq]);
        return {
          ...prev,
          frequency: nextFreq,
          battery: Math.max(0, prev.battery - 0.01),
          speed: missionState === 'report' ? 0 : Math.max(40, prev.speed + (Math.random() * 2 - 1)),
          signal: missionState === 'report' ? 100 : Math.min(100, Math.max(0, prev.signal + (Math.random() * 2 - 1)))
        };
      });
    }, 400);

    // 2. Continuous Flight Logic (Nodes)
    const nodeInterval = setInterval(() => {
      if (missionState === 'outbound') {
        setCurrentNode(prev => {
          if (prev >= 8) { setMissionState('returning'); return 8; }
          return prev + 1;
        });
      } else if (missionState === 'returning') {
        setCurrentNode(prev => {
          if (prev <= 1) { 
            setMissionState('report'); 
            return 1; 
          }
          return prev - 1;
        });
      }
    }, 3000);

    // 3. Image Cycling ONLY during 'report' phase
    let reportInterval;
    if (missionState === 'report') {
      reportInterval = setInterval(() => {
        setReportIndex(prev => (prev + 1) % images.length);
      }, 5000);
      
      // Auto-restart mission after viewing report
      setTimeout(() => {
        // Optional: comment out if you want report to stay until manual reset
        // setMissionState('outbound');
      }, 30000);
    }

    return () => {
      clearInterval(dataInterval);
      clearInterval(nodeInterval);
      if (reportInterval) clearInterval(reportInterval);
    }
  }, [missionState]);

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="title">
          {missionState === 'report' ? 'MISSION COMPLETE // DATA RETRIEVAL' : 'UAV MISSION IN PROGRESS // NO-GPS'}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div className="status-dot" style={{background: missionState === 'report' ? '#10b981' : '#3b82f6'}}></div>
          <span style={{color: missionState === 'report' ? '#10b981' : '#3b82f6', fontSize: '0.75rem', fontWeight: '900'}}>
            {missionState.toUpperCase()}
          </span>
        </div>
      </header>

      {/* FREQUENCY HERO SECTION */}
      <section className="freq-hero">
        <div className="freq-main-readout">
           <div className="label">Live Signal Peak</div>
           <div className="freq-main-value">
             {data.frequency.toFixed(4)} <span style={{fontSize: '1rem', color: '#64748b'}}>GHz</span>
           </div>
           <div className="freq-viz-container">
              {freqHistory.map((v, i) => (
                <div key={i} className="freq-bar" style={{height: `${((v - 5.7) / 0.2) * 100}%`}}></div>
              ))}
           </div>
        </div>

        <div className="signal-gauge">
            <div className="label">Link Integrity</div>
            <div className="dial-track">
               <div className="dial-fill" style={{transform: `rotate(${(data.signal / 100) * 180 - 45}deg)`}}></div>
               <div className="dial-value">{data.signal}%</div>
            </div>
            <div style={{fontSize: '0.6rem', color: '#10b981', marginTop: '1rem', fontWeight:'900'}}>DATA SECURE</div>
        </div>
        
        <div style={{flex: 1, paddingLeft: '1.5rem', borderLeft: '1px solid #1e293b'}}>
           <div className="label">Airspeed</div>
           <div className="value">{data.speed.toFixed(1)} km/h</div>
           <div className="label" style={{marginTop: '1rem'}}>Battery</div>
           <div className="value" style={{color: data.battery < 20 ? '#ef4444' : '#f8fafc'}}>{data.battery.toFixed(1)}%</div>
        </div>
      </section>

      {/* MISSION NODES SECTION (01 - 08) */}
      <section className="node-panel">
         <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div className="label">Flight Path Analysis (OUTBOUND / RETURN)</div>
            <div className="value" style={{color: missionState === 'report' ? '#10b981' : missionState === 'returning' ? '#ec4899' : '#3b82f6'}}>
               {missionState === 'outbound' ? `PROCEEDING TO NODE 0${currentNode}` : 
                missionState === 'returning' ? `RETURNING FROM NODE 0${currentNode}` : 
                'MISSION TARGETS FOUND - BASE ARCHIVE'}
            </div>
         </div>
         
         <div className="nodes-container">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
              const isActive = (n === currentNode && missionState !== 'report');
              const isCompleted = missionState === 'report' || 
                                 (missionState === 'outbound' && n < currentNode) || 
                                 (missionState === 'returning' && n > currentNode);
              return (
                <div key={n} className={`node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${missionState === 'returning' ? 'return' : ''}`}>
                   0{n}
                </div>
              )
            })}
         </div>
         
         <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.7rem', color: '#64748b', fontWeight:'bold'}}>
            <span>BASE RELAY ENTRY</span>
            <span>{missionState === 'outbound' ? 'PROCEEDING TO TARGET >>>' : missionState === 'returning' ? '<<< RETURNING TO BASE' : 'MISSION COMPLETED'}</span>
            <span>END SECTOR ECHO</span>
         </div>
      </section>

      {/* SURVEILLANCE FEED (REVEALED AFTER RETURN) */}
      <div className="dashboard-grid">
         <div className="card vision-card">
            {missionState === 'outbound' ? (
              <div className="scan-overlay">
                 <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '1.2rem', fontWeight: '900', color: '#1e3a8a'}}>SIGNAL SUPPRESSED</div>
                    <div style={{fontSize: '0.7rem', color: '#64748b'}}>UAV IN STEALTH MODE - NO DOWNLINK</div>
                 </div>
              </div>
            ) : missionState === 'returning' ? (
              <div className="scan-overlay">
                 <div style={{textAlign: 'center', color: '#8b5cf6'}}>
                    <div style={{fontWeight: '900', letterSpacing: '4px'}}>DATA SYNCING...</div>
                    <div style={{fontSize: '0.7rem'}}>ENCRYPTED BUFFER READY FOR BASE RETRIEVAL</div>
                    <div style={{height:'3px', background:'rgba(139, 92, 246, 0.2)', marginTop:'10px'}}>
                       <div style={{height:'100%', width:`${(8-currentNode)/7 * 100}%`, background:'#8b5cf6'}}></div>
                    </div>
                 </div>
              </div>
            ) : (
              <>
                 <div className="object-detected-tag" style={{animation: 'flash 0.5s infinite'}}>!! MISSION DATA ARCHIVE : {images[reportIndex].label} !!</div>
                 <img src={images[reportIndex].path} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Mission Feed" />
              </>
            )}
         </div>

         <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
           <div className="card" style={{flex: 1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <div className="label">LINK RELIABILITY</div>
              <div className="value" style={{fontSize: '1.8rem', color: '#3b82f6'}}>{missionState === 'report' ? '100' : data.signal}%</div>
           </div>
           
           <div className="card" style={{flex: 1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <div className="label">TARGET SCANNING</div>
              <div className="value" style={{fontSize: '1rem', color: missionState === 'report' ? '#10b981' : '#f59e0b'}}>
                 {missionState === 'report' ? 'COMPLETE : 3 OBJECTS' : 'IN PROGRESS...'}
              </div>
           </div>
         </div>
      </div>
    </div>
  )
}

export default App
