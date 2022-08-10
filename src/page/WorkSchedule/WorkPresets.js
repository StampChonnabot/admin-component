import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import WorkListTable from './component/table'

class WorkPresetsComponents extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount(){
    const {setBreadCrumb ,actionSetTitle} = this.props
    actionSetTitle('Work Presets')
    setBreadCrumb()
  }

  render(){
    const { components, setBreadCrumb, location } = this.props
    const {Button, StandardContainer} = components

    return (
      <Fragment>
        <StandardContainer
          subHeader="Work Preset List"
          loading={false}
          buttons={
            <Fragment>
              <Link to="/workpreset/create">
                <Button 
                  size="l" 
                  onClick={()=>{
                  setBreadCrumb(
                  [
                    {url:'/workpreset/list',text:'Work Preset List',inactive:true},
                    {url:'/workpreset/create',text:'Create Work Preset'}
                  ]
                  )}}
                >Create Preset
                </Button>
              </Link>
            </Fragment>}
        >
       
          <WorkListTable 
            location={location}
            components={components}
          />
        </StandardContainer>
      </Fragment>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
    setBreadCrumb:bindActionCreators(actionSetBreadcrumb, dispatch),
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
WorkPresetsComponents.propTypes = {
  setBreadCrumb: PropTypes.func,
  actionSetTitle: PropTypes.func,
  components:PropTypes.oneOfType([PropTypes.object]),
  location:PropTypes.oneOfType([PropTypes.object]),
}

WorkPresetsComponents.defaultProps = {
  setBreadCrumb:()=>{},
  actionSetTitle:()=>{},
  components:{},
  location:{},
}
export default connect(null,mapDispatchToProps)(withApollo(WorkPresetsComponents))
