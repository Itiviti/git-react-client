import * as packageJson from "../package.json";
import { CGitViewer } from "./git-viewer/CGitViewer";

export interface IGitViewer {
  viewerForRepo(source: ISource) : string
  viewerForBranch(source: ISource) : string
  viewerForPath(source: ISource) : string
  viewerForLine(source: ISource) : string
}

export interface ISource {
  repo: string,
  branch?: string,
  file?: string,
  line_no?: number
}

const config:any = packageJson;
export function prefix() { return config.homepage }
export function gitRestApi() { return config.restApi }
export function gitViewer() { return new CGitViewer(config.gitViewer) }
export function defaultRepoQuery() { return '^ul' }
