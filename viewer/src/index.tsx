import "@patternfly/react-core/dist/styles/base.css";

import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import AppLayout from "./AppLayout";
import SubplateSurfaces from "./SubplateSurfaces";
import { Client, Subject } from "./client";
import "./style.css";

export function App() {
  const client = new Client("/files/");
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const subjects = await client.lsSubjects();
      if (subjects.length >= 1) {
        setSelectedSubject(subjects[0]);
      }
      setSubjects(subjects);
    }

    async function tryLoad() {
      try {
        await load();
      } catch (e) {
        setError(e);
      }
    }

    tryLoad();
  }, []);

  if (error != null) {
    return (
      <>
        <p>There was an error loading the data.</p>
        <p>{typeof error === "object" ? JSON.stringify(error) : error}</p>
      </>
    );
  }

  return (
    <AppLayout
      subjects={subjects}
      selectedSubject={selectedSubject}
      onSubjectSelect={setSelectedSubject}
    >
      {/*<SubplateSurfaces />*/}
    </AppLayout>
  );
}

render(<App />, document.getElementById("app"));
