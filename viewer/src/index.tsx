import '@patternfly/react-core/dist/styles/base.css';


import { render } from 'preact';
import './style.css';
import SubplateSurfaces from './SubplateSurfaces';
import AppLayout from './AppLayout';


export function App() {

	return (
		<AppLayout>
      hello, world!
      <SubplateSurfaces imageUrl="http://localhost:8000/BCH_0067_s1/lh.innersp.nii" />
    </AppLayout>
	);
}


render(<App />, document.getElementById('app'));
