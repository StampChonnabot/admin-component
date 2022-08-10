import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Form, Col } from 'antd'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  TextOnButton,
  TableWrapper,
  Footer,
  InputBox,
  Popup,
  ButtonCustom,
  RowWrapper,
  FirstColumn,
  Star,
} from './components/styled'
import CreateHolidayPresetTable from './components/CreateHolidayPresetTable'
import { CREATE_HOLIDAY_PRESET } from '../../constants'

class CreateHolidayPreset extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      presetName: '',
      holiday: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      isError: false,
      visibleModal: false,
      visibleModalWarning: false,
      date: '',
      holidayName: '',
      typeCancel: 'cancel_general',
      currentModalDetailSecond: '',
    }
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

  onValueChange = (field, e) => {
    this.setState({ [field]: e.target.value })
  }

  handleOk = (type) => {
    const { history } = this.props
    const { presetName, holiday } = this.state
    switch (type) {
      case 'create':
        this.runQueryCreate(presetName, holiday.length, holiday)
        break
      case 'cancel':
        this.setState({ visibleModal: false })
        history.push({
          pathname: '/holidaypreset/list',
        })
        break
      case 'warning':
        this.setState({ visibleModalWarning: false })
        break
      case 'existing_data':
        this.setState({ visibleModalWarning: false })
        this.runQueryCreate(presetName, holiday.length, holiday)
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

  runQueryCreate = async (name, amount, holidays) => {
    const { components, client, history } = this.props
    const { Message } = components
    try {
      await client.mutate({
        mutation: CREATE_HOLIDAY_PRESET,
        variables: {
          name,
          amount,
          holidays,
        },
      })

      Message('success', 'Create holiday preset successful')
      this.setState({ visibleModal: false, visibleModalWarning: false })
      history.push({
        pathname: '/holidaypreset/list',
        state: {
          created: true,
        },
      })
    } catch (error) {
      this.setState({ isError: true })
      Message('error', 'Create holiday preset error')
    }
  }

  handleSubmit = (e) => {
    const { form } = this.props
    const { holidayName, date, holiday } = this.state
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
      if (holiday.length === 0) {
        this.ModalWarning(
          'Warning',
          'Please input holiday at least one day.',
          '',
          'warning',
        )
      } else if (holidayName || date) {
        this.setState({ typeCancel: 'cancel_general' })
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
          'Are you sure you want to create a new holiday preset ?',
          '',
          'create',
          'Cancel',
          'Confirm',
        )
      }
    })
  }

  setHoliday = (value) => {
    this.setState({ holiday: value.holiday })
  }

  setHolidayValue = (field, value) => {
    this.setState({ [field]: value })
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
      currentModalTitle,
      currentModalType,
      currentModalDetail,
      currentModalDetailSecond,
      date,
      holidayName,
      holiday,
      leftModalButton,
      rightModalButton,
      typeCancel,
      visibleModal,
      visibleModalWarning,
    } = this.state
    return (
      <Fragment>
        <StandardContainer subHeader="Create Holiday Preset" loading={false}>
          <Form onSubmit={this.handleSubmit}>
            <RowWrapper>
              <Col span={12}>
                <FirstColumn>
                  <TextOnButton>
                    Preset Name<Star>*</Star>
                  </TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('presetName', {
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
                        placeholder="Please input preset name"
                        style={{ width: '352px' }}
                        onChange={(value) => {
                          this.onValueChange('presetName', value)
                        }}
                      />,
                    )}
                  </Form.Item>
                </FirstColumn>
              </Col>
            </RowWrapper>

            <TableWrapper>
              <Col>
                <CreateHolidayPresetTable
                  components={components}
                  setHoliday={this.setHoliday}
                  setHolidayValue={this.setHolidayValue}
                  date={date}
                  holidayName={holidayName}
                  holidaydata={holiday}
                  form={form}
                />
              </Col>
            </TableWrapper>

            <Footer>
              <Form.Item>
                <Button
                  theme="cancel"
                  size="l"
                  onClick={() => {
                    this.Modal(
                      'Confirmation',
                      'Are you sure you want to discard your changed ?',
                      '',
                      'cancel',
                      'Cancel',
                      'Confirm',
                    )
                  }}
                >
                  Cancel
                </Button>
                <Button size="l" htmlType="submit">
                  Create
                </Button>
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
                    type="primary"
                    onClick={() => {
                      this.handleOk(currentModalType)
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

function mapStateToProps() {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
  }
}
const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}

const CreateHolidayPresetForm = Form.create({ name: 'create_holiday_preset' })(
  CreateHolidayPreset,
)

CreateHolidayPreset.propTypes = {
  history: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
}
CreateHolidayPreset.defaultProps = {
  history: {},
  components: {},
  client: {},
  form: {},
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(CreateHolidayPresetForm))
