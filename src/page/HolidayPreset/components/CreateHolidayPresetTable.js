/* eslint-disable camelcase */
import React from 'react'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import { Table, Icon, DatePicker, Form } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import {
  InputBox,
  AntDatePicker,
  InputBoxInTable,
  DateWrapper,
  Popup,
  ButtonCustom,
} from './styled'

class CreateHolidayPresetTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      holiday: [],
      holiday_name: '',
      holiday_date: '',
      holidayNameInput: '',
      holidayDateInput: '',
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      visibleModalWarning: false,
      holidayDateArr: [],
    }
  }

  componentWillMount() {
    const { holidayName, date } = this.props

    this.setState({
      holidayNameInput: holidayName,
      holidayDateInput: date,
    })
  }

  ModalWarning = (title, detail, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
    })
  }

  holidayPresetsParser = (preset) => {
    return {
      holiday_name: preset.holiday_name,
      holiday_date: preset.holiday_date,
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

  onClickAdd = () => {
    const {
      holiday_name,
      holiday_date,
      holiday,
      holidayNameInput,
      holidayDateInput,
      holidayDateArr,
    } = this.state
    const { setHolidayValue, setHoliday, form } = this.props
    const { setFieldsValue } = form
    if (holiday_name !== '' && holiday_date != null) {
      let passCheck = true
      const dateArr = _.cloneDeep(holiday)
      const newdata = {
        holiday_name: holidayNameInput,
        holiday_date: moment(holidayDateInput),
        unique_key: `${holidayNameInput}-${moment(holidayDateInput).format()}`,
      }

      _.each(dateArr, (value) => {
        const dateArrMoment = moment(value.holiday_date)
        const dateArrDate = moment
          .utc(moment(dateArrMoment).format('DD MMMM'))
          .format('DD MMMM')
        const holidayDateDate = moment
          .utc(moment(newdata.holiday_date).format('DD MMMM'))
          .format('DD MMMM')
        if (dateArrDate === holidayDateDate && holiday != null) {
          passCheck = false
          return false
        }
        return passCheck
      })

      if (passCheck) {
        const dateArrInputMoment = moment(holidayDateInput)
        const dateArrInputDate = moment
          .utc(moment(dateArrInputMoment).format('DD MMMM'))
          .format('DD MMMM')
        const mappedHoliday = _.map([newdata, ...holiday], this.holidayPresetsParser)
        this.setState({
          holiday: [newdata, ...holiday],
          holiday_name: '',
          holiday_date: '',
          holidayNameInput: '',
          holidayDateInput: null,
          holidayDateArr: [...holidayDateArr, dateArrInputDate],
        })
        setHolidayValue('holidayName', '')
        setHolidayValue('date', '')

        if (mappedHoliday) {
          setHoliday({
            holiday: mappedHoliday,
          })
        }
        setFieldsValue({ holiday_name_box: '' })
      } else {
        this.ModalWarning('Warning', 'This date is already in used', 'warning')
      }
    }
  }

  onEditField = (index, updateValue) => {
    const { holiday } = this.state
    const { setHoliday } = this.props
    const toBeManipulate = _.cloneDeep(holiday)
    toBeManipulate[index].holiday_name = updateValue
    this.setState({
      holiday: toBeManipulate,
    })
    if (toBeManipulate) {
      setHoliday({
        holiday: toBeManipulate,
      })
    }
  }

  onEditDateField = (index, updateValue) => {
    const { holidayDateArr, holiday } = this.state
    const { setHoliday } = this.props
    let passCheck = true
    const updateValueDate = moment
      .utc(moment(updateValue).format('DD MMMM'))
      .format('DD MMMM')

    _.each(holidayDateArr, (value) => {
      if (updateValueDate === value) {
        passCheck = false
        return false
      }
      return passCheck
    })

    if (passCheck) {
      const toBeManipulate = _.cloneDeep(holiday)
      toBeManipulate[index].holiday_date = updateValue
      this.setState({
        holiday: toBeManipulate,
      })
      if (toBeManipulate) {
        setHoliday({
          holiday: toBeManipulate,
        })
      }
    } else {
      this.ModalWarning('Warning', 'This date is already in used', 'warning')
    }
  }

  onClickDelete = (index) => {
    const { holiday } = this.state
    const { setHoliday } = this.props
    const defaultarr = holiday
    const cutHoliday = defaultarr.splice(index - 1, 1)
    if (cutHoliday) {
      this.setState({ holiday: defaultarr })
      setHoliday({
        holiday: defaultarr,
      })
    }
  }

  handleOk = (type) => {
    switch (type) {
      case 'warning':
        this.setState({
          visibleModalWarning: false,
        })
        break

      default:
        break
    }
  }

  render() {
    const { components, form, holidayName, setHolidayValue, date } = this.props
    const { IconHelper } = components
    const { getFieldDecorator, setFieldsValue } = form
    const {
      holiday,
      holiday_name,
      holiday_date,
      currentModalTitle,
      visibleModalWarning,
      currentModalType,
      currentModalDetail,
    } = this.state

    const generateFirstInputBox = () => {
      const createTab = {
        holiday_name: (
          <div style={{ height: '55px' }}>
            <div style={{ marginTop: '12px' }}>
              <Form>
                <Form.Item>
                  {getFieldDecorator('holiday_name_box', {
                    initialValue: '',
                    rules: [
                      {
                        pattern: new RegExp('(?!^ +$)^.+$'),
                        message: 'Must contain more than empty space',
                      },
                    ],
                  })(
                    <InputBoxInTable
                      placeholder="Holiday Name"
                      value={holidayName}
                      onChange={(value) => {
                        this.onValueChange('holiday_name', value)
                        setHolidayValue('holidayName', value.target.value)
                        this.setState({ holidayNameInput: value.target.value })
                      }}
                    />,
                  )}
                </Form.Item>
              </Form>
            </div>
          </div>
        ),
        holiday_date: (
          <DateWrapper>
            <AntDatePicker
              format="DD MMMM"
              size="large"
              mode="date"
              allowClear
              value={date}
              onChange={(date) => {
                this.onDateChange('holiday_date', date)
                setHolidayValue('date', date)
                this.setState({ holidayDateInput: date })
              }}
            />
          </DateWrapper>
        ),
      }
      const parsedExistingHolidays = [createTab, ...holiday]
      return parsedExistingHolidays
    }

    const columns = [
      {
        title: 'Holiday Name',
        dataIndex: 'holiday_name',
        key: 'holiday_name',
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <div style={{ height: '55px' }}>
                <div style={{ marginTop: '12px' }}>
                  <Form>
                    <Form.Item>
                      {getFieldDecorator(`${record.unique_key}_name`, {
                        initialValue: _.get(
                          this.state,
                          `holiday[${index - 1}].holiday_name`,
                        ),
                        rules: [
                          {
                            required: true,
                            message: 'Please input holiday name !',
                          },
                          {
                            pattern: new RegExp('(?!^ +$)^.+$'),
                            message: 'Must contain more than empty space',
                          },
                        ],
                      })(
                        <InputBox
                          style={{ width: '237px' }}
                          value={_.get(this.state, `holiday[${index - 1}].holiday_name`)}
                          onChange={(value) => {
                            this.onEditField(index - 1, value.target.value)
                          }}
                          placeholder={text}
                        />,
                      )}
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )
          } else {
            return text
          }
        },
      },
      {
        title: 'Date',
        dataIndex: 'holiday_date',
        key: 'holiday_date',
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <div style={{ height: '55px' }}>
                <div style={{ marginTop: '12px' }}>
                  <Form>
                    <Form.Item>
                      {getFieldDecorator(`${record.unique_key}_date`, {
                        initialValue: _.get(
                          this.state,
                          `holiday[${index - 1}].holiday_date`,
                        ),
                        rules: [
                          {
                            required: true,
                            message: 'Please input holiday date !',
                          },
                        ],
                      })(
                        <div style={{ width: '237px' }}>
                          <DatePicker
                            allowClear={false}
                            format="DD MMMM"
                            value={_.get(
                              this.state,
                              `holiday[${index - 1}].holiday_date`,
                            )}
                            onChange={(date) => {
                              this.onEditDateField(index - 1, date, 'holiday_date')
                              setFieldsValue({
                                [`holiday_date${holiday[index - 1].holiday_name}${moment(
                                  holiday[index - 1].holiday_date,
                                ).format('DD')}`]: date,
                              })
                            }}
                            size="large"
                          />
                        </div>,
                      )}
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )
          } else {
            return text
          }
        },
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <span onClick={() => this.onClickDelete(index)}>
                <IconHelper type="delete" />
              </span>
            )
          } else if (holiday_name && holiday_date) {
            return (
              <div
                style={{
                  color: '#7540EE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
                onClick={() => this.onClickAdd()}
              >
                <Icon style={{ fontSize: '18px' }} type="plus-circle" />
              </div>
            )
          } else {
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <Icon style={{ fontSize: '18px' }} type="plus-circle" />
              </div>
            )
          }
        },
      },
    ]
    return (
      <div>
        <Table
          pagination={{ position: 'none', defaultPageSize: 100 }}
          columns={columns}
          dataSource={generateFirstInputBox()}
        />
        <Popup
          title={currentModalTitle}
          visible={visibleModalWarning}
          footer={[
            <ButtonCustom
              type="primary"
              onClick={() => {
                this.handleOk(currentModalType)
              }}
            >
              Ok
            </ButtonCustom>,
          ]}
        >
          <p>{currentModalDetail}</p>
        </Popup>
      </div>
    )
  }
}
CreateHolidayPresetTable.propTypes = {
  holidayName: PropTypes.string,
  date: PropTypes.string,
  setHolidayValue: PropTypes.string,
  setHoliday: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
}
CreateHolidayPresetTable.defaultProps = {
  holidayName: '',
  date: '',
  setHolidayValue: '',
  setHoliday: {},
  form: {},
  components: {},
}
export default withApollo(CreateHolidayPresetTable)
