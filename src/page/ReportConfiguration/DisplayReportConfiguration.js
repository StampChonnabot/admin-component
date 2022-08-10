/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable guard-for-in */
import React, { Fragment } from 'react'
import { Row, Col, DatePicker, Spin, Icon,Select } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { FETCH_MONTHLY_REPORT } from '../../constants/index'

import DisplayReportConfigurationTable from './components/Table/DisplayReportConfigurationTable'
import {
  SelectButton,
  TextOnButton
} from './components/styled'

const { MonthPicker } = DatePicker
const headers = {
  code: 'Code',
  description: 'Code Name',
  hours: 'Jan',
  hours2: 'Feb',
  hours3: 'Mar',
  hours4: 'Apr',
  hours5: 'May',
  hours6: 'Jun',
  hours7: 'Jul',
  hours8: 'Aug',
  hours9: 'Sep',
  hours10: 'Oct',
  hours11: 'Nov',
  hours12: 'Dec',
  sub_total: 'Total',
}
class DisplayReportConfiguration extends React.Component {
  constructor(props) {
    super(props)
    const {location} = this.props
    this.state = {
      currentData:[],
      currentDataDay:[],
      selectStartMonth: moment('01/2019', 'MM/YYYY'),
      selectEndMonth: moment('12/2019', 'MM/YYYY'),
      toBeExported: [],
      toBeExportedDay: [],
      currentIDs: location.state.codeSet,
      reportName: location.state.reportName,
      selectedYear: '2019',
      mockReviewers: [
        'Patrick Ohair',
        'Runie Demogen',
        'Rose Shringer',
        'Tony Stark'
      ],
      currentSelectProject: '',
      currentReport: '',
      mockData: [],
      currentBodyField: '',
      visible: false,
      mode: ['month', 'month'],
      value: [],
      unit: 'Day',
      isLoading: true
    }
  }

