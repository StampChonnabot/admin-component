import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import styled from 'styled-components'
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

class AssetCategoriesComponents extends React.Component {
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
  
  
    const apiTest = async () => {
      try {
        const url = `http://vmvkk.mocklab.io/v1/accounts/deposits/123456789`
        return await this.props.helpers.restApi(
          {
            url: url,
            method: 'GET',
          },
          {
            condition: () => {return true},
            success: (response) => {console.log("Response from mocklab : ", response)},
          }
        )
      } catch (error) {
        return error
      }
    }
  
    apiTest()
    const {Button,
      StandardContainer,
      CustomTable,IconHelper,
      InputBox
    } = this.props.components
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
       
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const columns = [
      {
        title: 'Category Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => (
          <a href="javascript:;">
            {' '}
            
              {text}
            
          </a>
        ),
      },
      {
        title: 'All',
        dataIndex: 'all',
        key: 'all',
      },
      {
        title: 'Available',
        dataIndex: 'available',
        key: 'available',
      },
      {
        title: 'Unavailable',
        key: 'unavailable',
        dataIndex: 'unavailable'
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
          <IconHelper type="edit" />
          <IconHelper type="delete" />
          </span>
        ),
      },
    ]
    
    const data = [
      {
        key: '1',
        name: 'Laptop',
        all: 100,
        available: 5,
        unavailable: 95,
      },
      {
        key: '2',
        name: 'Lorem',
        all: 120,
        available: 50,
        unavailable: 95,
      },
      {
        key: '3',
        name: 'Lorem',
        all: 120,
        available: 50,
        unavailable: 95,
      },
      {
        key: '4',
        name: 'Lorem',
        all: 120,
        available: 50,
        unavailable: 95,
      }
    ]
    
    return (
      <Fragment>

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
)(AssetCategoriesComponents)

