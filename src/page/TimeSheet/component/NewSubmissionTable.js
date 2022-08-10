import React, { Fragment } from 'react'
import { Icon, Spin } from 'antd'
import _ from 'lodash'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import { SubmitTable } from './styles'
import {
  addDatesToColumn,
  runQueryEmployeeInfo,
  runQueryWorkPreset,
  runQueryHoliday,
  runQueryLeaveRequest,
  CheckHoliday,
} from '../HelperTimesheet'
import SearchNameComponent from './SearchNameComponent'

class SubmissionTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isReviewer: false,
      column: [],
      selectChargeCode: undefined,
      chargeCodes: [],
      workPreset: { work_day: '' },
      companyHolidays: [],
      approvedLeaveRequests: [],
      isLoading: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentPeriod } = this.props
    if (currentPeriod !== nextProps.currentPeriod) {
      this.setQueryStates(nextProps.currentPeriod)
      this.setState({ chargeCodes: nextProps.chargeCodes, isLoading: true })
      this.props.setField('hourRows', [])
    }
  }

  setQueryStates = async (currentPeriod) => {
    console.log('setQueryStates')
    const workID = await runQueryEmployeeInfo(this.props)
    console.log('workID',workID)
    const workPreset = await runQueryWorkPreset(
      workID.general_info.work_type_id,
      this.props,
    )
    console.log('workPreset',workPreset)
    const companyHoliday = await runQueryHoliday(
      moment(currentPeriod.start_date).format('YYYY'),
      this.props,
    )
    console.log('companyHoliday',companyHoliday)
    const approvedLeaveRequests = await runQueryLeaveRequest(this.props)
    console.log('approvedLeaveRequests',approvedLeaveRequests)
    this.setState({
      workPreset,
      companyHolidays: companyHoliday,
      approvedLeaveRequests,
      isLoading: false,
    })
  }

  onChargeCodeChange = (input) => {
    this.setState({
      selectChargeCode: input,
    })
  }

  createHeaderTab = () => {
    const { chargeCodes, currentPeriod } = this.props
    const { selectChargeCode } = this.state
    const options = this.filterChargeCodeChoice(chargeCodes)
    const tempTab = {
      name: (
        <SearchNameComponent
          selectChargeCode={selectChargeCode}
          setSelect={this.onChargeCodeChange}
          chargeCodes={options}
        />
      ),
      total: selectChargeCode ? (
        <div
          style={{
            color: '#7540EE',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={this.createTableTabs}
        >
          <Icon style={{ fontSize: '18px' }} type="plus-circle" />
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Icon style={{ fontSize: '18px' }} type="plus-circle" />
        </div>
      ),
    }
    if (currentPeriod.isEditable) {
      return tempTab
    } else {
      return null
    }
  }

  createFooterTab = () => {
    const { currentPeriod } = this.props
    const { workPreset } = this.state
    let totalHour = 0
    const tempTab = {
      name: <span style={{ fontWeight: 'bold' }}>Total</span>,
      total: 0,
    }
    if (currentPeriod) {
      const oneDayInMilisecond = 86400000
      for (let i = 0; i < currentPeriod.total_date; i++) {
        const tempDate = new Date(
          new Date(
            `${moment(currentPeriod.start_date).format('MMMM DD YYYY')}`,
          ).getTime() +
            i * oneDayInMilisecond,
        )
        let workDateHourTotal = 0

        _.forEach(this.props.rows, (codeRow) => {
          const dateHour = _.get(
            codeRow,
            `${moment(tempDate).format('ddd D')}.work_hours`,
            0,
          )
          totalHour += dateHour
          workDateHourTotal += dateHour
        })
        tempTab[`${moment(tempDate).format('ddd D')}`] = {
          date: tempDate,
          work_hours: workDateHourTotal,
          isLeave: true,
        }
        const startTime = moment(workPreset.start_time)
        const endTime = moment(workPreset.end_time)
        var duration = moment.duration(endTime.diff(startTime))
        var hours = duration.asHours() - 1

        if (workDateHourTotal > hours) {
          tempTab[`${moment(tempDate).format('ddd D')}`].isWarn = true
        }
      }
    }
    tempTab.total = (
      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{totalHour}</span>
    )

    return tempTab
  }

  createTableTabs = () => {
    const { chargeCodes, currentPeriod, components, periodStatus } = this.props
    const {
      workPreset,
      companyHoliday,
      approvedLeaveRequests,
      selectChargeCode,
    } = this.state

    if (selectChargeCode > 0 || selectChargeCode !== undefined) {
      const name = _.filter(chargeCodes, (code) => _.isEqual(code.id, selectChargeCode))
      const tempTab = {
        name: name[0].name,
        total: 0,
        codeID: name[0].id,
        status:
          periodStatus === 'DRAFT'
            ? ''
            : periodStatus === 'ADJUSTMENT_DRAFT'
            ? ''
            : periodStatus,
      }
      if (currentPeriod && currentPeriod.isEditable) {
        const oneDayInMilisecond = 86400000
        for (let i = 0; i < currentPeriod.total_date; i++) {
          const tempDate = new Date(
            new Date(
              `${moment(currentPeriod.start_date).format('MMMM DD YYYY')}`,
            ).getTime() +
              i * oneDayInMilisecond,
          )
          tempTab[`${moment(tempDate).format('ddd D')}`] = {
            date: tempDate,
            work_hours: 0,
            isAdjust: false,
            isHoliday: CheckHoliday(
              tempDate,
              workPreset,
              companyHoliday,
              approvedLeaveRequests,
            ),
          }
        }

        this.setState({
          selectChargeCode: undefined,
        })
        this.props.setField('hourRows', [...this.props.rows, tempTab])
      }
    } else {
      components.Message('error', 'ERROR : Please select charge code!')
    }
  }

  settingState = (newState) => {
    this.setState(newState)
  }

  createHeaderColumn = (props) => {
    const column = [
      {
        title: 'Projects',
        dataIndex: 'name',
        key: 'name',
        width: '264px',
        render: (text, record, index) => {
          {
            return <span style={{ paddingLeft: '16px' }}>{text}</span>
          }
        },
      },
      {
        title: 'Total',
        dataIndex: 'total',
        width: '56px',
        align: 'center',
        key: 'total',
        render: (text, record, index) => {
          return text
        },
      },
    ]
    return addDatesToColumn(column, props.currentPeriod, this.props, this.state)
  }

  filterChargeCodeChoice = (input) => {
    const codeIDList = _.map(this.props.rows, (row) => _.get(row, 'codeID', 0))
    const output = _.filter(
      input,
      (codeCandidate) => !_.includes(codeIDList, codeCandidate.id),
    )
    return output
  }

  selectRow = (index) => {
    this.props.setField('selectedRowIndex', index)
  }

  parseGrayBox = (dataRow, column) => {
    const greyBox = []
    if (dataRow[0]) {
      for (let i = 0; i < column.length; i++) {
        const isHoliday = _.get(dataRow[0], `${column[i].dataIndex}.isHoliday`, false)
        if (isHoliday) {
          greyBox.push(i + 1)
        }
      }
    }

    return greyBox
  }

  render() {
    const { periodStatus, currentPeriod } = this.props
    let column = []
    let dataRender = this.props.rows
    if (currentPeriod) {
      column = this.createHeaderColumn(this.props)
      const firstTab = this.createHeaderTab()
      const totalTab = this.createFooterTab()

      if (this.props.rows.length > 0) {
        dataRender = [...dataRender, totalTab]
      }
      if (totalTab && firstTab && !_.includes(['PENDING', 'ADJUSTMENT'], periodStatus)) {
        if (!this.props.viewOnly) {
          // dataRender = [firstTab, ...dataRender]
          dataRender = [firstTab, ...dataRender]
        }
      }
    }

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    const { isLoading } = this.state
    return (
      <Fragment>
        <SubmitTable
          pagination={{ position: 'none' }}
          grayedBox={this.parseGrayBox(this.props.rows, column)}
          loading={{
            spinning: isLoading,
            indicator: <Spin indicator={antIcon} />,
          }}
          scroll={{ x: 1400 }}
          columns={column}
          dataSource={dataRender}
          onRow={(record, index) => ({
            onClick: () => {
              if (
                index !== 0 &&
                index !== dataRender.length - 1 &&
                !record.name.includes('[LEAVE] - ')
              ) {
                this.selectRow(index)
              }
            },
          })}
        />
      </Fragment>
    )
  }
}

SubmissionTable.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  data: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  period: PropTypes.oneOfType([PropTypes.object]),
  pageSize: PropTypes.number,
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
  actionSetBreadcrumb: PropTypes.func.isRequired,
  client: PropTypes.oneOfType([PropTypes.object]),
  currentPeriod: PropTypes.oneOfType([PropTypes.object]),
  chargeCodes: PropTypes.oneOfType([PropTypes.object]),
  periodStatus: PropTypes.oneOfType([PropTypes.object]),
}
SubmissionTable.defaultProps = {
  data: {},
  client: {},
  period: {},
  pageSize: {},
  location: {},
  history: {},
  components: {},
  currentPeriod: {},
  chargeCodes: {},
  periodStatus: {},
}
export default withApollo(SubmissionTable)
