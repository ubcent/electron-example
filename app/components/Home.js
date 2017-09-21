// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

export default class Home extends Component {
  render() {
    const { env, hosts = [] } = this.props;
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>My IP {env.get('ip')}</h2>
          <ul>
            {hosts.map(host => <li>{host.ip} ({host.type}/{host.source})</li>)}
          </ul>
        </div>
      </div>
    );
  }
}
