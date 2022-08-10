import styled from 'styled-components'
import _ from 'lodash'
import { Tabs, Table, Upload, Input, Modal, Select, InputNumber } from 'antd'

export const ContentWrapper = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  flex-direction: row;
`
export const Sectioner = styled.div`
display:flex;
flex:1;
${'' /* justify-content:center; */}
justify-content:${(props) => (props.right ? 'flex-end' : 'flex-start')};
align-items:center
`

export const TabWrap = styled(Tabs)`
  .ant-tabs-nav .ant-tabs-tab {
    padding: 12px 24px;
  }
  .ant-tabs-nav-container {
    font-size: 16px;
  }
  .ant-tabs-bar {
    margin: 0px;
  }
`

export const Dragger = styled(Upload)``

export const InputBox = styled(Input)`
  font-size: 14px !important;
  font-family: 'Sukhumvit Set' !important;
  color: #606060;
`

export const Popup = styled(Modal)`
  button {
    width: 150px;
    height: 40px;
  }
  p {
    color: #4a4a4a;
    text-align: center;
    font-size: 16px;
  }
  .ant-modal-title {
    color: #25265e;
    text-align: center;
    font-size: 16px;
  }
  .ant-btn-primary {
    background-color: #7540ee;
  }
  .ant-modal-close-x {
    display: none;
  }
  .ant-modal-footer {
    border-top: none;
    text-align: center;
    padding-bottom: 24px;
  }
`

export const Footer = styled(Sectioner)`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`
export const SaveModal = styled(Modal)`
  button {
    width: 150px;
    height: 40px;
  }
  p {
    color: #4a4a4a;
    text-align: center;
    font-size: 16px;
  }
  .ant-modal-title {
    color: #25265e;
    text-align: center;
    font-size: 16px;
  }
  .ant-btn-primary {
    background-color: #7540ee;
  }
  .ant-modal-close-x {
    display: none;
  }
  .ant-modal-footer {
    border-top: none;
    text-align: center;
    padding-bottom: 24px;
  }
  .ant-modal-body {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
  }
`

export const SelectButton = styled(Select)`
  text-align: left;
  max-width: 100%;
  min-width: 20% .ant-select-selection--single {
    padding-top: 5px;
    height: 40px;
    font-size: 16px;
  }
`

export const SubmitTable = styled(Table)`
  td:nth-child(3) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 3) ? ' #fafafa' : null} !important;
  }
  td:nth-child(4) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 4) ? ' #fafafa' : null} !important;
  }
  td:nth-child(5) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 5) ? ' #fafafa' : null} !important;
  }
  td:nth-child(6) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 6) ? ' #fafafa' : null} !important;
  }
  td:nth-child(7) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 7) ? ' #fafafa' : null} !important;
  }
  td:nth-child(8) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 8) ? ' #fafafa' : null} !important;
  }
  td:nth-child(9) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 9) ? ' #fafafa' : null} !important;
  }
  td:nth-child(10) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 10) ? ' #fafafa' : null} !important;
  }
  td:nth-child(11) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 11) ? ' #fafafa' : null} !important;
  }
  td:nth-child(12) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 12) ? ' #fafafa' : null} !important;
  }
  td:nth-child(13) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 13) ? ' #fafafa' : null} !important;
  }
  td:nth-child(14) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 14) ? ' #fafafa' : null} !important;
  }
  td:nth-child(15) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 15) ? ' #fafafa' : null} !important;
  }
  td:nth-child(16) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 16) ? ' #fafafa' : null} !important;
  }
  td:nth-child(17) {
    background-color: ${(props) =>
      _.includes(props.grayedBox, 17) ? ' #fafafa' : null} !important;
  }
`

// export const MyInputNumber = styled(InputNumber)`
// width: 300;
// text-align: center;
// .ant-input-number-handler-wrap {
//   visibility: hidden;
// }
// `
