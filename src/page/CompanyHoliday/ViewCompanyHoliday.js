import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {  Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withApollo } from 'react-apollo'
import HolidayCompanyTable from './components/HolidayCompanyTable'


class ViewCompanyHoliday extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentWillMount(){
    const {setBreadCrumb,actionSetTitle}=this.props
    setBreadCrumb()
    actionSetTitle('Company Holiday')
  }

  render() {
    const {components,setBreadCrumb,location}=this.props
    const { Button,StandardContainer} = components

    return (
      <Fragment>
        <StandardContainer
          subHeader="Company Holiday List"
          loading={false}
          buttons={
            <Link to="/companyholiday/create">
              <Button
                size="l"
                onClick={()=>{setBreadCrumb(
            [
              {url:'/companyholiday/list',text:'Company Holiday List',inactive:true},
              {url:'/companyholiday/create',text:'Create Company Holiday'}
            ]
            )}}
              >Create Holiday
              </Button>
            </Link>
          }
        >

          <HolidayCompanyTable
            location={location}
            components={components}
          />
        </StandardContainer>
      </Fragment>
    )
  }

}

function mapStateToProps() {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setBreadCrumb:bindActionCreators(actionSetBreadcrumb, dispatch),
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
  }
}
const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}

const actionSetTitle = (title) => {
  return {
  type: 'SET_TITLE',
  payload: title,
  }
}

ViewCompanyHoliday.propTypes={
  setBreadCrumb:PropTypes.func,
  actionSetTitle:PropTypes.func,
  components:PropTypes.oneOfType([PropTypes.object]),
  location:PropTypes.oneOfType([PropTypes.object]),
}

ViewCompanyHoliday.defaultProps={
  setBreadCrumb:()=>{},
  actionSetTitle:()=>{},
  components:{},
  location:{},
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(ViewCompanyHoliday))

