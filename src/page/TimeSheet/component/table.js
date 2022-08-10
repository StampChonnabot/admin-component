import React from 'react'
import { Table } from 'antd'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import { Link } from 'react-router-dom'
import CustomPagination from './Footer'
import { GET_PERIODS, GET_TIMESHEETS_AS_EMP } from '../../../constants/index'

class TableTimeSheet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      pageSize: 10,
      periodList: [],
      currentPage: 1,
      currentEmployeeID: 111,
      biweeklyReports: [],
      currentSelectedReport: '',
      currentPeriod: '',
      employeeID: 1,
    }
  }

  componentWillMount() {
    const { client } = this.props
    client.cache.reset().then(async () => {
      await this.runBatchQuery()
    })
  }

  componentDidMount() {
    const { client } = this.props
    const { pageSize, currentPage } = this.state
    client.cache.reset().then(async () => {
      await this.runQuery(pageSize, currentPage)
    })
  }

  onValueChange = (field, e) => {
    this.setState({ [field]: e })
  }

  runBatchQuery = async () => {
    const { pageSize, currentPage } = this.state
    await this.runQueryPeriod()
    await this.runQuery(pageSize, currentPage)
  }

  biweeklyParser = (currentObject) => {
    const { currentPeriod } = this.state
    let mapStatus = _.cloneDeep(currentObject.status)
    if (currentObject.status === 1) {
      mapStatus = 'Draft'
    } else if (currentObject.status === 3) {
      mapStatus = 'Processed'
    } else if (currentObject.status === 2) {
      mapStatus = 'Submitted'
    } else if (currentObject.status === 4) {
      mapStatus = 'Adjustment Draft'
    } else if (currentObject.status === 5) {
      mapStatus = 'Adjustment Submitted'
    } else {
      mapStatus = 'Adjust Processed'
    }

    let current_period = _.cloneDeep(currentPeriod)

    if (currentObject.period_id >= current_period.id - 2) {
      return {
        key: currentObject.id,
        period: `${moment(currentObject.period.start_date).format('DD MMM')} - ${moment(
          currentObject.period.end_date,
        ).format('DD MMM YYYY')} `,
        type: 'Biweekly',
        leave: currentObject.leave_hour,
        work: currentObject.work_hour,
        total: currentObject.total_hour,
        statusID: currentObject.status,
        status: mapStatus,
        submit: currentObject.submit_date,
        period_id: currentObject.period_id,
        isEditable: true,
      }
    } else {
      return {
        key: currentObject.id,
        period: `${moment(currentObject.period.start_date).format('DD MMM')} - ${moment(
          currentObject.period.end_date,
        ).format('DD MMM YYYY')} `,
        type: 'Biweekly',
        leave: currentObject.leave_hour,
        work: currentObject.work_hour,
        total: currentObject.total_hour,
        statusID: currentObject.status,
        status: mapStatus,
        submit: currentObject.submit_date,
        period_id: currentObject.period_id,
        isEditable: false,
      }
    }
  }

  runQueryPeriod = () => {
    const { client } = this.props
    return new Promise(async (resolve) => {
      const queryResultPeriods = await client.query({
        query: GET_PERIODS,
      })
      let today = moment().toDate()
      _.each(queryResultPeriods.data.Periods, (value) => {
        let start_moment = moment(value.start_date)
        let end_moment = moment(value.end_date)
        let start_date = moment
          .utc(moment(start_moment).format('YYYY-MM-DD'))
          .format('YYYY-MM-DD')
        let end_date = moment
          .utc(moment(end_moment).format('YYYY-MM-DD'))
          .format('YYYY-MM-DD')

        if (moment(today).isBetween(start_date, end_date, null, '[]')) {
          this.setState({ currentPeriod: value })
          return false
        }
      })

      resolve('get runQueryPeriod')
    })
  }

  runQuery = async (limit, page) => {
    const { client } = this.props
    const offset = page > 1 ? (page - 1) * limit : 0
    return new Promise(async (resolve) => {
      const queryResult = await client.query({
        query: GET_TIMESHEETS_AS_EMP,
        variables: { limit, offset },
      })
      this.setState({
        biweeklyReports: _.map(
          queryResult.data.my_work_submissions.work_submissions,
          this.biweeklyParser,
        ),
        total: queryResult.data.my_work_submissions.total,
      })
      resolve('success get list')
    })
  }

  render() {
    const { components, setBreadCrumb } = this.props
    const { IconHelper } = components
    const { pageSize, currentPage, total, biweeklyReports } = this.state

    const onChange = (page) => {
      this.setState({
        currentPage: page,
      })
      this.runQuery(pageSize, currentPage)
    }
    const onShowSizeChange = (current, pageSize) => {
      this.setState({ pageSize })
      this.runQuery(pageSize, current)
    }
    const columns = [
      {
        title: 'Period',
        dataIndex: 'period',
        key: 'period',
        align: 'center',
        render: (text) => text,
      },
      {
        title: 'Type',
        key: 'type',
        align: 'center',
        dataIndex: 'type',
      },
      {
        title: 'Chargeable Hour',
        key: 'work',
        align: 'center',
        dataIndex: 'work',
      },
      {
        title: 'Non-chargeable Hour',
        key: 'leave',
        align: 'center',
        dataIndex: 'leave',
      },
      {
        title: 'Total Hour',
        key: 'total',
        align: 'center',
        dataIndex: 'total',
      },
      {
        title: 'Submitted on',
        key: 'submit',
        align: 'center',
        dataIndex: 'submit',
        render: (text) => (
          <span>{text === '' ? '-' : moment(text).format('DD MMM YYYY')}</span>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        align: 'center',
        dataIndex: 'status',
        render: (text) => (
          <span>
            {text === 'Draft' ? (
              <div style={{ color: '#606060' }}>Draft</div>
            ) : text === 'Submitted' ? (
              <div style={{ color: '#FFC400' }}>Submitted</div>
            ) : text === 'Processed' ? (
              <div style={{ color: '#57D9A3' }}>Processed</div>
            ) : text === 'Adjustment Draft' ? (
              <div style={{ color: '#606060' }}>Adjustment Draft</div>
            ) : text === 'Adjustment Submitted' ? (
              <div style={{ color: '#FFC400' }}>Adjustment Submitted</div>
            ) : (
              <div style={{ color: '#57D9A3' }}>Adjust Processed</div>
            )}
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        render: (text, record, index) => {
          if (
            (record.status === 'Submitted' || record.status === 'Adjustment Submitted') &&
            !record.isEditable
          ) {
            return <IconHelper type="edit" color="#AFAFAF" />
          } else {
            return (
              <Link
                onClick={() => {
                  setBreadCrumb([
                    { url: '/timesheet/list', text: 'Timesheet', inactive: true },
                    { url: '/timesheet/submission', text: 'Timesheet Submission' },
                  ])
                  this.onValueChange('currentSelectedReport', index)
                }}
                to={{
                  pathname: '/timesheet/submission',
                  state: {
                    currentID: record.period_id,
                  },
                }}
              >
                <IconHelper type="edit" />
              </Link>
            )
          }
        },
      },
    ]

    return (
      <div>
        <Table
          columns={columns}
          dataSource={biweeklyReports}
          pagination={{ position: 'none', pageSize }}
        />
        <CustomPagination
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          onChange={onChange}
          defaultCurrent={1}
          total={total}
        />
      </div>
    )
  }
}
TableTimeSheet.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
  actionSetBreadcrumb: PropTypes.func.isRequired,
}
TableTimeSheet.defaultProps = {
  client: {},
  location: {},
  history: {},
  components: {},
}

export default withApollo(TableTimeSheet)
