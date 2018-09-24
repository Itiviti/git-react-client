import { AppBar, Button, createStyles, Divider, Drawer, IconButton, LinearProgress, List, ListItem, ListItemText, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import transitions from '@material-ui/core/styles/transitions';
import BuildIcon from '@material-ui/icons/Build';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import  * as H from 'history';
import * as querystring from 'querystring';
import * as React from 'react';
import { CSSProperties } from 'react';
import { Redirect } from 'react-router';
import { fromEvent, merge, Subject } from 'rxjs';
import { bufferTime, filter, finalize, takeUntil } from 'rxjs/operators';
import './App.css';
import { renderNodesForLayout, rxFlow } from './components/GitCommon';
import GrepOptions, { IGrepOptionsState } from './components/searchoptions/GrepOptions';
import SearchOptions, { ISearchOptionsState } from './components/searchoptions/SearchOptions';
import { gitRestApi } from './settings';

interface IState {
  menuOpen: boolean,
  optionOpen: boolean,
  redirect?: string,
  data?: any,
  pending?: boolean,
  options?: {
    repo?: string,
    text?: string,
    branch?: string,
    path?: string,
    layout?: string,
    ignoreCase?: boolean,
    redirect?: boolean,
    mode?: string
  }
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
      menuOpen: false,
      optionOpen: this.isGitSearch() || !repo,
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

    const hasData = !!this.state.data;
    const isGitSearch = this.isGitSearch();
    const appBarStyle = this.state.menuOpen ? appBarShift : appBarShiftBack;

    return (
      <div className="App">
        <AppBar position="static" style={appBarStyle}>
          <Toolbar>
            <IconButton color="inherit" aria-label="Menu" onClick={this.toggleMenu} style={{ marginRight: 15 }}>
              <MenuIcon />
            </IconButton>

            <Typography variant="title" color="inherit">{isGitSearch ? "Git Search" : "Git Grep"}</Typography>
            <div style={{ flexGrow: 1 }}>
              {this.renderParams()}
            </div>
            <Button color="default" variant="contained" onClick={this.toggleOption}>
              <BuildIcon />
            </Button>
          </Toolbar>
        </AppBar>
        {this.state.pending &&
          <LinearProgress color='secondary' />
        }
        <Drawer variant="persistent" anchor="left" open={this.state.menuOpen}>
          <List>
            <div className={this.props.classes.drawerHeader}>
              <IconButton onClick={this.toggleMenu}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <ListItem button={true} onClick={this.navigate('/gitgrep')}>
              <ListItemText primaryTypographyProps={{ variant: 'subheading', color: isGitSearch ? 'default' : 'secondary' }} primary='Git Grep' />
            </ListItem>
            <ListItem button={true} onClick={this.navigate('/gitsearch')}>
              <ListItemText primaryTypographyProps={{ variant: 'subheading', color: isGitSearch ? 'secondary' : 'default' }} primary='Git Search' />
            </ListItem>
          </List>
        </Drawer>
        {this.renderOption(isGitSearch)}
        <pre className='results'>
          {hasData &&
            renderNodesForLayout(this.state.data, this.state.options!.layout)
          }
        </pre>
      </div>
    );
  }

  public componentDidMount() {
    if (!this.isGitSearch() && this.state.options && this.state.options.repo) {
      this.loadGrepFromServer(this.state.options);
    }
  }

  public renderParams() {
    if (this.state.options && this.state.options.repo) {
      const baseStyle: CSSProperties = { float: 'left', marginLeft: 13 };
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
    }
    return <GrepOptions { ...args } />
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

  private isGitSearch(): boolean {
    const currentLocation = window.location.pathname;
    return currentLocation.endsWith('gitsearch');
  }

  private onSearchOptionsValidate = (options: IGrepOptionsState | ISearchOptionsState) => {
    this.props.history.push(window.location.pathname + "?" + querystring.stringify(options));
    this.loadGrepFromServer(options);
  }

  private loadGrepFromServer(params: any) {
    this.setState({
      ...this.state,
      data: [],
      optionOpen: false,
      options: params,
      pending: true,
    });
    const esc = fromEvent<{keyCode: number}>(document, 'keydown').pipe(
      filter(e => e.keyCode === 27)
    );
    rxFlow(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}&delimiter=${'%0A%0A'}${params.ignoreCase?'&ignore_case=true':''}`, { withCredentials: false }).pipe(
      bufferTime(500),
      takeUntil(merge(this.startQuery,esc)),
      finalize(() => this.setState({
        ...this.state,
        pending: false
      })),
    ).subscribe(update => {
      const data = this.state.data!;
      data.push(...update);
      this.setState({
      ...this.state,
      data
    })});
  }
}

export default withStyles(styles)(App);
