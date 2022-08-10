import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import styled from 'styled-components'
import TableContainer from './component/table'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'
const ContentWrapper = styled.div`
  padding: 20px;
  display:flex;
  align-items:center;
  flex-direction:row;
`
const Sectioner = styled.div`
  display:flex;
  flex:1;
  ${'' /* justify-content:center; */}
  justify-content:${(props) =>props.right?'flex-end':'flex-start'};
  align-items:center
`

class Sample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: 'default search',
    };
  }
  Setstuff=(searchInput)=>{
    this.setState({searchInput})
  }
  render(){
    const {StandardContainer} = this.props.components

    return (
      <Fragment>
        <StandardContainer
        subHeader="Test Categories"
        loading={false}
       >
       <Query query={GQL}>
      {({ loading, error, data ,refetch}) => {
      if (loading) return 'Loading...'
      if (error) return `Error! ${error.message}`
      return (<div>
      {JSON.stringify(data)}
      <button onClick={()=>{refetch()}}>1231233</button>
      </div>)
    }}
    </Query>
          <TableContainer components={this.props.components}/>
        </StandardContainer>
      </Fragment>
    )
  }

}


function mapStateToProps(state) {
  return {
  }
}
export const logout = () => {
  removeCookieAll()
  return {
    type: types.LOG_OUT,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    logout: bindActionCreators(logout, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sample)

