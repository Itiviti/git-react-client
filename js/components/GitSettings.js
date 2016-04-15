import React from 'react';
import Spinner from 'react-spinkit';
import Cookie from 'react-cookie';
import {connect} from 'react-redux';
import {OverlayTrigger, Popover} from 'react-bootstrap';

@connect(state => ({
  settings: state.settings
}), (dispatch) => ({
  setLayout: (layout) => dispatch({type: 'SET_LAYOUT', layout})
}))
export default class Settings extends React.Component {
  render() {
    const popover = <Popover id="settings-panel" title="Settings">
      <div className="form-horizontal">
        <div className="form-group">
          <label className="col-sm-4 control-label">Layout</label>
          <div className="col-sm-8">
            <select className="form-control"
                value={this.props.settings.layout}
                onChange={evt=>this.props.setLayout(evt.target.value)}>
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
        <a id="settings-btn" href="#" className="fa fa-cog fa-large"></a>
      </OverlayTrigger>
    );
  }
}