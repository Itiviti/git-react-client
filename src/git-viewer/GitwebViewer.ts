import { IGitViewer, ISource } from "../settings";

export class GitwebViewer implements IGitViewer {
    private baseUrl : string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    public viewerForRepo(source: ISource) {
        const {repo} = source;
        return `${this.baseUrl}/?p=${repo}`;
    }
    public viewerForBranch(source: ISource) {
        const {repo, branch} = source;
        return `${this.baseUrl}/?p=${repo};a=shortlog;h=${branch};js=1`;
    }
    public viewerForPath(source: ISource) {
        const {repo, branch, file} = source;
        return `${this.baseUrl}/?p=${repo};a=blob;f=${file};hb=${branch};js=1`;
    }
    public viewerForLine(source: ISource) {
        const {repo, branch, file, lineNo} = source;
        return `${this.baseUrl}/?p=${repo};a=blob;f=${file};hb=${branch};js=1#l${lineNo}`;
    }
}