/* eslint-disable no-console */
import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Row } from 'antd'
import _ from "lodash"
import Cookies from 'js-cookie'
import ChargeCodeTable from './components/Table/ChargeCodeTable'
import ReportConfigurationList from '../ReportConfiguration/ReportConfiguration'
import { CustomTabs } from './components/styled'

const { TabPane } = CustomTabs

class ViewChargeCodeList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userPermission: Cookies.get('user_role'),
      isReportConfig: false
    }
  }

  componentWillMount() {
    const { setBreadCrumb, actionSetTitle } = this.props
    setBreadCrumb()
    actionSetTitle('Charge Code')
    try {
      const current = Cookies.get('active_tab')
      if (current === 'report') {
        this.setState({ isReportConfig: true }, () => {
          Cookies.set('active_tab', 'ChargeCode')
        })
      }
    } catch (e) {
      console.log('We got some parsing error')
    }
  }

  render() {
    const {
      isReportConfig,
      userPermission,
    } = this.state
    const { components, history, location } = this.props
    const { StandardContainer } = components
    return (
      <Fragment>
        {
          userPermission === 'back_office_admin' || userPermission === 'hr' || userPermission === 'manager' ? (
            <StandardContainer>
              <CustomTabs size="default" defaultActiveKey={isReportConfig ? '2' : '1'} onChange={(activeTab) => { console.log('activeTab', activeTab) }}>
                <TabPane tab="Charge Code" key="1">
                  <Row style={{ paddingTop: '24px' }}>
                    <ChargeCodeTable
                      pagination={{ position: 'none' }}
                      components={components}
                      location={location}
                      history={history}
                    />
                  </Row>
                </TabPane>
                <TabPane tab='Report Configuration' key='2'>
                  <ReportConfigurationList
                    components={components}
                    location={location}
                    history={history}
                  />
                </TabPane>
              </CustomTabs>
            </StandardContainer>
          ) : (
              <StandardContainer subHeader='Charge Code List'>
                <ChargeCodeTable
                  pagination={{ position: 'none' }}
                  components={components}
                  location={location}
                  history={history}
                />
              </StandardContainer>
            )
        }
      </Fragment>
    )
  }
}


function mapStateToProps() {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
    actionSetBreadcrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
  }
}
const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}

ViewChargeCodeList.propTypes = {
  components: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  location: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func,
  actionSetTitle: PropTypes.func,
}

ViewChargeCodeList.defaultProps = {
  components: {},
  form: {},
  history: {},
  client: {},
  location: {},
  setBreadCrumb: null,
  actionSetTitle: null
}

export const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewChargeCodeList)
