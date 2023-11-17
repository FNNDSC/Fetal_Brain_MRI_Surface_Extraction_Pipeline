import { Niivue } from "@niivue/niivue";
import {useEffect, useRef, useState} from "preact/hooks";
import { Checkbox } from '@patternfly/react-core';

/**
 * Options for loading a mesh layer overlay from URL.
 *
 * https://github.com/niivue/niivue/blob/f490e8aebcfb3bb9dc15bdcbbed30e56bf092248/src/nvmesh.js#L22C1-L31C4
 */
type NVMeshLayer = {
  url: string,
  opacity?: number,
  colormap?: string,
  colorMapNegative?: string,
  useNegativeCmap?: boolean,
  cal_min?: number,
  cal_max?: number
}

/**
 * Options for loading a mesh from URL.
 *
 * https://github.com/niivue/niivue/blob/f490e8aebcfb3bb9dc15bdcbbed30e56bf092248/src/nvmesh.js#L33-L42
 */
type NVMeshFromUrlOptions = {
  url: string,
  opacity?: number,
  visible?: boolean,
  layers?: NVMeshLayer[]
}

const SubplateSurfaces = () => {
  const canvas = useRef();

  const imageUrl = '/files/BCH_0065_s1/rh.wm._81920.mz3';

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const volumeList: NVMeshFromUrlOptions[] = [
      {
        url: imageUrl,
        visible: visible
      },
    ];
    const nv = new Niivue({isColorbar: true});
    nv.attachToCanvas(canvas.current);
    nv.loadMeshes(volumeList);
  }, [imageUrl]);


  // TODO canvas height and width
  // https://github.com/niivue/niivue-ui/blob/ccec21ddb77989a64784c35547591bc94efd6c11/src/components/NiivuePanel.jsx#L5
  return (
    <>
      <Checkbox id="is-visible" body="Visible" isChecked={visible} onChange={(_e, v) => setVisible(v)}/>
      <canvas ref={canvas} height={480} width={640} />
    </>
  );
};

export default SubplateSurfaces;
