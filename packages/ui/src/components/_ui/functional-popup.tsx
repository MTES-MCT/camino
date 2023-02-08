import { Messages, Props as MessageProps } from './messages'


interface Props {
  messages?: MessageProps['messages']
  header: () => JSX.Element
  content: () => JSX.Element
  footer: () => JSX.Element

}

export const FunctionalPopup = (props: Props): JSX.Element => {

  const messages  = props.messages ?? []
  return <div class="popup fixed shadow full bg-bg">
  <div class="popup-header px-l pt-l">
    {props.header()}
  </div>
  <div class="popup-content px-l pt">
    {props.content()}
  </div>
  <div class="popup-footer px-l pt pb-l">
    {/* <Messages id="cmn-ui-popup-messages" messages={messages} /> */}
    {props.footer()}
  </div>
</div>
}