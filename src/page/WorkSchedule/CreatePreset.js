/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {Select, Col } from 'antd'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import _ from 'lodash'
import {Popup,Picker,ContentWrapper,ButtonWrapper,InputBox,SelectBox,Check,FormCreate} from './component/styles'
import { CREATE_WORK_PRESET } from '../../constants/index'

const { Option } = Select

class CreatePresetsComponents extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    workday:[],
    presetName: '',
    workType: '',
    startTime: '',
    endTime: '',
    currentModalTitle: '',
    currentModalDetail: '',
    currentModalType: '',
    leftModalButton: '',
    rightModalButton: '',
    visibleModal: false,
    visibleModalWarning: false,
    workdayArr: '',
    }
  }

  componentWillMount(){
    const { actionSetTitle} = this.props
    actionSetTitle('Work Presets')
  }

  onChangeTime =(field,e)=> {
    this.setState({ [field]: e})
  }
  
  checkTime = () => {
    const { startTime,endTime } = this.state
    const value1 = startTime
    const value2 = endTime
   
   if ( value2 > value1){
     const sum = value2 - value1
     if( sum < 3600000){
      this.ModalWarning('Warning', 'Please input time at lease 1 Hour!','warning')
     }else
     if ( sum >= 3600000 && sum <= 32400000 ){
      this.Modal('Confirmation', 'Are you sure you want to create a new work preset ?', 'create','Cancel','Confirm')
     }else{
      this.ModalWarning('Warning', 'Can not input time over than 8 Hours!','warning')
     }
   }else{
    const sum = value1 - value2
    if( sum <= 0 ){
      this.ModalWarning('Warning', 'Please input time at lease 1 Hour!','warning')
    }else
    if( sum >= 6000 && sum < 54000000 ){
      this.ModalWarning('Warning', 'Please check your input time!','warning')
    }else{
      this.Modal('Confirmation', 'Are you sure you want to create a new work preset ?', 'create','Cancel','Confirm')
    }
    
   }

  }

  Modal = (title, detail, type,left,right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
      leftModalButton: left,
      rightModalButton: right,
    })
  };

  ModalWarning = (title, detail, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type
    })
  };

   onChangeValue = (field,value)=> {
    this.setState({ [field]: value})
}
 
 onChangeCheck = (index,value) => {
   const { workday } = this.state
   const updateCheckDate = _.cloneDeep(workday)
   updateCheckDate[index] = value.target.checked
  this.setState({ workday: updateCheckDate})
}

onCheckDateChange = (value) => {
  this.setState({ workdayArr: value})
}

serializeDate=(inputDate)=>{
  let output=''
  _.each(inputDate, value => {
    output += this.checkToAddComma(output,value)
  })
  return output
}

