var $ = require('jquery');
import React from 'react';
import {PrismCode} from "react-prism";

var Grep = React.createClass({
  viewerForRepo: function() {
      return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo}`;
  },
  viewerForBranch: function() {
      return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo};a=shortlog;h=${this.props.branch};js=1`;
  },
  viewerForPath: function() {
      return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo};a=blob;f=${this.props.file};hb=${this.props.branch};js=1`;
  },
  viewerForLine: function() {
      return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo};a=blob;f=${this.props.file};hb=${this.props.branch};js=1#l${this.props.line_no}`;
  },
  render: function() {
    var langs = { cs: 'csharp', fs: 'fsharp', js: 'javascript', md: 'markdown', pl: 'perl', py: 'python' };
    var arr = this.props.file.split('.');
    var ext = arr[arr.length - 1];
    var lang = `language-${langs[ext] || ext}`;
    return (
      <div><a href={this.viewerForRepo()}>{this.props.repo}</a>:<a href={this.viewerForBranch()}>{this.props.branch}</a>:<a href={this.viewerForPath()}>{this.props.file}</a>:<a href={this.viewerForLine()}>{this.props.line_no}</a>:<PrismCode  className={lang}>{this.props.line}</PrismCode></div>
    );
  }
});

var GrepBox = React.createClass({
  loadGrepFromServer: function(params) {
    $.ajax({
      url: `http://git-viewer:1337/repo/${params.repo}/grep/${params.branch}`,
      data: { q: params.text, path: params.path },
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  render: function() {
    var grepNodes = this.state.data.map(function(grep) {
      return (
      <Grep repo={grep.repo} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line}/>
      );
    });
    var preStyle = { background: '#272822' };
    return (
      <div>
        <GrepForm onGrepSubmit={this.loadGrepFromServer}/>
        <pre style={preStyle}>
        {grepNodes}
        </pre>
      </div>
    );
  }
});



var GrepForm = React.createClass({
  getInitialState: function() {
    return {repo: '^ul', text: '', branch: 'HEAD', path: '.'};
  },
  handleRepoChange: function(e) {
    this.setState({repo: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleBranchChange: function(e) {
    this.setState({branch: e.target.value});
  },
  handlePathChange: function(e) {
    this.setState({path: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onGrepSubmit(this.state);
  },
  render: function() {
    return (
      <form className="grepForm" onSubmit={this.handleSubmit}>
        <input type="search" placeholder="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleRepoChange} />
        <input type="search" placeholder="Search expression" value={this.state.text} onChange={this.handleTextChange} />
        <input type="search" placeholder="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleBranchChange} />
        <input type="search" placeholder="Matching path (e.g. *.java)" value={this.state.path} onChange={this.handlePathChange} />
        <input type="submit" value="Post" />
      </form>
    );
  }

});


export default GrepBox;  

