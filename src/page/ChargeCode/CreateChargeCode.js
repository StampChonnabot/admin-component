/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { Form, Row, Col, Select, Input, Checkbox } from 'antd'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import _ from 'lodash'
import {
  CREATE_CHARE_CODE,
  GET_EMPLOYEE_LIST,
  GET_CHARGE_CODE_DUPE,
  GET_CHARGE_CODES_LIST
} from '../../constants/index'
import OwnerChargeCodeTable from './components/Table/OwnerCreateChargeCodeTable'
import MemberChargeCodeTable from './components/Table/MemberCreateChargeCodeTable'
import {
  Sectioner,
  TextOnButton,
  InputBox,
  Footer,
  RangePickerCustom,
  SelectButton,
  Popup,
  ButtonCustom,
} from './components/styled'

const { Option } = Select
const { TextArea } = Input


class CreateChargeCode extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      description: '',
      code: '',
      codeName: '',
      startdate: '',
      enddate: '',
      owners: [],
      members: [],
      isActive: true,
      visibilityPrivate: false,
      pageSize: 100,
      currentPage: 1,
      getEmployeeList: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      nonWorkType: false,
      tempStart: null,
      tempEnd: null,
      shouldResetEmployeeDate: false,
      typeCancel: 'cancel_general',
      isExistingDataOwner: false,
      isExistingDataMember: false,
      lastStateDate: '',
      currentModalDetailSecond: '',
      isLeaveType: false
    }
  }


  componentWillMount() {
    const { pageSize, currentPage } = this.state
    this.runQueryGetEmployee(pageSize, currentPage)
  }


  onWarnModalOk = () => {
    const { owners,
      tempStart,
      tempEnd,
      members
    } = this.state

    const tempOwners = _.map(owners, owner => {
      const tempOwner = owner
      tempOwner.roll_on = tempStart
      tempOwner.roll_off = tempEnd
      return tempOwner
    })

    const tempMembers = _.map(members, member => {
      const tempMember = member
      tempMember.roll_on = _.cloneDeep(tempStart)
      tempMember.roll_off = _.cloneDeep(tempEnd)
      return tempMember
    })

    this.setState({
      owners: tempOwners,
      members: tempMembers,
      shouldResetEmployeeDate: true,
      startdate: _.cloneDeep(tempStart),
      enddate: _.cloneDeep(tempEnd)
    })
  }

  checkShouldWarn = (startDate, endDate, value) => {
    const { owners, members } = this.state
    const { form } = this.props
    let passedCheck = true
    // eslint-disable-next-line consistent-return
    _.forEach(owners, owner => {
      if (owner.roll_on.startOf('day').diff(startDate.startOf('day')) < 0 || owner.roll_off.startOf('day').diff(endDate.startOf('day')) > 0) {
        this.setState({
          tempStart: startDate,
          tempEnd: endDate,
        })
        passedCheck = false
        return false
      }
    })
    // eslint-disable-next-line consistent-return
    _.forEach(members, member => {
      if (member.roll_on.startOf('day').diff(startDate.startOf('day')) < 0 || member.roll_off.startOf('day').diff(endDate.startOf('day')) > 0) {
        this.setState({
          tempStart: startDate,
          tempEnd: endDate,
        })
        passedCheck = false
        return false
      }
    })

    if (passedCheck) {
      this.onDateChange('startdate', startDate)
      this.onDateChange('enddate', endDate)
      this.setState({ lastStateDate: value })
      form.setFieldsValue({ 'range-picker': value })
    }
  }

  runQueryGetEmployee = async (limit, page) => {
    const offset = (page - 1) * limit
    const { client } = this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: GET_EMPLOYEE_LIST,
        variables: { limit, offset },
      })
    this.setState({
      getEmployeeList: queryResult.data.employees.employee_list,
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
      currentModalType: type
    })
  }

  // eslint-disable-next-line camelcase
  runQuery = async (limit, offset, status, search_keyword) => {
    const { client } = this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: GET_CHARGE_CODES_LIST,
        variables: { limit, offset, status, search_keyword },
      })
    this.setState({
      getEmployeeList: queryResult.data.employees.employee_list,
    })
  }

  setOwners = (value) => {
    this.setState({ owners: value.owners })
  }

  setMembers = (value) => {
    this.setState({ members: value.members })
  }


  setIsExistingData = (field, value) => {
    this.setState({ [field]: value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { form } = this.props
    const {
      owners,
      isExistingDataOwner,
      isExistingDataMember
    } = this.state

    form.validateFieldsAndScroll((err) => {
      if (err) {
        return
      }
      if (owners.length === 0) {
        this.ModalWarning('Warning', 'Please select at least one owner.', '', 'warning')
      }
      else if (isExistingDataOwner) {
        this.setState({ typeCancel: 'cancel_existing_owner' })
        this.Modal('Warning', "You haven't added owner.", 'Are you sure you want to continue ?', 'existing_owner', 'Cancel', 'Confirm')
      } else if (isExistingDataMember) {
        this.setState({ typeCancel: 'cancel_existing_member' })
        this.Modal('Warning', "You haven't added member.", 'Are you sure you want to continue ?', 'existing_member', 'Cancel', 'Confirm')
      } else {
        this.setState({ typeCancel: 'cancel_general' })
        this.Modal('Confirmation', 'Are you sure you want to create a charge code ?', '', 'create', 'Cancel', 'Confirm')
      }
    })
  };


  handleCancel = type => {
    const { form } = this.props
    const { lastStateDate } = this.state
    switch (type) {
      case 'cancel_general':
        this.setState({
          visibleModal: false,
          visibleModalWarning: false
        })
        break
      case 'cancel_existing_owner':
        this.setState({
          visibleModal: false,
          typeCancel: 'cancel_general',
          visibleModalWarning: false
        })
        break
      case 'cancel_existing_member':
        this.setState({
          visibleModal: false,
          typeCancel: 'cancel_general',
          visibleModalWarning: false
        })
        break
      case 'warning':
        this.setState({
          visibleModalWarning: false
        })
        form.setFieldsValue({ 'range-picker': lastStateDate })
        break
      default:
        this.setState({
          visibleModalWarning: false
        })
        break
    }
  };

  handleOk = (type) => {
    const {
      owners,
      members,
      codeName,
      isLeaveType,
      isActive,
      startdate,
      enddate,
      visibilityPrivate,
      description,
      code,
      nonWorkType,
    } = this.state

    const { history } = this.props

    let employees = _.cloneDeep(owners)
    let tempCodeName = ''

    switch (type) {
      case 'create':
        if (members.length !== 0) {
          _.each(members, (value) => {
            employees = [...employees, value]
          })
        }
        tempCodeName = _.clone(codeName)

        if (isLeaveType) {
          tempCodeName = `[LEAVE] - ${codeName}`
        }
        this.runQueryCreate(
          isActive,
          tempCodeName,
          startdate,
          enddate,
          visibilityPrivate,
          description,
          code,
          employees,
          nonWorkType,
        )
        break
      case 'cancel':
        this.setState({ visibleModal: false })
        history.push({
          pathname: '/chargecode/list'
        })
        break
      case 'existing_owner':
        this.setState({ visibleModalWarning: false })
        if (members.length !== 0) {
          _.each(members, (value) => {
            employees = [...employees, value]
          })
        }
        this.runQueryCreate(
          isActive,
          codeName,
          startdate,
          enddate,
          visibilityPrivate,
          description,
          code,
          employees,
          nonWorkType
        )
        break
      case 'existing_member':
        this.setState({ visibleModalWarning: false })
        if (members.length !== 0) {
          _.each(members, (value) => {
            employees = [...employees, value]
          })
        }
        this.runQueryCreate(
          isActive,
          codeName,
          startdate,
          enddate,
          visibilityPrivate,
          description,
          code,
          employees,
          nonWorkType
        )
        break
      default:
        break
    }

  };

  handleOKToCancel = () => {
    const { history } = this.props
    history.push({
      pathname: '/chargecode/list'
    })
  }

  onSeletedVisibility = (value) => {
    if (value === 'private') {
      this.setState({ visibilityPrivate: true })
    } else {
      this.setState({ visibilityPrivate: false })
    }
  }

  onSeletedIsActive = (value) => {
    if (value === 'active') {
      this.setState({ isActive: true })
    } else {
      this.setState({ isActive: false })
    }
  }

  onDateChange = (field, date) => {
    this.setState({ [field]: date })

  }

  runQueryCheckCode = (code) => {
    const { client } = this.props
    return new Promise(async (res) => {
      await client.resetStore()
      const queryResult = await
        client.query({
          query: GET_CHARGE_CODE_DUPE,
          variables: { search_keyword: code },
        })
      const alreadyExist = queryResult.data.charge_codes.total > 0
      if (alreadyExist) {
        this.setState({
        })
      } else {
        this.setState({
          code
        })
      }
      res(alreadyExist)
    })
  }

  onNameChange = (field, event) => {
    this.setState({ [field]: event })

  }

  onChangeNonWorkType = (value) => {
    this.setState({
      nonWorkType: value,
      isLeaveType: ''
    })
  }

  setReset = () => {
    this.setState({ shouldResetEmployeeDate: false })
  }

  runQueryCreate = async (
    is_active,
    name,
    start_date,
    end_date,
    visibility_private,
    description,
    code,
    employees,
    is_not_work) => {
    const { history, client } = this.props
    await client.resetStore()
    await client.mutate({
      mutation: CREATE_CHARE_CODE,
      variables: { is_active, name, start_date, end_date, visibility_private, description, code, employees, is_not_work }
    })
    history.push('/chargecode/list')
    this.setState({ visibleModal: false })
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
  };

  validateToDescriptionText = (rule, value, callback) => {
    try {
      if (value && value.length > 50) {
        callback('Character must be no longer than 50 characters.')
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };

  validateToDuplicate = async (rule, value, callback) => {
    const { code } = this.state
    try {
      if (value && value.length === 6) {
        if (await this.runQueryCheckCode(value)) {
          callback(`${code} already exist, please use a different code.`)
        }
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };

  render() {
    const { components, form } = this.props
    const { Button, StandardContainer } = components
    const { getFieldDecorator } = form
    const { currentModalDetailSecond,
      currentModalDetail,
      currentModalType,
      typeCancel,
      leftModalButton,
      rightModalButton,
      visibleModal,
      currentModalTitle,
      visibleModalWarning,
      visibilityPrivate,
      shouldResetEmployeeDate,
      tempStart,
      tempEnd,
      startdate,
      enddate,
      owners,
      members,
      isExistingDataMember,
      getEmployeeList,
      isExistingDataOwner,
      nonWorkType,
      isLeaveType,
      lastStateDate
    } = this.state
    return (
      <Fragment>
        <StandardContainer subHeader="Create Charge Code" loading={false}>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Row style={{ paddingTop: '24px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Charge Code Name <span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('Description', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input charge code name !'
                        },
                        {
                          validator: this.validateToDescription,
                        },
                        {
                          pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                          message: 'Charge code can not contain any of the following characters: /:*!@#$%&^| !!',
                        }
                      ],
                    })(
                      <InputBox
                        maxlength="31"
                        style={{ width: '100%', height: '40px', fontSize: '16px' }}
                        placeholder="Charge code name"
                        onChange={value => { this.onNameChange('codeName', value.target.value) }}
                      />
                    )}
                  </Form.Item>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ paddingRight: '24px' }}>
                  <TextOnButton>Charge Code (6 characters) <span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('ChargeCode', {
                      validate: [
                        {
                          trigger: ['onChange', 'onBlur'],
                          rules: [
                            {
                              len: 6,
                              message: 'Charge code must be 6 characters'
                            },
                            {
                              required: true,
                              message: 'Please input charge code !'
                            },
                            {
                              pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                              message: 'Charge code can not contain any of the following characters: /:*!@#$%&^| !!',
                            },
                          ],
                        },
                        {
                          trigger: 'onBlur',
                          rules: [

                            {
                              validator: this.validateToDuplicate,
                            },

                          ],
                        }
                      ]
                    })(
                      <InputBox
                        maxlength="6"
                        style={{ width: '100%', height: '40px', fontSize: '16px' }}
                        placeholder='Charge code'
                        onBlur={value => { this.onNameChange('code', value.target.value) }}
                      />
                    )}
                  </Form.Item>
                </div>
              </Col>
            </Row>

            <Row style={{ paddingTop: '16px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Start Date - End Date <span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('range-picker', {
                      rules: [{ type: 'array', required: true, message: 'Please select time !' }]
                    })(
                      <RangePickerCustom
                        allowClear={false}
                        size='large'
                        format='DD MMM YYYY'
                        value={lastStateDate}
                        onChange={(value) => {
                          this.checkShouldWarn(value[0], value[1], value)
                        }}
                      />
                    )}
                  </Form.Item>
                </div>
              </Col>

              <Col span={12}>
                <div style={{ paddingRight: '24px' }}>
                  <TextOnButton>Charge Code Type <span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('select', {
                      rules: [{ required: true, message: 'Please select charge code type !' }],
                    })(
                      <SelectButton
                        onChange={(value) => {
                          this.onSeletedVisibility(value)
                        }}
                        placeholder='Charge code type'
                      >
                        <Option value="private">Private</Option>
                        <Option value="public">Pubilc</Option>
                      </SelectButton>,
                    )}
                  </Form.Item>
                </div>
              </Col>
            </Row>

            <Row style={{ paddingTop: '16px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Charge Code Description</TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('ProjectProject', {
                      rules: [
                        {
                          validator: this.validateToDescriptionText,
                        },
                        {
                          pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                          message: 'Charge code description can not contain any of the following characters: /:*!@#$%&^| !!',
                        },
                      ],
                    })(
                      <TextArea
                        style={{ height: '120px', fontSize: '16px' }}
                        maxlength='51'
                        placeholder='Charge code description'
                        onChange={(value) => { this.onNameChange('description', value.target.value) }}
                      />
                    )}
                  </Form.Item>
                </div>
              </Col>

              <Col span={12}>
                <div style={{ paddingRight: '24px' }}>
                  <TextOnButton>Charge Code Status <span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('is-active', {
                      rules: [{ required: true, message: 'Please select charge code status !' }],
                    })(
                      <SelectButton
                        onChange={(value) => {
                          this.onSeletedIsActive(value)
                        }}
                        placeholder="Charge code status"
                      >
                        <Option value="active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                      </SelectButton>,
                    )}
                  </Form.Item>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ paddingRight: '24px' }}>
                  <TextOnButton>Working Type <span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('checkbox-group', {
                      rules: [{ required: true, message: 'Please select working type !' }]
                    })(
                      <SelectButton
                        onChange={(value) => {
                          this.onChangeNonWorkType(value)
                        }}
                        placeholder="Working type"
                      >
                        <option value={false}>Billable</option>
                        <option value>Non-Billable</option>
                      </SelectButton>
                    )}
                  </Form.Item>
                </div>
                <div>
                  <Col span={12}>
                    <Checkbox
                      disabled={!nonWorkType}
                      checked={isLeaveType}
                      onChange={(value) => {
                        this.setState({ isLeaveType: value })
                      }}
                    >Leave Type
                    </Checkbox>
                  </Col>
                </div>
              </Col>
            </Row>

            <Row style={{ paddingTop: '48px' }}>
              <Col>
                <Sectioner>Owner</Sectioner>
              </Col>
            </Row>
            <Row style={{ paddingTop: '16px', paddingRight: '24px', paddingLeft: '24px' }}>
              <OwnerChargeCodeTable
                setReset={this.setReset}
                shouldResetDate={shouldResetEmployeeDate}
                forcedStartDate={tempStart}
                forcedEndDate={tempEnd}
                start_date={startdate}
                end_date={enddate}
                memberList={members}
                employeeList={getEmployeeList}
                setOwners={this.setOwners}
                isExistingDataOwner={isExistingDataOwner}
                setIsExistingData={this.setIsExistingData}
                pagination={{ position: 'none' }}
                components={components}
              />
            </Row>

            {visibilityPrivate === true ?
              (
                <div>
                  <Row
                    style={{ paddingTop: '48px' }}
                  >
                    <Col>
                      <Sectioner>Member</Sectioner>
                    </Col>
                  </Row>
                  <Row style={{ paddingTop: '16px', paddingRight: '24px', paddingLeft: '24px' }}>
                    <MemberChargeCodeTable
                      shouldResetDate={shouldResetEmployeeDate}
                      forcedStartDate={tempStart}
                      forcedEndDate={tempEnd}
                      start_date={startdate}
                      end_date={enddate}
                      pagination={{ position: 'none' }}
                      ownerList={owners}
                      isExistingDataMember={isExistingDataMember}
                      setIsExistingData={this.setIsExistingData}
                      employeeList={getEmployeeList}
                      setMembers={this.setMembers}
                      components={components}
                    />
                  </Row>
                </div>
              )
              : null}

            <Footer>
              <Form.Item>
                <Button
                  theme='cancel'
                  onClick={() => {
                    this.Modal('Confirmation', 'Are you sure you want to discard your changes ?', '', 'cancel', 'Cancel', 'Confirm')
                  }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit">Create</Button>

              </Form.Item>
            </Footer>
          </Form>

          <div>
            <Popup
              title={currentModalTitle}
              visible={visibleModalWarning}
              onOk={this.handleCancel}
              footer={[
                <ButtonCustom type="primary" onClick={this.handleCancel}>Ok</ButtonCustom>
              ]}
            >
              {currentModalDetail}<br />
              {currentModalDetailSecond}
            </Popup>
          </div>

          <Popup
            title={currentModalTitle}
            visible={visibleModal}
            footer={[
              <Button theme="cancel" key="back" onClick={() => { this.handleCancel(typeCancel) }}>{leftModalButton}</Button>,
              <Button onClick={() => { this.handleOk(currentModalType) }} key="submit" type="primary">{rightModalButton}</Button>]}
          >
            {currentModalDetail}  <br />
            {currentModalDetailSecond}
          </Popup>

        </StandardContainer>
      </Fragment>
    )
  }

}

CreateChargeCode.propTypes = {
  components: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object])
}

CreateChargeCode.defaultProps = {
  components: {},
  form: {},
  history: {},
  client: {}
}

const NewCreateChargeCode = Form.create({ name: 'normal_login' })(CreateChargeCode)

export default withApollo(NewCreateChargeCode)
