import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';



import { userInfo } from './utils/util'

import Login from './components/login';
import Layout from './components/layout';
import Dashboard from './components/dashboard';
import TicketList from './components/ticket/list';
import TicketAdd from './components/ticket/add';
import TicketDetail from './components/ticket/detail';
import User from './components/user';
import Server from './components/server';
import Scheduling from './components/scheduling';
import MyTicket from './components/workbench/ticket';
import MyScheduling from './components/workbench/scheduling';


@userInfo
class App extends React.Component {
  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Router>
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
            <Route path="/login" component={Login} />
            <Route path="/" render={() =>
              <Layout>
                <Switch>
                  <Route path='/dashboard' component={Dashboard} />
                  <Route path='/workbench/ticket' component={MyTicket} />
                  <Route path='/workbench/scheduling' component={MyScheduling} />
                  <Route path='/ticket/list' component={TicketList} />
                  <Route path='/ticket/add' component={TicketAdd} />
                  <Route path='/ticket/detail/:id' component={TicketDetail} />
                  <Route path='/user' component={User} />
                  <Route path='/server' component={Server} />
                  <Route path='/scheduling' component={Scheduling} />
                </Switch>
              </Layout>
            } />
          </Switch>
        </Router>
      </LocaleProvider>
    )
  }
}

export default App;