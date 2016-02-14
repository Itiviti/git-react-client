let settings = {
  gitRestApi: () => 'http://git-viewer:1337',
  gitViewer: () => new GitwebViewer('http://git-viewer/gitweb')
}

export default settings;

class GitwebViewer {
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
