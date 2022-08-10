import _ from 'lodash'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import React, { Fragment } from 'react'
import { Row, Col, Form } from 'antd'
import CreateReportConfigurationListTable from './components/Table/CreateReportConfigurationListTable'
import { CREATE_REPORT_CODE_SET } from '../../constants/index'
import {
  InputBox,
  TextOnButton,
  Footer,
  Popup
} from './components/styled'


class CreateReportConfiguration extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chargecode: [],
      reportname: '',
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      isExistingData: false,
      currentModalDetailSecond: ''
    }
  }

  Modal = (title, detail,second, type, left, right) => {
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

  ModalWarning = (title, detail,second, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalDetailSecond: second,
      currentModalType: type
    })
  };

  setChargeCode = (value) => {
    const arrChargeCode = []
    _.each(value.chargecode, Item => {
      arrChargeCode.push(Item.id)
    })
    this.setState({ chargecode: arrChargeCode })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { form } = this.props
    const {chargecode,isExistingData} = this.state
    form.validateFields((err) => {
      if (err) {
        return
      }
      if (chargecode.length === 0) {
        this.ModalWarning('Warning', 'Please input Charge code at least one code.','', 'warning')
      }
      else if (isExistingData) {
        this.Modal('Warning', "You haven't added charge code.", 'Are you sure you want to continue ?', 'existing_data', 'Cancel', 'Confirm')
      } else {
        this.Modal('Confirmation', 'Are you sure you want to create a new report configuration ?','', 'create', 'Cancel', 'Confirm')
      }
    })
  };

  handleOk = (type) => {
    const {chargecode,reportname} =this.state
    const {history} = this.props
    switch (type) {
      case 'create':
        this.runQueryCreate(
         chargecode,
          reportname,
        )
        break
      case 'warning':
        this.setState({ visibleModalWarning: false })
        break
      case 'cancel':
        history.push({
          pathname: '/chargecode/list',
          state: {
            activeTab: '2'
          }
        })
        this.setState({ visibleModal: false })
        break
      case 'existing_data':
        this.setState({ visibleModalWarning: false})
        this.runQueryCreate(
          chargecode,
          reportname,
        )
        break
      default:
        break
    }
  }

  handleCancel = () => {
    this.setState({
      visibleModal: false,
      visibleModalWarning: false,
    })
  };

  runQueryCreate = async (
    // eslint-disable-next-line camelcase
    charge_code_ids,
    name) => {
      const {client,history} = this.props
    await client.resetStore()
    await client.mutate({
        mutation: CREATE_REPORT_CODE_SET,
        variables: {
          charge_code_ids,
          name,
        }
      })
   history.push({
      pathname: '/chargecode/list',
      state: {
        activeTab: '2'
      }
    })
    this.setState({ visibleModal: false , visibleModalWarning: false})
  }

  onNameChange = (field, event) => {
    const {value} = event.target
    this.setState({ [field]: value })
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

  setExistingData = (value) => {
    this.setState({ isExistingData: value })
  }


  render() {
    const { components, form } = this.props
    const { Button, StandardContainer } = components
    const { getFieldDecorator } = form
    const {
      currentModalTitle,
      visibleModalWarning,
      isExistingData,
      visibleModal,
      currentModalType,
      typeCancel,
      leftModalButton,
      rightModalButton,
      currentModalDetail,
      currentModalDetailSecond
    } = this.state
    return (
      <Fragment>
        <StandardContainer subHeader="Create Report Set">
          <Form onSubmit={this.handleSubmit} className="form">
            <Row style={{ paddingTop: '24px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Report Name<span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('Name', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input report name !'
                        },
                        {
                          validator: this.validateToDescription,
                        },
                        {
                          pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                          message: 'Report name can not contain any of the following characters: /:*!@#$%&^| !!',
                        },
                      ],
                    })(
                      <InputBox
                        maxlength='31'
                        placeholder="Report name"
                        onChange={value => { this.onNameChange('reportname', value) }}
                        style={{width: '352px', height: '40px', fontSize: '16px'}}
                      />
                    )}
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Row style={{ paddingTop: '16px' }}>
              <CreateReportConfigurationListTable
                isExistingData={isExistingData}
                setExistingData={this.setExistingData}
                setChargeCode={this.setChargeCode}
                components={components} 
              />
            </Row>
            <Footer>
              <Form.Item>
                <Button
                  theme="cancel"
                  onClick={() => {
                  this.Modal('Confirmation', 'Are you sure you want to discard your changes ?','', 'cancel', 'Cancel', 'Confirm')
                }}
                >
                Cancel
                </Button>
                <Button htmlType="submit">Create</Button>
              </Form.Item>
            </Footer>
          </Form>


          <Popup
            title={currentModalTitle}
            visible={visibleModal}
            footer={[
              <Button theme="cancel" key="back" onClick={() => { this.handleCancel(typeCancel) }}>{leftModalButton}</Button>,
              <Button onClick={() => { this.handleOk(currentModalType) }} key="submit" type="primary">{rightModalButton}</Button>
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
              <Button type="primary" onClick={() => { this.handleOk(currentModalType) }}>Ok</Button>
            ]}
          >
            {currentModalDetail}

            <br />
            {currentModalDetailSecond}
          </Popup>

        </StandardContainer>
      </Fragment>
    )
  }

}


CreateReportConfiguration.propTypes = {
  form:PropTypes.oneOfType([PropTypes.object]),
  history:PropTypes.func,
  client:PropTypes.func,
  components:PropTypes.oneOfType([PropTypes.object]),
}
CreateReportConfiguration.defaultProps = {
  form: {},
  history:()=>{},
  client:()=>{},
  components:{}
}


const NewCreateReportConfiguration = Form.create({ name: 'form' })(CreateReportConfiguration)

export default withApollo(NewCreateReportConfiguration)