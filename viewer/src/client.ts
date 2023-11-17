import Papa from "papaparse";

const ACCEPT_JSON = {
  headers: {
    Accept: "application/json",
  },
};

// File extensions and regexes to match file types

const VOLUME_FILE_EXTENSIONS = [".nii", ".nii.gz"];
const SURFACE_OVERLAY_RE = /.+\.(disterr|smtherr|tlink_\d+mm)\.mz3/;
const SURFACE_FILE_EXTENSION = [".mz3"];

type HemiUrls = {
  volumes: string[];
  surfaces: string[];
  surfaceOverlays: string[];
  other: string[];
};

type SubjectUrls = {
  left: HemiUrls;
  right: HemiUrls;
};

type SubjectInfo = {
  mrn?: string;
  age?: number;
  extraInfo?: string;
  segmentedBy?: string;
  comments?: string;
};

type Subject = {
  name: string;
  info?: SubjectInfo;
};

/**
 * An entry returned by Caddy's file browser.
 */
type CaddyEntry = {
  name: string;
  size: number;
  url: string;
  mod_time: string;
  mode: number;
  is_dir: boolean;
  is_symlink: boolean;
};

/**
 * A client for getting data from the `all_niftiandmz3` output directory from the
 * snakemake pipeline.
 */
class Client {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * List subjects. If a CSV of subject information is available, then the subject information is
   * combined with the subject directories available.
   */
  async lsSubjects(): Promise<Subject[]> {
    const res = await fetch(this.baseUrl, ACCEPT_JSON);
    const data: CaddyEntry[] = await res.json();
    const subjectNames = data
      .filter((entry) => entry.is_dir)
      .map((entry) => entry.name)
      .map(trimTrailingSlash);
    const csvFileName = data
      .filter((entry) => !entry.is_dir)
      .map((entry) => entry.name)
      .find((name) => name.endsWith(".csv"));
    if (csvFileName === undefined) {
      return subjectNames.map((name) => {
        return { name };
      });
    }
    const csvData = await fetchCsv(this.baseUrl + csvFileName);

    return subjectNames.map((name) => {
      const data = csvData.find((row) => row.subject.trim() === name);
      const info: SubjectInfo = {
        mrn: data['MRN'],
        age: data['Age'],
        extraInfo: data['Extra_info'],
        segmentedBy: data['Segmented by'],
        comments: data['Comments'],
      };
      return {name, info};
    }).sort(subjectSortComparer);
  }

  /**
   * List all the files (volumes, surfaces, surface overlay data) for a subject.
   */
  async getFiles(subject: string): Promise<SubjectUrls> {
    const url = this.baseUrl + subject;
    const res = await fetch(url, ACCEPT_JSON);
    const data: CaddyEntry[] = await res.json();
    const fileNames: string[] = data
      .filter((entry) => !entry.is_dir)
      .map((entry) => entry.name);
    const fileNamesLeft = fileNames.filter((name) => name.startsWith("lh."));
    const fileNamesRight = fileNames.filter((name) => name.startsWith("rh."));
    return {
      left: classifyFileNamesAsUrls(fileNamesLeft, this.baseUrl, subject),
      right: classifyFileNamesAsUrls(fileNamesRight, this.baseUrl, subject),
    };
  }
}

async function fetchCsv(url: string): Promise<any[]> {
  const csvRes = await fetch(url);
  const csvString = await csvRes.text();
  const parseResult = Papa.parse(csvString.trimEnd(), {header: true});
  if (parseResult.errors.length > 0) {
    console.error("Failed to parse CSV from " + url);
    console.dir(parseResult.errors);
    throw Error(parseResult.errors);
  }
  return parseResult.data;
}

function trimTrailingSlash(name: string): string {
  if (name.endsWith("/")) {
    return name.substring(0, name.length - 1);
  }
  return name;
}

function classifyFileNamesAsUrls(
  fileNames: string[],
  baseUrl: string,
  subject: string,
) {
  return addUrlToFileNames(classifyFileNames(fileNames), baseUrl, subject);
}

function classifyFileNames(fileNames: string[]): HemiUrls {
  const urls: HemiUrls = {
    surfaces: [],
    volumes: [],
    surfaceOverlays: [],
    other: [],
  };
  fileNames.forEach((fileName) => {
    const matchesFileExtension = (ext) => fileName.endsWith(ext);
    if (VOLUME_FILE_EXTENSIONS.some(matchesFileExtension)) {
      urls.volumes.push(fileName);
    } else if (fileName.match(SURFACE_OVERLAY_RE)) {
      urls.surfaceOverlays.push(fileName);
    } else if (SURFACE_FILE_EXTENSION.some(matchesFileExtension)) {
      urls.surfaces.push(fileName);
    } else {
      urls.other.push(fileName);
    }
  });
  return urls;
}

function addUrlToFileNames(
  names: HemiUrls,
  baseUrl: string,
  subject: string,
): HemiUrls {
  const createUrl = (name) => baseUrl + subject + "/" + name;
  return {
    volumes: names.volumes.map(createUrl),
    surfaces: names.surfaces.map(createUrl),
    surfaceOverlays: names.surfaceOverlays.map(createUrl),
    other: names.other.map(createUrl),
  };
}

/**
 * Helper function for sorting subjects by age.
 */
function subjectSortComparer(a: Subject, b: Subject): number {
  if (a.info && a.info.age) {
    if (b.info && b.info.age) {
      // same age
      if (a.info.age === b.info.age) {
        return a.name.localeCompare(b.name);
      }
      // different age
      return a.info.age - b.info.age;
    } else {
      // b age unknown
      return 1;
    }
  }
  // a age unknown
  if (b.info && b.info.age > 0) {
    return -1;
  }
  // both age unknown
  return a.name.localeCompare(b.name);
}

export { HemiUrls, SubjectUrls, Subject, SubjectInfo, Client };
