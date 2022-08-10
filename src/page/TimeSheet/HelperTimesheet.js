import _ from 'lodash'
import Moment from 'moment'
import extendMoment from 'moment-range'
import React from 'react'
import { Input, Select } from 'antd'
import styled from 'styled-components'
import {
  GET_WORK_PRESET_DETAILS,
  GET_COMPANY_HOLIDAY_EMP,
  GET_EMPINFO,
  GET_LEAVE_REQUEST,
  GET_EMPINFO_WITHID,
  GET_CHRAGE_CODES_DETAIL,
  GET_LEAVE_REQUEST_EMP,
} from '../../constants/index'

const moment = extendMoment.extendMoment(Moment)

export const getCurrentPeriod = (periodList, today) => {
  const output = _.filter(periodList, (period) => {
    const startDate = moment
      .utc(moment(period.start_date).format('YYYY-MM-DD'))
      .format('YYYY-MM-DD')
    const endDate = moment
      .utc(moment(period.end_date).format('YYYY-MM-DD'))
      .format('YYYY-MM-DD')
    return moment(today).isBetween(startDate, endDate, null, '[]')
  })
  return output[0]
}

export const addEditableFlag = (periodList) => {
  const tempToday = moment().toDate()
  const currentPeriod = getCurrentPeriod(periodList, tempToday)
  const output = _.map(periodList, (eachPeriod) => {
    const tempPeriod = _.cloneDeep(eachPeriod)
    if (currentPeriod.id - 2 <= eachPeriod.id) {
      tempPeriod.isEditable = true
    } else {
      tempPeriod.isEditable = false
    }
    tempPeriod.name =
      moment.utc(moment(eachPeriod.start_date).format('YYYY-MM-DD')).format('DD MMM') +
      ' - ' +
      moment.utc(moment(eachPeriod.end_date).format('YYYY-MM-DD')).format('DD MMM YYYY')
    return tempPeriod
  })
  return output
}

export const optionRenderParser = (period) => {
  return (
    <Select.Option key={period.id} value={period.id}>
      {period.name}
    </Select.Option>
  )
}

export const reviewerRenderParser = (employee) => {
  return (
    <Select.Option key={employee.id} value={`${employee.id}`}>
      {employee.personnel_info.firstname_en + ' ' + employee.personnel_info.lastname_en}
    </Select.Option>
  )
}

export const chargeCodeRenderParser = (chargeCode) => {
  return (
    <Select.Option key={chargeCode.id} value={chargeCode.id}>
      {chargeCode.name}
    </Select.Option>
  )
}

const InputBox = styled(Input)`
  text-align: center !important;
  color: ${(props) => (props.isAdjust ? 'red' : '#353535')} !important;
`
const ColorfulSpan = styled.div`
  color: ${(props) =>
    props.isAdjust ? 'red' : props.isWarn ? 'red' : '#353535'} !important;
  width: 52px !important;
  height: 40px !important;
  border-radius: 4px !important;
  font-size: 16px !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  display: flex !important;
  font-weight: ${(props) =>
    props.isBold ? 'bold' : props.isWarn ? 'bold' : 'normal'} !important;
`
const handleFocus = (event) => {
  event.target.select()
}

