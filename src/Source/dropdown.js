import React, { Component } from 'react';

class Dropdown extends Component {

    handleValueChange = (e) => {
        let value = e.target.value == "measure" ? true : false;
        this.props.changeActivity(value);
    }

    render() {
        return(
            <form id="functionality">
                <label htmlFor="activity">Tegevus: &nbsp;</label>
                <select id="activity" onChange={(this.handleValueChange)}>
                    <option value="measure">Mõõtmine</option>
                    <option value="points">Punktobjekt</option>
                </select>
            </form>
        );
    }
};

export default Dropdown;