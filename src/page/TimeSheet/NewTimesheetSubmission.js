import React, { Fragment, Children } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { Typography, Input, Select, Switch } from 'antd'
import Moment from 'moment'
import extendMoment from 'moment-range'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import SubmissionTable from './component/NewSubmissionTable'
import {
  Sectioner,
  ContentWrapper,
  Footer,
  SaveModal,
  SelectButton,
} from './component/styles'
import {
  GET_TIMESHEET,
  CREATE_TIMESHEET,
  GET_CHARGECODES,
  GET_PERIODS,
  CREATE_ADJUSTMENT,
  EDIT_TIMESHEET,
  GET_WORK_ADJUSTMENTS,
  EDIT_WORK_ADJUSTMENT,
  CREATE_WORK_SUBMIT,
  GET_EMPLOYEES,
  GET_TIMESHEET_EMPLOYEE,
  GET_WORK_ADJUSTMENTS_EMPLOYEE,
} from '../../constants/index'
import {
  addEditableFlag,
  getCurrentPeriod,
  optionRenderParser,
  reviewerRenderParser,
  getCodeNameFromID,
  runQueryWorkPreset,
  CheckHoliday,
  runQueryHoliday,
  runQueryEmployeeInfo,
  runQueryLeaveRequest,
  filterOnlyRelatedLeaveList,
} from './HelperTimesheet'
const { Text } = Typography
const { TextArea } = Input

const moment = extendMoment.extendMoment(Moment)

