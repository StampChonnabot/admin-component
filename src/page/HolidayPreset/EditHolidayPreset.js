/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Form, Col } from 'antd'
import _ from 'lodash'
import {
  TextOnButton,
  TableWrapper,
  Footer,
  RowWrapper,
  FirstColumn,
  Star,
  Popup,
  ButtonCustom,
  InputBox,
} from './components/styled'
import EditHolidayPresetTable from './components/EditHolidayPresetTable'
import { EDIT_HOLIDAY_PRESET } from '../../constants'

class EditHolidayPreset extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      details: null,
      holidays: null,
      userId: null,
      isError: false,
      presetnameInput: null,
      delete_holiday: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      typeCancel: 'cancel_general',
      currentModalDetailSecond: '',
    }
  }

  componentWillMount() {
    const { location, userId } = this.props
    this.setState({
      details: location.state.currentPreset,
      holidays: location.state.holidays,
      userId: parseInt(userId, 10),
      presetnameInput: location.state.presetName,
    })
  }

  Modal = (title, detail, second, type, left, right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalDetailSecond: second,
      currentModalType: type,
      leftModalButton: left,
      rightModalButton: right,
    })
  }

  ModalWarning = (title, detail, second, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalDetailSecond: second,
      currentModalType: type,
    })
  }

  setDeleteHoliday = (value) => {
    const newData = []
    _.each(value.deletedItems, (Item) => {
      newData.push(Item.id)
    })
    this.setState({ delete_holiday: newData })
  }

  setHoliday = (value) => {
    this.setState({ holidays: value.holidays })
  }

  setHolidayValue = (field, value) => {
    this.setState({ [field]: value })
  }

  checkDatePassed = (index) => {
    return (
      moment(_.get(this.state, `details[${index - 1}].holiday_date`)).valueOf() >=
      moment().valueOf()
    )
  }

  onValueChange = (field, e) => {
    this.setState({ [field]: e.target.value })
  }

  handleOk = (type) => {
    const { holidays, presetnameInput, userId, delete_holiday, details } = this.state
    const { client, setBreadCrumb, history, location } = this.props
    const holidayset = _.cloneDeep(holidays)
    switch (type) {
      case 'edit':
        client.resetStore()
        this.runQueryEdit(
          presetnameInput,
          holidays.length,
          holidayset,
          userId,
          delete_holiday,
          details,
        )
        setBreadCrumb([
          {
            url: '/holidaypreset/list',
            text: 'Holiday Preset List',
            inactive: true,
            backIndex: 2,
          },
          { url: '/holidaypreset/details', text: 'Holiday Preset Details' },
        ])
        break

      case 'warning':
        this.setState({ visibleModalWarning: false })
        break
      case 'cancel':
        this.setState({ visibleModal: false })
        history.push({
          pathname: '/holidaypreset/list',
          state: {
            currentPreset: location.state.currentPreset,
          },
        })
        break
      case 'existing_data':
        client.resetStore()
        this.runQueryEdit(
          presetnameInput,
          holidays.length,
          holidayset,
          userId,
          delete_holiday,
          details,
        )
        break
      default:
        break
    }
  }

  handleCancel = (type) => {
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
          typeCancel: 'cancel_general',
        })
        break
      default:
        this.setState({
          visibleModal: false,
          visibleModalWarning: false,
        })
        break
    }
  }

  parserHoliday = (holidays) => {
    if (holidays['id']) {
      return {
        id: holidays.id,
        holiday_name: holidays.holiday_name,
        holiday_date: moment(holidays.holiday_date),
      }
    } else {
      return {
        holiday_name: holidays.holiday_name,
        holiday_date: moment(holidays.holiday_date),
      }
    }
  }

  runQueryEdit = async (
    name,
    amount,
    inputHolidays,
    updated_by,
    delete_holiday_ids,
    id,
  ) => {
    const { components, client, history } = this.props
    const { Message } = components
    const { details } = this.state
    const holidays = _.map(inputHolidays, (hol) => {
      const tempHol = _.cloneDeep(hol)
      delete tempHol.unique_key
      return tempHol
    })
    try {
      await client.mutate({
        mutation: EDIT_HOLIDAY_PRESET,
        variables: {
          name,
          amount,
          holidays,
          updated_by,
          delete_holiday_ids,
          id,
        },
      })
      Message('success', 'Edit holiday preset successful')
      this.setState({
        visible: false,
        visibleModalWarning: false,
      })

      history.replace({
        pathname: '/holidaypreset/details',
        state: {
          currentPreset: details,
          created: true,
        },
      })
    } catch (error) {
      Message('error', 'Edit holiday preset error')
      this.setState({ isError: true })
    }
  }

  handleSubmit = (e) => {
    const { form } = this.props
    const { holidays, holidayName, date, presetnameInput } = this.state
    e.preventDefault()
    form.validateFields((err) => {
      let tempError = {}
      if (err) {
        tempError = _.clone(err)
        delete tempError.holiday_name_box
      }
      if (Object.keys(tempError).length > 0) {
        return
      }
      if (holidays.length === 0) {
        this.ModalWarning(
          'Warning',
          'Please input holiday at least one day.',
          '',
          'warning',
        )
      } else if (holidayName || date) {
        this.setState({ typeCancel: 'cancel_existing_data' })
        this.Modal(
          'Warning',
          "You haven't added the holiday.",
          'Are you sure you want to continue?',
          'existing_data',
          'Cancel',
          'Confirm',
        )
      } else {
        this.setState({ typeCancel: 'cancel_general' })
        this.Modal(
          'Confirmation',
          `Are you sure you want to update ${presetnameInput} ?`,
          '',
          'edit',
          'Cancel',
          'Confirm',
        )
      }
    })
  }

  validateToDescription = (rule, value, callback) => {
    try {
      if (value && value.length > 30) {
        callback('Character must be no longer than 30 characters !')
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  }

  render() {
    const { form, components } = this.props
    const { getFieldDecorator } = form
    const { Button, StandardContainer } = components
    const {
      presetnameInput,
      date,
      holidayName,
      holidays,
      currentModalTitle,
      visibleModal,
      typeCancel,
      leftModalButton,
      currentModalType,
      rightModalButton,
      currentModalDetail,
      currentModalDetailSecond,
      visibleModalWarning,
    } = this.state

    return (
      <Fragment>
        <StandardContainer subHeader="Edit Holiday Preset" loading={false}>
          <Form onSubmit={this.handleSubmit}>
            <RowWrapper>
              <Col span={12}>
                <FirstColumn>
                  <TextOnButton>
                    Preset Name<Star>*</Star>
                  </TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('preset_name', {
                      initialValue: presetnameInput,
                      rules: [
                        {
                          required: true,
                          message: 'Please input preset name !',
                        },
                        {
                          validator: this.validateToDescription,
                        },
                        {
                          pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                          message:
                            'Preset name can not contain any of the following characters: /:*!@#$%&^| !!',
                        },
                        {
                          pattern: new RegExp('(?!^ +$)^.+$'),
                          message: 'Must contain more than empty space',
                        },
                      ],
                    })(
                      <InputBox
                        maxlength="31"
                        style={{ width: '352px' }}
                        onChange={(value) => {
                          this.onValueChange('presetnameInput', value)
                        }}
                      />,
                    )}
                  </Form.Item>
                </FirstColumn>
              </Col>
            </RowWrapper>

            <TableWrapper>
              <EditHolidayPresetTable
                setDeleteHoliday={this.setDeleteHoliday}
                components={components}
                setHoliday={this.setHoliday}
                date={date}
                setHolidayValue={this.setHolidayValue}
                holidayName={holidayName}
                holidaydata={holidays}
                form={form}
              />
            </TableWrapper>

            <Footer>
              <Form.Item>
                <Button
                  theme="cancel"
                  onClick={() => {
                    this.Modal(
                      'Confirmation',
                      'Are you sure you want to discard your changed ? ',
                      '',
                      'cancel',
                      'Cancel',
                      'Confirm',
                    )
                  }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit">Save</Button>
              </Form.Item>

              <Popup
                title={currentModalTitle}
                visible={visibleModal}
                footer={[
                  <Button
                    theme="cancel"
                    key="back"
                    onClick={() => {
                      this.handleCancel(typeCancel)
                    }}
                  >
                    {leftModalButton}
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
                <br />
                {currentModalDetailSecond}
              </Popup>

              <Popup
                title={currentModalTitle}
                visible={visibleModalWarning}
                footer={[
                  <ButtonCustom
                    key="back"
                    onClick={() => {
                      this.handleCancel(typeCancel)
                    }}
                  >
                    Ok
                  </ButtonCustom>,
                ]}
              >
                {currentModalDetail}
                <br />
                {currentModalDetailSecond}
              </Popup>
            </Footer>
          </Form>
        </StandardContainer>
      </Fragment>
    )
  }
}

const EditHolidayPresetForm = Form.create({ name: 'edit_holiday_preset' })(
  EditHolidayPreset,
)
EditHolidayPreset.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  userId: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
  history: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
}
EditHolidayPreset.defaultProps = {
  location: {},
  userId: {},
  client: {},
  history: {},
  components: {},
  form: {},
}
export default withApollo(EditHolidayPresetForm)
