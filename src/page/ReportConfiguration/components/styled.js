import styled from 'styled-components'
import { Table, Input, Button, Select, Modal } from 'antd'

export const ContentWrapper = styled.div`
  max-width: 100%;
  padding: 24px 0px;
  display:flex;
  align-items:center;
  flex-direction:row;
`
export const Sectioner = styled.div`
  display:flex;
  padding: 0px 0px 0px 24px;
  flex:1;
  font-size: 22px
  ${'' /* justify-content:center; */}
  justify-content:${(props) => props.right ? 'flex-end' : 'flex-start'};
  align-items:center
`

export const TableList = styled(Table)`
span.ant-table-column-title{
  padding-left: 0px;
}
th:nth-child(1) > span > div > span.ant-table-column-title {
  padding-left: 14px;
}
`

export const InputBox = styled(Input)`
  text-align: left;
  .ant-input {
    max-width: 100%;
    height: 40px;
    font-size: 16px;
  }
`

export const TextOnButton = styled.div`
  font-size: 16px;
  max-width: 100%;
  color: #4A4A4A;
`

export const SelectButton = styled(Select)`
text-align: left;
max-width: 100%;
min-width: 20%;
.ant-select-selection--single {
  padding-top: 5px;
  height: 40px;
  font-size: 16px;
}
`
export const Footer = styled(Sectioner)`
display:flex;
flex:1;
justify-content: flex-end;
padding-top: 80px !important;
padding-right: 24px
`
export const Popup = styled(Modal)`
button {
  width: 150px;
  height:40px;
}
.ant-modal-header {
  color: #25265E;
  text-align: center;
  font-size: 16px;
}
.ant-modal-body{
  color: #25265E;
  text-align: center;
  font-size: 16px;
}
.ant-btn-primary{
  background-color: #7540EE;
}
.ant-modal-close-x{
  display: none;
}
.ant-modal-footer{
  border-top: none;
  text-align: center;
  padding-bottom: 24px;
}
`
export const ButtonCustom = styled(Button)`
  width: 150px;
  height:40px;
  background-color: #7540EE !important;
`
export const Truncate = styled.div`
white-space: nowrap; 
  width: 150px; 
  overflow: hidden;
  text-overflow: ellipsis; 
`

