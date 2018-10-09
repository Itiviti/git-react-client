import { AppBar, Button, createStyles, Divider, Drawer, IconButton, InputAdornment, LinearProgress, List, ListItem, ListItemText, TextField, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import transitions from '@material-ui/core/styles/transitions';
import BuildIcon from '@material-ui/icons/Build';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import FilterListIcon from '@material-ui/icons/FilterList';
import MenuIcon from '@material-ui/icons/Menu';
import  * as H from 'history';
import * as querystring from 'querystring';
import * as React from 'react';
import { CSSProperties } from 'react';
import { Redirect } from 'react-router';
import * as Virtual from 'react-virtualized';
import { fromEvent, merge, Subject } from 'rxjs';
import { bufferTime, filter, finalize, takeUntil } from 'rxjs/operators';
import './App.css';
import { renderCompactNode, rxFlow } from './components/GitCommon';
import { IGrepResultLine } from './components/GrepResultLine';
import GrepOptions, { IGrepOptionsState } from './components/searchoptions/GrepOptions';
import SearchOptions, { ISearchOptionsState } from './components/searchoptions/SearchOptions';
import { gitRestApi } from './settings';

interface IOption {
  repo?: string,
  text?: string,
  branch?: string,
  path?: string,
  layout?: string,
  ignoreCase?: boolean,
  redirect?: boolean,
  mode?: string
}

interface IState {
  menuOpen: boolean,
  optionOpen: boolean,
  redirect?: string,
  data?: any,
  pending?: boolean,
  filter?: string,
  options?: IOption
}

const drawerWidth = 240;

const appBarShift = {
  marginLeft: drawerWidth,
  transition: transitions.create(['margin', 'width'], {
    duration: transitions.duration.enteringScreen,
    easing: transitions.easing.easeOut,
  }),
  width: `calc(100% - ${drawerWidth}px)`,
}

const appBarShiftBack = {
  marginLeft: 0,
  transition: transitions.create(['margin', 'width'], {
    duration: transitions.duration.standard,
    easing: transitions.easing.easeOut,
  }),
  width: '100%',
}

const styles = createStyles({
  drawerHeader: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    minHeight: '56px',
    padding: '0 8px',
    width: drawerWidth
  },
  input: {
    marginBottom: '15px'
  }
});

interface IProps extends WithStyles<typeof styles> {
  history: H.History
}

class App extends React.Component<IProps, IState> {

  private startQuery: Subject<any> = new Subject<any>();

  constructor(props: IProps) {
    super(props);
    const query = querystring.parse(window.location.search.replace(/^\?/, ''));
    const repo = query.repo as string;

    this.state = {
      data: [],
      filter: '',
      menuOpen: false,
      optionOpen: !repo,
      options: {
        branch: query.branch as string || query.ref as string,
        ignoreCase: query.ignoreCase && query.ignoreCase === "true" ? true : false,
        layout: 'compact',
        mode: query.mode as string,
        path: query.path as string,
        redirect: !!query.redirect,
        repo,
        text: query.text as string || query.grep as string,
      },
      pending: false,
    };
  }

