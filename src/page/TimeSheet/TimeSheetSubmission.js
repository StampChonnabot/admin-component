/* eslint-disable prefer-const */
/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { Typography, Input, Icon, Select } from 'antd'
import {
  Sectioner,
  ContentWrapper,
  Dragger,
  Footer,
  SaveModal,
  SelectButton,
  Popup,
} from './component/styles'
import SubmissionTable from './component/SubmissionTable'

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
} from '../../constants/index'

const { Option } = SelectButton
const { Text } = Typography
const { TextArea } = Input

let periods = []
let PERIOD_OPTIONS = []
let reviewers = []
let REVIEWER_OPTIONS = []

const uploads = {
  name: 'file',
  multiple: true,
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  onChange(info) {
    const { status } = info.file
    if (status !== 'uploading')
      if (status === 'done') {
        // message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        // message.error(`${info.file.name} file upload failed.`);
      }
  },
}

class TimeSheetSubmission extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      reviewers: [],
      currentSelectProject: '',
      currentReport: '',
      mockData: [],
      currentBodyField: '',
      projects: [],
      notProjects: [],
      toSelectProjects: [],
      visibleModal: false,
      selectedItems: '',
      getPeriodList: [],
      currentData: [],
      currentSelectPeriod: '',
      currentSelectPeriodMapped: '',
      comparePeriod: '',
      allChargeCodes: '',
      toCreate: false,
      adjustments: [],
      checkIsPass: false,
      isEditable: true,
      toCreateReportInPass: false,
      originalReport: [],
      checkIsEdited: false,
      currentSelect: 0,
      currentModalType: '',
      rightModalButton: '',
      currentModalTitle: '',
      currentModalDetail: '',
      isSubmitted: false,
      viewOnly: false,
      employeeID: 1,
      employeeList: [],
      limit: 10,
      offset: 0,
      isReviewer: false,
      isSave: false,
    }
  }

  componentWillMount() {
    const { actionSetTitle, location } = this.props
    actionSetTitle('Company Holiday')
    if (location.data && location.data.viewOnly === true) {
      this.setState({ isEditable: false })
    }
    if (location.data && location.data.empID) {
      this.setState({ employeeID: location.data.empID })
    }

    this.runBatchQuery()
  }

  runBatchQuery = async () => {
    const { limit, offset, currentSelectPeriod } = this.state
    await this.runQueryChargeCodes(limit, offset)
    await this.runQueryPeriod()
    await this.runQueryEmployees(limit, offset)
    this.getSelectedPeriod(currentSelectPeriod)
  }

  runBatchSaveBeforeChange = async () => {
    const { currentSelectPeriod } = this.state
    await this.onClickSave()
    this.getSelectedPeriod(currentSelectPeriod)
  }

  runQueryChargeCodes = (limit, offset) => {
    const { client } = this.props
    return new Promise(async (resolve) => {
      const chargeCodes = await client.query({
        query: GET_CHARGECODES,
        variables: { limit, offset },
      })
      this.setState(
        {
          allChargeCodes: chargeCodes.data.charge_codes.charge_codes,
        },
        () => {
          resolve('SUCCESS runQuery')
        },
      )
    })
  }

  runQuery = async (employee_id, period_id) => {
    const { client } = this.props
    const { isReviewer, allChargeCodes } = this.state
    await client.cache.reset()
    return new Promise(async (resolve) => {
      const queryResult = await client.query({
        query: isReviewer ? GET_TIMESHEET : GET_TIMESHEET_EMPLOYEE,
        variables: { employee_id, period_id },
      })
      if (queryResult.data.work_reports.work_reports.length !== 0) {
        if (queryResult.data.work_reports.work_reports[0].status === 'DRAFT') {
          this.setState({ toCreate: false })
        } else {
          this.setState({ toCreate: true })
        }
        _.each(queryResult.data.work_reports.work_reports, (report) => {
          report.work_progresses = _.map(
            report.work_progresses,
            this.ProgressParserForInitial,
          )
          if (report.reviewers.length !== 0) {
            report.reviewers = _.map(report.reviewers, this.ReviewerParser)
          }
        })
        this.setState({
          currentReport: queryResult.data.work_reports.work_reports,
          originalReport: _.cloneDeep(queryResult.data.work_reports.work_reports),
        })
      } else {
        this.setState({
          currentReport: queryResult.data.work_reports.work_reports,
          originalReport: _.cloneDeep(queryResult.data.work_reports.work_reports),
        })
      }

      const mapDifferentProj = _.cloneDeep(allChargeCodes)

      const clone = _.cloneDeep(queryResult.data.work_reports.work_reports)
      _.forEachRight(mapDifferentProj, (chargeCode, forIndex) => {
        _.each(clone, (existingCode) => {
          if (chargeCode.id === existingCode.project_id) {
            mapDifferentProj.splice(forIndex, 1)
          }
        })
      })
      if (queryResult.data.work_reports.work_reports.length !== 0) {
        if (
          queryResult.data.work_reports.work_reports[0] &&
          queryResult.data.work_reports.work_reports[0].status &&
          (queryResult.data.work_reports.work_reports[0].status === 'PENDING' ||
            queryResult.data.work_reports.work_reports[0].status === 'ADJUSTMENT')
        ) {
          this.setState(
            {
              isSubmitted: true,
              projects: mapDifferentProj,
              checkIsEdited: false,
              isEditable: false,
              toCreate: true,
            },
            () => {
              resolve('SUCCESS runQuery')
            },
          )
        } else {
          this.setState(
            {
              isSubmitted: false,
              projects: mapDifferentProj,
              checkIsEdited: false,
              toCreate: true,
              isEditable: true,
            },
            () => {
              resolve('SUCCESS runQuery')
            },
          )
        }
      } else {
        this.setState(
          {
            isSubmitted: false,
            projects: mapDifferentProj,
            checkIsEdited: false,
            toCreate: true,
          },
          () => {
            resolve('SUCCESS runQuery')
          },
        )
      }
    })
  }

  runQueryAdjustments = (employee_id, period_id) => {
    const { client } = this.props
    return new Promise(async (resolve) => {
      const queryResultAdjustments = await client.query({
        query: GET_WORK_ADJUSTMENTS,
        variables: { employee_id, period_id },
      })

      const cloneAdjustments = _.cloneDeep(
        queryResultAdjustments.data.work_adjustments.work_adjustments,
      )
      _.each(cloneAdjustments, (adj) => {
        adj.work_adjustments = _.map(adj.work_adjustments, this.ProgressParser)
      })
      this.setState({
        adjustments: queryResultAdjustments.data.work_adjustments.work_adjustments,
      })
      resolve('get adjustment')
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
        this.setState(
          {
            employeeList: _.map(
              queryResultEmployees.data.employees.employee_list,
              this.EmployeeParser,
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

  ReviewerParser = () => {
    return []
  }

  EmployeeParser = (emp) => {
    return {
      id: emp.id,
      name: `${emp.personnel_info.firstname_en} ${emp.personnel_info.lastname_en}`,
    }
  }

  runQueryPeriod = () => {
    const { client, location } = this.props
    const { employeeID } = this.state
    return new Promise(async (resolve) => {
      const queryResultPeriods = await client.query({
        query: GET_PERIODS,
      })
      const today = moment().toDate()
      let getPeriod = ''

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
          this.setState({
            getPeriodList: queryResultPeriods.data.Periods,
            selectedItems: {
              name: `${moment(value.start_date).format('DD')} - ${moment(
                value.end_date,
              ).format('DD MMM YYYY')}`,
              id: value.id,
              start_date: moment.utc(start_moment.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
              end_date: moment.utc(end_moment.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
              total_date: value.total_date,
            },
            comparePeriod: value.id,
          })
          getPeriod = value.id
          return false
        }
      })

      _.each(queryResultPeriods.data.Periods, (value) => {
        if (location.data) {
          if (location.data.currentID === value.id) {
            this.setState({
              getPeriodList: queryResultPeriods.data.Periods,
              selectedItems: {
                name: `${moment(value.start_date).format('DD')} - ${moment(
                  value.end_date,
                ).format('DD MMM YYYY')}`,
                id: value.id,
                start_date: value.start_date,
                end_date: value.end_date,
                total_date: value.total_date,
              },
            })
            getPeriod = value.id
            return false
          }
        }
      })

      this.setState({ currentSelectPeriod: getPeriod })
      this.runQuery(employeeID, getPeriod)
      this.runQueryAdjustments(employeeID, getPeriod)

      resolve('get runQueryPeriod')
    })
  }

  runQueryCreate = (
    project_id,
    period_id,
    work_progresses,
    reviewers,
    files,
    description,
    employee_id,
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
            employee_id,
          },
        })
        resolve('create work report SUCCESS !')
      } catch (error) {
        reject(error)
      }
    })
  }

  runQueryCreateAdjustment = (
    project_id,
    period_id,
    work_adjustments,
    adjust_period,
    employee_id,
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
            employee_id,
          },
        })
        resolve('create adjustment SUCCESS !')
      } catch (error) {
        reject(error)
      }
    })
  }

  runQueryCreateSubmit = (period_id, employee_id, report_ids) => {
    const { client } = this.props
    return new Promise(async (resolve, reject) => {
      try {
        await client.mutate({
          mutation: CREATE_WORK_SUBMIT,
          variables: {
            period_id,
            employee_id,
            report_ids,
          },
        })
        this.setState({ isSubmitted: true, isEditable: false })
      } catch (error) {
        reject(error)
      }
      resolve('SUBMIT SUCCESS !')
    })
  }

  runQueryEdit = (
    id,
    project_id,
    files,
    description,
    delete_file_ids,
    employee_id,
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
            employee_id,
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

  runQueryEditAdjustment = (
    employee_id,
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
            employee_id,
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

  handleChange = (value) => {
    const { checkIsEdited } = this.state
    this.setState({ currentSelectPeriod: value })
    if (checkIsEdited) {
      this.handleSubmit('change')
    } else {
      this.getSelectedPeriod(value)
    }
  }

  getSelectedPeriod = async (value) => {
    const { getPeriodList, comparePeriod, employeeID } = this.state
    const { location, client } = this.props
    let mapValue = ''
    if (getPeriodList) {
      _.each(getPeriodList, (period) => {
        if (period.id === value) {
          mapValue = period
          return false
        }
      })
    }
    if (comparePeriod > value) {
      this.setState({
        selectedItems: {
          name: `${moment(mapValue.start_date).format('DD')} - ${moment(
            mapValue.end_date,
          ).format('DD MMM YYYY')}`,
          id: mapValue.id,
          start_date: mapValue.start_date,
          end_date: mapValue.end_date,
          total_date: mapValue.total_date,
        },
        checkIsPass: true,
      })
    } else {
      this.setState({
        selectedItems: {
          name: `${moment(mapValue.start_date).format('DD')} - ${moment(
            mapValue.end_date,
          ).format('DD MMM YYYY')}`,
          id: mapValue.id,
          start_date: mapValue.start_date,
          end_date: mapValue.end_date,
          total_date: mapValue.total_date,
        },
        checkIsPass: false,
      })
    }

    if (location.data && location.data.viewOnly === true) {
      this.setState({ isEditable: false, currentBodyField: '' })
    } else if (comparePeriod - 2 > value) {
      this.setState({ isEditable: false, currentBodyField: '' })
    } else {
      this.setState({ isEditable: true, currentBodyField: '' })
    }

    client.cache.reset().then(async () => {
      await this.runQuery(employeeID, mapValue.id)
      await this.runQueryAdjustments(employeeID, mapValue.id)
    })
  }

  ProgressReportParser = (currentObj) => {
    if (currentObj.report_id) {
      return {
        project_id: currentObj.project_id,
        work_progresses: currentObj.work_progresses,
        description: currentObj.description,
        files: [],
        reviewers: [],
        report_id: currentObj.report_id,
      }
    } else {
      return {
        project_id: currentObj.project_id,
        work_progresses: currentObj.work_progresses,
        description: currentObj.description,
        files: [],
        reviewers: [],
      }
    }
  }

  AdjustmentParser = (currentObj) => {
    const { selectedItems, comparePeriod } = this.state
    if (currentObj.status) {
      return {
        adjust_period: selectedItems.id,
        period_id: comparePeriod,
        project_id: currentObj.project_id,
        work_adjustments: currentObj.work_adjustments,
        description: currentObj.description,
        files: [],
        status: currentObj.status,
        reviewers: [],
      }
    } else {
      return {
        adjust_period: selectedItems.id,
        period_id: comparePeriod,
        project_id: currentObj.project_id,
        work_adjustments: currentObj.work_adjustments,
        description: currentObj.description,
        files: [],
        reviewers: [],
      }
    }
  }

  ProgressParser = (currentObj) => {
    let date = moment(currentObj.date)
    let date_moment = moment(moment.utc(date.format('YYYY-MM-DD'), 'YYYY-MM-DD')).format()
    if (currentObj.id) {
      return {
        date: date_moment,
        work_hours: currentObj.work_hours,
        id: currentObj.id,
      }
    } else {
      return {
        date: date_moment,
        work_hours: currentObj.work_hours,
      }
    }
  }

  ProgressParserForInitial = (currentObj) => {
    let date = moment(currentObj.date)
    let date_moment = moment(moment.utc(date.format('YYYY-MM-DD'), 'YYYY-MM-DD')).format()

    if (currentObj.id) {
      return {
        date: date_moment,
        work_hours: currentObj.work_hours,
        id: currentObj.id,
        original_work_hours: currentObj.work_hours,
      }
    } else {
      return {
        date: date_moment,
        work_hours: currentObj.work_hours,
        original_work_hours: 0,
      }
    }
  }

  onSetCurrentReport = (value) => {
    this.setState({ currentReport: value })
  }

  onSetIsSave = (value) => {
    this.setState({ isSave: value })
  }

  onSetCurrentAdjustment = (value) => {
    this.setState({ adjustments: value })
  }

  onSelectProject = (value) => {
    this.setState({ currentSelectProject: value })
  }

  onClickAddProject = (value) => {
    this.setState({ projects: value })
  }

  onSetCurrentSelect = (value) => {
    this.setState({ currentSelect: value })
  }

  onSetEdited = (value) => {
    this.setState({ checkIsEdited: value })
  }

  onChange = (field, e) => {
    this.setState({
      [field]: e,
    })
  }

  onEditMockdata = (value) => {
    this.setState({ currentReport: value })
  }

  onSetBodyField = (value) => {
    this.setState({ currentBodyField: value })
  }

  onClickSave = () => {
    const { checkIsPass, originalReport, currentReport, adjustments } = this.state
    return new Promise(async (resolve) => {
      let cloneCurrentReport = []
      let text = ''
      if (checkIsPass) {
        if (originalReport.length !== 0) {
          if (originalReport[0].status === 'DRAFT') {
            cloneCurrentReport = _.cloneDeep(currentReport)
            text = 'work_progresses'
          } else {
            cloneCurrentReport = _.cloneDeep(adjustments)
            text = 'work_adjustments'
          }
        } else {
          cloneCurrentReport = _.cloneDeep(currentReport)
          text = 'work_progresses'
        }
      } else if (originalReport.length !== 0) {
        if (originalReport[0].status === 'DRAFT') {
          cloneCurrentReport = _.cloneDeep(currentReport)
          text = 'work_progresses'
        } else {
          cloneCurrentReport = _.cloneDeep(adjustments)
          text = 'work_adjustments'
        }
      } else {
        cloneCurrentReport = _.cloneDeep(currentReport)
        text = 'work_progresses'
      }

      _.each(cloneCurrentReport, (value) => {
        let mapProgress = _.map(value[text], this.ProgressParser)
        value[text] = mapProgress
      })
      let mapProgressReport = ''
      if (checkIsPass) {
        if (originalReport.length !== 0) {
          if (originalReport[0].status === 'DRAFT') {
            mapProgressReport = _.map(cloneCurrentReport, this.ProgressReportParser)
          } else {
            mapProgressReport = _.map(cloneCurrentReport, this.AdjustmentParser)
          }
        } else {
          mapProgressReport = _.map(cloneCurrentReport, this.ProgressReportParser)
        }
      } else if (originalReport.length !== 0) {
        if (originalReport[0].status === 'DRAFT') {
          mapProgressReport = _.map(cloneCurrentReport, this.ProgressReportParser)
        } else {
          mapProgressReport = _.map(cloneCurrentReport, this.AdjustmentParser)
        }
      } else {
        mapProgressReport = _.map(cloneCurrentReport, this.ProgressReportParser)
      }
      let cloneMapProgressReport = _.cloneDeep(mapProgressReport)
      _.forEachRight(cloneMapProgressReport, (value, forIndex) => {
        if (value[text].length === 0) {
          cloneMapProgressReport.splice(forIndex, 1)
        }
      })
      if (checkIsPass) {
        if (originalReport.length !== 0) {
          if (originalReport[0].status === 'DRAFT') {
            for (let report of cloneMapProgressReport) {
              if (report.report_id) {
                await this.runQueryEdit(
                  report.report_id,
                  report.project_id,
                  report.files,
                  report.description,
                  [],
                  this.state.employeeID,
                  this.state.selectedItems.id,
                  report.work_progresses,
                  report.reviewers,
                  [],
                )
              } else {
                await this.runQueryCreate(
                  report.project_id,
                  this.state.selectedItems.id,
                  report.work_progresses,
                  report.reviewers,
                  report.files,
                  report.description,
                  this.state.employeeID,
                )
              }
            }
          } else {
            for (let report of cloneMapProgressReport) {
              if (report.status) {
                if (report.status == 'ADJUSTMENT_DRAFT') {
                  await this.runQueryEditAdjustment(
                    this.state.employeeID,
                    report.project_id,
                    this.state.comparePeriod,
                    report.work_adjustments,
                    this.state.selectedItems.id,
                  )
                } else {
                  await this.runQueryCreateAdjustment(
                    report.project_id,
                    this.state.comparePeriod,
                    report.work_adjustments,
                    this.state.selectedItems.id,
                    this.state.employeeID,
                  )
                }
              } else {
                await this.runQueryCreateAdjustment(
                  report.project_id,
                  this.state.comparePeriod,
                  report.work_adjustments,
                  this.state.selectedItems.id,
                  this.state.employeeID,
                )
              }
            }
          }
        } else {
          for (let report of cloneMapProgressReport) {
            if (report.report_id) {
              await this.runQueryEdit(
                report.report_id,
                report.project_id,
                report.files,
                report.description,
                [],
                this.state.employeeID,
                this.state.selectedItems.id,
                report.work_progresses,
                report.reviewers,
                [],
              )
            } else {
              await this.runQueryCreate(
                report.project_id,
                this.state.selectedItems.id,
                report.work_progresses,
                report.reviewers,
                report.files,
                report.description,
                this.state.employeeID,
              )
            }
          }
        }
      } else if (currentReport.length !== 0) {
        if (
          currentReport[0].status === 'PROCESSED' ||
          currentReport[0].status === 'ADJUSTMENT_PROCESSED' ||
          currentReport[0].status === 'ADJUSTMENT_DRAFT'
        ) {
          for (let report of cloneMapProgressReport) {
            if (report.status) {
              if (report.status === 'ADJUSTMENT_DRAFT') {
                await this.runQueryEditAdjustment(
                  this.state.employeeID,
                  report.project_id,
                  this.state.comparePeriod,
                  report.work_adjustments,
                  this.state.selectedItems.id,
                )
              } else {
                await this.runQueryCreateAdjustment(
                  report.project_id,
                  this.state.comparePeriod,
                  report.work_adjustments,
                  this.state.selectedItems.id,
                  this.state.employeeID,
                )
              }
            } else {
              await this.runQueryCreateAdjustment(
                report.project_id,
                this.state.comparePeriod,
                report.work_adjustments,
                this.state.selectedItems.id,
                this.state.employeeID,
              )
            }
          }
        } else {
          for (let report of cloneMapProgressReport) {
            if (report.report_id) {
              await this.runQueryEdit(
                report.report_id,
                report.project_id,
                report.files,
                report.description,
                [],
                this.state.employeeID,
                this.state.selectedItems.id,
                report.work_progresses,
                report.reviewers,
                [],
              )
            } else {
              await this.runQueryCreate(
                report.project_id,
                this.state.selectedItems.id,
                report.work_progresses,
                report.reviewers,
                report.files,
                report.description,
                this.state.employeeID,
              )
            }
          }
        }
      }
      this.setState(
        {
          visibleModal: false,
          currentSelect: '',
          currentBodyField: '',
          currentSelectProject: '',
          checkIsEdited: false,
          isSave: true,
        },
        () => {
          resolve('SAVE SUCCESS !')
        },
      )
    })
  }

  onClickSubmitReport = async () => {
    const { client } = this.props
    const { employeeID, currentSelectPeriod, currentReport } = this.state
    client.cache.reset().then(async () => {
      await this.onClickSave()
      await this.runQuery(employeeID, currentSelectPeriod)
      let clone = _.cloneDeep(currentReport)
      let IDs = []
      IDs = _.map(clone, (value) => {
        return value.report_id
      })
      await this.runQueryCreateSubmit(currentSelectPeriod, employeeID, IDs)
      await this.runQuery(employeeID, currentSelectPeriod)
      await this.runQueryAdjustments(employeeID, currentSelectPeriod)
    })
  }

  onEditBody = (field, updateValue) => {
    const { currentBodyField, currentReport } = this.state
    let cloneCurrentReport = _.cloneDeep(currentReport)
    let cloneBodyField = _.cloneDeep(currentBodyField)
    _.each(currentReport, (value, index) => {
      if (value.project_id === cloneBodyField.project_id) {
        if (field === 'reviewers') {
          let temp = _.map(updateValue, (value) => {
            return {
              reviewer_id: parseInt(value, 10),
            }
          })
          value[field] = temp
          cloneBodyField[field] = updateValue
          cloneCurrentReport[index][field] = temp
          return false
        } else {
          value[field] = updateValue
          cloneBodyField[field] = updateValue
          cloneCurrentReport[index][field] = updateValue
          return false
        }
      }
    })
    cloneBodyField[field] = updateValue
    this.setState({
      currentReport: cloneCurrentReport,
      currentBodyField: cloneBodyField,
    })
  }

  handleCancel = (text) => {
    const { currentSelectPeriod } = this.state
    switch (text) {
      case 'change':
        this.getSelectedPeriod(currentSelectPeriod)
        this.setState({
          visibleModal: false,
        })
        break
      default:
        this.setState({
          visibleModal: false,
        })
        break
    }
  }

  handleOk = async (type) => {
    const { client } = this.props
    const { employeeID, currentSelectPeriod } = this.state
    switch (type) {
      case 'save':
        client.cache.reset().then(async () => {
          await this.onClickSave()
          await this.runQuery(employeeID, currentSelectPeriod)
          await this.runQueryAdjustments(employeeID, currentSelectPeriod)
        })

        break

      case 'change':
        this.runBatchSaveBeforeChange()
        this.setState({
          visibleModal: false,
        })
        break

      case 'submit':
        this.onClickSubmitReport()
        this.setState({
          visibleModal: false,
          checkIsEdited: false,
        })
        break

      default:
        break
    }
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
    const { location, components, history } = this.props
    const {
      getPeriodList,
      employeeList,
      currentReport,
      selectedItems,
      isEditable,
      originalReport,
      toSelectProjects,
      projects,
      allChargeCodes,
      adjustments,
      checkIsPass,
      toCreate,
      currentSelect,
      isSubmitted,
      viewOnly,
      employeeID,
      isSave,
      currentSelectProject,
      currentBodyField,
      currentModalTitle,
      visibleModal,
      currentModalType,
      rightModalButton,
      currentModalDetail,
    } = this.state
    if (location.data && location.data.empID) periods = getPeriodList
    PERIOD_OPTIONS = _.map(periods, (value) => {
      return {
        name: `${moment(value.start_date).format('DD')} - ${moment(value.end_date).format(
          'DD MMM YYYY',
        )}`,
        id: value.id,
        start_date: value.start_date,
        end_date: value.end_date,
        total_date: value.total_date,
      }
    })

    let periodOptions = PERIOD_OPTIONS.map((item) => (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
    ))

    reviewers = employeeList
    REVIEWER_OPTIONS = _.map(reviewers, (value) => {
      return {
        name: value.name,
        id: value.id,
      }
    })

    let reviewerOptions = REVIEWER_OPTIONS.map((item) => (
      <Option key={item.id} value={`${item.id}`}>
        {item.name}
      </Option>
    ))

    const { StandardContainer, Button } = components

    if (currentReport) {
      return (
        <Fragment>
          <StandardContainer
            subHeader={selectedItems ? selectedItems.name : ''}
            loading={false}
            buttons={
              isEditable ? (
                originalReport.length !== 0 ? (
                  originalReport[0].status === 'DRAFT' ||
                  originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
                  currentReport[0].status === 'ADJUSTMENT_PROCESSED' ||
                  originalReport[0].status === 'PROCESSED' ? (
                    <Button
                      size="large"
                      onClick={() => {
                        this.handleSubmit('submit')
                      }}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button size="large" theme="disable" disabled>
                      Submit
                    </Button>
                  )
                ) : currentReport.length !== 0 ? (
                  <Button
                    size="large"
                    onClick={() => {
                      this.handleSubmit('submit')
                    }}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button size="large" theme="disable" disabled>
                    Submit
                  </Button>
                )
              ) : (
                <Button size="large" theme="disable" disabled>
                  Submit
                </Button>
              )
            }
          >
            <ContentWrapper>
              {location.data && location.data.viewOnly === true ? null : (
                <SelectButton
                  showSearch
                  allowClear
                  placeholder="Period"
                  optionFilterProp="children"
                  value={selectedItems.name}
                  onChange={(value) => {
                    this.handleChange(value)
                  }}
                >
                  {periodOptions}
                </SelectButton>
              )}
            </ContentWrapper>
            <SubmissionTable
              selectProjects={toSelectProjects}
              currentPeriodID={selectedItems}
              projects={projects}
              allChargeCodes={allChargeCodes}
              currentReport={currentReport}
              components={components}
              adjustments={adjustments}
              checkIsPass={checkIsPass}
              isEditable={isEditable}
              toCreate={toCreate}
              currentSelect={currentSelect}
              originalReport={originalReport}
              isSubmitted={isSubmitted}
              viewOnly={viewOnly}
              employeeID={employeeID}
              employeeList={employeeList}
              isSave={isSave}
              setIsSaved={(value) => {
                this.onSetIsSave(value)
              }}
              setCurrentReport={(value) => {
                this.onSetCurrentReport(value)
              }}
              setCurrentAdjustment={(value) => {
                this.onSetCurrentAdjustment(value)
              }}
              setMockdata={(value) => {
                this.onEditMockdata(value)
              }}
              setBodyField={(value) => {
                this.onSetBodyField(value)
              }}
              setAddedProject={(value) => {
                this.onClickAddProject(value)
              }}
              setEdited={(value) => {
                this.onSetEdited(value)
              }}
              onSetCurrentSelect={(value) => {
                this.onSetCurrentSelect(value)
              }}
              selectProject={this.onSelectProject}
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
                {currentSelectProject.selectProject === '' ||
                currentSelectProject.selectProject === undefined ? (
                  <TextArea
                    rows={7}
                    disabled
                    style={{ fontSize: '16px' }}
                    value={currentBodyField.description}
                  />
                ) : currentReport.length !== 0 ? (
                  currentReport[0].status !== 'ADJUSTMENT_PROCESSED' &&
                  currentReport[0].status !== 'ADJUSTMENT_DRAFT' &&
                  currentReport[0].status !== 'PROCESSED' ? (
                    <TextArea
                      rows={7}
                      disabled={false}
                      style={{ fontSize: '16px' }}
                      value={currentBodyField.description}
                      onChange={(value) => {
                        this.onEditBody('description', value.target.value)
                      }}
                    />
                  ) : (
                    <TextArea
                      rows={7}
                      disabled
                      style={{ fontSize: '16px' }}
                      value={currentBodyField.description}
                    />
                  )
                ) : (
                  <TextArea
                    rows={7}
                    disabled={false}
                    style={{ fontSize: '16px' }}
                    value={currentBodyField.description}
                  />
                )}
              </Sectioner>
              <Sectioner
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  paddingLeft: '8px',
                }}
              >
                <Text>Attached file</Text>

                {currentSelectProject.selectProject === '' ||
                currentReport.status !== 1 ? (
                  <Dragger {...uploads} disabled>
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload. Strictly prohibit from
                      uploading company data or other band files
                    </p>
                  </Dragger>
                ) : (
                  <Dragger {...uploads}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload. Strictly prohibit from
                      uploading company data or other band files
                    </p>
                  </Dragger>
                )}
              </Sectioner>
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
                {currentSelectProject.selectProject === '' ||
                currentSelectProject.selectProject === undefined ? (
                  <Select
                    mode="tags"
                    size="large"
                    placeholder="Please select"
                    style={{ width: '100%' }}
                    disabled
                  >
                    {reviewerOptions}
                  </Select>
                ) : currentReport.length !== 0 ? (
                  currentReport[0].status !== 'ADJUSTMENT_PROCESSED' &&
                  currentReport[0].status !== 'ADJUSTMENT_DRAFT' &&
                  currentReport[0].status !== 'PROCESSED' ? (
                    <Select
                      mode="tags"
                      size="large"
                      placeholder="Please select"
                      value={currentBodyField.reviewers}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        this.onEditBody('reviewers', value)
                      }}
                    >
                      {reviewerOptions}
                    </Select>
                  ) : (
                    <Select
                      mode="tags"
                      size="large"
                      value={currentBodyField.reviewers}
                      placeholder="Please select"
                      style={{ width: '100%' }}
                      disabled
                    >
                      {reviewerOptions}
                    </Select>
                  )
                ) : (
                  <Select
                    mode="tags"
                    size="large"
                    value={currentBodyField.reviewers}
                    placeholder="Please select"
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      this.onEditBody('reviewers', value)
                    }}
                  >
                    {reviewerOptions}
                  </Select>
                )}
              </Sectioner>
              <Sectioner />
            </ContentWrapper>
            <ContentWrapper>
              <Footer>
                {location.data && location.data.viewOnly === true ? (
                  <Button
                    theme="cancel"
                    size="l"
                    onClick={() => {
                      history.replace('/timesheet/review')
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    theme="cancel"
                    size="l"
                    onClick={() => {
                      history.replace('/timesheet/list')
                    }}
                  >
                    Cancel
                  </Button>
                )}

                {isEditable ? (
                  originalReport.length !== 0 ? (
                    originalReport[0].status === 'DRAFT' ||
                    originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
                    currentReport[0].status === 'ADJUSTMENT_PROCESSED' ||
                    originalReport[0].status === 'PROCESSED' ? (
                      <Button
                        size="l"
                        onClick={() => {
                          this.handleSubmit('save')
                        }}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button size="l" theme="disable" disabled>
                        Save
                      </Button>
                    )
                  ) : currentReport.length !== 0 ? (
                    <Button
                      size="l"
                      onClick={() => {
                        this.handleSubmit('save')
                      }}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button size="l" theme="disable" disabled>
                      Save
                    </Button>
                  )
                ) : (
                  <Button size="l" theme="disable" disabled>
                    Save
                  </Button>
                )}

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
            </ContentWrapper>
          </StandardContainer>
        </Fragment>
      )
    } else {
      return null
    }
  }
}

function mapStateToProps() {
  return {}
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
