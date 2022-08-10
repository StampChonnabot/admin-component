import styled from 'styled-components'
import { Input, Select, Checkbox ,TimePicker,Modal ,Form,Table} from 'antd'

export const FormCreate = styled(Form)`
.anticon{
  display: none;
}
`
export const Popup = styled(Modal)`
button {
  width: 150px;
  height:40px;
}
p {
  color: #4A4A4A;
  text-align: center;
  font-size: 16px;
}
.ant-modal-title{
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

export const Picker = styled(TimePicker)`
max-width: 100%;
display: flex;
width: 450px;
& .ant-time-picker-input {
height: 40px;
}
`
export const ContentWrapper = styled.div`

max-width: 100%;
flex: 1;
display: flex;
padding: 24px;
flex-direction:row;
`
export const ButtonWrapper = styled.div`
padding: 24px;
  flex: 1;
  display: flex;
  justify-content: flex-end;
`
export const Sectioner = styled.div`
  display:flex;
  flex:1;
  justify-content:${(props) =>props.right?'flex-end':'flex-start'};
  align-items:center
`

export const Footer = styled(Sectioner)`
display:flex;
flex:1;
justify-content: flex-end;
padding-top: 80px !important;
`
export const SelectBox = styled(Select)`

display: flex;
.ant-select-selection--single {
  max-width: 100%;
  padding-top: 5px;
  width: 450px;
  height: 40px;
  font-size: 16px;
  cursor: pointer;
}
`
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
export const InputBox = styled(Input)`
max-width: 100%;
display: flex;
  text-align: left;
  &.ant-input {
    width: 450px;
    height: 40px;
    font-size: 16px;
  }
`
export const Truncate = styled.div`
white-space: nowrap; 
  width: 150px; 
  overflow: hidden;
  text-overflow: ellipsis; 
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
export const TextOnButton = styled.div`
  font-size: 16px;
  max-width: 100%;
  color: #4A4A4A;
`