import React, { Fragment } from 'react'
import { Row } from 'antd'
import PropTypes from 'prop-types'
import ReportConfigurationListTable from './components/Table/ReportConfigurationListTable'

function ReportConfigurationList(props){


    const {components,location,history} = props
    return (
      <Fragment>
        <Row style={{ paddingTop: '16px' }}>
          <ReportConfigurationListTable
            components={components}
            location={location}
            history={history}
          />
        </Row>
      </Fragment>
    )
  
}

ReportConfigurationList.propTypes={
  location:PropTypes.oneOfType([PropTypes.object]),
  history:PropTypes.func,
  components:PropTypes.oneOfType([PropTypes.object]),
}
ReportConfigurationList.defaultProps={
  location:{},
  history:()=>{},
  components:{}
}


export default ReportConfigurationList

