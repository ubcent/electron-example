// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

export default class Home extends Component {
  render() {
    const { env } = this.props;
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>My IP {env.get('ip')}</h2>
        </div>
      </div>
    );
  }
}
