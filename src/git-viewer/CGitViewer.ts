import { IGitViewer, ISource } from "../settings";

export class CGitViewer implements IGitViewer {
    private baseUrl : string

    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }
    public viewerForRepo(source: ISource) {
        const {repo} = source;
        return `${this.baseUrl}/${repo}`;
    }
    public viewerForBranch(source: ISource) {
        const {repo, branch} = source;
        return `${this.baseUrl}/${repo}/log/?h=${branch}`;
    }
    public viewerForPath(source: ISource) {
        const {repo, branch, file} = source;
        return `${this.baseUrl}/${repo}/tree/${file}?h=${branch}`;
    }
    public viewerForLine(source: ISource) {
        const {repo, branch, file, lineNo} = source;
         return `${this.baseUrl}/${repo}/tree/${file}?h=${branch}#n${lineNo}`;
    }
}