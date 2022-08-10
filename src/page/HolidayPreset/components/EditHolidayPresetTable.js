/* eslint-disable camelcase */
import React from 'react'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import { Table, Icon, DatePicker, Form, Spin } from 'antd'
import _ from 'lodash'
import moment from 'moment'
import { InputBox, InputBoxInTable, Popup, ButtonCustom } from './styled'

class EditHolidayPresetTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      holidaydata: null,
      holiday_name: '',
      holiday_date: '',
      holiday_nameInput: '',
      holidatDateInput: '',
      deletedItems: [],
      holidayDateArr: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      visibleModalWarning: false,
      isLoading: true,
    }
  }

  componentWillMount() {
    const { holidaydata, holidayName, date, setHoliday } = this.props
    this.setState({
      holidaydata,
      holiday_name: holidayName,
      holiday_date: date,
    })

    const mappedHoliday = _.map(holidaydata, this.holidayPresetsParser)
    if (mappedHoliday) {
      setHoliday({
        holidays: mappedHoliday,
      })
      this.setState({ holidaydata: mappedHoliday, isLoading: false })
    }
  }

  ModalWarning = (title, detail, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
    })
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
      holiday_nameInput,
      holidatDateInput,
      holidaydata,
      holiday_name,
      holiday_date,
    } = this.state
    const { setHolidayValue, setHoliday, form } = this.props
    if (holiday_nameInput !== '' && holidatDateInput != null) {
      let passCheck = true
      const dateArr = _.cloneDeep(holidaydata)

      const newdata = {
        holiday_name,
        holiday_date: moment(holiday_date),
        unique_key: `${holiday_name}-${moment(holiday_date).format()}`,
      }

      _.each(dateArr, (value) => {
        const dateArr_moment = moment(value.holiday_date)
        const dateArr_date = moment
          .utc(moment(dateArr_moment).format('DD MMMM'))
          .format('DD MMMM')
        const holidayDate_date = moment
          .utc(moment(newdata.holiday_date).format('DD MMMM'))
          .format('DD MMMM')
        if (dateArr_date === holidayDate_date && holidaydata != null) {
          passCheck = false
          return false
        }
        return passCheck
      })

      if (passCheck) {
        const mappedHoliday = _.map([newdata, ...holidaydata], this.holidayPresetsParser)
        this.setState({
          holidaydata: [newdata, ...holidaydata],
          holiday_name: '',
          holiday_date: '',
          holiday_nameInput: '',
          holidatDateInput: null,
          deletedItems: [],
        })
        setHolidayValue('holidayName', '')
        setHolidayValue('date', '')

        if (mappedHoliday) {
          setHoliday({
            holidays: mappedHoliday,
          })
        }
        form.setFieldsValue({ holiday_name_box: '' })
      } else {
        this.ModalWarning('Warning', 'This date is already in used', 'warning')
      }
    }
  }

  onClickDelete = (index) => {
    const { holidaydata, deletedItems } = this.state
    const { setDeleteHoliday, setHoliday } = this.props
    const defaultarr = holidaydata
    const cutHoliday = defaultarr.splice(index - 1, 1)

    if (cutHoliday) {
      this.setState({
        holidaydata: defaultarr,
        deletedItems: [...deletedItems, cutHoliday[0]],
      })
      setDeleteHoliday({
        deletedItems: [...deletedItems, cutHoliday[0]],
      })
      setHoliday({
        holidays: defaultarr,
      })
    }
  }

  onEditField = (index, updateValue) => {
    const { holidaydata } = this.state
    const { setHoliday } = this.props
    const toBeManipulate = _.cloneDeep(holidaydata)
    toBeManipulate[index].holiday_name = updateValue

    this.setState({
      holidaydata: toBeManipulate,
    })
    if (toBeManipulate) {
      setHoliday({
        holidays: toBeManipulate,
      })
    }
  }

  onEditDateField = (index, updateValue, field) => {
    const dataArrDate = []
    let passCheck = true
    const updateValue_date = moment
      .utc(moment(updateValue).format('DD MMMM'))
      .format('DD MMMM')

    _.each(dataArrDate, (value) => {
      if (updateValue_date === value) {
        passCheck = false
        return false
      }
      return passCheck
    })

    if (passCheck) {
      const { holidaydata } = this.state
      const { setHoliday } = this.props
      const toBeManipulate = _.cloneDeep(holidaydata)
      toBeManipulate[index][field] = updateValue

      this.setState({
        holidaydata: toBeManipulate,
      })
      if (toBeManipulate) {
        setHoliday({
          holidays: toBeManipulate,
        })
      }
    } else {
      this.ModalWarning('Warning', 'This date is already in used', 'warning')
    }
  }

  holidayPresetsParser = (preset) => {
    const moment_date = moment(preset.holiday_date)
    const final = moment.utc(moment(moment_date).format('DD MMMM'))
    if (preset.id) {
      return {
        holiday_name: preset.holiday_name,
        holiday_date: final,
        id: preset.id,
        unique_key: `${preset.holiday_name}-${moment(moment_date).format()}`,
      }
    } else {
      return {
        holiday_name: preset.holiday_name,
        holiday_date: final,
        unique_key: `${preset.holiday_name}-${moment(moment_date).format()}`,
      }
    }
  }

  handleOk = (type) => {
    switch (type) {
      case 'warning':
        this.setState({ visibleModalWarning: false })
        break
      default:
        break
    }
  }

  render() {
    const { components, form, setHolidayValue } = this.props
    const { IconHelper } = components
    const { getFieldDecorator } = form
    const {
      holiday_nameInput,
      holidatDateInput,
      holidaydata,
      isLoading,
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
                      value={holiday_nameInput}
                      onChange={(value) => {
                        setHolidayValue('holidayName', value.target.value)
                        this.onValueChange('holiday_name', value)
                        this.setState({ holiday_nameInput: value.target.value })
                      }}
                    />,
                  )}
                </Form.Item>
              </Form>
            </div>
          </div>
        ),
        holiday_date: (
          <div style={{ width: '237px' }}>
            <DatePicker
              format="DD MMMM"
              size="large"
              allowClear
              value={holidatDateInput}
              onChange={(date) => {
                setHolidayValue('date', date)
                this.onDateChange('holiday_date', date)
                this.setState({ holidatDateInput: date })
              }}
            />
          </div>
        ),
      }

      const parsedExistingHolidays = [createTab, ...holidaydata]
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
                          `holidaydata[${index - 1}].holiday_name`,
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
                          value={_.get(
                            this.state,
                            `holidaydata[${index - 1}].holiday_name`,
                          )}
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
                          `holidaydata[${index - 1}].holiday_date`,
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
                              `holidaydata[${index - 1}].holiday_date`,
                            )}
                            onChange={(date) => {
                              this.onEditDateField(index - 1, date, 'holiday_date')
                              // this.props.form.setFieldsValue({ [`${record.unique_key}_date`]: date })
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
          } else if (holiday_nameInput && holidatDateInput) {
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
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    return (
      <div>
        <Table
          loading={{
            spinning: isLoading,
            indicator: <Spin indicator={antIcon} />,
          }}
          columns={columns}
          dataSource={generateFirstInputBox()}
          pagination={{ position: 'none', defaultPageSize: 100 }}
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

EditHolidayPresetTable.propTypes = {
  holidaydata: PropTypes.oneOfType([PropTypes.object]),
  holidayName: PropTypes.string,
  date: PropTypes.string,
  setHoliday: PropTypes.oneOfType([PropTypes.object]),
  setHolidayValue: PropTypes.string,
  form: PropTypes.oneOfType([PropTypes.object]),
  setDeleteHoliday: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
}
EditHolidayPresetTable.defaultProps = {
  holidaydata: {},
  form: {},
  holidayName: '',
  date: '',
  setHoliday: {},
  setDeleteHoliday: {},
  setHolidayValue: '',
  components: {},
}
export default withApollo(EditHolidayPresetTable)
