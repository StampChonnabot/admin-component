/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { DatePicker, Spin, Icon, Form, Col, Typography } from 'antd'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { InputBoxTable, TextOnButton, TableList, ButtonWrapper, Popup, ContentWrapper } from './components/styled'
import { EDIT_COMPANY_HOLIDAY } from '../../constants/index'

const { Text } = Typography

class EditCompanyHolidayDetail extends React.Component {
  constructor(props) {
    super(props)
    const {location} = this.props
    this.state = {
      currentData: [],
      defaultDate: moment(`01/01/${location.state.currentName}`, 'DD MMM YYYY'),
      holidayCompanyYear: location.state.currentName,
      currentId: location.state.currentId,
      holidaycompany_name: '',
      date: '',
      newHolidays: [],
      deletedHolidays: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModaldetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      isLoading: true,
      typeCancel: 'cancel_general'
    }
  }

  componentWillMount() {
    const {actionSetTitle,location} = this.props
    const {holidayCompanyYear} = this.state
    actionSetTitle('Company Holiday')
    if (holidayCompanyYear === moment().get('year')) {
      this.setState({ defaultDate: moment() })
    } else {
      this.setState({ defaultDate: moment(`01/01/${location.state.currentName}`, 'DD MM YYYY') })
    }

    let holidayArrDate = []
    _.forEach(_.map(location.state.currentHolidayList, value => { return { date: value.date, holidaycompany_name: value.holidaycompany_name, id: value.id } }), holiday => {
      const newdata = {
        holidayName: holiday.holiday_name,
        date: moment(holiday.date).set('year', holidayCompanyYear).format('DD MMM YYYY'),
        unique_key: `${holiday.holiday_name}-${moment(holiday.date).set('year', holidayCompanyYear).format()}`
      }

      const dateArrInput_moment = moment(newdata.date)
      const dateArrInput_date = moment.utc(moment(dateArrInput_moment).format('DD MMMM')).format('DD MMMM')
      holidayArrDate = [dateArrInput_date, ...holidayArrDate]
    })
    this.setState({
      currentData: _.map(location.state.currentHolidayList, value => {
        return {
          date: moment(value.date),
          holidaycompany_name: value.holidaycompany_name,
          id: value.id,
          unique_key: `${value.holidaycompany_name}-${moment(value.date)}`
        }
      }),
      newHolidays: holidayArrDate,
      isLoading: false
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
  };

  ModalWarning = (title, detail, detailSec, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModaldetail: detailSec,
      currentModalType: type
    })
  };

  handleSubmit = e => {
    e.preventDefault()
    const {form}=this.props
    const {currentData,holidaycompany_name,date,holidayCompanyYear}=this.state
   form.validateFields((err) => {
      let tempError = {}
      if (err) {
        tempError = _.clone(err)
        delete tempError.holidaycompany_name_box
      }

      if (Object.keys(tempError).length > 0) {
        return
      }
      if (currentData.length === 0) {
        this.ModalWarning('Warning', 'Please input holiday at least one day.', '', 'warning')
      }
      else if (holidaycompany_name || date) {
        this.setState({ typeCancel: 'cancel_existing_data' })
        this.Modal('Warning', "You haven't added the holiday.", 'Are you sure you want to continue ?', 'edit', 'Cancel', 'Confirm')

      } else {
        this.setState({ typeCancel: 'cancel_general' })
        this.Modal('Confirmation', `Are you sure you want to update ${holidayCompanyYear} ?`, '', 'edit', 'Cancel', 'Confirm')
      }
    })
  };

  handleOk = (type) => {
    const {currentData,deletedHolidays,currentId,holidayCompanyYear}=this.state
    const {setBreadCrumb,history} = this.props
    switch (type) {
      case 'edit':
        this.runQueryEdit(
          currentData.length,
          _.map(currentData, this.parseHolidayForMutation),
          deletedHolidays,
          currentId,
          holidayCompanyYear
        )
        setBreadCrumb(
          [
            { url: '/companyholiday/list', text: 'Company Holiday List', inactive: true, backIndex: 2 },
            { url: '/companyholiday/details', text: 'Company Holiday Details' }
          ]
        )
        break
      case 'cancel':
        history.push({
          pathname: '/companyholiday/list',
          state: {
            updated: true
          }
        })
      // eslint-disable-next-line no-fallthrough
      default:
        break
    }
  }

  onValueChange = (field, e) => {
    this.setState({ [field]: e.target.value })
  }


  onDateChange = (field, e) => {
    if (e) {
      this.setState({ [field]: e })
    } else {
      this.setState({ [field]: null })
    }
  }


  checkDatePassed = (index) => {
    return moment(_.get(this.state, `currentData[${index - 1}].date`)).valueOf() >= moment().valueOf()
  }


