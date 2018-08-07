declare var DEBUG: boolean;

export interface GitViewer {
  viewerForRepo({repo}) : string
  viewerForBranch({repo, branch}) : string
  viewerForPath({repo, branch, file}) : string
  viewerForLine({repo, branch, file, line_no}) : string
}

export function prefix() { return DEBUG ? '/' : '/reactgit/'; }
export function gitRestApi() { return 'http://git-viewer.ullink.lan:1337' }
export function gitViewer() { return new CGitViewer('http://git-viewer.ullink.lan/cgit') }
export function defaultRepoQuery() { return '^ul' }

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

class CGitViewer implements GitViewer {
  baseUrl : string
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  viewerForRepo({repo}) {
    return `${this.baseUrl}/${repo}`;
  }
  viewerForBranch({repo, branch}) {
    return `${this.baseUrl}/${repo}/log/?h=${branch}`;
  }
  viewerForPath({repo, branch, file}) {
    return `${this.baseUrl}/${repo}/tree/${file}?h=${branch}`;
  }
  viewerForLine({repo, branch, file, line_no}) {
    return `${this.baseUrl}/${repo}/tree/${file}?h=${branch}#n${line_no}`;
  }
}
