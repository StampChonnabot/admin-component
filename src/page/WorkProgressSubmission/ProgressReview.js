/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { Select, Typography, Spin, Icon } from 'antd'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import Cookies from 'js-cookie'
import { connect } from 'react-redux'
import { withApollo } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import ReviewTable from './component/table'
import {
  GET_PERIODS,
  GET_EMPLOYEES,
  GET_TIMESHEETS_REVIEWER,
} from '../../constants/index'
import CustomPagination from '../HolidayPreset/components/Footer'
import { ContentWrapper, SelectButton } from './component/styled'

const { Text } = Typography
const { Option } = Select
let PERIOD_OPTIONS = []

class ProgressReview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      reviewerID: 0,
      isReview: _.includes(
        Cookies.get('user_permission').split(','),
        'work_submission_read',
      ),
      isHR: true,
      currentSelectPeriod: {
        name: '',
        id: 1,
      },
      currentSelectStatus: 'All',
      workSubmissions: [],
      employeeList: [],
      data: [],
      pageSize: 10,
      currentPage: 1,
      total: 0,
      period: 0,
      isLoading: true,
      statusNum: 0,
    }
  }

  componentWillMount() {
    const { actionSetTitle, actionSetBreadcrumb, client } = this.props
    const { pageSize, currentPage } = this.state
    actionSetTitle('Timesheet Review')
    actionSetBreadcrumb('')
    client.cache.reset().then(async () => {
      await this.runQueryEmployees(999, 0)
      const period = await this.runQueryPeriod()
      await this.runQueryWorkSubmission(period.resultPeriod.id, 0, pageSize, currentPage)
    })
  }

  runQueryPeriod = () => {
    const { client } = this.props
    return new Promise(async (resolve) => {
      const queryResultPeriods = await client.query({
        query: GET_PERIODS,
      })
      let resultPeriod = ''
      const today = moment().format('YYYY-MM-DD')
      _.each(queryResultPeriods.data.Periods, (value) => {
        const start_moment = moment(value.start_date)
        const end_moment = moment(value.end_date)
        const start_date = moment
          .utc(moment(start_moment).format('YYYY-MM-DD'))
          .format('YYYY-MM-DD')
        const end_date = moment
          .utc(moment(end_moment).format('YYYY-MM-DD'))
          .format('YYYY-MM-DD')

        if (moment(today).isBetween(start_date, end_date, null, '[]')) {
          resultPeriod = {
            name: `${moment(value.start_date).format('DD')} - ${moment(
              value.end_date,
            ).format('DD MMM YYYY')}`,
            id: value.id,
          }
          return false
        }
      })
      this.setState(
        {
          currentSelectPeriod: resultPeriod,
          periodList: queryResultPeriods.data.Periods,
          period: resultPeriod,
          isLoading: false,
        },
        () => {
          resolve({ resultPeriod })
        },
      )
    })
  }

  runQueryWorkSubmission = (period_id, status, limit, page) => {
    const { client } = this.props
    const { employeeList } = this.state
    const offset = (page - 1) * limit
    return new Promise(async (resolve) => {
      try {
        const queryResultWorkSubmissions = await client.query({
          query: GET_TIMESHEETS_REVIEWER,
          variables: { period_id, status, limit, offset },
        })
        const cloneData = _.cloneDeep(
          queryResultWorkSubmissions.data.work_submissions.work_submissions,
        )
        _.each(cloneData, (work) => {
          _.each(employeeList, (emp) => {
            if (work.employee_id === emp.id) {
              work.employee_id = {
                id: emp.id,
                name: emp.name,
              }
              return false
            }
          })
        })
        if (queryResultWorkSubmissions.data.work_submissions.length !== 0) {
          this.setState(
            {
              workSubmissions: _.map(cloneData, this.WorkSubmissionParser),
              total: queryResultWorkSubmissions.data.work_submissions.total,
              isLoading: false,
            },
            () => {
              resolve('get workSubmission')
            },
          )
        } else {
          this.setState(
            {
              workSubmissions: [],
            },
            () => {
              resolve('get workSubmission')
            },
          )
        }
      } catch (error) {
        this.setState(
          {
            workSubmissions: [],
          },
          () => {
            resolve('get workSubmission')
          },
        )
        // reject(error)
      }
    })
  }

  runQueryEmployees = (limit, offset) => {
    const { client } = this.props
    return new Promise(async (resolve, reject) => {
      try {
        const queryResultEmployees = await client.query({
          query: GET_EMPLOYEES,
          variables: { limit, offset },
        })
        console.log('queryResultEmployees', queryResultEmployees)
        this.setState(
          {
            employeeList: _.map(
              queryResultEmployees.data.employees.employee_list,
              this.EmployeeParser,
            ),
            isLoading: false,
          },
          () => {
            resolve('get employee')
          },
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  EmployeeParser = (emp) => {
    return {
      id: emp.id,
      name: `${emp.personnel_info.firstname_en} ${emp.personnel_info.lastname_en}`,
    }
  }

  WorkSubmissionParser = (curObject) => {
    let tempStatus = 0
    if (curObject.status === 2 || curObject.status === 5) {
      tempStatus = 'Submitted'
    } else {
      tempStatus = 'NoSubmission'
    }
    console.log("curObject ",curObject.employee_id)
    return {
      name: curObject.employee_id,
      leave: curObject.leave_hour,
      status: tempStatus,
      total: curObject.total_hour,
      work: curObject.work_hour,
    }
  }

  onChange = (field, value) => {
    const { client } = this.props
    const {
      currentSelectPeriod,
      statusNum,
      pageSize,
      periodList,
      currentPage,
    } = this.state
    let statusID = 0
    if (field === 'currentSelectStatus') {
      if (value === 'All') {
        statusID = 0
      } else if (value === 'Submitted') {
        statusID = 1
      } else if (value === 'NoSubmission') {
        statusID = 2
      }
      client.cache.reset().then(async () => {
        await this.runQueryWorkSubmission(
          currentSelectPeriod.id,
          statusID,
          pageSize,
          currentPage,
        )
      })
      this.setState({ [field]: value, statusNum: statusID })
    } else if (field === 'currentSelectPeriod') {
      client.cache.reset().then(async () => {
        await this.runQueryWorkSubmission(value, statusNum, pageSize, currentPage)
      })
      let temp = ''
      _.map(periodList, (period) => {
        if (period.id === value) {
          temp = {
            name: `${moment(period.start_date).format('DD')} - ${moment(
              period.end_date,
            ).format('DD MMM YYYY')}`,
            id: period.id,
          }
        }
      })
      this.setState({
        [field]: temp,
      })
    } else {
      this.setState({ [field]: value })
    }
  }

  render() {
    const { components, history } = this.props
    const { StandardContainer } = components
    const {
      periodList,
      currentSelectPeriod,
      statusNum,
      pageSize,
      currentSelectStatus,
      isLoading,
      workSubmissions,
      currentPage,
      total,
    } = this.state
    console.log('workSubmissions', workSubmissions)
    PERIOD_OPTIONS = _.map(periodList, (value) => {
      return {
        name: `${moment(value.start_date).format('DD')} - ${moment(value.end_date).format(
          'DD MMM YYYY',
        )}`,
        id: value.id,
      }
    })

    const periodOptions = PERIOD_OPTIONS.map((item) => (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
    ))

    const onShowSizeChange = (current, pageSize) => {
      this.setState({ pageSize })
      this.runQueryWorkSubmission(currentSelectPeriod.id, statusNum, pageSize, current)
    }
    const onChange = (page) => {
      this.setState({
        currentPage: page,
      })
      this.runQueryWorkSubmission(currentSelectPeriod.id, statusNum, pageSize, page)
    }
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <Fragment>
        <StandardContainer subHeader="Reviewees" loading={false}>
          <ContentWrapper>
            <div style={{ paddingRight: '16px' }}>
              <SelectButton
                showSearch
                value={currentSelectPeriod.id}
                style={{ width: 200 }}
                onChange={(value) => {
                  this.onChange('currentSelectPeriod', value)
                }}
                placeholder="Select Period"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {periodOptions}
              </SelectButton>
            </div>
            <SelectButton
              showSearch
              value={currentSelectStatus}
              style={{ width: 200 }}
              placeholder="Select Status"
              optionFilterProp="children"
              onChange={(value) => {
                this.onChange('currentSelectStatus', value)
              }}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="All">All Status</Option>
              <Option value="Submitted">Submitted</Option>
              <Option value="NoSubmission">No Submission</Option>
            </SelectButton>
          </ContentWrapper>
          <ContentWrapper>
            <Text style={{ fontSize: '24px' }}>{currentSelectPeriod.name}</Text>
          </ContentWrapper>
          <ReviewTable
            loading={{
              spinning: isLoading,
              indicator: <Spin indicator={antIcon} />,
            }}
            period={currentSelectPeriod.id}
            data={workSubmissions}
            history={history}
            components={components}
            pageSize={pageSize}
          />
          <CustomPagination
            current={currentPage}
            pageSize={pageSize}
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            onChange={onChange}
            defaultCurrent={1}
            total={total}
          />
        </StandardContainer>
      </Fragment>
    )
  }
}

function mapStateToProps() {
  return {}
}

export const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
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
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
    actionSetBreadcrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
  }
}

ProgressReview.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
  actionSetBreadcrumb: PropTypes.func.isRequired,
}
ProgressReview.defaultProps = {
  client: {},
  location: {},
  history: {},
  components: {},
}

export default connect(mapStateToProps, mapDispatchToProps)(withApollo(ProgressReview))