  public render() {
    const currentLocation = window.location.pathname;
    if (this.state.redirect && !currentLocation.endsWith(this.state.redirect)) {
      return <Redirect push={true} to={this.state.redirect} />
    }

    const isGitSearch = this.isGitSearch();
    const appBarStyle = this.state.menuOpen ? appBarShift : appBarShiftBack;

    const filterText = this.state.filter;
    let data = this.state.data;

    if (data && filterText) {
      data = this.state.data!.filter((d: IGrepResultLine) => d.repo.includes(filterText) || d.file.includes(filterText) || d.branch.includes(filterText) || d.line.includes(filterText));
    }

    return (
      <Virtual.WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <div className="App">
            {this.state.pending &&
              <LinearProgress style={{ zIndex: 2000, width: '100%', top: 0, position: 'absolute' }} color='secondary' />
            }
            <AppBar position="fixed" style={appBarStyle}>
              <Toolbar>
                <IconButton color="inherit" aria-label="Menu" onClick={this.toggleMenu} style={{ marginRight: 15 }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="title" color="inherit">{isGitSearch ? "Git Search" : "Git Grep"}</Typography>
                <div style={{ flexGrow: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {this.renderParams()}
                </div>
                <TextField value={this.state.filter} onChange={this.handleFilterTextChange} className='filter' style={{ paddingLeft: 5, paddingRight: 5 }} InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon style={{ color: 'white' }} />
                    </InputAdornment>
                  )
                }}/>
                <Button color="default" variant="contained" onClick={this.toggleOption}>
                  <BuildIcon />
                </Button>
              </Toolbar>
            </AppBar>
            <Drawer variant="persistent" anchor="left" open={this.state.menuOpen}>
              <List>
                <div className={this.props.classes.drawerHeader}>
                  <IconButton onClick={this.toggleMenu}>
                    <ChevronLeftIcon />
                  </IconButton>
                </div>
                <Divider />
                <ListItem button={true} onClick={this.navigate('gitgrep')}>
                  <ListItemText primaryTypographyProps={{ variant: 'subheading', color: isGitSearch ? 'default' : 'secondary' }} primary='Git Grep' />
                </ListItem>
                <ListItem button={true} onClick={this.navigate('gitsearch')}>
                  <ListItemText primaryTypographyProps={{ variant: 'subheading', color: isGitSearch ? 'secondary' : 'default' }} primary='Git Search' />
                </ListItem>
              </List>
            </Drawer>
            {this.renderOption(isGitSearch)}
            {!!data &&
              <pre className='results'>
                <Virtual.List
                  autoHeight={true}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  scrollTop={scrollTop}
                  overscanRowCount={100}
                  rowCount={data.length}
                  rowRenderer={this.renderResult(data)}
                  width={5000}
                  height={height}
                  rowHeight={16} />
              </pre>
            }
          </div>
        )}
      </Virtual.WindowScroller>
    );
  }

  public componentDidMount() {
    if (!this.state.options || !this.state.options.repo) {
      return;
    }
    if (!this.isGitSearch()) {
      this.loadGrepFromServer(this.state.options);
    } else {
      this.loadSearchFromServer(this.state.options);
    }
  }

  public renderParams() {
    if (this.state.options && (this.state.options.repo || this.state.options.text)) {
      const baseStyle: CSSProperties = { display: 'inline-block', marginLeft: 13 };
      const boldStyle: CSSProperties = { ...baseStyle, fontWeight: "bold" };

      const options = this.state.options;
      return (
        <>
          <Typography variant="subheading" color="inherit" style={baseStyle}>Repositories</Typography>
          <Typography variant="subheading" color="inherit" style={boldStyle}>{options.repo}</Typography>
          <Typography variant="subheading" color="inherit" style={baseStyle}>Search expression</Typography>
          <Typography variant="subheading" color="inherit" style={boldStyle}>{options.text}</Typography>
          {this.state.options.ignoreCase &&
            <Typography variant="subheading" color="inherit" style={boldStyle}>(Ignore case)</Typography>
          }
          <Typography variant="subheading" color="inherit" style={baseStyle}>Branch</Typography>
          <Typography variant="subheading" color="inherit" style={boldStyle}>{options.branch}</Typography>
          <Typography variant="subheading" color="inherit" style={baseStyle}>File pattern</Typography>
          <Typography variant="subheading" color="inherit" style={boldStyle}>{options.path}</Typography>
        </>
      );
    }
    return (<Typography variant="subheading" color="inherit">No search has been run yet</Typography>);
  }

  private renderResult: (results: IGrepResultLine[]) => (props: Virtual.ListRowProps) => React.ReactNode = results => props => {
    return renderCompactNode(results[props.index], props.key, { ...props.style, width: 'auto' });
  }

  private renderOption(isGitSearch: boolean) {
    const query = querystring.parse(window.location.search.replace(/^\?/, ''));
    const args = {
      inputClass: this.props.classes.input,
      onClose: this.toggleOption,
      onValidate: this.onSearchOptionsValidate,
      query,
      show: this.state.optionOpen
    }
    if (isGitSearch) {
      return <SearchOptions { ...args } />
    } else {
      return <GrepOptions { ...args } />
    }
  }

  private navigate(target: string): () => void {
    return () => {
      this.setState({
        ...this.state,
        menuOpen: false,
        optionOpen: true,
        redirect: target
      })
    }
  };

  private toggleMenu: () => void = () => {
    this.setState({
      ...this.state,
      menuOpen: !this.state.menuOpen
    });
  }

  private toggleOption: () => void = () => {
    this.setState({
      ...this.state,
      optionOpen: !this.state.optionOpen
    });
  }

  private handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({...this.state, filter: e.target.value});
  }

  private isGitSearch(): boolean {
    const currentLocation = window.location.pathname;
    return currentLocation.endsWith('gitsearch');
  }

  private onSearchOptionsValidate = (options: IGrepOptionsState | ISearchOptionsState) => {
    this.props.history.push(window.location.pathname + "?" + querystring.stringify(options));
    if (this.isGitSearch()) {
      this.loadSearchFromServer(options);
    } else {
      this.loadGrepFromServer(options);
    }
  }

  private loadSearchFromServer(params: IOption) {
    this.setState({
      ...this.state,
      data: [],
      optionOpen: false,
      options: params,
      pending: true,
    });

    // parse text to find line_no and stuff
    const txt = params.text!;
    let match;
    let line = 1;

    let paths;
    if (params.mode === SearchOptions.MODE_FILE) {
      paths = [txt, `*/${txt}`]
    } else {
      // TODO: redirect to MS ref src
      match = txt.match(/([\w\.\d]+):(\d+)/);
      if (match) {
        paths = [`*/${match[1]}`];
        line = parseInt(match[2], 10);
      } else {
        match = txt.match(/([^.]+)\.[^.]+\(/);
        if (match) {
          paths = [`*/${match[1]}.*`];
        } else {
          match = txt.match(/(\w+)/);
          if (match) {
            paths = [`*/${match[1]}.*`];
          } else {
            return;
          }
        }
      }
    }

    const pathsQuery = paths.map(p => `path=${p}`).join('&');
    this.loadResult(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=^&${pathsQuery}&target_line_no=${line}&delimiter=${'%0A%0A'}${params.ignoreCase?'&ignore_case=true':''}`);
  }

  private loadGrepFromServer(params: IOption) {
    this.setState({
      ...this.state,
      data: [],
      optionOpen: false,
      options: params,
      pending: true,
    });

    this.loadResult(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=${params.text ? params.text : ''}&path=${params.path}&delimiter=${'%0A%0A'}${params.ignoreCase?'&ignore_case=true':''}`);
  }

  private loadResult(query: string) {
    const esc = fromEvent<{keyCode: number}>(document, 'keydown').pipe(
      filter(e => e.keyCode === 27)
    );
    rxFlow(query, { withCredentials: false }).pipe(
      bufferTime(500),
      takeUntil(merge(this.startQuery,esc)),
      finalize(() => this.setState({
        ...this.state,
        pending: false
      })),
      filter(update => update && update.length > 0)
    ).subscribe(update => {
      const data = this.state.data!;
      data.push(...update);
      this.setState({
        ...this.state,
        data
      });
    });
  }
}

export default withStyles(styles)(App);
