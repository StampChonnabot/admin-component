import styled from 'styled-components'
import { DatePicker, Input, Modal, Button, Row, Table } from 'antd'

export const Sectioner = styled.div`
  display:flex;
  flex:1;
  padding: 24px 24px 24px 24px;
  justify-content:${(props) => props.right ? 'flex-end' : 'flex-start'};
  align-items:center
`
export const TextOnButton = styled.div`
  font-size: 16px;
  max-width: 100%;
  color: #4A4A4A;
`

export const AntDatePicker = styled(DatePicker)`
  width:237px;
}

`

export const TableWrapper = styled.div`
padding: 16px 24px 0px;
`

export const Footer = styled(Sectioner)`
display:flex;
flex:1;
justify-content: flex-end;
padding-top: 80px !important;
`
export const SaveModal = styled(Modal)`
.ant-modal-footer {
  border-top: 0px !important;
  display: flex;
  justify-content: center;
  padding: 24px 24px 24px;
}
.ant-modal-header{
  display: flex;
  justify-content: center;
}
.ant-modal-content > button {
  visibility: hidden !important;
}
.ant-modal-footer button + button{
  margin-left:16px !important;
}
.ant-modal-title{
  font-size: 28px !important;
}
.ant-modal-body{
  display: flex ;
  justify-content: center;
  align-items: center;
  font-size: 20px !important;
  height: 140px ;
}
`

export const DeleteModal = styled(Modal)`
.ant-modal-footer {
  border-top: 0px !important;
  display: flex;
  justify-content: center;
  padding: 24px 24px 24px;
}
.ant-modal-header{
  display: flex;
  justify-content: center;
}
.ant-modal-content > button {
  visibility: hidden !important;
}
.ant-modal-footer button + button{
  margin-left:16px !important;
}
.ant-modal-title{
  font-size: 28px !important;
}
.ant-modal-body{
  display: flex ;
  justify-content: center;
  align-items: center;
  font-size: 20px !important;
  height: 140px ;
}
`
export const InputBox = styled(Input)`
  text-align: left;
  &.ant-input {
    max-width: 100%;
    height: 40px;
    font-size: 16px;
  }
`
export const DateWrapper = styled.span`
width:237px;
`
export const InputBoxInTable = styled(Input)`
  text-align: left;
  &.ant-input {
    width:237px;
    max-width: 100%;
    height: 40px;
    font-size: 16px;
  }
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
export const RowWrapper = styled(Row)`
padding-top: 24px;
`

export const FirstColumn = styled.div`
padding-left: 24px;
padding-rigth: 16px;
`

export const Star = styled.span`
color: red;
`
export const TableList = styled(Table)`
  padding-left: 24px;
  padding-right: 24px;
`
export const TableCustom = styled(Table)`
span.ant-table-column-title{
  padding-left: 0px;
}
th:nth-child(1) > span > div > span.ant-table-column-title {
  padding-left: 0px;
}
.ant-table-thead > tr > th, .ant-table-tbody > tr > td {
  padding-left: 24px;
}
`
export const Truncate = styled.div`
white-space: nowrap; 
  width: 150px; 
  overflow: hidden;
  text-overflow: ellipsis; 
`