export const addDatesToColumn = (inputColumn, currentPeriod, props) => {
  let clonedColumn = _.cloneDeep(inputColumn)
  const oneDayInMilisecond = 86400000
  for (let i = 0; i < currentPeriod.total_date; i++) {
    const tempDate = new Date(
      new Date(`${moment(currentPeriod.start_date).format('MMMM DD YYYY')}`).getTime() +
        i * oneDayInMilisecond,
    )
    const dateCol = {
      title: (
        <div>
          <div>{moment(tempDate).format('ddd')}</div>{' '}
          <div>{moment(tempDate).format('D')}</div>
        </div>
      ),
      dataIndex: `${moment(tempDate).format('ddd D')}`,
      align: 'center',
      width: '62px',
      key: `${moment(tempDate).format('ddd D')}`,
      render: (text, record, index) => {
        {
          const fontColor = _.get(text, 'isAdjust', false) ? 'red' : null
          const shouldDisable =
            _.includes(['PENDING', 'ADJUSTMENT'], record.status) ||
            _.get(props, 'viewOnly', false)
          if (index != 0 || shouldDisable || text != null) {
            if (
              props.selectedRowIndex === index &&
              !shouldDisable &&
              props.selectedRowIndex < props.rows.length + 1 &&
              !_.get(text, 'isLeave', false)
            ) {
              return (
                <InputBox
                  formatter={(value) => {
                    return value > 10 ? `${value}%` : `${value / 10}%`
                  }}
                  isHoliday={_.get(text, 'isHoliday', false)}
                  isAdjust={_.get(text, 'isAdjust', false)}
                  fontColor={fontColor}
                  size="large"
                  maxLength={2}
                  onFocus={handleFocus}
                  defaultValue={_.get(text, 'work_hours', 0)}
                  value={_.get(text, 'work_hours', 0) === 0 ? 0 : text.work_hours}
                  onChange={(value) => {
                    if (!isNaN(Number(value.target.value)) && value.target.value != '') {
                      handleHourInput(index, value, text, props)
                    } else {
                      value.target.value = 0
                      handleHourInput(index, value, text, props)
                      event.target.select()
                    }
                  }}
                />
              )
            }
            return (
              <ColorfulSpan
                isWarn={_.get(text, 'isWarn', false)}
                isBold={index > props.rows.length}
                isHoliday={_.get(text, 'isHoliday', false)}
                isAdjust={_.get(text, 'isAdjust', false)}
              >
                {_.get(text, 'work_hours', -1)}
              </ColorfulSpan>
            )
          }
          return ''
        }
      },
    }
    clonedColumn = [...clonedColumn, dateCol]
  }
  return clonedColumn
}

const handleHourInput = (index, value, text, props) => {
  const newUpdatedrows = _.cloneDeep(props.rows)

  let total = 0
  const currentStatus = newUpdatedrows[index - 1].status
  const currentWorkBlock = newUpdatedrows[index - 1][`${moment(text.date).format('ddd D')}`]
  currentWorkBlock.isNew = true
  currentWorkBlock.work_hours = parseInt(value.target.value)
  if (
    (currentStatus === 'PROCESSED' && currentWorkBlock.id) ||
    (currentStatus === 'ADJUSTMENT_DRAFT' && !currentWorkBlock.isAdjust)
  ) {
    delete currentWorkBlock.id
  }
  if (
    _.includes(
      ['PROCESSED', 'ADJUSTMENT_DRAFT', 'ADJUSTMENT_PROCESSED'],
      props.periodStatus,
    )
  ) {
    currentWorkBlock.isAdjust = true
  }
  _.forEach(newUpdatedrows[index - 1], (hourBlock) => {
    if (hourBlock.work_hours) {
      total += hourBlock.work_hours
    }
  })
  newUpdatedrows[index - 1]['total'] = total
  props.setField('hourRows', newUpdatedrows)
  props.setEditTrue()
}

export const getCodeNameFromID = (id, codeList, props) => {
  return new Promise(async (resolve) => {
    let queryName = _.get(
      _.filter(codeList, (code) => {
        return code.id === id
      }),
      '[0].name',
      '0',
    )
    if (queryName === '0') {
      try {
        const queryResultCode = await props.client.query({
          query: GET_CHRAGE_CODES_DETAIL,
          variables: { id },
        })
        queryName = queryResultCode.data.charge_code.name

        // resolve(queryResultCode.data.work_preset)
        resolve(queryName)
      } catch (error) {
        resolve('No name')
      }
    }
    resolve(queryName)
  })
}

export const runQueryWorkPreset = (id, props) => {
  return new Promise(async (resolve) => {
    try {
      const queryResultEmployees = await props.client.query({
        query: GET_WORK_PRESET_DETAILS,
        variables: { id },
      })
      resolve(queryResultEmployees.data.work_preset)
    } catch (error) {
      resolve({})
    }
  })
}
export const runQueryHoliday = (name, props) => {
  return new Promise(async (resolve, reject) => {
    try {
      const queryResultEmployees = await props.client.query({
        query: GET_COMPANY_HOLIDAY_EMP,
        variables: { name },
      })
      resolve(queryResultEmployees.data.company_holidays.company_holidays)
    } catch (error) {
      reject(error)
    }
  })
}