  // eslint-disable-next-line camelcase
  runQuery = async (start_period, end_period, project_ids) => {
    const { client } = this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: FETCH_MONTHLY_REPORT,
        variables: { start_period, end_period, project_ids },
      })
    this.setState({
      currentData: _.map(queryResult.data.monthly_report, this.monthlyParserHour),
      currentDataDay: _.map(queryResult.data.monthly_report, this.monthlyParserDay),
      isLoading: false
    })
    const {currentData} = this.state
    this.setExportData(_.map(currentData, this.formatCSV), _.map(_.map(queryResult.data.monthly_report, this.monthlyParserDay), this.formatCSV))
  }

  formatCSV = (obj) => {
    return {
      code: obj.code,
      description: obj.description,
      hours: obj.hours,
      hours2: obj.hours2,
      hours3: obj.hours3,
      hours4: obj.hours4,
      hours5: obj.hours5,
      hours6: obj.hours6,
      hours7: obj.hours7,
      hours8: obj.hours8,
      hours9: obj.hours9,
      hours10: obj.hours10,
      hours11: obj.hours11,
      hours12: obj.hours12,
      sub_total: obj.sub_total,
    }
  }

  monthlyParserHour = (preset, index) => {
    const checkedHour = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let total = 0

    for (let i = 0; i <= preset.hours.length; i++) {
      if (preset.hours[i] != null) {
        checkedHour[i] = preset.hours[i]
        total += preset.hours[i]
      }
    }

    return {
      key: index,
      code: preset.code,
      description: preset.description,
      hours: checkedHour[0],
      hours2: checkedHour[1],
      hours3: checkedHour[2],
      hours4: checkedHour[3],
      hours5: checkedHour[4],
      hours6: checkedHour[5],
      hours7: checkedHour[6],
      hours8: checkedHour[7],
      hours9: checkedHour[8],
      hours10: checkedHour[9],
      hours11: checkedHour[10],
      hours12: checkedHour[11],
      sub_total: total
    }
  }

  monthlyParserDay = (preset, index) => {
    const checkedHour = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let total = 0
    for (let i = 0; i <= 12; i++) {
      if (preset.hours[i] != null) {
        checkedHour[i] = Math.round(preset.hours[i] / 8)
        total += Math.round(preset.hours[i] / 8)
      }
    }

    return {
      key: index,
      code: preset.code,
      description: preset.description,
      hours: checkedHour[0],
      hours2: checkedHour[1],
      hours3: checkedHour[2],
      hours4: checkedHour[3],
      hours5: checkedHour[4],
      hours6: checkedHour[5],
      hours7: checkedHour[6],
      hours8: checkedHour[7],
      hours9: checkedHour[8],
      hours10: checkedHour[9],
      hours11: checkedHour[10],
      hours12: checkedHour[11],
      sub_total: total
    }
  }

  convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
    let str = ''

    for (let i = 0; i < array.length; i++) {
      let line = ''

      // eslint-disable-next-line prefer-const
      for (let index in array[i]) {
        if (line !== '') line += ','
        line += array[i][index]
      }

      str += `${line}\r\n`
    }

    return str
  }

  exportCSVFile = (items) => {
    items.unshift(headers)
    const jsonObject = JSON.stringify(items)
    const csv = this.convertToCSV(jsonObject)
    const exportedFilenmae = 'Export.csv' || 'export.csv'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, exportedFilenmae)
    } else {
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', exportedFilenmae)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  setExportData = (value, valueDay) => {
    this.setState({
      toBeExported: value,
      toBeExportedDay: valueDay
    })
  }

  handlePanelChange = (value, mode) => {
    this.setState({
      value,
      mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
    })
  };

  handleChangeMonth = value => {
    this.setState({ value })
  };

  SelectUnit = value => {
    this.setState({ unit: value })
  }

  SelectYear = value => {
    const {selectEndMonth,selectStartMonth} = this.state
    this.setState({
      selectStartMonth: selectStartMonth.set('year', value),
      selectEndMonth: selectEndMonth.set('year', value)
    })
  }

  SelectMonth = (field, value) => {
    this.setState({
      // eslint-disable-next-line react/destructuring-assignment
      [field]: this.state[field].set('month', value.get('month'))
    })
  }

  hitSearch = () => {
    const {selectStartMonth,selectEndMonth,currentIDs} = this.state
    let tempStart = _.cloneDeep(selectStartMonth)
    let tempEnd = _.cloneDeep(selectEndMonth)
    tempStart = tempStart.set('date', 1)
    tempEnd = tempEnd.set('date', 16)
    tempStart = moment.utc(tempStart.format('YYYY-MM-DD'), 'YYYY-MM-DD')
    tempEnd = moment.utc(tempEnd.format('YYYY-MM-DD'), 'YYYY-MM-DD')

    this.runQuery(tempStart, tempEnd, currentIDs)
  }

  render() {
    const {components,location,history} = this.props
    const {reportName,
      selectStartMonth,
      selectedYear,
      selectEndMonth,
      isLoading,
      unit,
      toBeExportedDay,
      toBeExported,
      currentData,
      currentDataDay,
      currentIDs}= this.state
    const { Button, StandardContainer
    } = components
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <Fragment>
        <StandardContainer subHeader={reportName} loading={false} buttons={<Button size="l" onClick={() => { this.exportCSVFile(unit === 'Day' ? toBeExportedDay : toBeExported) }}>Export</Button>}>
          <Row style={{ paddingTop: '24px' }}>
            <Col span={5} style={{ left: '24px', paddingRight: '16px' }}>
              <TextOnButton>Year</TextOnButton>
              <div>
                <SelectButton
                  defaultValue='2019'
                  style={{ width: '100%' }}
                  placeholder="Select Year"
                  onChange={this.SelectYear}
                >
                  <SelectButton.Option key="2019" value="2019">2019</SelectButton.Option>
                  <SelectButton.Option key="2020" value="2020">2020</SelectButton.Option>
                </SelectButton>
              </div>
            </Col>
            <Col span={10} style={{ left: '24px', paddingRight: '16px' }}>
              <TextOnButton>Periods</TextOnButton>
              <div style={{ flexDirection: 'row', display: 'flex' }}>
                <MonthPicker allowClear={false} style={{ marginRight: '16px' }} size="large" value={selectStartMonth} defaultValue={moment(selectedYear, 'YYYY')} format="MMMM" onChange={(e) => { this.SelectMonth('selectStartMonth', e) }} />
                <MonthPicker allowClear={false} size="large" value={selectEndMonth} defaultValue={moment(selectedYear, 'YYYY')} format='MMMM' onChange={(e) => { this.SelectMonth('selectEndMonth', e) }} />
              </div>
            </Col>

            <Col span={5} style={{ left: '24px', paddingRight: '8px' }}>
              <TextOnButton>Measure Unit</TextOnButton>
              <div>
                <SelectButton
                  defaultValue='Day'
                  style={{ width: '100%' }}
                  placeholder="Select Unit"
                  onChange={this.SelectUnit}
                >
                  <Select.Option value="Day">Day</Select.Option>
                  <Select.Option value="Hour">Hour</Select.Option>
                </SelectButton>
              </div>
            </Col>
            <Col span={2} style={{ left: '4px', paddingTop: '28px' }}>

              <div>
                <Button onClick={this.hitSearch} mode="search" />
              </div>

            </Col>
          </Row>

          <Row style={{ paddingTop: '16px' }}>
            <DisplayReportConfigurationTable
              loading={{
                spinning:isLoading,
                indicator: <Spin indicator={antIcon} />,
              }}
              displayUnit={unit}
              setExportData={this.setExportData}
              currentData={currentData}
              currentDataDay={currentDataDay}
              currentIds={currentIDs}
              components={components}
              location={location}
              history={history}
              unitData={unit}
            />
          </Row>
        </StandardContainer>
      </Fragment>
    )

  }

}

DisplayReportConfiguration.propTypes = {
location:PropTypes.oneOfType([PropTypes.object]),
client:PropTypes.func,
history:PropTypes.func,
components:PropTypes.oneOfType([PropTypes.object]),
}

DisplayReportConfiguration.defaultProps = {
  location:{},
  client:()=>{},
  history:()=>{},
  components:{}
}

export default withApollo(DisplayReportConfiguration)

