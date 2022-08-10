/* eslint-disable react/destructuring-assignment */
/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Select, Col } from 'antd'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { EDIT_WORK_PRESET, GET_WORK_PRESET_DETAILS } from '../../constants/index'
import {
  Picker,
  ContentWrapper,
  ButtonWrapper,
  InputBox,
  SelectBox,
  Check,
  Popup,
  FormCreate,
} from './component/styles'

const { Option } = Select

class EditWorkPresetComponents extends React.Component {
  constructor(props) {
    super(props)
    const { location } = this.props
    this.state = {
      currentData: location.state.currentData,
      work_day: location.state.work_day,
      presetNameInput: '',
      workTypeInput: '',
      startTimeInput: '',
      endTimeInput: '',
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      currentID: location.state.currentID,
    }
  }

  componentWillMount() {
    const { actionSetTitle, location } = this.props
    actionSetTitle('Work Presets')
    this.runQuery(`${location.state.currentID}`)
  }

  runQuery = async (id) => {
    const { client } = this.props
    const queryResult = await client.query({
      query: GET_WORK_PRESET_DETAILS,
      variables: { id },
    })
    this.setState({
      currentData: queryResult.data.work_preset,
      startTimeInput: moment(queryResult.data.work_preset.start_time),
      endTimeInput: moment(queryResult.data.work_preset.end_time),
      workTypeInput: queryResult.data.work_preset.type,
      presetNameInput: queryResult.data.work_preset.name,
    })
  }

