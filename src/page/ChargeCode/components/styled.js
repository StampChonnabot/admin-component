import styled from 'styled-components'
import { Tabs, Table, Form, Input, Checkbox, Button, DatePicker, Select, Col, Modal } from 'antd'

const { RangePicker } = DatePicker
const { TextArea } = Input

export const Check = styled(Checkbox)`
padding: 24px;
& .ant-checkbox-wrapper {
  font-size: 16px;
}
.ant-checkbox-inner{
  width: 21px;
  height:21px;
}
`

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

export const CustomTabs = styled(Tabs)`
.ant-tabs-tab {
    width: 250px;
    text-align: center;
    font-size: 22px
}
.ant-tabs-bar{
    margin: 0 0 0 0;
}
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
export const ContainerBoxFrist = styled.div`
  ${'' /* justify-content:center; */}
  justify-content:${(props) => props.right ? 'flex-end' : 'flex-start'};
  align-items:center
`
export const ContainerBoxSecond = styled.div`
  padding-left: 16px;
  ${'' /* justify-content:center; */}
  justify-content:${(props) => props.right ? 'flex-end' : 'flex-start'};
  align-items:center
`
export const TextOnButton = styled.div`
  font-size: 16px;
  max-width: 100%;
  color: #4A4A4A;
`
export const InputBox = styled(Input)`
  text-align: left;
  .ant-input {
    max-width: 100%;
    height: 40px !important;
    font-size: 16px !important;
  }
`
export const ButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  padding: 80px 24px 24px;
  justify-content: flex-end;
  align-items:center;
  flex-direction:row;
`
export const FormInput = styled(Input)`
text-align: left;
&.ant-input {
  width: 490px;
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

export const RangePickerCustom = styled(RangePicker)`
max-width: 100%;
text-align: left;
&.ant-input {
  line-height:40px;
  height: 40px;
  font-size: 16px;
}
.ant-calendar-range-picker-input:placeholder-shown {
  padding-top: 4.5px;
}
.ant-calendar-range-picker-separator {
  padding-top: 3px !important;
}
input.ant-calendar-range-picker-input{
   padding-top: 4.5px;
}
`
export const DatePickerCustom = styled(DatePicker)`
max-width: 100%;
text-align: left;
&.ant-input {
  line-height:40px;
  height: 40px;
  font-size: 16px;
}
.ant-calendar-picker .ant-calendar-range-picker-input {
  bottom: 0;
}
`
export const DatePickerTable = styled(DatePicker)`
text-align: left;
max-width: 100%;
min-width: 20%;
`
export const InputBoxTable = styled(Input)`
  text-align: left;
  max-width: 100%;
  min-width: 20%
  &.ant-input {
    height: 40px;
    font-size: 16px;
  }
`
export const SelectButton = styled(Select)`
text-align: left;
max-width: 100%;
min-width: 20%
.ant-select-selection--single {
  padding-top: 5px;
  height: 40px;
  font-size: 16px;
}
`


export const Column = styled(Col)`
flex-direction:column;
width: 490px;
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
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TruncateSelection = styled(Select)`
white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`