class TimeSheetSubmission extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visibleModal: false,
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      rightModalButton: '',
      periodDropdown: [],
      selectPeriod: 0,
      dataChunk: [],
      employeeList: [],
      chargeCodes: [],
      hourRows: [],
      selectedRowIndex: 0,
      isEdited: false,
      tempPeriod: 0,
      today: moment().format('YYYY-MM-DD'),
    }
  }

  componentWillMount() {
    this.initializePage()
  }

  setEditTrue = () => {
    this.setState({ isEdited: true })
  }

  setField = (field, value) => {
    this.setState({
      [field]: value,
    })
  }

  initializePage = async () => {
    await this.runQueryPeriod()
    await this.runQueryChargeCodes()
    await this.runQueryEmployees()
    const { selectPeriod } = this.state
    this.getAndSetExistingWorkProgresses(selectPeriod)
  }

  filterAvailableChargeCode = (chargeCode, currentPeriod) => {
    let start_moment = moment(currentPeriod.start_date).startOf('day')
    let end_moment = moment(currentPeriod.end_date).startOf('day')
    let code_start_moment = moment(chargeCode.start_date).startOf('day')
    let code_end_moment = moment(chargeCode.end_date).startOf('day')

    let output =
      start_moment.diff(code_end_moment) <= 0 && end_moment.diff(code_start_moment) >= 0
    const isLeave = chargeCode.name.includes('[LEAVE] - ')
    if (isLeave) {
      output = false
    }
    return output
  }

  getAndSetExistingWorkProgresses = async (periodID) => {
    return new Promise(async (res) => {
      await this.runQueryChargeCodes()
      const workReportList = await this.runQueryWorkReport(periodID)
      const workAdjustmentList = await this.runQueryAdjustments(periodID)

      await this.setFetchedDataToPage(workReportList, workAdjustmentList)
      this.setState({ selectedRowIndex: 0, isEdited: false }, () => {
        res('Complete get and set work progresses')
      })
    })
  }

  setFetchedDataToPage = async (input, adjustmentList) => {
    const { periodDropdown, selectPeriod } = this.state
    return new Promise(async (res) => {
      const hourRows = []
      const dataChunk = []
      const approvedLeaveRequests = await runQueryLeaveRequest(this.props)
      const currentPeriod = _.filter(
        periodDropdown,
        (period) => period.id === selectPeriod,
      )[0]
      const workID = await runQueryEmployeeInfo(this.props)
      const workPreset = await runQueryWorkPreset(
        workID.general_info.work_type_id,
        this.props,
      )
      const companyHoliday = await runQueryHoliday(
        moment(currentPeriod.start_date).format('YYYY'),
        this.props,
      )

      for (let index = 0; index < input.work_reports.work_reports.length; index++) {
        let project = input.work_reports.work_reports[index]
        dataChunk[index + 1] = {
          reviewers: project.reviewers.map((reviewer) => '' + reviewer.reviewer_id),
          description: project.description,
        }

        const rowContent = await this.ReportParserGet(
          project,
          adjustmentList,
          approvedLeaveRequests,
          workPreset,
          companyHoliday,
        )
        hourRows[index] = _.cloneDeep(rowContent)
      }

      const leaveList = filterOnlyRelatedLeaveList(
        approvedLeaveRequests.leave_requests,
        currentPeriod,
      )

      let tableRowSize = _.cloneDeep(hourRows.length)
      tableRowSize = tableRowSize < 1 ? 1 : tableRowSize
      if (_.cloneDeep(hourRows.length) < 1) {
        for (let index = 0; index < leaveList.length; index++) {
          let rowContent = await this.leaveRequestParser(
            leaveList,
            currentPeriod,
            approvedLeaveRequests,
          )
          hourRows[index] = _.cloneDeep(rowContent)
        }
      }

      this.setState(
        {
          periodStatus: _.get(hourRows[0], 'status', ''),
          dataChunk,
          hourRows,
        },
        () => {
          res('Ok')
        },
      )
    })
  }

  runQueryPeriod = async () => {
    const { client } = this.props
    return new Promise(async (resolve) => {
      const queryResultPeriods = await client.query({
        query: GET_PERIODS,
      })
      const viewerPeriodID = _.get(this.props, 'location.state.currentID', 0)
      const currentPeriodObject = _.filter(
        queryResultPeriods.data.Periods,
        (eachperiod) => eachperiod.id === viewerPeriodID,
      )[0]
      let today = _.cloneDeep(this.state.today)

      if (_.get(this.props, 'location.state.currentID', -1) > 0) {
        today = moment(currentPeriodObject.start_date).format('YYYY-MM-DD')
      }
      const addedFlag = addEditableFlag(queryResultPeriods.data.Periods, today)
      const currentPeriod = getCurrentPeriod(addedFlag, today)
      this.setState(
        {
          periodDropdown: addedFlag,
          selectPeriod: currentPeriod.id,
          selectedPeriodName: _.filter(
            addedFlag,
            (period) => period.id === currentPeriod.id,
          )[0].name,
        },
        () => {
          resolve('get runQueryPeriod')
        },
      )
    })
  }

  runQueryChargeCodes = async () => {
    const { client } = this.props
    const { periodDropdown, selectPeriod } = this.state
    const limit = -1
    const offset = 0
    return new Promise(async (resolve) => {
      const chargeCodes = await client.query({
        query: GET_CHARGECODES,
        variables: { limit, offset },
      })
      const filteredCode = []

      _.forEach(chargeCodes.data.charge_codes.charge_codes, (code) => {
        if (
          this.filterAvailableChargeCode(
            code,
            _.filter(periodDropdown, (period) => period.id === selectPeriod)[0],
          )
        ) {
          filteredCode.push(code)
        }
      })

      this.setState(
        {
          chargeCodes: filteredCode,
        },
        () => {
          resolve('SUCCESS runQuery')
        },
      )
    })
  }

  runQueryEmployees = async () => {
    const { client } = this.props
    const limit = 100
    const offset = 0
    return new Promise(async (resolve, reject) => {
      try {
        const queryResultEmployees = await client.query({
          query: GET_EMPLOYEES,
          variables: { limit, offset },
        })

        this.setState(
          {
            employeeList: _.filter(
              queryResultEmployees.data.employees.employee_list,
              (emp) => emp.general_info.position.is_manager,
            ),
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

  runQueryAdjustments = async (period_id) => {
    const { client } = this.props
    const viewOnly = _.get(this.props, 'location.state.viewOnly', false)
    return new Promise(async (resolve) => {
      try {
        const queryResultAdjustments = await client.query({
          query: viewOnly ? GET_WORK_ADJUSTMENTS_EMPLOYEE : GET_WORK_ADJUSTMENTS,
          variables: {
            period_id: _.get(this.props, 'location.state.currentID', period_id),
            employee_id: _.get(this.props, 'location.state.empID', 0),
          },
        })
        resolve(queryResultAdjustments.data.work_adjustments.work_adjustments)
      } catch (error) {
        resolve([])
      }
    })
  }

  runQueryCreateWorkReport = async (
    project_id,
    period_id,
    work_progresses,
    reviewers,
    files,
    description,
  ) => {
    const { client } = this.props
    return new Promise(async (resolve, reject) => {
      try {
        await client.mutate({
          mutation: CREATE_TIMESHEET,
          variables: {
            project_id,
            period_id,
            work_progresses,
            reviewers,
            files,
            description,
          },
        })
        resolve('create work report SUCCESS !')
      } catch (error) {
        reject(error)
      }
    })
  }

  runQueryCreateSubmit = async (period_id, report_ids) => {
    const { client, components } = this.props
    const { selectedPeriodName } = this.state
    return new Promise(async (resolve, reject) => {
      try {
        await client.mutate({
          mutation: CREATE_WORK_SUBMIT,
          variables: {
            period_id,
            report_ids,
          },
        })
      } catch (error) {
        reject(error)
      }
      resolve(components.Message('success', `Submit ${selectedPeriodName} successful`))
    })
  }

  runQueryCreateWorkAdjustment = async (
    project_id,
    period_id,
    work_adjustments,
    adjust_period,
  ) => {
    const { client } = this.props
    return new Promise(async (resolve, reject) => {
      try {
        await client.mutate({
          mutation: CREATE_ADJUSTMENT,
          variables: {
            project_id,
            period_id,
            work_adjustments,
            adjust_period,
          },
        })
        resolve('create adjustment SUCCESS !')
      } catch (error) {
        reject(error)
      }
    })
  }

  runQueryWorkReport = async (period_id) => {
    const { client } = this.props
    const viewOnly = _.get(this.props, 'location.state.viewOnly', false)
    await client.cache.reset()
    return new Promise(async (resolve) => {
      try {
        const queryResult = await client.query({
          query: viewOnly ? GET_TIMESHEET : GET_TIMESHEET_EMPLOYEE,
          variables: {
            period_id: viewOnly
              ? _.get(this.props, 'location.state.currentID', period_id)
              : period_id,
            employee_id: _.get(this.props, 'location.state.empID', 0),
          },
        })
        resolve(queryResult.data)
      } catch (e) {
        const empty = {
          work_reports: { work_reports: [] },
        }
        resolve(empty)
      }
    })
  }

  runQueryEditWorkReport = async (
    id,
    project_id,
    files,
    description,
    delete_file_ids,
    period_id,
    work_progresses,
    reviewers,
    delete_reviewer_ids,
  ) => {
    const { client } = this.props
    return new Promise(async (resolve, reject) => {
      try {
        await client.resetStore()
        await client.mutate({
          mutation: EDIT_TIMESHEET,
          variables: {
            id,
            project_id,
            files,
            description,
            delete_file_ids,
            period_id,
            work_progresses,
            reviewers,
            delete_reviewer_ids,
          },
        })
        resolve('edit work report SUCCESS !')
      } catch (error) {
        reject(error)
      }
    })
  }

  runQueryEditAdjustment = async (
    project_id,
    period_id,
    work_adjustments,
    adjust_period,
  ) => {
    const { client } = this.props
    return new Promise(async (resolve, reject) => {
      try {
        await client.resetStore()
        await client.mutate({
          mutation: EDIT_WORK_ADJUSTMENT,
          variables: {
            project_id,
            period_id,
            work_adjustments,
            adjust_period,
          },
        })
        resolve('edit adjustment SUCCESS !')
      } catch (error) {
        reject(error)
      }
    })
  }

  onClickSubmitReport = async () => {
    this.props.client.cache.reset().then(async () => {
      await this.onClickSave()
      await this.getAndSetExistingWorkProgresses(this.state.selectPeriod)
      let IDs = _.map(this.state.hourRows, rows => rows.report_id)


      await this.runQueryCreateSubmit(this.state.selectPeriod, IDs)
      await this.getAndSetExistingWorkProgresses(this.state.selectPeriod)
    })
  }


  onClickSave = async (shouldShowMessage) => {
    const { components } = this.props
    const {
      periodDropdown,
      hourRows,
      periodStatus,
      selectPeriod,
      selectedPeriodName,
    } = this.state
    let today = _.cloneDeep(this.state.today)
    const currentPeriod = getCurrentPeriod(periodDropdown, today)
    return new Promise(async (res) => {
      const currentState = hourRows[0].status
      _.each(hourRows, async (hourReport, index) => {
        let work_progresses = []
        if (
          _.includes(
            ['PROCESSED', 'ADJUSTMENT_DRAFT', 'ADJUSTMENT_PROCESSED'],
            currentState,
          )
        ) {
          work_progresses = this.AdjustmentParserPost(hourReport)
        } else {
          work_progresses = this.ReportParserPost(hourReport)
        }

        const reviewers = _.map(
          _.get(this.state, `dataChunk[${index + 1}].reviewers`, []),
          this.ReviewerParser,
        )
        const description = _.get(this.state, `dataChunk[${index + 1}].description`, '')

        if (!hourReport.status && periodStatus === 'ADJUSTMENT_DRAFT') {
          hourReport.status = 'PROCESSED'
        }
        switch (hourReport.status) {
          case 'DRAFT':
            await this.runQueryEditWorkReport(
              hourReport.report_id,
              hourReport.codeID,
              [],
              description,
              [],
              selectPeriod,
              work_progresses,
              reviewers,
              [],
            )
            break
          case 'PROCESSED':
            await this.runQueryCreateWorkAdjustment(
              hourReport.codeID,
              currentPeriod.id,
              work_progresses,
              selectPeriod,
            )
            break
          case 'ADJUSTMENT_PROCESSED':
            await this.runQueryCreateWorkAdjustment(
              hourReport.codeID,
              currentPeriod.id,
              work_progresses,
              selectPeriod,
            )
            break
          case 'ADJUSTMENT_DRAFT':
            await this.runQueryEditAdjustment(
              hourReport.codeID,
              currentPeriod.id,
              work_progresses,
              selectPeriod,
            )
            break
          default:
            await this.runQueryCreateWorkReport(
              hourReport.codeID,
              selectPeriod,
              work_progresses,
              reviewers,
              [],
              description,
            )
            break
        }

        this.getAndSetExistingWorkProgresses(selectPeriod)
      })
      if (shouldShowMessage) {
        res(components.Message('success', `Save ${selectedPeriodName} successful`))
      } else {
        res('success')
      }
    })
  }

  ReportParserPost = (row) => {
    const output = []
    const clone = Object.values(row)
    let index = 0
    let workHour
    for (workHour of clone) {
      if (workHour.date && workHour.isNew) {
        output.push({
          date: workHour.date,
          work_hours: workHour.work_hours,
        })
        if (workHour.id) {
          output[index].id = workHour.id
        }
        index++
      }
    }
    return output
  }

  AdjustmentParserPost = (row) => {
    const output = []
    const clone = Object.values(row)
    let index = 0
    let workHour
    for (workHour of clone) {
      if (workHour.date && workHour.isAdjust && workHour.isNew) {
        output.push({
          date: workHour.date,
          work_hours: workHour.work_hours,
        })
        if (workHour.id && workHour.isAdjust) {
          output[index].id = workHour.id
        }
        index++
      }
    }
    return output
  }

  leaveRequestParser = async (leaveDates, currentPeriod, approvedLeaveRequests) => {
    const { chargeCodes } = this.state
    return new Promise(async (res) => {
      const oneDayInMilisecond = 86400000
      const workID = await runQueryEmployeeInfo(this.props)
      const workPreset = await runQueryWorkPreset(
        workID.general_info.work_type_id,
        this.props,
      )
      const companyHoliday = await runQueryHoliday(
        moment(currentPeriod.start_date).format('YYYY'),
        this.props,
      )
      const currentLeaveList = _.cloneDeep(leaveDates[0])
      const mockRow = {
        codeID: currentLeaveList.leave_type.charge_code_id,
        name: await getCodeNameFromID(
          currentLeaveList.leave_type.charge_code_id,
          chargeCodes,
          this.props,
        ),
        total: 0,
        status: '',
      }

      for (let i = 0; i < currentPeriod.total_date; i++) {
        const tempDate = new Date(
          new Date(
            `${moment(currentPeriod.start_date).format('MMMM DD YYYY')}`,
          ).getTime() +
            i * oneDayInMilisecond,
        )
        mockRow[`${moment(tempDate).format('ddd D')}`] = {
          date: tempDate,
          work_hours: 0,
          isAdjust: false,
          isHoliday: CheckHoliday(
            tempDate,
            workPreset,
            companyHoliday,
            approvedLeaveRequests,
          ),
          isLeave: true,
        }
        _.forEach(currentLeaveList.leave_request_dates, (leaveDate) => {
          if (
            `${moment(tempDate).format('MM-DD-YYYY')}` ===
            `${moment(leaveDate.date).format('MM-DD-YYYY')}`
          ) {
            mockRow[`${moment(tempDate).format('ddd D')}`].work_hours = leaveDate.hour
            mockRow[`${moment(tempDate).format('ddd D')}`].isNew = true

            mockRow.total += leaveDate.hour
          }
        })
      }
      res(mockRow)
    })
  }

  ReportParserGet = async (
    workReport,
    adjustmentList,
    approvedLeaveRequests,
    workPreset,
    companyHoliday,
  ) => {
    const { periodDropdown, selectPeriod, chargeCodes } = this.state
    return new Promise(async (res) => {
      const oneDayInMilisecond = 86400000
      const currentPeriod = _.filter(
        periodDropdown,
        (period) => period.id === selectPeriod,
      )[0]

      const mockRow = {
        codeID: workReport.project_id,
        name: await getCodeNameFromID(workReport.project_id, chargeCodes, this.props),
        total: 0,
        status: workReport.status,
        report_id: workReport.report_id,
      }

      for (let i = 0; i < currentPeriod.total_date; i++) {
        const tempDate = new Date(
          new Date(
            `${moment(currentPeriod.start_date).format('MMMM DD YYYY')}`,
          ).getTime() +
            i * oneDayInMilisecond,
        )
        mockRow[`${moment(tempDate).format('ddd D')}`] = {
          date: tempDate,
          work_hours: 0,
          isAdjust: false,
          isHoliday: CheckHoliday(
            tempDate,
            workPreset,
            companyHoliday,
            approvedLeaveRequests,
          ),
          total: 0,
        }
        _.forEach(workReport.work_progresses, (workData) => {
          if (
            `${moment(tempDate).format('ddd D')}` ===
            `${moment(workData.date).format('ddd D')}`
          ) {
            mockRow[`${moment(tempDate).format('ddd D')}`].id = workData.id
            mockRow[`${moment(tempDate).format('ddd D')}`].work_hours =
              workData.work_hours
            mockRow.total += workData.work_hours
          }
        })
        _.forEach(adjustmentList, (adjustment) => {
          _.forEach(
            _.filter(adjustment.work_adjustments, (adj) => !adj.is_pending_delete),
            (adjustData) => {
              if (
                `${moment(tempDate).format('ddd D')}` ===
                  `${moment(adjustData.date).format('ddd D')}` &&
                adjustment.project_id === workReport.project_id
              ) {
                mockRow[`${moment(tempDate).format('ddd D')}`].id = adjustData.id
                mockRow[`${moment(tempDate).format('ddd D')}`].work_hours =
                  adjustData.work_hours
                mockRow[`${moment(tempDate).format('ddd D')}`].isAdjust = true
                mockRow.total += adjustData.work_hours - adjustData.original_work_hours
              }
            },
          )
        })
      }
      res(mockRow)
    })
  }

  ReviewerParser = (reviewer) => {
    return {
      reviewer_id: parseInt(reviewer),
    }
  }

  handlePeriodChange = async (value) => {
    const { isEdited, periodDropdown } = this.state
    if (isEdited) {
      this.handleSubmit('change')
    } else {
      this.setState({
        selectPeriod: value,
        selectedPeriodName: _.filter(periodDropdown, (period) => period.id == value)[0]
          .name,
        selectedRowIndex: 0,
      })
      this.getAndSetExistingWorkProgresses(value)
    }
  }

  handleDescriptionChange = (value) => {
    const { selectedRowIndex, dataChunk } = this.state
    const tempData = _.cloneDeep(dataChunk)
    if (tempData[selectedRowIndex]) {
      tempData[selectedRowIndex].description = value
    } else {
      tempData[selectedRowIndex] = {
        ...tempData[selectedRowIndex],
        description: value,
      }
    }
    this.setState({
      dataChunk: tempData,
      isEdited: true,
    })
  }

  onChooseReviewer = (value) => {
    const { selectedRowIndex, dataChunk } = this.state
    const tempData = _.cloneDeep(dataChunk)
    if (tempData[selectedRowIndex]) {
      tempData[selectedRowIndex].reviewers = value
    } else {
      tempData[selectedRowIndex] = {
        ...tempData[selectedRowIndex],
        reviewers: value,
      }
    }

    this.setState({
      dataChunk: tempData,
      isEdited: true,
    })
  }

  handleSubmit = (type) => {
    switch (type) {
      case 'save':
        this.Modal('Confirm', 'Do you want to save draft ?', 'save', 'Save')
        break
      case 'submit':
        this.Modal('Confirm', 'Do you want to submit this period ?', 'submit', 'Submit')
        break
      case 'change':
        this.Modal('Warning', 'Do you want to save before change ?', 'change', 'OK')
        break
      default:
        break
    }
  }

  handleCancel = (text) => {
    const { tempPeriod, periodDropdown } = this.state
    switch (text) {
      case 'change':
        this.setState({
          selectPeriod: tempPeriod,
          selectedPeriodName: _.filter(
            periodDropdown,
            (period) => period.id === tempPeriod,
          )[0].name,
          selectedRowIndex: 0,
          visibleModal: false,
        })
        this.getAndSetExistingWorkProgresses(tempPeriod)
        break
      default:
        this.setState({
          visibleModal: false,
        })
        break
    }
  }

  handleOk = async (type) => {
    const { tempPeriod, periodDropdown } = this.state
    switch (type) {
      case 'save':
        await this.onClickSave(true)
        this.setState({
          visibleModal: false,
        })
        break

      case 'change':
        await this.onClickSave()
        this.setState({
          selectPeriod: tempPeriod,
          selectedPeriodName: _.filter(
            periodDropdown,
            (period) => period.id === tempPeriod,
          )[0].name,
          selectedRowIndex: 0,
          visibleModal: false,
        })
        this.getAndSetExistingWorkProgresses(tempPeriod)
        break

      case 'submit':
        await this.onClickSubmitReport()
        this.setState({
          visibleModal: false,
        })
        break

      default:
        break
    }
  }

  Modal = (title, detail, type, right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
      rightModalButton: right,
    })
  }

  render() {
    const { components, location, history } = this.props
    const { StandardContainer, Button } = components
    const {
      selectedPeriodName,
      hourRows,
      selectPeriod,
      periodDropdown,
      selectedRowIndex,
      chargeCodes,
      periodStatus,
      employeeList,
      currentModalTitle,
      visibleModal,
      currentModalType,
      rightModalButton,
      currentModalDetail,
    } = this.state

    const readOnly = _.get(location, 'state.viewOnly', false)
    const shouldDisable =
      _.includes(
        ['PENDING', 'ADJUSTMENT'],
        _.get(this.state, 'hourRows[0].status', 'DRAFT'),
      ) || readOnly
    const shouldLockDetails =
      !_.includes(['', 'DRAFT'], _.get(this.state, 'hourRows[0].status', 'DRAFT')) ||
      readOnly
    return (
      <Fragment>
        <StandardContainer
          subHeader={selectedPeriodName ? `Submission Period: ${selectedPeriodName}` : ''}
          loading={false}
          buttons={
            _.get(this.props, 'location.state.viewOnly', false) ? null : (
              <Button
                size="l"
                disabled={shouldDisable || hourRows.length < 1}
                theme={shouldDisable || hourRows.length < 1 ? 'disable' : ''}
                onClick={() => {
                  this.handleSubmit('submit')
                }}
              >
                Submit
              </Button>
            )
          }
        >
          <ContentWrapper>
            {location.state && location.state.viewOnly === true ? null : (
              <SelectButton
                showSearch
                allowClear={false}
                placeholder="Period"
                optionFilterProp="children"
                value={selectPeriod}
                onChange={(value) => {
                  this.handlePeriodChange(value)
                  this.setState({ tempPeriod: value })
                }}
              >
                {_.map(periodDropdown, optionRenderParser)}
              </SelectButton>
            )}
          </ContentWrapper>

          <ContentWrapper>
            <div>
              <Sectioner>
                <p>"Button for testing change to next period"</p>
              </Sectioner>
              <div>
                <Sectioner>
                  <Switch
                    onChange={(value) => {
                      if (value) {
                        this.setState({
                          today: moment()
                            .add(15, 'day')
                            .format('YYYY-MM-DD'),
                        })
                      } else {
                        this.setState({ today: moment().format('YYYY-MM-DD') })
                      }
                    }}
                  />
                </Sectioner>
              </div>
            </div>
          </ContentWrapper>

          <SubmissionTable
            setEditTrue={this.setEditTrue}
            viewOnly={_.get(this.props, 'location.state.viewOnly', false)}
            periodStatus={periodStatus}
            components={components}
            currentPeriod={
              _.filter(periodDropdown, (period) => period.id === selectPeriod)[0]
            }
            chargeCodes={chargeCodes}
            rows={hourRows}
            setField={this.setField}
            selectedRowIndex={selectedRowIndex}
          />

          <ContentWrapper>
            <Sectioner
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                paddingRight: '8px',
              }}
            >
              <Text>Description</Text>
              <TextArea
                maxLength={255}
                rows={7}
                disabled={
                  selectedRowIndex > hourRows.length ||
                  selectedRowIndex === 0 ||
                  shouldDisable ||
                  shouldLockDetails
                }
                onChange={(event) => {
                  this.handleDescriptionChange(event.target.value)
                }}
                style={{ fontSize: '16px' }}
                value={
                  _.get(this.props, 'location.state.viewOnly', false) ||
                  _.includes(['PENDING', 'ADJUSTMENT'], periodStatus)
                    ? _.get(
                        this.state,
                        `dataChunk[${selectedRowIndex + 1}].description`,
                        '',
                      )
                    : _.get(this.state, `dataChunk[${selectedRowIndex}].description`, '')
                }
              />
            </Sectioner>
            <Sectioner />
          </ContentWrapper>
          <ContentWrapper>
            <Sectioner
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                paddingRight: '8px',
              }}
            >
              <Text>Reviewer</Text>

              <Select
                mode="tags"
                size="large"
                placeholder="Please select"
                style={{ width: '100%' }}
                disabled={
                  selectedRowIndex > hourRows.length ||
                  selectedRowIndex === 0 ||
                  shouldDisable ||
                  shouldLockDetails
                }
                value={
                  _.get(this.props, 'location.state.viewOnly', false) ||
                  _.includes(['PENDING', 'ADJUSTMENT'], periodStatus)
                    ? _.get(
                        this.state,
                        `dataChunk[${selectedRowIndex + 1}].reviewers`,
                        [],
                      )
                    : _.get(this.state, `dataChunk[${selectedRowIndex}].reviewers`, [])
                }
                onChange={(value) => {
                  this.onChooseReviewer(value)
                }}
              >
                {_.map(employeeList, reviewerRenderParser)}
              </Select>
            </Sectioner>
            <Sectioner />
          </ContentWrapper>
          <ContentWrapper>
            {!_.get(this.props, 'location.state.viewOnly', false) ? (
              <Footer>
                <Button
                  theme="cancel"
                  size="l"
                  onClick={() => {
                    history.replace('/timesheet/list')
                  }}
                >
                  Cancel
                </Button>

                <Button
                  size="l"
                  onClick={() => {
                    this.handleSubmit('save')
                  }}
                  disabled={shouldDisable || hourRows.length < 1}
                  theme={shouldDisable || hourRows.length < 1 ? 'disable' : ''}
                >
                  Save
                </Button>

                <SaveModal
                  title={currentModalTitle}
                  visible={visibleModal}
                  footer={[
                    <Button
                      theme="cancel"
                      key="back"
                      onClick={() => {
                        this.handleCancel(currentModalType)
                      }}
                    >
                      Cancel
                    </Button>,
                    <Button
                      onClick={() => {
                        this.handleOk(currentModalType)
                      }}
                      key="submit"
                      type="primary"
                    >
                      {rightModalButton}
                    </Button>,
                  ]}
                >
                  {currentModalDetail}
                </SaveModal>
              </Footer>
            ) : null}
          </ContentWrapper>
        </StandardContainer>
      </Fragment>
    )
  }
}

function mapStateToProps() {
  return {}
}

function mapDispatchToProps() {
  return {}
}
TimeSheetSubmission.propTypes = {
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
}
TimeSheetSubmission.defaultProps = {
  data: {},
  client: {},
  period: {},
  pageSize: {},
  location: {},
  history: {},
  components: {},
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(TimeSheetSubmission))