  Modal = (title, detail, type, left, right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
      leftModalButton: left,
      rightModalButton: right,
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

  onChangeTime = (field, e) => {
    this.setState({ [field]: e })
  }

  onChangeValue = (field, value) => {
    this.setState({ [field]: value })
  }

  onChangeText = (field, value) => {
    const name = value.target.value
    this.setState({ [field]: name })
  }

  onChangeCheck = (index, value) => {
    const { checkedDate } = this.state
    const updatedCheckDate = _.cloneDeep(checkedDate)
    updatedCheckDate[index] = value.target.checked
    this.setState({ checkedDate: updatedCheckDate })
  }

  parseCheckDate = (dateArray) => {
    const parsedDateArray = dateArray.split(',')
    return parsedDateArray
  }

  runQueryEdit = async (id, name, type, start_time, end_time, work_day, updated_by) => {
    const { components, client, history, location } = this.props
    const { Message } = components
    await client.resetStore()
    try {
      client.mutate({
        mutation: EDIT_WORK_PRESET,
        variables: { id, name, type, start_time, end_time, work_day, updated_by },
      })
      Message('success', 'Edit work preset successful')
      history.replace({
        pathname: '/workpreset/details',
        state: {
          currentID: location.state.currentID,
          updated: true,
          work_day: this.serializeDate(this.state.work_day),
        },
      })
      this.setState({ visibleModal: false })
    } catch (error) {
      Message('error', 'Edit work preset error')
    }
  }

  serializeDate = (inputDate) => {
    let output = ''
    _.each(inputDate, (value) => {
      output += this.checkToAddComma(output, value)
    })
    return output
  }

  checkToAddComma = (inputString, toAdd) => {
    if (_.isEmpty(inputString)) {
      return toAdd
    } else {
      return `,${toAdd}`
    }
  }

  handleSubmit = (e) => {
    const { form } = this.props
    e.preventDefault()
    form.validateFields((err) => {
      if (!err) {
        this.checkTime()
      }
    })
  }

  checkTime = () => {
    const { startTimeInput, endTimeInput, currentData } = this.state
    const value1 = startTimeInput
    const value2 = endTimeInput

    if (value2 > value1) {
      const sum = value2 - value1

      if (sum < 3600000) {
        this.ModalWarning('Warning', 'Please input time at lease 1 Hour!', 'warning')
      } else if (sum >= 3600000 && sum <= 32400000) {
        this.Modal(
          'Confirmation',
          `Are you sure you want to update ${currentData.name} ?`,
          'edit',
          'Cancel',
          'Confirm',
        )
      } else {
        this.ModalWarning('Warning', 'Can not input time over than 8 Hours!', 'warning')
      }
    } else {
      const sum = value1 - value2

      if (sum <= 0) {
        this.ModalWarning('Warning', 'Please input time at lease 1 Hour!', 'warning')
      } else if (sum >= 6000 && sum < 54000000) {
        this.ModalWarning('Warning', 'Please check your input time!', 'warning')
      } else {
        this.Modal(
          'Confirmation',
          `Are you sure you want to update ${currentData.name} ?`,
          'edit',
          'Cancel',
          'Confirm',
        )
      }
    }
  }

  onChangeWorkDay = (value) => {
    this.setState({ work_day: value })
  }

  handleCancel = () => {
    this.setState({
      visibleModal: false,
    })
  }

  handleOk = (type) => {
    const {
      currentID,
      presetNameInput,
      workTypeInput,
      startTimeInput,
      endTimeInput,
      work_day,
    } = this.state
    const { setBreadCrumb, history, location } = this.props
    switch (type) {
      case 'edit':
        this.runQueryEdit(
          currentID,
          presetNameInput,
          workTypeInput,
          moment(startTimeInput),
          moment(endTimeInput),
          this.serializeDate(work_day),
          1,
        )
        setBreadCrumb([
          {
            url: '/workpreset/list',
            text: 'Work Preset List',
            inactive: true,
            backIndex: 2,
          },
          { url: '/workpreset/details', text: 'Work Presets Details' },
        ])
        break
      case 'warning':
        this.setState({ visibleModalWarning: false })
        break
      case 'cancel':
        this.setState({ visibleModal: false })
        history.push({
          pathname: '/workpreset/list',
          state: {
            currentID: location.state.currentID,
          },
        })
        break
      default:
        break
    }
  }

  validateToDescription = (rule, value, callback) => {
    try {
      if (value && value.length > 30) {
        callback('Character must be no longer than 30 characters')
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
      presetNameInput,
      workTypeInput,
      startTimeInput,
      endTimeInput,
      work_day,
      currentModalTitle,
      visibleModal,
      visibleModalWarning,
      leftModalButton,
      currentModalType,
      rightModalButton,
      currentModalDetail,
    } = this.state
    return (
      <Fragment>
        <StandardContainer subHeader="Edit Work Preset" loading={false}>
          <FormCreate onSubmit={this.handleSubmit}>
            <ContentWrapper>
              <Col span={12}>
                <FormCreate.Item label="Preset Name" hasFeedback required>
                  {getFieldDecorator('name', {
                    initialValue: presetNameInput,
                    rules: [
                      { required: true, message: 'Please input preset name !' },
                      {
                        validator: this.validateToDescription,
                      },
                      {
                        pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                        message:
                          'Preset name can not contain any of the following characters: /:*!@#$%&^|',
                      },
                    ],
                  })(
                    <InputBox
                      maxlength="31"
                      onChange={(value) => {
                        this.onChangeText('presetNameInput', value)
                      }}
                    />,
                  )}
                </FormCreate.Item>
              </Col>

              <Col span={12}>
                <FormCreate.Item label="Work Type" hasFeedback required>
                  <SelectBox
                    optionFilterProp="children"
                    value={workTypeInput}
                    onChange={(value) => {
                      this.onChangeValue('workTypeInput', value)
                    }}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                  >
                    <Option value="Strict">Strict Schedule</Option>
                    <Option value="Flexible">Flexible Schedule</Option>
                  </SelectBox>
                </FormCreate.Item>
              </Col>
            </ContentWrapper>

            <ContentWrapper>
              <Col span={12}>
                <FormCreate.Item label="Start Time" hasFeedback required>
                  {getFieldDecorator('start', {
                    initialValue: moment(startTimeInput, 'LT'),
                    rules: [{ required: true, message: 'Please select start time!' }],
                  })(
                    <Picker
                      use12Hours
                      minuteStep={15}
                      onChange={(time) => {
                        this.onChangeTime('startTimeInput', time)
                      }}
                      format="h:mm A"
                    />,
                  )}
                </FormCreate.Item>
              </Col>

              <Col span={12}>
                <FormCreate.Item label="End Time" hasFeedback required>
                  {getFieldDecorator('end', {
                    initialValue: moment(endTimeInput, 'LT'),
                    rules: [{ required: true, message: 'Please select end time!' }],
                  })(
                    <Picker
                      use12Hours
                      minuteStep={15}
                      onChange={(time) => {
                        this.onChangeTime('endTimeInput', time)
                      }}
                      format="h:mm A"
                    />,
                  )}
                </FormCreate.Item>
              </Col>
            </ContentWrapper>

            <ContentWrapper>
              <Col span={12}>
                <FormCreate.Item label="Work Day" hasFeedback required>
                  {getFieldDecorator('day', {
                    initialValue: work_day,
                    rules: [
                      { required: true, message: 'Please select at least one day!' },
                    ],
                  })(
                    <Check.Group onChange={this.onChangeWorkDay}>
                      <Check value="MON">Monday</Check>
                      <br />

                      <Check value="TUE">Tuesday</Check>
                      <br />

                      <Check value="WED">Wednesday</Check>
                      <br />

                      <Check value="THU">Thursday</Check>
                      <br />

                      <Check value="FRI">Friday</Check>
                      <br />
                      <Check value="SAT">Saturday</Check>
                      <br />
                      <Check value="SUN">Sunday</Check>
                    </Check.Group>,
                  )}
                </FormCreate.Item>
              </Col>
            </ContentWrapper>
            <ButtonWrapper>
              <Button
                theme="cancel"
                onClick={() => {
                  this.Modal(
                    'Confirmation',
                    'Are you sure you want to discard your changes ?',
                    'cancel',
                    'Cancel',
                    'Confirm',
                  )
                }}
              >
                Cancel
              </Button>
              <FormCreate.Item>
                <Button htmlType="submit">Save</Button>{' '}
              </FormCreate.Item>
            </ButtonWrapper>

            <Popup
              title={currentModalTitle}
              visible={visibleModal}
              footer={[
                <Button theme="cancel" onClick={this.handleCancel}>
                  {leftModalButton}
                </Button>,
                <Button
                  onClick={() => {
                    this.handleOk(currentModalType)
                  }}
                >
                  {rightModalButton}
                </Button>,
              ]}
            >
              <p>{currentModalDetail}</p>
            </Popup>

            <Popup
              title={currentModalTitle}
              visible={visibleModalWarning}
              footer={[
                <Button
                  onClick={() => {
                    this.handleOk(currentModalType)
                  }}
                >
                  Ok
                </Button>,
              ]}
            >
              <p>{currentModalDetail}</p>
            </Popup>
          </FormCreate>
        </StandardContainer>
      </Fragment>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
  }
}

const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
  }
}
const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}
EditWorkPresetComponents.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  actionSetTitle: PropTypes.func,
  client: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func,
}

EditWorkPresetComponents.defaultProps = {
  location: {},
  actionSetTitle: () => {},
  client: {},
  components: {},
  history: {},
  form: {},
  setBreadCrumb: () => {},
}

const EditWorkPresetForm = FormCreate.create({ name: 'edit_work_preset' })(
  EditWorkPresetComponents,
)
export default connect(null, mapDispatchToProps)(withApollo(EditWorkPresetForm))
