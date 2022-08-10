import styled from 'styled-components'
import { Select} from 'antd'


export const ContentWrapper = styled.div`
padding: 24px;
  display:flex;
  align-items:center;
  flex-direction:row;
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