  onClickAdd = (name, inputDate) => {
    const {currentData,date,newHolidays}=this.state
    const {form} = this.props
    let passCheck = true
    const dateArr = _.cloneDeep(currentData)
    const newdata = {
      date:inputDate,
      holidaycompany_name: name,
      unique_key: `${name}-${moment(inputDate).format()}`
    }

    // eslint-disable-next-line consistent-return
    _.each(dateArr, value => {
      const dateArr_moment = moment(value.date)
      const dateArr_date = moment.utc(moment(dateArr_moment).format('DD MMMM')).format('DD MMMM')
      const holidayDate_date = moment.utc(moment(newdata.date).format('DD MMMM')).format('DD MMMM')
      if (dateArr_date === holidayDate_date && currentData != null) {
        passCheck = false
        return false
      }
    })
    if (passCheck) {
      const dateArrInput_moment = moment(date)
      const dateArrInput_date = moment.utc(moment(dateArrInput_moment).format('DD MMMM')).format('DD MMMM')
      this.setState({
        currentData: [newdata, ..._.cloneDeep(currentData)],
        newHolidays: [...newHolidays, dateArrInput_date],
        holidaycompany_name: '',
        date: '',
      })
      form.setFieldsValue({ holidaycompany_name_box: '' })
    } else {
      this.ModalWarning('Warning', 'This date is already in used.', '', 'warning')
    }

  }

  runQueryEdit = async (
    holiday_amount,
    holiday_details,
    delete_company_holiday_ids,
    id,
    holidaycompany_name,
  ) => {
    const { components,client,history,location } = this.props
    const { Message } = components
    try {
      await
        client.mutate({
          mutation: EDIT_COMPANY_HOLIDAY,
          variables: {
            holiday_amount,
            holiday_details,
            delete_company_holiday_ids,
            id,
            holidaycompany_name,
          },
        })
      Message('success', 'Edit company holiday successful')
      history.replace({
        pathname: '/companyholiday/details',
        state: {
          currentId: location.state.currentId,
          updated: true
        }
      })

    } catch (error) {

      Message('error', 'Edit company holiday error')
    }
  }


