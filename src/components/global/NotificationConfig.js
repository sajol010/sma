import { React } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import NotificationComponent from './NotificationComponent';

const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'pink' }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400'
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17
      }}
      text2Style={{
        fontSize: 15
      }}
    />
  ),
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */

  ndaReceived: ({ text1, text2 }) => (
    <NotificationComponent title={text1} msg={text2} iconName={text2}/>
  ),

  warning: ({ text1, text2 }) => (
    <NotificationComponent title={text1} msg={text2} iconName={text1} />
  )
};
export default toastConfig;
