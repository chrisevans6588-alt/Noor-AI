
import React, { useState, useEffect } from 'react';

const QiblaFinder: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDir, setQiblaDir] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS for permission handling
    const isIOSDevice = 
      /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Get Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          const qDir = calculateQibla(latitude, longitude);
          setQiblaDir(qDir);
        },
        (err) => {
          setError("Location access denied. Please enable location to find Qibla direction.");
          console.error(err);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    // Handle Orientation
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // @ts-ignore
      const webkitHeading = event.webkitCompassHeading;
      const alpha = event.alpha;

      if (webkitHeading !== undefined) {
        setHeading(webkitHeading);
      } else if (alpha !== null) {
        // Fallback for browsers without webkitCompassHeading
        setHeading(360 - alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const calculateQibla = (lat: number, lng: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const phiK = toRad(21.4225); // Kaaba Lat
    const lambdaK = toRad(39.8262); // Kaaba Lng
    const phi = toRad(lat);
    const lambda = toRad(lng);

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    let qibla = toDeg(Math.atan2(y, x));
    return (qibla + 360) % 360;
  };

  const requestPermission = () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // @ts-ignore
      DeviceOrientationEvent.requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.location.reload(); // Reload to start listening
          }
        })
        .catch(console.error);
    }
  };

  const needleRotation = qiblaDir !== null ? qiblaDir - heading : 0;

  return (
    <div className="max-w-md mx-auto space-y-8 p-4 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Qibla Finder</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Align your device flat to point towards the Kaaba (Makkah).
        </p>

        {error ? (
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-rose-600 text-sm font-medium">
            {error}
          </div>
        ) : !coords ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold">Obtaining Coordinates...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Compass Visualization */}
            <div className="relative w-64 h-64 mb-8">
              {/* Outer Ring */}
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
              
              {/* Cardal Points */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="absolute top-2 font-bold text-slate-400 text-xs">N</span>
                <span className="absolute bottom-2 font-bold text-slate-400 text-xs">S</span>
                <span className="absolute right-2 font-bold text-slate-400 text-xs">E</span>
                <span className="absolute left-2 font-bold text-slate-400 text-xs">W</span>
              </div>

              {/* Qibla Indicator (Fixed relative to compass north) */}
              <div 
                className="absolute inset-0 transition-transform duration-100"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                {/* Pointer to Qibla */}
                <div 
                   className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
                   style={{ transform: `rotate(${qiblaDir}deg)` }}
                >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-6 h-6 text-amber-600">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter mt-1">KAABA</span>
                    </div>
                </div>
              </div>

              {/* Device Direction Indicator */}
              <div className="absolute top-1/2 left-1/2 w-1 h-24 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-full opacity-10"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full -mt-2"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center">
                    <p className="text-2xl font-black text-slate-800">{Math.round(heading)}°</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Heading</p>
                 </div>
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-amber-900">Qibla Bearing</span>
                <span className="text-lg font-black text-amber-700">{qiblaDir?.toFixed(1)}°</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed italic">
                {Math.abs(needleRotation) < 5 
                  ? "✓ You are facing the Qibla" 
                  : `Rotate your device ${Math.round(needleRotation)}° to align with Kaaba`}
              </p>
            </div>
            
            {isIOS && (
              <button 
                onClick={requestPermission}
                className="mt-6 text-xs text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
              >
                Calibrate Compass (iOS)
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-2">How to use</h3>
        <ul className="text-sm text-slate-500 space-y-2">
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold">1.</span>
            Place your phone on a flat surface away from magnets or electronics.
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold">2.</span>
            Rotate your body/device until the gold Kaaba icon aligns with the top indicator.
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold">3.</span>
            If on iPhone, use the calibration button to enable compass access.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QiblaFinder;
