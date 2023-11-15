import { useRef, useEffect } from 'preact/hooks';
import { Niivue } from "@niivue/niivue";

const SubplateSurfaces = ({ imageUrl } : { imageUrl: string }) => {
  const canvas = useRef();
  useEffect(() => {
    const volumeList = [
      {
        url: imageUrl,
      },
    ];
    const nv = new Niivue();
    nv.attachToCanvas(canvas.current);
    nv.loadVolumes(volumeList);
  }, [imageUrl]);
  
  return <canvas ref={canvas} height={480} width={640} />;
};

export default SubplateSurfaces;