  parseHolidayForMutation = (holiday) => {
    const mockUserId = 1
    const outputHoliday = {
      name: holiday.holidaycompany_name,
      date: moment(moment(holiday.date)).format(),
      created_by: mockUserId,
    }
    if (holiday.id) {
      outputHoliday.id = holiday.id
    }
    return outputHoliday
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

  onEditField = (index, updateValue) => {
    const {currentData} = this.state
    const toBeManipulate = _.cloneDeep(currentData)
    toBeManipulate[index].holidaycompany_name = updateValue
    this.setState({
      currentData: toBeManipulate
    })
  }

  onEditDateField = (index, updateValue) => {
    const {newHolidays,currentData}=this.state
    let passCheck = true
    const updateValue_date = moment.utc(moment(updateValue).format('DD MMMM')).format('DD MMMM')
    // eslint-disable-next-line consistent-return
    _.each(newHolidays, value => {
      if (updateValue_date === value) {
        passCheck = false
        return false
      }
    })
    if (passCheck) {
      const toBeManipulate = _.cloneDeep(currentData)
      toBeManipulate[index].date = updateValue
      this.setState({
        currentData: toBeManipulate
      })
    } else {
      this.ModalWarning('Warning', 'This date is already in used.', '', 'warning')
    }

  }


  onDelete = (index) => {
    const {currentData,deletedHolidays}= this.state
    const toBeManipulate = _.cloneDeep(currentData)
    const id = _.get(toBeManipulate, `[${index - 1}].id`, -1)
    toBeManipulate.splice(index - 1, 1)

    if (id > 0) {
      this.setState({
        currentData: toBeManipulate,
        deletedHolidays: [...deletedHolidays, id]
      })
    } else {
      this.setState({
        currentData: toBeManipulate
      })
    }

  }


  render() {
    const { form ,components} = this.props
    const { getFieldDecorator } = form
    const { Button, StandardContainer, IconHelper } = components
    const {currentModalDetail,defaultDate,holidayCompanyYear,holidaycompany_name,date,currentData,isLoading,currentModalTitle,visibleModal,typeCancel,leftModalButton,rightModalButton,currentModalType,currentModaldetail,visibleModalWarning} = this.state
    const columns = [
      {
        title: 'Holiday Name',
        dataIndex: 'holidaycompany_name',
        key: 'holidaycompany_name',
        width: 370,
        render: (text, record, index) => {
            if (index !== 0) {
              return (
                <div style={{ height: '55px' }}>
                  <Form>
                    <Form.Item>
                      {getFieldDecorator(`${record.unique_key}_name`, {
                        initialValue: _.get(this.state, `currentData[${index - 1}].holidaycompany_name`),
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
                          disabled={moment(_.get(this.state, `currentData[${index - 1}].date`)).valueOf() < moment().valueOf()}
                          value={_.get(this.state, `currentData[${index - 1}].holidaycompany_name`)}
                          onChange={value => {
                            this.onEditField(index - 1, value.target.value)
                          }}
                          placeholder={text}
                        />
                      )}
                    </Form.Item>
                  </Form>
                </div>


              )

            } else {
              return (
                text
              )
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
                        initialValue: _.get(this.state, `currentData[${index - 1}].date`),
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
                            defaultPickerValue={moment(defaultDate)}
                            disabled={moment(_.get(this.state, `currentData[${index - 1}].date`)).valueOf() < moment().valueOf()}
                            disabledDate={dateSelect => (defaultDate.valueOf() > dateSelect.valueOf()) ||
                              (dateSelect.valueOf() >= moment(`01/01/${parseInt(holidayCompanyYear,10) + 1}`, 'DD/MM/YYYY').valueOf()) ||
                              (moment(dateSelect).startOf('day').valueOf() <= moment().startOf('day').valueOf())}
                            format="DD MMM YYYY"
                            value={_.get(this.state, `currentData[${index - 1}].date`)}
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
              return (
                text
              )
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
              if (this.checkDatePassed(index)) {
                return (
                  <span onClick={() => {
                    this.onDelete(index)
                  }}
                  >
                    <IconHelper type="delete" />
                  </span>
                )
              } else {
                return (
                  <span>
                    <IconHelper type="delete" color="grey" />
                  </span>
                )
              }

            }
            else if (holidaycompany_name !== '' && date !== '') {
                return (
                  <div
                    style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}
                    onClick={() =>
                      this.onClickAdd(holidaycompany_name, date)}
                  >
                    <Icon
                      style={{ fontSize: '18px' }}
                      type="plus-circle"
                    />

                  </div>
                )
              } else {
                return (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
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


    const createTab = {
      holidaycompany_name: (
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
                  placeholder="Holiday Name"
                  value={holidaycompany_name}
                  onChange={
                    value => {
                      this.onValueChange('holidaycompany_name', value)
                    }}
                />
              )}
            </Form.Item>
          </Form>
        </div>


      ),

      date: (
        <div style={{ width: '237px', marginBottom: '15px' }}>
          <DatePicker
            style={{ width: '237px' }}
            allowClear
            size='large'
            disabledDate={dateSelect => (defaultDate.valueOf() > dateSelect.valueOf()) ||
              (dateSelect.valueOf() >= moment(`01/01/${parseInt(holidayCompanyYear,10) + 1}`, 'DD/MM/YYYY').valueOf()) ||
              (moment(dateSelect).startOf('day').valueOf() <= moment().startOf('day').valueOf())}
            format="DD MMM YYYY"
            value={date}
            defaultPickerValue={moment().add(1, 'days')}
            onChange={
              (date) => {
                this.onDateChange('date', date)
              }
            }
          />
        </div>),
    }
    const dataTable = [createTab, ...currentData]
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <Fragment>
        <StandardContainer
          subHeader="Edit Company Holiday"
        >
          <ContentWrapper>
            <Col span={12}>
              <TextOnButton>Effective Year</TextOnButton>
              <Text style={{ marginLeft: '14px' }}>
                {holidayCompanyYear}
              </Text>
            </Col>

          </ContentWrapper>
          <Form onSubmit={this.handleSubmit}>
            <TableList
              loading={{
                spinning: isLoading,
                indicator: <Spin indicator={antIcon} />,
              }}
              columns={columns}
              dataSource={dataTable}
              pagination={{ position: 'none', defaultPageSize: 100 }}
            />

            <ButtonWrapper>
              <Form.Item>
                <Button size="l" theme="cancel" onClick={() => { this.Modal('Confirmation', 'Are you sure you want to discard your changes ?', '', 'cancel', 'Cancel', 'Confirm') }}>Cancel</Button>
                <Button size="l" htmlType="submit">Save</Button>
              </Form.Item>
            </ButtonWrapper>

            <Popup
              title={currentModalTitle}
              visible={visibleModal}
              footer={[
                <Button theme="cancel" key="back" onClick={() => { this.handleCancel(typeCancel) }}>{leftModalButton}</Button>,
                <Button onClick={() => { this.handleOk(currentModalType) }} type="primary">{rightModalButton}</Button>
              ]}
            >{currentModalDetail}<br />{currentModaldetail}
            </Popup>

            <Popup
              title={currentModalTitle}
              visible={visibleModalWarning}
              footer={[
                <Button onClick={() => { this.handleCancel(typeCancel) }} type="primary">Ok</Button>
              ]}
            >
              {currentModalDetail}
              <br />
              {currentModaldetail}
            </Popup>

          </Form>
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
const EditCompanyHolidayDetailForm = Form.create({ name: 'edit_company_holiday' })(EditCompanyHolidayDetail)

EditCompanyHolidayDetail.propTypes={
  form:PropTypes.oneOfType([PropTypes.object]),
  components:PropTypes.oneOfType([PropTypes.object]),
  client:PropTypes.oneOfType([PropTypes.object]),
  history:PropTypes.oneOfType([PropTypes.object]),
  location:PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb:PropTypes.func,
  actionSetTitle:PropTypes.func
}
EditCompanyHolidayDetail.defaultProps={
  form:{},
  components:{},
  client:{},
  history:{},
  location:{},
  setBreadCrumb:()=>{},
  actionSetTitle:()=>{},
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(EditCompanyHolidayDetailForm))

