/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import NfcManager, {NfcTech, NfcEvents} from 'react-native-nfc-manager';

import React, {useState, useEffect} from 'react';
import verifyScanner from './src/scanner/verify';
import authenticateScanner from './src/scanner/authenticate';
import verifyTag from './src/tag/verify';
import connectTag from './src/tag/connect';
import authenticateTag from './src/tag/authenticate';
import getServiceById from './src/service/getServiceById';
import {Picker} from 'react-native-wheel-pick';
import {APP_BASE_URL} from '@env';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Platform,
  Pressable,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [scanner, setScanner] = useState({});
  const [issuedTag, setIssuedTag] = useState({});
  const [signInToken, setSignInToken] = useState(null);
  const [service, setService] = useState(null);
  const [_users, setUsers] = useState([]);
  const [_services, setServices] = useState([]);
  const [selectUserData, setSelectUserData] = useState('');
  const [selectServiceData, setSelectServiceData] = useState('');
  const [externalAppUrl, setExternalAppUrl] = useState(null);
  const [hasNfc, setHasNFC] = React.useState(null);

  const data = {
    scanner: 'test-scanner',
  };

  const clearInputUI = () => {
    setUsers([]);
    setServices([]);
    setSelectUserData('');
    setSelectServiceData('');
  };
  React.useEffect(() => {
    const checkIsSupported = async () => {
      const deviceIsSupported = await NfcManager.isSupported();
      setHasNFC(deviceIsSupported);
      return;
    };

    checkIsSupported();
  }, []);

  const initScanner = async () => {
    let _tag = null;

    try {
      await NfcManager.requestTechnology([NfcTech.Ndef]);

      _tag = await NfcManager.getTag();
      _tag.ndefStatus = await NfcManager.ndefHandler.getNdefStatus();
      const {id} = _tag;
      if (id) {
        setIssuedTag(id);
        onScan({
          token: scanner?.token,
          scanner: scanner?.scannerId,
          tag: id,
          userId: '',
        });
      }
      if (Platform.OS === 'ios') {
        await NfcManager.setAlertMessageIOS(`Toppen! Id: ${id} 🚀`);
      }
    } catch (ex) {
      // for tag reading, we don't actually need to show any error
      console.log(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  const launchApp = async ({accessToken, serviceId, residenceId}) => {
    const url = `${APP_BASE_URL}/user/authenticate/${accessToken}/${serviceId}/${residenceId}`;
    setExternalAppUrl(url);
    // Linking.openURL(externalAppUrl);
  };

  const onAuthenticateTag = async ({tag, token}) => {
    const authResult = await authenticateTag({tag, token});
    launchApp({
      accessToken: authResult.accessToken,
      serviceId: authResult.service._id,
      residenceId: authResult.service.residence,
    });
  };

  const onConnectTag = async () => {
    const body = {
      tag: issuedTag,
      scannerId: scanner._id,
      token: scanner.token,
      username: selectUserData,
      servicename: selectServiceData,
    };
    await connectTag(body);
    if (scanner?.token) {
      setSignInToken(scanner.token);
    }
    onAuthenticateTag({tag: issuedTag, token: scanner?.token});
  };

  const onScan = async scanData => {
    const verifyResult = await verifyTag(scanData);
    clearInputUI();
    const {
      users = [],
      services = [],
      tag = null,
      user: existingUser = null,
    } = verifyResult;
    if (!tag && !existingUser) {
      if (users.length > 0 && services.length > 0) {
        const _selectUserData = users.map(user => {
          return {
            label: user.username,
            value: user.username,
          };
        });
        const _selectServiceData = services.map(_service => {
          return {
            label: _service.name,
            value: _service.name,
          };
        });
        setUsers(_selectUserData);
        setServices(_selectServiceData);
      }
    } else {
      setSelectServiceData(tag.serviceId);
      console.info('issuedTag', issuedTag);
      onAuthenticateTag({tag: scanData.tag, token: scanner?.token});
    }
  };
  const setupScanner = async () => {
    console.info('setupScanner');
    clearInputUI();
    const verifyResult = await verifyScanner(data);
    console.log('verifyResult', JSON.stringify(verifyResult, null, 2));
    if (!verifyResult.scanner) {
      return;
    }
    setScanner({...verifyResult.scanner});
    console.info('authenticateScanner');
    const authResult = await authenticateScanner(
      verifyResult?.scanner?.scannerId,
    );
    console.log('authResult', JSON.stringify(authResult, null, 2));
    const {token = null} = authResult;

    if (token) {
      const serviceResult = await getServiceById(
        verifyResult?.scanner?.serviceId,
        token,
      );
      setService(serviceResult);
      setScanner({...verifyResult.scanner, token: token});
    }
  };

  useEffect(() => {
    setSelectUserData('');
    setSelectServiceData('');
    setExternalAppUrl(null);
    setupScanner();
  }, []);

  const readTag = async () => {
    let tag = null;

    try {
      await NfcManager.requestTechnology([NfcTech.Ndef]);

      tag = await NfcManager.getTag();
      tag.ndefStatus = await NfcManager.ndefHandler.getNdefStatus();
      console.log('tag', tag);
      if (Platform.OS === 'ios') {
        await NfcManager.setAlertMessageIOS('Success');
      }
    } catch (ex) {
      // for tag reading, we don't actually need to show any error
      console.log(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }

    return tag;
  };
  const onExternalAppNavState = navState => {
    console.log('navState', navState);
    const {url} = navState;
    if (url.includes('logout')) {
      setExternalAppUrl(null);
      setupScanner();
    }
  };
  const disableNfc = async () => {
    await NfcManager.unregisterTagEvent();
  };

  if (hasNfc === null) {
    return null;
  }

  if (!hasNfc) {
    return (
      <View style={styles.sectionContainer}>
        <Text>NFC not supported</Text>
      </View>
    );
  }

  return (
    <>
      {externalAppUrl ? (
        <SafeAreaView style={styles.view}>
          <WebView
            incognito={true}
            cacheEnabled={false}
            clearCache={true}
            clearHistory={true}
            source={{uri: externalAppUrl}}
            style={{flex: 1}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            onNavigationStateChange={navState =>
              onExternalAppNavState(navState)
            }
          />
        </SafeAreaView>
      ) : (
        <>
          <SafeAreaView style={styles.view}>
            <StatusBar
              barStyle="light-content"
              hidden={false}
              backgroundColor={'red'}
            />
            <View style={styles.container}>
              {service?.name ? (
                <>
                  <Text style={styles.title}>{service?.name}</Text>
                  <Pressable
                    style={styles.button}
                    onPress={() => initScanner()}
                    accessibilityLabel="Skanna din tagg">
                    <Text style={styles.text}>Tryck för att skanna</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.title}>Fixar lite...</Text>
              )}
              {_users.length > 0 && _services.length > 0 && (
                <>
                  <View style={styles.connect}>
                    <Picker
                      style={styles.picker}
                      itemTextStyle={styles.pickerItem}
                      placeholder="Välj användare"
                      pickerData={_users}
                      onValueChange={value => setSelectUserData(value)}
                    />

                    <Picker
                      pickerData={_services}
                      style={styles.picker}
                      itemTextStyle={styles.pickerItem}
                      placeholder="Välj service"
                      onValueChange={value => setSelectServiceData(value)}
                    />
                    <Pressable
                      style={styles.button}
                      onPress={() => onConnectTag()}
                      accessibilityLabel="Skanna din tagg">
                      <Text style={styles.text}>Koppla</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </SafeAreaView>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: 'white',
    backgroundColor: '#403d39',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  view: {
    alignSelf: 'stretch',
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  button: {
    alignItems: 'stretch',
    justifyContent: 'center',
    width: 300,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#eb5e28',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    textAlign: 'center',
    color: 'white',
  },
  connect: {
    backgroundColor: '#403d39',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
  },
  picker: {
    padding: 0,
    margin: 0,
    width: 300,
    height: 140,
    backgroundColor: 'white',
    color: '#fff',
  },
  pickerItem: {
    color: '#fff',
  },
});
export default App;
