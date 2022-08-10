import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Input, Icon, Select } from 'antd'
import _ from 'lodash'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import { InputBox, SubmitTable } from './styles'
import {
  GET_TIMESHEET,
  GET_WORK_ADJUSTMENTS,
  GET_TIMESHEET_EMPLOYEE,
  GET_WORK_ADJUSTMENTS_EMPLOYEE,
} from '../../../constants/index'

class SubmissionTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isReviewer: false,
      selectedRowKeys: [],
      currentSelect: null,
      pageSize: 10,
      currentEmployeeID: 123,
      currentPage: 1,
      mappProjectfromCurrentReport: [],
      data: [],
      allChargeCodes: null,
      value: 'Add Charge code',
      codeName: '',
      columns: [
        {
          title: 'Projects',
          dataIndex: 'name',
          key: 'name',
          width: '264px',
          render: (text, record, index) => {
            if (this.props.isEditable && !this.props.isSubmitted) {
              if (index === 0) {
                return <InputBox size="large" />
              } else {
                return text
              }
            } else {
              return text
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
            if (this.props.isEditable && !this.props.isSubmitted) {
              if (this.props.originalReport.length !== 0) {
                if (
                  this.props.originalReport[0].status === 'DRAFT' ||
                  this.props.originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
                  this.props.originalReport[0].status === 'ADJUSTMENT_PROCESSED' ||
                  this.props.originalReport[0].status === 'PROCESSED'
                ) {
                  if (index === 0) {
                    if (this.state.codeName === '') {
                      return (
                        <span>
                          <Icon type="plus-circle" />
                        </span>
                      )
                    } else {
                      return (
                        <span onClick={this.onClickAdd}>
                          <Icon type="plus-circle" />
                        </span>
                      )
                    }
                  } else {
                    return text
                  }
                }
              } else if (index === 0) {
                if (this.state.codeName === '') {
                  return (
                    <span>
                      <Icon type="plus-circle" />
                    </span>
                  )
                } else {
                  return (
                    <span onClick={this.onClickAdd}>
                      <Icon type="plus-circle" />
                    </span>
                  )
                }
              } else {
                return text
              }
            } else {
              return text
            }
          },
        },
      ],
      mockProjects: [],
      mockPreroid: {
        preroidStart: moment(
          new Date(
            new Date(
              moment(this.props.currentPeriodID.start_date).format('MMMM DD YYYY'),
            ),
          ).getTime(),
        ).format('LL'),
        preroidEnd: moment.unix('1565913600').format('LL'),
        projects: [],
        totalDate: 15,
      },
      selectProject: '',
      currentReport: null,
      projects: null,
      currentEdit: '',
      mockData: [],
      currentPeriodID: null,
      adjustments: null,
      checkIsPass: null,
    }
  }

  componentWillMount() {
    const {
      currentSelect,
      allChargeCodes,
      currentReport,
      projects,
      currentPeriodID,
      adjustments,
      checkIsPass,
      originalReport,
    } = this.props
    this.state({
      currentSelect,
      allChargeCodes,
      currentReport,
      projects,
      currentPeriodID: currentPeriodID.id,
      adjustments,
      checkIsPass,
    })
    const { columns, mockPreroid } = this.state
    this.setDefaultBeforeRender(this.props)
    if (checkIsPass) {
      if (currentReport.length !== 0) {
        if (currentReport[0].status === 'DRAFT') {
          this.onInit(columns, mockPreroid, currentReport)
        } else if (currentReport[0].status === 'ADJUSTMENT_DRAFT') {
          this.onInit(columns, mockPreroid, adjustments)
        } else if (currentReport[0].status === 'PROCESSED') {
          this.onInit(columns, mockPreroid, adjustments)
        } else if (currentReport[0].status === 'ADJUSTMENT_PROCESSED') {
          this.onInit(columns, mockPreroid, adjustments)
        }
      } else {
        this.onInit(columns, mockPreroid, currentReport)
      }
    } else if (originalReport.length !== 0) {
      if (originalReport[0].status === 'ADJUSTMENT_DRAFT') {
        this.onInit(columns, mockPreroid, adjustments)
      } else if (originalReport[0].status === 'ADJUSTMENT_PROCESSED') {
        this.onInit(columns, mockPreroid, adjustments)
      }
    } else {
      this.onInit(columns, mockPreroid, currentReport)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {
      isSubmitted,
      currentPeriodID,
      checkIsPass,
      originalReport,
      currentReport,
      adjustments,
    } = this.props
    const { columns, mockPreroid } = this.state
    if (nextProps.currentPeriodID.id !== currentPeriodID.id) {
      this.setDefaultBeforeRender(nextProps)
    }
    if (nextProps.isSubmitted !== isSubmitted && nextProps.isSubmitted) {
      if (!nextProps.isSubmitted) {
        this.setDefaultBeforeRender(nextProps)
        if (checkIsPass) {
          if (originalReport.length !== 0) {
            if (originalReport[0].status === 'DRAFT') {
              this.onInit(columns, mockPreroid, currentReport)
            } else if (originalReport[0].status === 'ADJUSTMENT_DRAFT') {
              this.onInit(columns, mockPreroid, adjustments)
            } else if (originalReport[0].status === 'PROCESSED') {
              this.onInit(columns, mockPreroid, adjustments)
            } else if (originalReport[0].status === 'ADJUSTMENT_PROCESSED') {
              this.onInit(columns, mockPreroid, adjustments)
            }
          } else {
            this.onInit(columns, mockPreroid, currentReport)
          }
        } else if (originalReport.length !== 0) {
          if (originalReport[0].status === 'ADJUSTMENT_DRAFT') {
            this.onInit(columns, mockPreroid, adjustments)
          } else if (originalReport[0].status === 'ADJUSTMENT_PROCESSED') {
            this.onInit(columns, mockPreroid, adjustments)
          }
        } else {
          this.onInit(columns, mockPreroid, currentReport)
        }
      } else {
        this.setDefaultBeforeRender(nextProps)
      }
    }
  }

  onValueChange = (field, event) => {
    const value = event.target.value
    this.setState({ [field]: value })
  }

  onSelectHandle = (field, event) => {
    this.setState({ [field]: event })
  }

  runQuery = async (employee_id, period_id, column, mockPeriod, adjustments) => {
    const { client } = this.props
    const { isReviewer } = this.state
    const queryResult = await client.query({
      query: isReviewer ? GET_TIMESHEET : GET_TIMESHEET_EMPLOYEE,
      variables: { employee_id, period_id },
    })
    let adjustIDs = []
    const cloneWorkProgress = _.cloneDeep(queryResult.data.work_reports.work_reports)
    if (queryResult.data.work_reports.work_reports.length !== 0) {
      if (adjustments.length !== 0) {
        _.each(adjustments, (adjust) => {
          if (adjust.work_adjustments.length !== 0) {
            _.each(queryResult.data.work_reports.work_reports, (report, index) => {
              if (report.project_id === adjust.project_id) {
                let tempIDs = []
                if (report.work_progresses.length !== 0) {
                  _.each(report.work_progresses, (progress, progressIndex) => {
                    _.each(adjust.work_adjustments, (work_adjust) => {
                      if (
                        moment(progress.date).format('DD') ===
                        moment(work_adjust.date).format('DD')
                      ) {
                        cloneWorkProgress[index].work_progresses[
                          progressIndex
                        ].work_hours = work_adjust.work_hours
                        cloneWorkProgress[index].work_progresses[progressIndex].id =
                          work_adjust.id
                        tempIDs = [
                          ...tempIDs,
                          {
                            id: work_adjust.id,
                            date: work_adjust.date,
                            work_hour: work_adjust.work_hours,
                          },
                        ]
                      } else {
                        const newDate = {
                          date: work_adjust.date,
                          work_hours: work_adjust.work_hours,
                          isAdjust: true,
                          id: work_adjust.id,
                        }
                        cloneWorkProgress[index].work_progresses.push(newDate)
                        tempIDs = [
                          ...tempIDs,
                          {
                            id: work_adjust.id,
                            date: work_adjust.date,
                            work_hour: work_adjust.work_hours,
                          },
                        ]
                      }
                    })

                    return false
                  })
                } else {
                  _.each(adjust.work_adjustments, (work_adjust) => {
                    const newDate = {
                      date: work_adjust.date,
                      work_hours: work_adjust.work_hours,
                      isAdjust: true,
                      id: work_adjust.id,
                    }
                    cloneWorkProgress[index].work_progresses.push(newDate)
                    tempIDs = [
                      ...tempIDs,
                      {
                        id: work_adjust.id,
                        date: work_adjust.date,
                        work_hour: work_adjust.work_hours,
                      },
                    ]
                  })
                }

                adjustIDs = [...adjustIDs, ...tempIDs]
              }
            })
          }
        })
      }
      this.setState({ currentReport: cloneWorkProgress })
      this.onInit(column, mockPeriod, cloneWorkProgress, adjustIDs)
    } else {
      const mockReport = []
      if (adjustments.length !== 0) {
        _.each(adjustments, (adjust) => {
          const tempIDs = []
          const cloneWorkAdjustments = _.map(adjust.work_adjustments, (value) => {
            tempIDs.push({ id: value.id, date: value.date, work_hour: value.work_hours })
            return {
              date: value.date,
              work_hours: value.work_hours,
              isAdjust: true,
              id: value.id,
            }
          })
          mockReport.push({
            description: adjust.description,
            project_id: adjust.project_id,
            work_progresses: cloneWorkAdjustments,
          })
          adjustIDs.push(tempIDs)
        })
      }
      this.setState({ currentReport: mockReport })
      this.onInit(column, mockPeriod, mockReport, adjustIDs)
    }
  }

  runQueryAdjustments = async (employee_id, period_id, column, mockPeriod) => {
    const { client } = this.props
    const { isReviewer } = this.state
    const queryResultAdjustments = await client.query({
      query: isReviewer ? GET_WORK_ADJUSTMENTS : GET_WORK_ADJUSTMENTS_EMPLOYEE,
      variables: { employee_id, period_id },
    })
    this.runQuery(
      employee_id,
      period_id,
      column,
      mockPeriod,
      queryResultAdjustments.data.work_adjustments.work_adjustments,
    )
    this.setState({
      adjustments: queryResultAdjustments.data.work_adjustments.work_adjustments,
    })
  }

  onInit = (column, mockPeriod, currentReport) => {
    const {
      isEditable,
      isSubmitted,
      originalReport,
      currentPeriodID,
      allChargeCodes,
      currentSelect,
    } = this.props
    const projects = []
    let timesheets = []
    const timesheetTab = []
    //---------- MOCK TIMESHEETS --------------
    for (let k = 0; k < 2; k++) {
      if (k === 0) {
        if (isEditable && !isSubmitted) {
          if (originalReport.length !== 0) {
            if (
              originalReport[0].status === 'DRAFT' ||
              originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
              originalReport[0].status === 'ADJUSTMENT_PROCESSED' ||
              originalReport[0].status === 'PROCESSED'
            ) {
              for (let i = 0; i < currentPeriodID.total_date; i++) {
                const timesheet = new Date(
                  new Date(
                    `${moment(mockPeriod.preroidStart).format('MMMM DD YYYY')}`,
                  ).getTime() +
                    i * 24 * 60 * 60 * 1000,
                )
                timesheetTab.push({
                  date: timesheet,
                  work_hours: '',
                  isAdjust: false,
                })
              }
              const createTab = {
                name: '',
                timesheets: timesheetTab,
                totalHour: '',
                isAdjust: false,
              }
              projects.push(createTab)
            }
          } else {
            for (let i = 0; i < currentPeriodID.total_date; i++) {
              const timesheet = new Date(
                new Date(
                  `${moment(mockPeriod.preroidStart).format('MMMM DD YYYY')}`,
                ).getTime() +
                  i * 24 * 60 * 60 * 1000,
              )
              timesheetTab.push({
                date: timesheet,
                work_hours: '',
                isAdjust: false,
              })
            }
            const createTab = {
              name: '',
              timesheets: timesheetTab,
              totalHour: '',
              isAdjust: false,
            }
            projects.push(createTab)
          }
        }
      } else {
        let projectName = ''
        for (let j = 0; j < currentReport.length; j++) {
          _.each(allChargeCodes, (code) => {
            if (code.id === currentReport[j].project_id) {
              return (projectName = code.name)
            }
          })

          for (let i = 0; i < currentPeriodID.total_date; i++) {
            const timesheet = new Date(
              new Date(
                `${moment(mockPeriod.preroidStart).format('MMMM DD YYYY')}`,
              ).getTime() +
                i * 24 * 60 * 60 * 1000,
            )
            timesheets.push({
              date: timesheet,
              work_hours: 0,
              isAdjust: false,
              id: '',
            })
          }
          if (currentReport) {
            _.each(timesheets, (timesheet, index) => {
              _.each(currentReport[j].work_progresses, (data) => {
                if (
                  moment(timesheet.date).format('DD') == moment(data.date).format('DD')
                ) {
                  timesheets[index].work_hours = data.work_hours
                  timesheets[index].id = data.id
                  return false
                }
              })
              if (this.state.adjustments.length !== 0) {
                _.each(this.state.adjustments[j].work_adjustments, (adj) => {
                  if (
                    moment(timesheet.date).format('DD') === moment(adj.date).format('DD')
                  ) {
                    timesheets[index].work_hours = adj.work_hours
                    timesheets[index].isAdjust = true
                  }
                })
              }
            })
          }

          let totalHour = 0
          _.each(timesheets, (value) => {
            totalHour = totalHour + value.work_hours
          })
          const project = {
            name: projectName,
            timesheets,
            totalHour,
            isAdjust: false,
          }

          projects.push(project)
          timesheets = []
        }
      }
    }
    let clone = _.cloneDeep(column)
    for (let i = 0; i < currentPeriodID.total_date; i++) {
      const currentDate = new Date(
        new Date(`${moment(mockPeriod.preroidStart).format('MMMM DD YYYY')}`).getTime() +
          i * 24 * 60 * 60 * 1000,
      )

      const dateCol = {
        title: (
          <div>
            <div>{moment(currentDate).format('ddd')}</div>{' '}
            <div>{moment(currentDate).format('D')}</div>
          </div>
        ),
        dataIndex: i + 1,
        align: 'center',
        width: '62px',
        key: `${moment(currentDate).format('ddd D')}`,
        render: (text, record, index) => {
          {
            let color = ''
            if (text.isAdjust) {
              color = 'red'
            }

            if (currentSelect !== '' && currentSelect !== 0) {
              if (index === currentSelect) {
                return (
                  <InputBox
                    size="large"
                    style={{ textAlign: 'center', color }}
                    maxLength="1"
                    onFocus={this.handleFocus}
                    defaultValue={text.work_hours}
                    value={text.work_hours === 0 ? 0 : text.work_hours}
                    onChange={(value) => {
                      if (isNaN(Number(value.target.value))) {
                        return (value = '')
                      } else {
                        this.onEditField(index, i, value, currentDate, record.name)
                      }
                    }}
                  />
                )
              } else {
                return (
                  <span
                    style={{
                      width: '40px',
                      color,
                    }}
                  >
                    {text.work_hours}
                  </span>
                )
              }
            } else {
              return (
                <span
                  style={{
                    width: '40px',
                    color,
                  }}
                >
                  {text.work_hours}
                </span>
              )
            }
          }
        },
      }
      clone = [...clone, dateCol]
    }
    const cloneMockdata = []
    _.each(projects, (value, key) => {
      const mock = {
        key,
        name: value.name,
        total: value.totalHour,
      }
      const { currentPeriodID } = this.props
      for (let i = 1; i <= currentPeriodID.total_date; i++) {
        mock[`${i}`] = {
          work_hours: value.timesheets[i - 1].work_hours,
          isAdjust: value.timesheets[i - 1].isAdjust,
        }
      }
      cloneMockdata.push(mock)
    })
    this.setState({
      mockPreroid: {
        preroidStart: mockPeriod.preroidStart,
        preroidEnd: mockPeriod.preroidEnd,
        projects,
        selectProject: '',
      },
      columns: clone,
      mockData: cloneMockdata,
      currentReport,
      mockProjects: projects,
      value: '',
    })
    const { selectProject } = this.props
    selectProject({ selectProject: '' })
  }

  adjustUpdate = (currentReport, date, updateValue) => {
    const { adjustments } = this.props
    let isNewDate = true
    let isNewAdjust = false
    const cloneAdjustments = _.cloneDeep(adjustments)
    if (adjustments.length !== 0) {
      _.each(cloneAdjustments, (adjustment) => {
        isNewAdjust = false
        if (currentReport.project_id === adjustment.project_id) {
          _.each(adjustment.work_adjustments, (work_adjust) => {
            isNewDate = false
            const adjust_moment = moment(work_adjust.date)
            const date_moment = moment(date)
            const adjust_date = moment
              .utc(moment(adjust_moment).format('YYYY-MM-DD'))
              .format('YYYY-MM-DD')
            const default_date = moment
              .utc(moment(date_moment).format('YYYY-MM-DD'))
              .format('YYYY-MM-DD')
            if (moment(adjust_date).format('DD') === moment(default_date).format('DD')) {
              work_adjust.work_hours = parseInt(updateValue)
              isNewDate = false
              return false
            } else {
              isNewDate = true
            }
          })

          if (isNewDate) {
            isNewAdjust = false
            adjustment.work_adjustments.push({
              date: moment(date).format(),
              work_hours: parseInt(updateValue),
            })
          }
          return false
        } else {
          isNewAdjust = true
        }
      })

      if (isNewAdjust) {
        const newAdjustment = {
          description: currentReport.description,
          files: [],
          project_id: currentReport.project_id,
          reviewers: [],
          report_id: currentReport.report_id,
          work_adjustments: [
            {
              date: moment(date).format(),
              work_hours: parseInt(updateValue),
            },
          ],
        }

        cloneAdjustments.push(newAdjustment)
      }
    } else {
      const newAdjustment = {
        description: currentReport.description,
        files: [],
        project_id: currentReport.project_id,
        reviewers: [],
        report_id: currentReport.report_id,
        work_adjustments: [
          {
            date: moment(date).format(),
            work_hours: parseInt(updateValue),
          },
        ],
      }

      cloneAdjustments.push(newAdjustment)
    }
    this.setState({
      adjustments: cloneAdjustments,
    })
    const { setCurrentAdjustment, setMockdata } = this.props
    setCurrentAdjustment(cloneAdjustments)
    setMockdata(cloneAdjustments)
  }

  onEditField = (index, dateIndex, updateValue, currentDate, projectName) => {
    const { setEdited } = this.props
    const { mockData, allChargeCodes } = this.state
    const toBeManipulate = _.cloneDeep(mockData)
    let getProjectID = ''

    setEdited(true)
    _.each(allChargeCodes, (value) => {
      if (value.name === projectName) {
        getProjectID = value.id
        return false
      }
    })

    if (updateValue.target.value === 0) {
      toBeManipulate[index].total =
        toBeManipulate[index].total - toBeManipulate[index][dateIndex + 1].work_hours
    } else {
      toBeManipulate[index].total =
        toBeManipulate[index].total - toBeManipulate[index][dateIndex + 1].work_hours
      toBeManipulate[index].total =
        toBeManipulate[index].total + parseInt(updateValue.target.value)
    }
    const { checkIsPass, originalReport } = this.props
    if (checkIsPass) {
      if (originalReport.length !== 0) {
        if (originalReport[0].status === 'DRAFT') {
          if (updateValue.target.value) {
            toBeManipulate[index][dateIndex + 1].work_hours = parseInt(
              updateValue.target.value,
            )
          } else {
            toBeManipulate[index][dateIndex + 1].work_hours = 0
          }
        } else {
          if (updateValue.target.value) {
            toBeManipulate[index][dateIndex + 1].work_hours = parseInt(
              updateValue.target.value,
            )
            toBeManipulate[index][dateIndex + 1].isAdjust = true
          } else {
            toBeManipulate[index][dateIndex + 1].work_hours = 0
            toBeManipulate[index][dateIndex + 1].isAdjust = true
          }
        }
      } else {
        if (updateValue.target.value) {
          toBeManipulate[index][dateIndex + 1].work_hours = parseInt(
            updateValue.target.value,
          )
        } else {
          toBeManipulate[index][dateIndex + 1].work_hours = 0
        }
      }
    } else if (originalReport.length !== 0) {
      if (
        originalReport[0].status === 'PEOCESSED' ||
        originalReport[0].status === 'DRAFT'
      ) {
        if (updateValue.target.value) {
          toBeManipulate[index][dateIndex + 1].work_hours = parseInt(
            updateValue.target.value,
          )
        } else {
          toBeManipulate[index][dateIndex + 1].work_hours = 0
        }
      } else if (updateValue.target.value) {
        toBeManipulate[index][dateIndex + 1].work_hours = parseInt(
          updateValue.target.value,
        )
        toBeManipulate[index][dateIndex + 1].isAdjust = true
      } else {
        toBeManipulate[index][dateIndex + 1].work_hours = 0
        toBeManipulate[index][dateIndex + 1].isAdjust = true
      }
    } else if (updateValue.target.value) {
      toBeManipulate[index][dateIndex + 1].work_hours = parseInt(updateValue.target.value)
    } else {
      toBeManipulate[index][dateIndex + 1].work_hours = 0
    }
    this.setState({
      mockData: toBeManipulate,
    })
    const { currentReport } = this.props
    if (currentReport.length !== 0 && currentReport) {
      let isNewDate = false
      let getCurrentReportIndex = 0

      _.each(currentReport, (report, index) => {
        if (report.project_id === getProjectID) {
          getCurrentReportIndex = index
          return false
        }
      })
      if (originalReport.length !== 0) {
        if (
          originalReport[0].status !== 'DRAFT' ||
          originalReport[0].status === 'ADJUSTMENT_PROCESSED' ||
          originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
          originalReport[0].status === 'PROCESSED'
        ) {
          this.adjustUpdate(
            currentReport[getCurrentReportIndex],
            currentDate,
            updateValue.target.value,
          )
        }
      }
      if (currentReport[getCurrentReportIndex].work_progresses.length !== 0) {
        _.each(currentReport[getCurrentReportIndex].work_progresses, (value) => {
          if (moment(value.date).format('DD') === moment(currentDate).format('DD')) {
            if (updateValue.target.value) {
              isNewDate = false
              value.original_work_hours = value.work_hours
              value.work_hours = parseInt(updateValue.target.value)
              return false
            } else {
              isNewDate = false
              value.original_work_hours = value.work_hours
              value.work_hours = 0
              return false
            }
          } else {
            isNewDate = true
          }
        })
      } else {
        isNewDate = true
      }
      if (isNewDate) {
        currentReport[getCurrentReportIndex].work_progresses.push({
          date: moment(currentDate).format(),
          work_hours: parseInt(updateValue.target.value),
          original_work_hours: 0,
        })
      }
      const { setCurrentReport, setMockdata } = this.props
      this.setState({
        currentReport,
      })
      setCurrentReport(currentReport)
      setMockdata(currentReport)
    }
  }

  NewDataParser = (currentObj) => {
    return {
      date: currentObj,
      work_hours: currentObj,
    }
  }

  handleFocus = (event) => {
    if (event.target.value === 0) {
      event.target.select()
    } else {
      event.target.select()
    }
  }

  onClickAdd = () => {
    const {
      currentPeriodID,
      currentReport,
      projects,
      setAddedProject,
      setMockdata,
      setCurrentReport,
    } = this.props
    const { mockData, codeName } = this.state

    const newData = _.cloneDeep(mockData)
    const mock = {
      key: newData.length,
      name: codeName.name,
      total: 0,
    }

    for (let i = 1; i <= currentPeriodID.total_date; i++) {
      mock[`${i}`] = { work_hours: 0, isAdjust: false }
    }
    newData.push(mock)

    const cloneCurrentReport = _.cloneDeep(currentReport)
    cloneCurrentReport.push({
      files: [],
      work_progresses: [],
      project_id: codeName.id,
      description: '',
    })

    const newProject = _.cloneDeep(projects)
    _.map(projects, (value, index) => {
      if (value.id === codeName.id) {
        return newProject.splice(index, 1)
      }
    })

    this.setState({
      mockData: newData,
      currentReport: cloneCurrentReport,
      value: '',
      codeName: '',
    })
    setAddedProject(newProject)
    setMockdata(cloneCurrentReport)
    setCurrentReport(cloneCurrentReport)
  }

  setDefaultBeforeRender = (nextProps) => {
    const {
      isEditable,
      isSubmitted,
      originalReport,
      employeeID,
      onSetCurrentSelect,
      setIsSaved,
    } = this.props
    const { mockPreroid, codeName } = this.state
    const newDate = new Date(
      new Date(moment(nextProps.currentPeriodID.start_date).format('MMMM DD YYYY')),
    ).getTime()
    const clonePeriod = _.cloneDeep(mockPreroid)
    clonePeriod.preroidStart = moment(newDate).format('LL')
    const mockPeriod = clonePeriod
    const column = [
      {
        title: 'Projects',
        dataIndex: 'name',
        key: 'name',
        width: '264px',
        render: (text, record, index) => {
          if (isEditable && !isSubmitted) {
            if (index === 0) {
              return text.work_hours
            } else {
              return text
            }
          } else {
            return text
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
          if (isEditable && !isSubmitted) {
            if (originalReport.length !== 0) {
              if (
                originalReport[0].status === 'DRAFT' ||
                originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
                originalReport[0].status === 'ADJUSTMENT_PROCESSED' ||
                originalReport[0].status === 'PROCESSED'
              ) {
                if (index === 0) {
                  if (codeName === '') {
                    return (
                      <span>
                        <Icon type="plus-circle" />
                      </span>
                    )
                  } else {
                    return (
                      <span onClick={this.onClickAdd}>
                        <Icon type="plus-circle" />
                      </span>
                    )
                  }
                } else {
                  return text
                }
              }
            } else if (index === 0) {
              if (codeName === '') {
                return (
                  <span>
                    <Icon type="plus-circle" />
                  </span>
                )
              } else {
                return (
                  <span onClick={this.onClickAdd}>
                    <Icon type="plus-circle" />
                  </span>
                )
              }
            } else {
              return text
            }
          } else {
            return text
          }
        },
      },
    ]

    this.runQueryAdjustments(employeeID, nextProps.currentPeriodID.id, column, mockPeriod)
    this.setState({ codeName: '' })
    onSetCurrentSelect('')
    setIsSaved(false)
  }

  selectRow = (record, index) => {
    const {
      currentReport,
      isSubmitted,
      setCurrentReport,
      setMockdata,
      setBodyField,
      selectProject,
      onSetCurrentSelect,
    } = this.props
    const { allChargeCodes } = this.state
    const selectedRowKeys = [...this.state.selectedRowKeys]
    if (selectedRowKeys.indexOf(record.key) >= 0) {
      selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1)
    } else {
      selectedRowKeys.push(record.key)
    }

    let temp = ''
    let tempID = ''

    _.each(allChargeCodes, (project) => {
      if (project.name === record.name) {
        tempID = project.id
        return false
      }
    })

    if (index !== 0) {
      if (currentReport.length !== 0) {
        if (
          currentReport[0].status === 'DRAFT' ||
          currentReport[0].status === 'ADJUSTMENT_DRAFT' ||
          currentReport[0].status === 'ADJUSTMENT_PROCESSED' ||
          currentReport[0].status === 'PROCESSED'
        ) {
          let found = false
          _.each(currentReport, (value) => {
            if (value.project_id === tempID) {
              temp = value
              found = true
              return false
            } else {
              found = false
            }
          })

          if (!found) {
            const newProject = {
              project_id: tempID,
              work_progresses: [],
              description: '',
            }
            temp = newProject
            this.setState({
              currentReport: [...currentReport, newProject],
            })
            setCurrentReport([...currentReport, newProject])
            setMockdata([...currentReport, newProject])
          }
          setBodyField(temp)
          selectProject({ selectProject: record.name })
          this.setState({ selectedRowKeys })
          onSetCurrentSelect(index)
        } else if (!isSubmitted) {
          let found = false
          _.each(currentReport, (value) => {
            if (value.project_id === tempID) {
              temp = value
              found = true
              return false
            } else {
              found = false
            }
          })

          if (!found) {
            const newProject = {
              project_id: tempID,
              work_progresses: [],
              description: '',
            }
            temp = newProject
            this.setState({
              currentReport: [...currentReport, newProject],
            })
            setCurrentReport([...currentReport, newProject])
            setMockdata([...currentReport, newProject])
          }

          setBodyField(temp)
          selectProject({ selectProject: record.name })
          this.setState({ selectedRowKeys })
          onSetCurrentSelect(index)
        }
      } else {
        const newProject = {
          project_id: tempID,
          work_progresses: [],
          description: '',
        }
        const cloneReport = _.cloneDeep(currentReport)

        cloneReport.push(newProject)
        temp = newProject

        this.setState({
          currentReport: cloneReport,
        })
        setCurrentReport(cloneReport)
        setMockdata(cloneReport)
        setBodyField(temp)
        selectProject({ selectProject: record.name })
        this.setState({ selectedRowKeys })
        onSetCurrentSelect(index)
      }
    }
  }

  handleSearch = (value) => {
    const { data } = this.state
    if (value) {
      this.setState({
        data: _.filter(data, (data) => {
          return _.includes(data, value)
        }),
      })
    } else {
      this.setState({ data: [] })
    }
  }

  handleChange = (value) => {
    this.setState({ value })
  }

  render() {
    const { projects, isEditable, isSubmitted, originalReport } = this.props
    const { columns, mockData } = this.state
    let options = ''
    if (projects) {
      options = projects.map((d, index) => (
        <Select.Option value={index} key={index}>
          {' '}
          {d.name}{' '}
        </Select.Option>
      ))
    }
    columns[0] = {
      title: 'Projects',
      dataIndex: 'name',
      key: 'name',
      width: '264px',
      render: (text, record, index) => {
        {
          let editable = true
          if (isEditable) {
            editable = false
          }
          if (isEditable && !isSubmitted) {
            if (originalReport.length !== 0) {
              if (
                originalReport[0].status === 'DRAFT' ||
                originalReport[0].status === 'ADJUSTMENT_DRAFT' ||
                originalReport[0].status === 'ADJUSTMENT_PROCESSED' ||
                originalReport[0].status === 'PROCESSED'
              ) {
                if (index === 0) {
                  return (
                    <Select
                      size="large"
                      showSearch
                      disabled={editable}
                      placeholder="Add Charge code"
                      value={this.state.value}
                      style={{ width: '200px' }}
                      showArrow={false}
                      filterOption={false}
                      onSearch={this.handleSearch}
                      onChange={this.handleChange}
                      onSelect={(onSelectObj) => {
                        this.onSelectHandle('codeName', this.props.projects[onSelectObj])
                      }}
                      notFoundContent={null}
                    >
                      {options}
                    </Select>
                  )
                } else {
                  return text
                }
              } else {
                return text
              }
            } else if (index === 0) {
              return (
                <Select
                  size="large"
                  showSearch
                  disabled={editable}
                  placeholder="Add Charge code"
                  value={this.state.value}
                  style={{ width: '200px' }}
                  showArrow={false}
                  filterOption={false}
                  onSearch={this.handleSearch}
                  onChange={this.handleChange}
                  onSelect={(onSelectObj) => {
                    this.onSelectHandle('codeName', projects[onSelectObj])
                  }}
                  notFoundContent={null}
                >
                  {options}
                </Select>
              )
            } else {
              return text
            }
          } else {
            return text
          }
        }
      },
    }
    return (
      <Fragment>
        <SubmitTable
          pagination={{ position: 'none' }}
          scroll={{ x: 1400 }}
          columns={columns}
          dataSource={mockData}
          onRow={(record, index) =>
            isEditable
              ? {
                  onClick: () => {
                    this.selectRow(record, index)
                  },
                }
              : {}
          }
        />
      </Fragment>
    )
  }
}

