/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Col, Spin, Icon, Typography} from 'antd'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import moment from 'moment'
import { GET_COMPANY_HOLIDAY_DETAILS } from '../../constants/index'
import { ContentWrapper, TextOnButton, TableCustom } from './components/styled'

const { Text } = Typography

class ViewCompanyHolidayDetail extends React.Component {
  constructor(props) {
    super(props)
    const {location} =this.props
    this.state = {
      currentData: location.state.currentData,
      currentYear: moment().format('YYYY'),
      holidaySetsName: ''
    }
  }

  // eslint-disable-next-line react/sort-comp
  UNSAFE_componentWillMount() {
    const {actionSetTitle,location} =this.props
   actionSetTitle('Company Holiday')
    this.runQuery(`${location.state.currentId}`)
  }

  holidayCompanyParser = (holidaycompany, index) => {
    return {
      id: holidaycompany.id,
      date: holidaycompany.date,
      holidaycompany_name: holidaycompany.name,
      key: index
    }
  }

  runQuery = async (id) => {
    const {client}=this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: GET_COMPANY_HOLIDAY_DETAILS,
        variables: { id },
      })
    this.setState({
      holidaySetsName: queryResult.data.company_holiday.holidaycompany_name,
      currentData: _.map(queryResult.data.company_holiday.holidaydetails, this.holidayCompanyParser),
      isLoading: false
    })

  }

  onEdit = () => {
    const {history,location,setBreadCrumb} = this.props
    const {currentData,holidaySetsName}=this.state
    history.push({
      pathname: '/companyholiday/edit',
      state: {
        currentId: location.state.currentId,
        currentHolidayList: currentData,
        currentName: holidaySetsName
      }
    })
    setBreadCrumb(
      [
        { url: '/companyholiday/list', text: 'Company Holiday List', inactive: true },
        { url: '/companyholiday/details', text: 'Company Holiday Details', inactive: true },
        { url: '/companyholiday/edit', text: 'Edit Company Holiday' },
      ]
    )

  }

  render() {
    const {components} = this.props
    const { Button,
      StandardContainer
    } = components
    const {holidaySetsName,isLoading,currentData} = this.state
    const columns = [
      {
        title: 'Holiday Name',
        dataIndex: 'holidaycompany_name',
        key: 'holidaycompany_name',
        width: 370,
        render: (text) => {
          if (columns[0]) {
            return text
          } else {
            return { text }
          }
        }
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        width: 0,
        render: (text) => {
          if (columns[0]) {
            return moment(text).format('DD MMM YYYY')

          } else {
            return moment(text).format('DD MMM YYYY')
          }
        }
      },
    ]
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <Fragment>
        <StandardContainer
          subHeader="Company Holiday Details"
          buttons={
            <Fragment>
              <Button size="l" onClick={this.onEdit}>Edit</Button>
            </Fragment>}
        >
          <ContentWrapper>
            <Col span={12}>
              <TextOnButton>Effective Year</TextOnButton>
              <Text style={{ marginLeft: '14px'}}>
                {holidaySetsName}
              </Text>
            </Col>
          </ContentWrapper>

          <TableCustom
            loading={{
              spinning: isLoading,
              indicator: <Spin indicator={antIcon} />,
            }}
            columns={columns}
            dataSource={currentData}
            pagination={{ position: 'none', defaultPageSize: 100 }}
          />
        </StandardContainer>

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
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
  }
}
const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}
const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
  }
}
ViewCompanyHolidayDetail.propTypes={
  components:PropTypes.oneOfType([PropTypes.object]),
 location:PropTypes.oneOfType([PropTypes.object]),
 history:PropTypes.oneOfType([PropTypes.object]),
 setBreadCrumb:PropTypes.func,
 actionSetTitle:PropTypes.func,
 client:PropTypes.oneOfType([PropTypes.object]),
}
ViewCompanyHolidayDetail.defaultProps={
  components:{},
 location:{},
 history:{},
 setBreadCrumb:()=>{},
 actionSetTitle:()=>{},
 client:{},
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(ViewCompanyHolidayDetail))

