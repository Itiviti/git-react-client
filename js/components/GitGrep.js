import React from 'react';
import Spinner from "react-spinkit";
import GrepResult from './GrepResult.js';
require('../../css/components/GitGrep.css');
import { browserHistory } from 'react-router'

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = { layout: 'google' };
  }
  handleClick() {
    var layout = this.state.layout == 'google' ? 'compact' : 'google';
    this.setState({layout: layout});
    this.props.settingsUpdated(this.state);
  }
  render() {
    return (
      <p onClick={this.handleClick}>foo</p>
    );
  }
}

class GrepBox extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick        = this.handleClick.bind(this);
    this.handleRepoChange   = this.handleRepoChange.bind(this);
    this.handleTextChange   = this.handleTextChange.bind(this);
    this.handleBranchChange = this.handleBranchChange.bind(this);
    this.handlePathChange   = this.handlePathChange.bind(this);
    this.settingsUpdated    = this.settingsUpdated.bind(this);
    var query = this.props.location.query || {};
    this.state = {repo: query.repo || query.project || '^ul', text: query.text || query.grep || '', branch: query.branch || query.ref || 'HEAD', path: query.path || '.', data: [], pending: false};
  }
  loadGrepFromServer(params) {
    this.setState({pending: true});
    fetch(`http://git-viewer:1337/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}`, { })
      .then(response => response.json() )
      .then(json => {
        this.setState({data: json, pending: false});
      }).catch(ex => {
         console.log('parsing failed', ex)
      });
  }
  handleClick(e) {
    e.preventDefault();
    this.props.location.query.path = this.state.path;
    this.props.location.query.text = this.state.text;
    this.props.location.query.branch = this.state.branch;
    this.props.location.query.repo = this.state.repo;
    this.props.location.query.submit = 'Grep';
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(this.state);
  }
  handleRepoChange(e) {
    this.setState({repo: e.target.value});
  }
  handleTextChange(e) {
    this.setState({text: e.target.value});
  }
  handleBranchChange(e) {
    this.setState({branch: e.target.value});
  }
  handlePathChange(e) {
    this.setState({path: e.target.value});
  }
  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit == 'Grep') {
      this.loadGrepFromServer(this.state);
    }
  }
  settingsUpdated(settings) {
    this.setState({layout: settings.layout});
  }
  render() {
    var loading = this.state.pending ? ( <Spinner spinnerName='circle' noFadeIn /> ) : ( <div/> );
    var grepNodes = this.state.data.map(grep => (
      <GrepResult repo={grep.repo} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line}/>
      )
    );
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <form className="grepForm">
            <input type="search" placeholder="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleRepoChange} />
            <input type="search" placeholder="Search expression" value={this.state.text} onChange={this.handleTextChange} />
            <input type="search" placeholder="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleBranchChange} />
            <input type="search" placeholder="Matching path (e.g. *.java)" value={this.state.path} onChange={this.handlePathChange} />
            <button onClick={this.handleClick}>Grep</button>
          </form>
          {loading}
          <Settings settingsUpdated={this.settingsUpdated}/>
        </div>
        <pre className="results">
        {grepNodes}
        </pre>
      </div>
    );
  }
}

export default GrepBox;  