SubmissionTable.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
  actionSetBreadcrumb: PropTypes.func.isRequired,
  currentSelect: PropTypes.oneOfType([PropTypes.object]),
  allChargeCodes: PropTypes.oneOfType([PropTypes.object]),
  currentReport: PropTypes.oneOfType([PropTypes.object]),
  projects: PropTypes.oneOfType([PropTypes.object]),
  currentPeriodID: PropTypes.oneOfType([PropTypes.object]),
  adjustments: PropTypes.oneOfType([PropTypes.object]),
  checkIsPass: PropTypes.oneOfType([PropTypes.object]),
  originalReport: PropTypes.oneOfType([PropTypes.object]),
  isSubmitted: PropTypes.oneOfType([PropTypes.object]),
  isEditable: PropTypes.oneOfType([PropTypes.object]),
  selectProject: PropTypes.oneOfType([PropTypes.object]),
  setCurrentAdjustment: PropTypes.oneOfType([PropTypes.object]),
  setMockdata: PropTypes.oneOfType([PropTypes.object]),
  setEdited: PropTypes.oneOfType([PropTypes.object]),
  setCurrentReport: PropTypes.oneOfType([PropTypes.object]),
  employeeID: PropTypes.oneOfType([PropTypes.object]),
  setAddedProject: PropTypes.oneOfType([PropTypes.object]),
  onSetCurrentSelect: PropTypes.oneOfType([PropTypes.object]),
  setIsSaved: PropTypes.oneOfType([PropTypes.object]),
  setBodyField: PropTypes.oneOfType([PropTypes.object]),
}
SubmissionTable.defaultProps = {
  client: {},
  location: {},
  history: {},
  components: {},
  currentSelect: {},
  allChargeCodes: {},
  currentReport: {},
  projects: {},
  currentPeriodID: {},
  adjustments: {},
  checkIsPass: {},
  originalReport: {},
  isSubmitted: {},
  isEditable: {},
  selectProject: {},
  setCurrentAdjustment: {},
  setMockdata: {},
  setEdited: {},
  setCurrentReport: {},
  employeeID: {},
  setAddedProject: {},
  onSetCurrentSelect: {},
  setIsSaved: {},
  setBodyField: {},
}

export default withApollo(SubmissionTable)
