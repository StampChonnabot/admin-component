/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Typography, Col } from 'antd'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { GET_WORK_PRESET_DETAILS } from '../../constants/index'
import { ContentWrapper, Check, TextOnButton } from './component/styles'

const { Text } = Typography
class WorkPresetDetailsComponents extends React.Component {
  constructor(props) {
    super(props)
    const {location} =this.props
    this.state = {
      work_day: this.parseCheckDate(location.state.work_day),
      currentData: '',
      start_time: '',
      end_time: '',
      currentID: location.state.currentID
    }
  }
  
  componentWillMount() {
    const { actionSetTitle, location } = this.props
    actionSetTitle('Work Presets')
    this.runQuery(`${location.state.currentID}`)

  }
  
  workPresetIdParser = (preset, index) => {
    return {
      key: index,
      name: preset.name,
      type: preset.type,
      start_time: preset.start_time,
      end_time: preset.end_time,
      work_day: preset.workday,
      id: preset.id
    }
  }

  runQuery = async (id) => {
    const { client } = this.props
    const queryResult = await
      client.query({
        query: GET_WORK_PRESET_DETAILS,
        variables: { id }
      })
    this.setState({
      currentData: _.map(queryResult.data.work_preset, this.workPresetIdParser),
      start_time: queryResult.data.work_preset.start_time,
      end_time: queryResult.data.work_preset.end_time,
      name: queryResult.data.work_preset.name,
      type: queryResult.data.work_preset.type,
    })
  }

  parseCheckDate = (dateArray) => {
    const parsedDateArray = dateArray.split(',')
    return parsedDateArray
  }

  render() {
    const { components,history,setBreadCrumb } = this.props
    const { Button, StandardContainer } = components
    const {name,type,start_time,end_time,work_day,currentData,currentID} = this.state
    return (
      <Fragment>
        <StandardContainer
          subHeader="Work Preset Details"
          loading={false}
          buttons={
            <Button 
              size="l" 
              onClick={() => {
                history.push({
                  pathname: '/workpreset/edit',
                  state: {
                    currentData,
                    currentID,
                    work_day
                  }
                })
                setBreadCrumb(
                  [
                    { url: '/workpreset/list', text: 'Work Preset List', inactive: true },
                    { url: '/workpreset/details', text: 'Work Presets Details', inactive: true },
                    { url: '/workpreset/edit', text: 'Edit Work Preset' }
                  ]
                )
            }}
            >Edit
            </Button>
          }
        >

          <ContentWrapper>
            <Col span={12}>
              <TextOnButton>Preset Name</TextOnButton>
              <Text>{name}</Text>
            </Col>
            <Col span={12}>
              <TextOnButton>Work Type</TextOnButton>
              <Text>{type}</Text>
            </Col>
          </ContentWrapper>
          <ContentWrapper>
            <Col span={12}>
              <TextOnButton>Start Time</TextOnButton>
              {moment(start_time).format('h:mm A')}
            </Col>
            <Col span={12}>
              <TextOnButton>End Time</TextOnButton>
              {moment(end_time).format('h:mm A')}
            </Col>
          </ContentWrapper>
          <ContentWrapper>
            <Col span={12}>
              <TextOnButton>Work Day</TextOnButton>
              <Check.Group value={work_day} disabled>
                <Check value="MON">Monday</Check><br />
                <Check value="TUE">Tueday</Check><br />
                <Check value="WED">Wednesday</Check><br />
                <Check value="THU">Thursday</Check><br />
                <Check value="FRI">Friday</Check><br />
                <Check value="SAT">Saturday</Check><br />
                <Check value="SUN">Sunday</Check>
              </Check.Group>
            </Col>
          </ContentWrapper>
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

WorkPresetDetailsComponents.propTypes = {
  actionSetTitle:PropTypes.func,
  setBreadCrumb:PropTypes.func,
  location:PropTypes.oneOfType([PropTypes.object]),
  client:PropTypes.oneOfType([PropTypes.object]),
  components:PropTypes.oneOfType([PropTypes.object]),
  history:PropTypes.oneOfType([PropTypes.object]),
}

WorkPresetDetailsComponents.defaultProps = {
  actionSetTitle:()=>{},
  setBreadCrumb:()=>{},
  location:{},
  client:{},
  components:{},
  history: {},
}
export default connect(
  null,
  mapDispatchToProps,
)(withApollo(WorkPresetDetailsComponents))
