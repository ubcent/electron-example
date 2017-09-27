import { connect } from 'react-redux';
import Home from '../components/Home';
import { send } from 'redux-electron-ipc';

function mapStateToProps(state) {
  return {
    hosts: state.get('host').toList().toJS(),
    env: state.get('env')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchTree: (ip) => dispatch(send('fetchTree', ip))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
