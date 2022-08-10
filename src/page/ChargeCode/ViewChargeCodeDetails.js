/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { Row, Col, Typography, Icon, Spin } from 'antd'
import moment from 'moment'
import Cookies from 'js-cookie'
import _ from 'lodash'
import MemberTable from './components/Table/MemberTable'
import OwnerTable from './components/Table/OwnerTable'
import { GET_CHRAGE_CODES_DETAIL } from '../../constants/index'
import { runQueryEmployeeInfo } from '../TimeSheet/HelperTimesheet'
import {
  Sectioner,
  TextOnButton
} from './components/styled'

const { Text } = Typography

class ViewChargeCodeDetails extends React.Component {
  constructor(props) {
    super(props)
    const { location } = this.props
    this.state = {
      currentCode: '',
      currentID: location.state.currentID,
      limit: 10,
      offset: 0,
      employeeList: [],
      userPermission: Cookies.get('user_role'),
      isLoading: true,
      currentEmpID: 0,
      canEdit: false
    }
  }

  componentWillMount() {
    const { client, location } = this.props
    client.cache.reset().then(async () => {
      await this.runQuery(location.state.currentID)
      await runQueryEmployeeInfo(this.props)
      Cookies.get('user_role')
    })
  }

  onEditChargeCode = () => {
    const { history, location, setBreadCrumb } = this.props
    history.push({
      pathname: '/chargecode/edit',
      state: {
        currentID: location.state.currentID,
      }
    })
    setBreadCrumb(
      [
        { url: '/chargecode/list', text: 'Charge Code List', inactive: true },
        { url: '/chargecode/details', text: 'Charge Code Details', inactive: true },
        { url: '/chargecode/edit', text: 'Edit Charge Charge' }
      ]
    )
  }

  runQuery = async (id) => {
    const { client } = this.props
    return new Promise(async (resolve) => {
      const queryResult = await
        client.query({
          query: GET_CHRAGE_CODES_DETAIL,
          variables: { id },
        })
      let owner_array = []
      let member_array = []
      if (queryResult.data) {
        _.each(queryResult.data.charge_code.employees, (value) => {
          if (value.type === 'OWNER') {
            value.type = 1
            value.roll_on = moment(value.roll_on)
            value.roll_off = moment(value.roll_off)
            owner_array = [...owner_array, value]
            return owner_array

          } else {
            value.type = 2
            value.roll_on = moment(value.roll_on)
            value.roll_off = moment(value.roll_off)
            member_array = [...member_array, value]
            return member_array
          }
        })
      }

      this.setState({
        currentCode: queryResult.data.charge_code,
        owners: owner_array,
        members: member_array,
        isLoading: false
      }, () => {
        resolve('runquery success !!')
      })

    })
  }


  render() {
    const { components } = this.props
    const { Button, StandardContainer } = components
    const {
      members,
      isLoading,
      currentCode,
      owners,
      userPermission,
    } = this.state


    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />


    if (currentCode) {

      return (
        <Fragment>
          <StandardContainer
            subHeader="Charge Code Details"
            loading={false}
            buttons={
              userPermission === 'back_office_admin' || userPermission === 'hr' || userPermission === 'manager' ?
                (<Button size="l" onClick={this.onEditChargeCode}>Edit</Button>) :
                (null)
            }
          >
            <Row style={{ paddingTop: '24px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Charge Code Name</TextOnButton>
                  <Text>{currentCode.name}</Text>
                </div>
              </Col>
              <Col span={12}>
                <TextOnButton>Charge Code</TextOnButton>
                <Text>{currentCode.code}</Text>
              </Col>
            </Row>

            <Row style={{ paddingTop: '16px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Start Date - End Date</TextOnButton>
                  <Text><span>{moment(currentCode.start_date).format('DD MMM YYYY')}</span> - <span>{moment(currentCode.end_date).format('DD MMM YYYY')}</span></Text>
                </div>

              </Col>
              <Col span={12}>
                <div style={{ paddingRight: '24px' }}>
                  <TextOnButton>Charge Code Type</TextOnButton>
                  <Text>{
                    currentCode.visibility_private ?
                      (
                        <div>Private</div>
                      ) :
                      (
                        <div>Public</div>
                      )
                  }
                  </Text>
                </div>
              </Col>
            </Row>
            <Row style={{ paddingTop: '16px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton> Working Type</TextOnButton>
                  <Text>{
                    _.get(this.state, 'currentCode.is_not_work', 'No data') === 1 ? <div>Non-Billable</div> : <div>Billable</div>
                  }
                  </Text>

                </div>
              </Col>
              <Col span={12}>
                <div style={{ paddingRight: '16px' }}>
                  <TextOnButton> Charge Code Status</TextOnButton>
                  <Text>{
                    _.get(this.state, 'currentCode.is_active', 'No data') === true ? <div style={{ color: '#57D9A3' }}>Active</div> : <div style={{ color: '#FF8F73' }}>Inactive</div>
                  }
                  </Text>

                </div>
              </Col>
            </Row>
            <Row style={{ paddingTop: '16px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Charge Code Description</TextOnButton>
                  <Text>{_.get(this.state, 'currentCode.description', '-') !== '' ? <div>{currentCode.description}</div> : <div>-</div>}</Text>
                </div>
              </Col>
            </Row>

            <Row style={{ paddingTop: '48px' }}>
              <Col>
                <Sectioner>Owner</Sectioner>
              </Col>
            </Row>
            <Row style={{ paddingTop: '16px' }}>
              <Col>
                <OwnerTable
                  loading={{
                    spinning: isLoading,
                    indicator: <Spin indicator={antIcon} />,
                  }}
                  components={components}
                  ownerdata={owners}
                />
              </Col>
            </Row>

            {currentCode.visibility_private ? (
              <div>

                <Row style={{ paddingTop: '48px' }}>
                  <Col>
                    <Sectioner>Member</Sectioner>
                  </Col>
                </Row>
                <Row style={{ paddingTop: '16px' }}>
                  <Col>
                    <MemberTable
                      loading={{
                        spinning: isLoading,
                        indicator: <Spin indicator={antIcon} />,
                      }}
                      components={components}
                      memberdata={members}
                    />
                  </Col>
                </Row>
              </div>
            ) : (
                null
              )
            }
          </StandardContainer>
        </Fragment>
      )
    } else {
      return null
    }

  }
}

ViewChargeCodeDetails.propTypes = {
  components: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  location: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func,
}

ViewChargeCodeDetails.defaultProps = {
  components: {},
  form: {},
  history: {},
  client: {},
  location: {},
  setBreadCrumb: null
}

function mapStateToProps() {
  return {
  }
}

const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
  }
}


const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withApollo(ViewChargeCodeDetails))
