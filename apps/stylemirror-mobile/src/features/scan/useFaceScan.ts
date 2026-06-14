import { useCallback, useMemo, useRef, useState } from 'react';
import { analyzeFaceLandmarks, landmarksFromFaceDetection, mockAnalyzeFace } from '@stylemirror/face-analysis';
import { FaceScanResult } from '@stylemirror/shared';

export type ScanStatus = 'ready' | 'scanning' | 'complete' | 'error';

export type FaceDetection = {
  bounds: { origin: { x: number; y: number }; size: { width: number; height: number } };
  leftEarPosition?: { x: number; y: number } | null;
  rightEarPosition?: { x: number; y: number } | null;
  leftEyePosition?: { x: number; y: number } | null;
  rightEyePosition?: { x: number; y: number } | null;
  leftCheekPosition?: { x: number; y: number } | null;
  rightCheekPosition?: { x: number; y: number } | null;
  mouthPosition?: { x: number; y: number } | null;
  noseBasePosition?: { x: number; y: number } | null;
  bottomMouthPosition?: { x: number; y: number } | null;
  rightMouthPosition?: { x: number; y: number } | null;
  leftMouthPosition?: { x: number; y: number } | null;
};

export type NormalizedFaceBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useFaceScan() {
  const initialScan = useMemo(() => mockAnalyzeFace(), []);
  const [scan, setScan] = useState<FaceScanResult>(initialScan);
  const [status, setStatus] = useState<ScanStatus>('complete');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [faceBounds, setFaceBounds] = useState<NormalizedFaceBounds | null>(null);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);

  /**
   * Run a real scan from a captured photo.
   * @param photoUri   Local URI from expo-camera takePictureAsync()
   * @param detections Faces from FaceDetector.detectFacesAsync()
   * @param imageWidth Width of the captured photo in px
   * @param imageHeight Height of the captured photo in px
   */
  const runRealScan = useCallback(
    async (
      photoUri: string,
      detections: FaceDetection[],
      imageWidth: number,
      imageHeight: number
    ) => {
      setStatus('scanning');
      setErrorMsg(null);

      // Small delay for animation to kick in
      await new Promise((r) => setTimeout(r, 200));

      if (!detections || detections.length === 0) {
        // Fallback to mock if no face found
        setScan(mockAnalyzeFace());
        setStatus('error');
        setErrorMsg('No face detected. Make sure your face is in the frame and try again.');
        return;
      }

      const best = detections[0]; // Use largest / first face
      const landmarks = landmarksFromFaceDetection(best, imageWidth, imageHeight);
      const result = analyzeFaceLandmarks(landmarks);

      // Normalize face bounds for overlay positioning
      const nb: NormalizedFaceBounds = {
        x: best.bounds.origin.x / imageWidth,
        y: best.bounds.origin.y / imageHeight,
        width: best.bounds.size.width / imageWidth,
        height: best.bounds.size.height / imageHeight
      };

      setLastPhotoUri(photoUri);
      setFaceBounds(nb);
      setScan(result);
      setStatus('complete');
    },
    []
  );

  /** Quick demo scan without real camera (fallback / dev) */
  const runDemoScan = useCallback(() => {
    setStatus('scanning');
    setErrorMsg(null);
    setTimeout(() => {
      setScan(mockAnalyzeFace());
      setStatus('complete');
    }, 1200);
  }, []);

  return {
    runRealScan,
    runDemoScan,
    scan,
    status,
    errorMsg,
    faceBounds,
    lastPhotoUri
  };
}
