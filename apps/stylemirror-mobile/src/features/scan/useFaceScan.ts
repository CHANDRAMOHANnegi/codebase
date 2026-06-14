import { useMemo, useState } from 'react';
import { analyzeFaceLandmarks, mockAnalyzeFace } from '@stylemirror/face-analysis';
import { FaceLandmarks, FaceScanResult } from '@stylemirror/shared';

const demoLandmarks: FaceLandmarks = {
  browCenter: { x: 0.5, y: 0.34 },
  cheekLeft: { x: 0.22, y: 0.48 },
  cheekRight: { x: 0.78, y: 0.48 },
  chin: { x: 0.5, y: 0.86 },
  foreheadLeft: { x: 0.3, y: 0.24 },
  foreheadRight: { x: 0.7, y: 0.24 },
  hairlineCenter: { x: 0.5, y: 0.16 },
  jawLeft: { x: 0.29, y: 0.68 },
  jawRight: { x: 0.71, y: 0.68 }
};

export type ScanStatus = 'ready' | 'scanning' | 'complete';

export function useFaceScan() {
  const initialScan = useMemo(() => mockAnalyzeFace(), []);
  const [scan, setScan] = useState<FaceScanResult>(initialScan);
  const [status, setStatus] = useState<ScanStatus>('complete');

  const runDemoScan = () => {
    setStatus('scanning');
    setTimeout(() => {
      setScan(analyzeFaceLandmarks(demoLandmarks));
      setStatus('complete');
    }, 900);
  };

  return {
    runDemoScan,
    scan,
    status
  };
}
