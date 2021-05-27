import React, { Component } from 'react';
import Dropdown from "./dropdown";

class Activity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: true,
        };
        this.onChangeActivity = this.onChangeActivity.bind(this);
    }

    onChangeActivity = (value) => {
        this.setState({value: value});
    };

    render() {
        return (
            <div>
                <Dropdown changeActivity={this.onChangeActivity} />
            </div>
        )
    }
}

export default Activity;