export const CheckHoliday = (date, workPreset, companyHoliday, leaveList) => {
  let isHoliday = false
  const compHol = _.get(companyHoliday, '[0].holidaydetails', [])
  const holidayDateFormat = _.map(
    compHol,
    (holiday) => `${moment(holiday.date).format('YYYY-MM-DD')}`,
  )
  let eligibleRequest = []
  const leaveDays = []
  if (workPreset.work_day) {
    isHoliday = !_.includes(
      workPreset.work_day.split(','),
      `${moment(date).format('ddd')}`.toUpperCase(),
    )
  }
  if (isHoliday) {
    return isHoliday
  }
  isHoliday = _.includes(holidayDateFormat, `${moment(date).format('YYYY-MM-DD')}`)
  if (isHoliday) {
    return isHoliday
  }
  if (leaveList.total > 0) {
    eligibleRequest = _.map(leaveList.leave_requests, (request) => {
      if (
        `${moment(request.start_date).format('YYYY-MM')}` ===
        `${moment(date).format('YYYY-MM')}`
      ) {
        return request
      }
      return request
    })
    eligibleRequest = _.filter(eligibleRequest, (request) => request != null)
  }
  if (eligibleRequest.length > 0) {
    _.forEach(eligibleRequest, (requestList) => {
      _.forEach(requestList.leave_request_dates, (offdate) => {
        leaveDays.push(`${moment(offdate.date).format('YYYY-MM-DD')}`)
      })
    })
  }
  isHoliday = _.includes(leaveDays, `${moment(date).format('YYYY-MM-DD')}`)

  return isHoliday
}

export const runQueryEmployeeInfo = (props) => {
  const viewOnly = _.get(props, 'location.state.viewOnly', false)
  return new Promise(async (resolve, reject) => {
    try {
      const queryResultEmployees = await props.client.query({
        query: viewOnly ? GET_EMPINFO_WITHID : GET_EMPINFO,
        variables: viewOnly ? { id: props.location.state.empID } : {},
      })
      resolve(queryResultEmployees.data.employee)
    } catch (error) {
      reject(error)
    }
  })
}

export const runQueryLeaveRequest = (props) => {
  const viewOnly = _.get(props, 'location.state.viewOnly', false)
  return new Promise(async (resolve, reject) => {
    try {
      const leaveRequestResult = await props.client.mutate({
        mutation: viewOnly ? GET_LEAVE_REQUEST_EMP : GET_LEAVE_REQUEST,
        variables: viewOnly ? { employee_id: props.location.state.empID } : {},
      })
      resolve(leaveRequestResult.data.leave_requests)
    } catch (error) {
      resolve([])
    }
  })
}

export const enumerateDaysBetweenDates = (startDate, endDate) => {
  const dates = []

  const startMoment = moment(startDate).startOf('day')
  const endMoment = moment(endDate).startOf('day')

  const currDate = moment(startMoment.format('YYYY-MM-DD')).startOf('day')
  const lastDate = moment(endMoment.format('YYYY-MM-DD')).startOf('day')
  currDate.add(-1, 'days')
  while (currDate.add(1, 'days').diff(lastDate, 'days') <= 0) {
    dates.push(`${moment(currDate.clone()).format('YYYY-MM-DD')}`)
  }

  return dates
}

export const filterOnlyRelatedLeaveList = (leaveList, currentPeriod) => {
  const output = []
  const periodDate = enumerateDaysBetweenDates(
    currentPeriod.start_date,
    currentPeriod.end_date,
  )

  _.forEach(leaveList, (leaveRequest) => {
    const final = enumerateDaysBetweenDates(leaveRequest.start_date, leaveRequest.end_date)

    _.forEach(periodDate, (dateInPeriod) => {
      if (_.includes(final, dateInPeriod)) {
        output.push(leaveRequest)
        return false
      }
    })
  })
  return output
}
