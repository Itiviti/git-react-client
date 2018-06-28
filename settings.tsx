declare var DEBUG: boolean;

export interface GitViewer {
  viewerForRepo({repo}) : string
  viewerForBranch({repo, branch}) : string
  viewerForPath({repo, branch, file}) : string
  viewerForLine({repo, branch, file, line_no}) : string
}

export function prefix() { return DEBUG ? '/' : '/reactgit/'; }
export function gitRestApi() { return 'http://git-viewer.ullink.lan:1337' }
export function gitViewer() { return create('http://git-viewer.ullink.lan/gitweb') }
export function defaultRepoQuery() { return '^ul' }

function create(baseUrl: string) : GitViewer {
   return new GitwebViewer(baseUrl);
} 

class GitwebViewer implements GitViewer {
  baseUrl : string
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  viewerForRepo({repo}) {
    return `${this.baseUrl}/?p=${repo}`;
  }
  viewerForBranch({repo, branch}) {
    return `${this.baseUrl}/?p=${repo};a=shortlog;h=${branch};js=1`;
  }
  viewerForPath({repo, branch, file}) {
    return `${this.baseUrl}/?p=${repo};a=blob;f=${file};hb=${branch};js=1`;
  }
  viewerForLine({repo, branch, file, line_no}) {
    return `${this.baseUrl}/?p=${repo};a=blob;f=${file};hb=${branch};js=1#l${line_no}`;
  }
}
