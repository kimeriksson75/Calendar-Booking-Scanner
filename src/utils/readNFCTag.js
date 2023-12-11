import {BackHandler, NativeModules, Platform} from 'react-native';
import NfcManager, {Ndef} from 'react-native-nfc-manager';

// BEGIN EXTRA CODE
// END EXTRA CODE

/**
 * @returns {Promise.<string>}
 */
export async function ReadNFCTag() {
  // BEGIN USER CODE
  if (!NativeModules.NfcManager) {
    throw new Error('The NfcManager module is not available in your app.');
  }
  if (Platform.OS === 'android') {
    const enabled = await NfcManager.isEnabled();
    if (!enabled) {
      throw new Error('NFC is not enabled');
    }
  }

  return new Promise(async (resolve, reject) => {
    let success = false;
    await NfcManager.start({
      onSessionClosedIOS: () => {
        if (!success) {
          reject(new Error('NFC session closed'));
        }
      },
    });
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', async () => {
        await NfcManager.unregisterTagEvent();
        await NfcManager.stop();
        return reject(new Error('NFC was canceled by the user'));
      });
      NfcManager.onStateChanged(async event => {
        if (event.state === 'off' || event.state === 'turning_off') {
          await NfcManager.unregisterTagEvent();
          await NfcManager.stop();
          return reject(new Error('NFC was disabled by the user'));
        }
      });
    }
    NfcManager.registerTagEvent(async tag => {
      success = true;
      await NfcManager.unregisterTagEvent();
      await NfcManager.stop();
      const text = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
      resolve(text);
    }, 'Read NFC');
  });
}
