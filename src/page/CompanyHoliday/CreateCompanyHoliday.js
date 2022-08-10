/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Col, DatePicker, Spin, Icon } from 'antd'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withApollo } from 'react-apollo'
import _ from 'lodash'
import { InputBoxTable, TextOnButton, Star, ButtonWrapper, ContentWrapper, SelectBox, Popup, TableList } from './components/styled'
import {
  CREATE_COMPANY_HOLIDAY,
  GET_HOLIDAY_PRESET_BYID,
  GET_COMPANY_HOLIDAY_EXIST,
  GET_HOLIDAY_PRESETS_LIST
} from '../../constants/index'

const { Option } = Select
class CreateCompanyHolidayDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mockdata: [],
      date: null,
      holidayName: '',
      holidayCompanyYear: '',
      PresetSelected: '',
      presetList: [],
      companyHolidays: [],
      dropdownYear: [],
      deleteHoliday: '',
      defaultDate: moment(),
      currentModalTitle: '',
      currentModalDetail: '',
      currentModaldetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      total: props.totalPage,
      pageSize: 100,
      currentPage: 1,
      presetName: '',
      holidayArrDate: [],
      typeCancel: 'cancel_general',
      isLoading: true,
    }
  }

  componentWillMount() {
    const {pageSize,currentPage} = this.state
    const {actionSetTitle} = this.props
    this.runQueryGetPreset(pageSize, currentPage)
    this.runQueryGetExistingCompanyHoliday(currentPage, pageSize)
    actionSetTitle('Company Holiday')
  }

  ModalWarning = (title, detail, detailSec, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModaldetail: detailSec,
      currentModalType: type
    })
  }

  Modal = (title, detail, detailSec, type, left, right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModaldetail: detailSec,
      currentModalType: type,
      leftModalButton: left,
      rightModalButton: right,
    })
  }

  runQueryGetExistingCompanyHoliday = async (page, limit) => {
    const {client} = this.props
    const offset = (page - 1) * limit
    const dropDown = []
    const currentYear = moment().year()
    for (let i = 0; i < 3; i++) {
      dropDown.push(currentYear + i)
    }
    const queryResult = await
     client.query({
        query: GET_COMPANY_HOLIDAY_EXIST,
        variables: { limit, offset },
      })
    this.setState({
      dropdownYear: dropDown,
      companyHolidays: _.map(queryResult.data.company_holidays.company_holidays, v => v.holidaycompany_name),
    })
  }


  runQueryGetPreset = async (limit, page) => {
    const {client} = this.props
    const offset = (page - 1) * limit
    const queryResult = await
      client.query({
        query: GET_HOLIDAY_PRESETS_LIST,
        variables: { limit, offset },
      })
    this.setState({ presetList: queryResult.data.holiday_presets.preset_list, isLoading: false })
  }


  onYearChange = (year) => {
    const {mockdata,date} = this.state
    if (moment().year() < year) {
      this.setState({
        holidayCompanyYear: year,
        defaultDate: moment(`01/01/${year}`, 'DD MM YYYY')
      })
    } else {
      this.setState({
        holidayCompanyYear: year
      })
    }

  
    let currentDate = []
    let holidayArrDate = []
    currentDate = _.map(mockdata, holiday => {
      const newdata = {
        holidayName: holiday.holidayName,
        date: moment(holiday.date).set('year', year),
      }
      const dateArrInput_moment = moment(newdata.date)
      const dateArrInput_date = moment.utc(moment(dateArrInput_moment).format('DD MMMM')).format('DD MMMM')
      holidayArrDate = [dateArrInput_date, ...holidayArrDate]
      return newdata
    })
    let newDate = ''
    if(date){
      newDate = moment(date).set('year', year)
    }
   
    this.setState({
      mockdata: currentDate,
      holidayArrDate,
      date: newDate
    })

  }


  onValueChange = (field, e) => {
    this.setState({ [field]: e.target.value })
  }


  onChange = (field, updateValue) => {
    if(updateValue){
      this.setState({ [field]: updateValue })
    }else{
      this.setState({ [field]: null })
    }
    
  }


  onClickAdd = () => {
    const {holidayName,date,mockdata,holidayArrDate}= this.state
    const {form} = this.props
    if (holidayName !== '' && date !== null) {
      let passCheck = true
      const dateArr = _.cloneDeep(mockdata)
      const newdata = {
        holidayName,
        date,
        unique_key:`${holidayName}-${moment(date).format()}`
      }

      // eslint-disable-next-line consistent-return
      _.each(dateArr, value => {
        const dateArr_moment = moment(value.date)
        const dateArr_date = moment.utc(moment(dateArr_moment).format('DD MMMM')).format('DD MMMM')
        const holidayDate_date = moment.utc(moment(newdata.date).format('DD MMMM')).format('DD MMMM')
        if (dateArr_date === holidayDate_date && mockdata != null) {
          passCheck = false
          return false
        }
      })
      if (passCheck) {
        const dateArrInput_moment = moment(date)
        const dateArrInput_date = moment.utc(moment(dateArrInput_moment).format('DD MMMM')).format('DD MMMM')
        this.setState({
          mockdata: [newdata, ...mockdata],
          holidayName: '',
          date: '',
          holidayArrDate: [...holidayArrDate, dateArrInput_date]
        })
        form.setFieldsValue({holidaycompany_name_box:''})
      } else {
        this.ModalWarning('Warning', 'This date is already in used.', '', 'warning')
      }
    }
  }

  onPresetSelected = async (id) => {
    const {client,form} = this.props
    if (id === 0) {
      this.setState({
        presetName: '',
        holidayName: '',
        date: ''
      })
    } else {
      this.onChange('PresetSelected', id)
      const queryResult = await client.query({
        query: GET_HOLIDAY_PRESET_BYID,
        variables: { id },
      })
      const mappedHoliday = _.map(queryResult.data.holiday_preset.holidays, this.holidayPresetsParser)
      this.generateHoliday(mappedHoliday)
      this.setState({
        presetName: queryResult.data.holiday_preset.name,
        isLoading: false,
      })
      const { resetFields } = form
      resetFields(['undefined_date','undefined_name'])
    }
  }

  generateHoliday = (holidayList) => {
    const {holidayCompanyYear} = this.state
    let currentDate = []
    let holidayArrDate = []
    _.forEach(holidayList, holiday => {
      const newdata = {
        holidayName: holiday.holiday_name,
        date: moment(holiday.holiday_date).set('year', holidayCompanyYear),
        unique_key: `${holiday.holiday_name}-${moment(holiday.holiday_date).set('year', holidayCompanyYear)}`
      }
      currentDate = [newdata, ...currentDate]

      const dateArrInput_moment = moment(newdata.date)
      const dateArrInput_date = moment.utc(moment(dateArrInput_moment).format('DD MMMM')).format('DD MMMM')
      holidayArrDate = [dateArrInput_date, ...holidayArrDate]
    })
    this.setState({
      mockdata: currentDate,
      holidayArrDate,
    })
  }

  onEditField = (index, updateValue) => {
    const {mockdata} = this.state
    const toBeManipulate = _.cloneDeep(mockdata)
    toBeManipulate[index].holidayName = updateValue
    this.setState({
      mockdata: toBeManipulate
    })
  }

  onEditDateField = (index, updateValue) => {
    const {holidayArrDate,mockdata} = this.state
    let passCheck = true
    const updateValue_date = moment.utc(moment(updateValue).format('DD MMMM')).format('DD MMMM')
    // eslint-disable-next-line consistent-return
    _.each(holidayArrDate, value => {
      if (updateValue_date === value) {
        passCheck = false
        return false
      }
    })
    if (passCheck) {
      const toBeManipulate = _.cloneDeep(mockdata)
      toBeManipulate[index].date = updateValue
      this.setState({
        mockdata: toBeManipulate
      })
    } else {
      this.ModalWarning('Warning', 'This date is already in used.', '', 'warning')
    }
  }

  onClickDelete = (index) => {
    const {mockdata} = this.state
    const defaultarr = mockdata
    const cutHoliday = defaultarr.splice(index - 1, 1)
    if (cutHoliday) {
      this.setState({ mockdata: defaultarr })
    }
  }

  holidayPresetsParser = (preset) => {
    const moment_date = moment(preset.holiday_date)
    const final = moment.utc(moment(moment_date).format())
    return {
      holiday_name: preset.holiday_name,
      holiday_date: final,
      unique_key: `${preset.holiday_name}-${moment(moment_date).format()}`
    }
  }



  handleOk = (type) => {
    const {mockdata,holidayCompanyYear,currentSelectedPresetID} = this.state
    const {history} = this.props
    let holidays = []
    switch (type) {
      case 'create':
        _.each(mockdata, value => {
          holidays = [...holidays, {
            date: moment(value.date),
            name: value.holidayName
          }]
        })
        this.runQueryCreate(
          holidayCompanyYear,
          holidays.length,
          holidays)
        this.setState({ visibleModal: false })
        break

      case 'warning':
        this.setState({ visibleModalWarning: false })
        break

      case 'cancel':
        this.setState({ visibleModal: false })
        history.push({
          pathname: '/companyholiday/list',
          state: {
            updated: true
          }
        })
        break
      case 'swap':
        this.onPresetSelected(currentSelectedPresetID)
        this.setState({ visibleModal: false })
        break
      default:
        break
    }

  }

  checkAvailableYear = (year) => {
    const {companyHolidays} = this.state
    return _.includes(companyHolidays, year.toString())
  }


  runQueryCreate = async (
    holidaycompany_name,
    holiday_amount,
    holidaydetails) => {
    const {components,client,history} = this.props
    const { Message } = components
    try {
      await
        client.mutate({
          mutation: CREATE_COMPANY_HOLIDAY,
          variables: {
            holidaycompany_name,
            holiday_amount,
            holidaydetails
          },
        })

      Message('success', 'Create company holiday successful')
      history.push({
        pathname: '/companyholiday/list',
        state: {
          updated: true
        }
      })
    } catch (error) {
      Message('error', 'Create company holiday error')
    }
  }

  handleCancel = type => {
    switch (type) {
      case 'cancel_general':
        this.setState({
          visibleModal: false,
          visibleModalWarning: false,
        })
        break
      case 'cancel_existing_data':
        this.setState({
          visibleModal: false,
          visibleModalWarning: false,
          typeCancel: 'cancel_general'
        })
        break
      default:
        this.setState({
          visibleModal: false,
          visibleModalWarning: false,
        })
        break
    }


  };


  handleSubmit = e => {
    e.preventDefault()
    const {form} = this.props
    const {mockdata,holidayName,date} = this.state
    form.validateFields((err) => {
      let tempError = {}
      if (err) {
        tempError = _.clone(err)
        delete tempError.holidaycompany_name_box
      }

      if (Object.keys(tempError).length > 0) {
        return
      }
      if (mockdata.length === 0) {
        this.ModalWarning('Warning', 'Please input holiday at least one day.', '', 'warning')
      }
      else if (holidayName || date) {
        this.setState({ typeCancel: 'cancel_existing_data' })
        this.Modal('Warning', "You haven't added the holiday.", 'Are you sure you want to continue ?', 'create', 'Cancel', 'Confirm')
      } else {
        this.setState({ typeCancel: 'cancel_general' })
        this.Modal('Confirmation', 'Are you sure you want to create a new company holiday ?', '', 'create', 'Cancel', 'Confirm')
      }
    })
  };


  render() {
    const {form,components} = this.props
    const { getFieldDecorator } = form
    const { Button, StandardContainer, IconHelper } = components
    const {defaultDate,holidayName,date}=this.state
    const columns = [{
      title: 'Holiday Name',
      dataIndex: 'holidayName',
      key: 'holidayName',
      width: 370,
      render: (text, record, index) => {
        if (index !== 0) {
          return (
            <div style={{ height: '55px' }}>
              <Form>
                <Form.Item>
                  {getFieldDecorator(`${record.unique_key}_name`, {
                    initialValue: _.get(this.state, `mockdata[${index - 1}].holidayName`),
                    rules: [
                      {
                        required: true,
                        message: 'Please input holiday name !'
                      },
                      {
                        pattern: new RegExp('(?!^ +$)^.+$'),
                        message: 'Must contain more than empty space',
                      },
                    ],
                  })(
                    <InputBoxTable
                      value={text}
                      onChange={value => { this.onEditField(index - 1, value.target.value) }}
                    />
                  )}
                </Form.Item>
              </Form>
            </div>
          )
        } else {
          return text

        }
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 200,
      render: (text, record, index) => {
        if (index !== 0) {
          return (
            <div style={{ width: '237px', height: '55px' }}>
              <Form>
                <Form.Item>
                  {getFieldDecorator(`${record.unique_key}_date`, {
                    initialValue: _.get(this.state, `mockdata[${index - 1}].date`),
                    rules: [
                      {
                        required: true,
                        message: 'Please input holiday date !'
                      },
                    ],
                  })(
                    <div style={{ width: '237px' }}>
                      <DatePicker
                        allowClear={false}
                        format="DD MMM YYYY"
                        // value={text}
                        disabledDate={dateSelect => (defaultDate.valueOf() > dateSelect.valueOf()) || (dateSelect.valueOf() >= moment(`01/01/${holidayCompanyYear + 1}`, 'DD MM YYYY').valueOf())}
                        value={_.get(this.state, `mockdata[${index - 1}].date`)}
                        onChange={(date) => {
                          this.onEditDateField(index - 1, date)
                        }}
                        size='large'
                      />
                    </div>
                  )}
                </Form.Item>
              </Form>
            </div>
)
        } else {
          return text

        }
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 0,
      render: (text, record, index) => {
        
          if (index !== 0) {
            return (
              <div onClick={() => {
                this.setState({ deleteHoliday: index })
                this.onClickDelete(index)
              }
              }
              >
                <IconHelper type="delete" />
              </div>
            )
          } else if (holidayName && date) {
            return (
              <div
                style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom:'10px' }}
                onClick={() => this.onClickAdd()}
              >
                <Icon
                  style={{ fontSize: '18px' }}
                  type="plus-circle"
                />
              </div>
            )
          } else {
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginBottom:'10px'  }}>
                <Icon
                  style={{ fontSize: '18px' }}
                  type="plus-circle"
                />
              </div>
)
          }

        
      }
    },
    ]

    const generateFirstInputBox = () => {
      const {holidayCompanyYear,holidayName,defaultDate,date,mockdata} = this.state
      const createTab =
      {
        holidayName: (

          <div style={{ height: '55px' }}>
            <Form>
              <Form.Item>
                {getFieldDecorator('holidaycompany_name_box', {
                  initialValue: '',
                  rules: [
                    {
                      pattern: new RegExp('(?!^ +$)^.+$'),
                      message: 'Must contain more than empty space',
                    },
                  ],
                })(

                  <InputBoxTable
                    disabled={holidayCompanyYear === ''}
                    placeholder="Holiday Name"
                    value={holidayName}
                    style={{ width: '237px' }}
                    onChange={
                      value => {
                        this.onValueChange('holidayName', value)
                      }
                    }

                  />
                )}
              </Form.Item>
            </Form>
          </div>


        ),
        date: (
          <div style={{ width: '237px', marginBottom:'15px' }}>
            <DatePicker
              size='large'
              disabled={holidayCompanyYear === ''}
              allowClear
              style={{ width: '237px' }}
              disabledDate={dateSelect => (defaultDate.valueOf() > dateSelect.valueOf()) || (dateSelect.valueOf() >= moment(`01/01/${holidayCompanyYear + 1}`, 'DD MM YYYY').valueOf())}
              format="DD MMM YYYY"
              value={date}
              defaultPickerValue={defaultDate}
              onChange={
                (date) => {
                  this.onChange('date', date)
                }
              }
            />
          </div>),
      }
      const parsedExistingHolidays = [createTab, ...mockdata]
      return parsedExistingHolidays
    }
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    const {dropdownYear,presetName,presetList,holidayCompanyYear,PresetSelected,isLoading,currentModalDetail,currentModalTitle,visibleModal,typeCancel,leftModalButton,rightModalButton,currentModalType,currentModaldetail,visibleModalWarning} = this.state
    return (
      <Fragment>
        <StandardContainer
          subHeader="Create Company Holiday"
          loading={
            false
          }
        >

          <Form onSubmit={this.handleSubmit}>
            <ContentWrapper>
              <Col span={12}>
                <TextOnButton>Effective Year<Star>*</Star></TextOnButton>
                <Form.Item>
                  {getFieldDecorator('year', {
                    rules: [{ required: true, message: 'Please select effective year !' }],
                  })(
                    <SelectBox
                      placeholder="Please select effective year"
                      optionFilterProp="children"
                      onChange={value => { this.onYearChange(value) }}
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {
                        _.map(dropdownYear, year => {
                          return <Option disabled={this.checkAvailableYear(year)} value={year}> {year} </Option>
                        })
                      }
                    </SelectBox>
                  )}
                </Form.Item>
              </Col>


              <Col span={12}>
                <TextOnButton>Holiday Preset (optional)</TextOnButton>
                <Form.Item>
                  <div>
                    <SelectBox
                      allowClear
                      value={presetName}
                      showSearch
                      disabled={holidayCompanyYear === ''}
                      optionFilterProp="children"
                      onChange={value => {
                        this.setState({ currentSelectedPresetID: value })
                        if (value === undefined) {
                          this.onPresetSelected(0)
                        } else if (PresetSelected !== '') {
                            this.Modal('Confirmation', 'Are you sure you want to discard this holiday preset ?', '', 'swap', 'Cancel', 'Discard')
                          } else {
                            this.onPresetSelected(value)
                          }
                      }
                      }
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {
                        _.map(presetList, preset => {
                          return <Option value={preset.id}>{preset.name}</Option>
                        })
                      }
                    </SelectBox>
                  </div>
                </Form.Item>
              </Col>
            </ContentWrapper>
            <TableList
              loading={{
                spinning: isLoading,
                indicator: <Spin indicator={antIcon} />,
              }}
              columns={columns}
              dataSource={generateFirstInputBox()}
              pagination={{ position: 'none', defaultPageSize: 100 }}
            />

            <ButtonWrapper>
              <Form.Item>
                <Button size="l" theme="cancel" onClick={() => { this.Modal('Confirmation', 'Are you sure you want to discard your changes ?', '', 'cancel', 'Cancel', 'Confirm') }}> Cancel </Button>

                <Button size="l" htmlType="submit"> Create </Button>
              </Form.Item>
            </ButtonWrapper>
          </Form>

          <Popup
            title={currentModalTitle}
            visible={visibleModal}
            footer={[
              <Button theme="cancel" onClick={() => { this.handleCancel(typeCancel) }}>{leftModalButton}</Button>,
              <Button onClick={() => { this.handleOk(currentModalType) }}> {rightModalButton}</Button>
            ]}
          >
            {currentModalDetail}<br />{currentModaldetail}
          </Popup>

          <Popup
            title={currentModalTitle}
            visible={visibleModalWarning}
            footer={[
              <Button type="primary" onClick={() => { this.handleOk(currentModalType) }}>Ok</Button>
            ]}
          >
            {currentModalDetail}<br />{currentModaldetail}
          </Popup>

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

CreateCompanyHolidayDetail.propTypes={
  client:PropTypes.oneOfType([PropTypes.object]),
  form:PropTypes.oneOfType([PropTypes.object]),
  components:PropTypes.oneOfType([PropTypes.object]),
  history:PropTypes.oneOfType([PropTypes.object]),
  totalPage:PropTypes.number,
  actionSetTitle:PropTypes.func
}

CreateCompanyHolidayDetail.defaultProps={
  client:{},
  form:{},
  components:{},
  history:{},
  totalPage:0,
  actionSetTitle:()=>{}
}

const CreateCompanyHolidayDetailForm = Form.create({ name: 'create_company_holiday' })(CreateCompanyHolidayDetail)
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(CreateCompanyHolidayDetailForm))
