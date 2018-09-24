import * as React from 'react'
import * as Cookie from 'react-cookie'

interface IProperties {
  settingsUpdated: (settings: {layout: string}) => void
}

interface IState {
  layout: string
}

export default class GrepSettings extends React.Component<IProperties, IState> {
  constructor(props: IProperties) {
    super(props);
    this.state = { layout: Cookie.load('layout') || 'compact' };
    this.props.settingsUpdated(this.state);
  }

  public render() {
    return (
      <div style={{marginLeft: 'auto'}} >Layout:
        <a onClick={this.handleClick}>{this.state.layout}</a>
      </div>
    );
  }

  private handleClick:() => void = () => {
    const layout = this.state.layout === 'google' ? 'google' : 'compact';
    this.setState({layout});
    this.props.settingsUpdated({layout});
    Cookie.save('layout', layout);
  }
}

