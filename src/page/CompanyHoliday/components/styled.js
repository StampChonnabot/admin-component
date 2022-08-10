import {  Row,Input,Select,Table,Modal} from 'antd'
import styled from 'styled-components'

export const ContainerBoxFrist = styled.div`
  ${'' /* justify-content:center; */}
  justify-content:${(props) => props.right ? 'flex-end' : 'flex-start'};
  align-items:center
`
export const InputBoxTable = styled(Input)`
  text-align: left;
  &.ant-input {
    width: 237px;
    height: 40px;
    font-size: 16px;
  }
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
export const TableWrapper = styled.div`
  padding-left: 24px;
  padding-right: 24px;
`

export const RowWrapper = styled(Row)`
padding-top: 24px;
`
export const TextOnButton = styled.div`
  font-size: 16px;
  color: #4A4A4A;
`
export const Star = styled.span`
color: red;
`
export const InputBox = styled(Input)`
  text-align: left;
  &.ant-input {
    width: 490px;
    height: 40px;
    font-size: 16px;
  }
`
export const FirstColumn = styled.div`
padding-left: 24px;
padding-rigth: 16px;
`

export const SelectButton = styled(Select)`
text-align: left;
.ant-select-selection--single {
  padding-top: 5px
  width: 490px;
  height: 40px;
  font-size: 16px;
}
`

export const ContentWrapper = styled.div`
max-width: 100%;
flex: 1;
display: flex;
padding: 24px;
flex-direction:row;
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

export const ButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  padding: 80px 24px 24px;
  justify-content: flex-end;
  align-items:center;
  flex-direction:row;
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
