import React from 'react';
import Spinner from 'react-spinkit';
import Cookie from 'react-cookie';
import {OverlayTrigger, Popover} from 'react-bootstrap';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {layout: Cookie.load('layout') || 'compact'};
    this.props.settingsUpdated(this.state);
  }

  setLayout = (layout) => {
    this.setState({layout: layout});
    this.props.settingsUpdated({layout});
    Cookie.save('layout', layout);
  }

  render() {
    const popover = <Popover id="settings-panel" title="Settings">
      <div className="form-horizontal">
        <div className="form-group">
          <label className="col-sm-4 control-label">Layout</label>
          <div className="col-sm-8">
            <select className="form-control"
                value={this.state.layout}
                onChange={evt=>this.setLayout(evt.target.value)}>
              <option value="compact">Compact</option>
              <option value="google">Google</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">Forward</label>
          <div className="col-sm-8">
            <input type="checkbox" disabled />
          </div>
        </div>
      </div>
    </Popover>;

    return (
      <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popover}>
        <button className="btn btn-default fa fa-cog"></button>
      </OverlayTrigger>
    );
  }
}