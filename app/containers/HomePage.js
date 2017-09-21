import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home';

function mapStateToProps(state) {
  return {
    hosts: state.get('hosts'),
    env: state.get('env')
  };
}

export default connect(mapStateToProps)(Home);