import React, { Fragment } from 'react'
import {Switch, Button} from 'antd'
export const TestComponents = (props) => {
  const {StandardContainer} = props.components
  return (
    <Fragment>
      <StandardContainer
      loading={false}
      buttons={
      <React.Fragment>
        <Button size="xl" onClick={()=>{}}>Action</Button>
        <Button size="s" theme="cancel" onClick={()=>alert('Hi')}>Action</Button>
        <Button size="s" theme="disable" onClick={()=>alert('Hi')}>Action</Button>
      </React.Fragment>
    }>
      <Button  role="switch" aria-checked="true">Primary</Button>
      <Switch defaultChecked />
      Lorem
      </StandardContainer>
      
    </Fragment>
  )
}