checkToAddComma=(inputString,toAdd)=>{
  if(_.isEmpty(inputString)){
    return toAdd
  }else{
    return `,${toAdd}`
  }
}

  handleOk = (type) => {
    const { presetName, workType, startTime, endTime, workdayArr} = this.state
    const {history} = this.props
    switch (type) {
      case 'create':
        this.runQueryCreate(
              presetName,
              workType,
              moment(startTime),
              moment(endTime),
              this.serializeDate(workdayArr)
            )
        break

      case 'cancel':
          this.setState({ visibleModal: false})
          history.push({
            pathname: '/workpreset/list'
          })
      break
      case 'warning':
          this.setState({ visibleModalWarning: false})
          break
      default:
        break
    }
  }

  handleCancel = () => {
    this.setState({
      visibleModal: false
    })
  };

  onNameChange = (field, event) => {
    const name = event.target.value
    this.setState({ [field]: name})
  }

  handleSubmit = e => {
    const {form} = this.props
    e.preventDefault()
    form.validateFields((err) => {
      if (!err) {
        this.checkTime()
      }
    })
    
  };

  runQueryCreate = async(
    name,
    type,
    start_time,
    end_time,
    work_day ) => {
      const {components,client,history} = this.props
      const {Message} = components
      try{
    await client.resetStore()
    await client.mutate({
      mutation: CREATE_WORK_PRESET,
      variables: { 
        name,type,start_time,end_time,work_day},
    })
    Message('success','Create work preset successful')
    history.push({
      pathname: '/workpreset/list'
    })
      }catch(error){
        Message('error','Create work preset error')
      }
  }

  validateToDescription = (rule, value, callback) => {
    try {
      if (value && value.length > 30) {
          callback( 'Character must be no longer than 30 characters')
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };

  render(){
    const {form,components} = this.props
    const { getFieldDecorator } = form
    const {Button,StandardContainer} = components
    const { currentModalTitle,visibleModal,visibleModalWarning,leftModalButton,currentModalType,currentModalDetail,rightModalButton} = this.state
    return (
      <Fragment>
        <StandardContainer
          subHeader="Create Work Preset"
          loading={false}
        >
       
          <FormCreate onSubmit={this.handleSubmit}>
            <ContentWrapper>
              <Col span={12}>
                <FormCreate.Item label="Preset Name" hasFeedback>
                  {getFieldDecorator('name', {
                        rules: [
                          { required: true, message: 'Please input preset name !' },
                          {
                            validator: this.validateToDescription,
                          },
                          {
                            pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                            message: 'Preset name can not contain any of the following characters: /:*!@#$%&^|',
                          }
                        ],
                      })(
                        <InputBox maxlength="31" placeholder="Please input preset name" onChange={value => {this.onNameChange('presetName',value)}} />
                      )}
                </FormCreate.Item>
              </Col>

              <Col span={12}>
                <FormCreate.Item label="Work Type" hasFeedback>
                  {getFieldDecorator('select', {
                      rules: [{ required: true, message: 'Please select work type !' }],
                    })(
                      <SelectBox
                        showSearch
                        placeholder="Please select work type"
                        optionFilterProp="children"
                        onChange={value => {this.onChangeValue('workType',value)}}
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Option value="Strict">Strict Schedule</Option>
                        <Option value="Flexible">Flexible Schedule</Option>
                      </SelectBox>
          )}
                </FormCreate.Item>   
              </Col>
            </ContentWrapper>
            
            <ContentWrapper>
              <Col span={12}>
                <FormCreate.Item label="Start Time" hasFeedback>
                  {getFieldDecorator('startTime', {
                        rules: [{ required: true, message: 'Please select start time !' }],
                      })(
                        <Picker use12Hours minuteStep={15} format="h:mm: A" onChange={(time) => {this.onChangeTime('startTime',time)}} />
                      )}
                </FormCreate.Item>
              </Col>

              <Col span={12}>
                <FormCreate.Item label="End Time" hasFeedback>
                  {getFieldDecorator('end', {
                        rules: [{ required: true, message: 'Please select end time !' }],
                      })(
                        <Picker use12Hours minuteStep={15} format="h:mm: A" onChange={(time) => {this.onChangeTime('endTime',time)}} />
                      )}
                </FormCreate.Item>
              </Col>
            </ContentWrapper>
            
            <ContentWrapper>
              <Col span={12}>
                <FormCreate.Item label="Work Day" hasFeedback>
                  {getFieldDecorator('day', {
                        rules: [{ required: true, message: 'Please select at least one day!' }],
                      })(
                        <Check.Group onChange={this.onCheckDateChange}>
                          <Check value="MON">Monday</Check><br />
                        
                          <Check value="TUE">Tuesday</Check><br />
                        
                          <Check value="WED">Wednesday</Check><br />
                          
                          <Check value="THU">Thursday</Check><br />
                        
                          <Check value="FRI">Friday</Check><br />
                          <Check value="SAT">Saturday</Check><br />
                          <Check value="SUN">Sunday</Check>
                        </Check.Group>,
                      )}
                </FormCreate.Item>
              </Col>
            </ContentWrapper>
            
            <ButtonWrapper>
              <Button size="l" theme="cancel" onClick={() => {this.Modal('Confirmation', 'Are you sure you want to discard your changes ?','cancel','Cancel','Confirm')}}>Cancel</Button>
              <FormCreate.Item><Button size="l" htmlType="submit">Create</Button></FormCreate.Item>
            </ButtonWrapper>
      

            <Popup
              title={currentModalTitle}
              visible={visibleModal}
              footer={[
                <Button theme="cancel" onClick={this.handleCancel}>{leftModalButton}</Button>,
                <Button onClick={() => {this.handleOk(currentModalType)}}>{rightModalButton}</Button>
              ]}
            >
              <p>{currentModalDetail}</p>
            </Popup>


            <Popup
              title={currentModalTitle}
              visible={visibleModalWarning}
              footer={[
                <Button onClick={()=>{this.handleOk(currentModalType)}}>Ok</Button>
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
  }
}

const actionSetTitle = (title) => {
  return {
  type: 'SET_TITLE',
  payload: title,
  }
}

CreatePresetsComponents.propTypes = {
  actionSetTitle: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
}

CreatePresetsComponents.defaultProps = {
  actionSetTitle: ()=>{},
  history: {},
  form: {},
  components: {},
  client: {},
}
const CreateWorkPresetForm = FormCreate.create({name: 'create_work_preset'})(CreatePresetsComponents)
export default connect(
  null,
  mapDispatchToProps,
)(withApollo(CreateWorkPresetForm))

