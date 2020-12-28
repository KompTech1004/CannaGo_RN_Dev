import React, { Component } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-modalbox';
import { Switch } from 'react-native-switch';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from "react-native-fetch-blob";
import Firebase from '../../../config/firebase'

import { styles } from '../../components/styles'

import { func, string, bool, object, array } from "prop-types";
import { connect } from "react-redux";
import { load, userInfo } from "../../store/reducers/user";

import NonImage from '../../assets/iamges/storeImage1.png'
import uncheckImage from '../../assets/iamges/uncheckImage.png'
import checkImage from '../../assets/iamges/checkImage.png'

const options = {
  title: 'Choose Photo',
  takePhotoButtonTitle: 'Take photo with your camera',
  chooseFromLibraryButtonTitle: 'Choose photo from library'
}

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarSource: NonImage,
      ischecked: false,
      checkImage: checkImage,
      uncheckImage: uncheckImage,
      modalVisible: false,
      usertype: 'consumer',
      Checked: true,
      firstName: '',
      lastName: '',
      email: '',
      phoneNum: '',
      password: '',
      profileimage: '',
      storeName: '',
      storePhoneNum: '',
      storeAddress: '',
      storeHours: '',
      companyName: '',
      fein: '',
      userId: Firebase.auth().currentUser.uid,
    };
  }

  componentDidMount = async () => {
    const { real_data, user_real_info } = this.props
    const usertype = await AsyncStorage.getItem("usertype");
    await this.setState({ usertype: usertype });
    await this.setState({
      firstName: user_real_info.firstName,
      lastName: user_real_info.lastName,
      email: user_real_info.email,
      phoneNum: user_real_info.phoneNum,
      password: user_real_info.password,
      storeName: user_real_info.storePhoneNum,
      storePhoneNum: user_real_info.storePhoneNum,
      storeHours: user_real_info.storeHours,
      storeAddress: user_real_info.storeAddress,
      companyName: user_real_info.companyName,
      fein: user_real_info.fein,
      profileimage: user_real_info.profileimage,
      userType: user_real_info.userType
    })
    console.log("++++++++++++++")
    console.log(this.state.profileimage)
  }

  closeModal = () => {
    this.refs.modal6.close();
    // this.props.navigation.navigate('LoginScreen');
  }

  _onChangeSwitch() {
    this.setState({ Checked: !this.state.Checked })
  }

  // chooseImage = () => {
  //   ImagePicker.showImagePicker(options, async (response) => {
  //       console.log('Response = ', response);
  //       if (response.didCancel) {
  //           console.log('User cancelled image picker');
  //       } else if (response.error) {
  //           console.log('ImagePicker Error: ', response.error);
  //       } else {
  //           console.log(response.uri)
  //           const source = { uri: response.uri };
  //           const URL = response.data;
  //       }
  //   });
  // }

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false
    })
    // alert('network error')
  }

  chooseImage = async () => {
    ImagePicker.showImagePicker(options, response => {
      console.log("Response = ", response.uri);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        const source = { uri: response.uri };
        // console.log(response.data);
        const Blob = RNFetchBlob.polyfill.Blob;    //firebase image upload
        const fs = RNFetchBlob.fs;
        window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
        window.Blob = Blob;

        const Fetch = RNFetchBlob.polyfill.Fetch
        // replace built-in fetch
        window.fetch = new Fetch({
          // enable this option so that the response data conversion handled automatically
          auto: true,
          // when receiving response data, the module will match its Content-Type header
          // with strings in this array. If it contains any one of string in this array, 
          // the response body will be considered as binary data and the data will be stored
          // in file system instead of in memory.
          // By default, it only store response data to file system when Content-Type 
          // contains string `application/octet`.
          binaryContentTypes: [
            'image/',
            'video/',
            'audio/',
            'foo/',
          ]
        }).build()

        let uploadBlob = null;

        var path = Platform.OS === "ios" ? response.uri.replace("file://", "") : response.uri

        var d = new Date();
        var _name = d.getHours() + d.getMinutes() + d.getSeconds() + 'img.jpg';

        fs.readFile(path, "base64")
          .then(data => {
            //console.log(data);
            let mime = "image/jpg";
            return Blob.build(data, { type: `${mime};BASE64` });
          })
          .then(blob => {
            uploadBlob = blob;
            Firebase
              .storage()
              .ref("ProfileImages/" + _name)
              .put(blob)
              .then(() => {
                uploadBlob.close();
                return Firebase
                  .storage()
                  .ref("ProfileImages/" + _name)
                  .getDownloadURL();
              })
              .then(async uploadedFile => {
                console.log("++++++++++++");
                console.log({ uploadedFile });
                await this.setState({ profileimage: uploadedFile })
                console.log(this.state.profileimage);
              })
              .catch(error => {
                console.log({ error });
              });
          });

        this.setState({
          avatarSource: source
        });
        this.update()
      }
    });
  };

  async update() {
    const { firstName, lastName, email, phoneNum, userType, profileimage, password, storeName, storePhoneNum, storeAddress, storeHours, companyName, fein } = this.state
    var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 25000)
    await Firebase.database().ref('user/' + this.state.userId).update({
      fristName: firstName,
      lastName: lastName,
      email: email,
      phoneNum: phoneNum,
      password: password,
      storeName: storeName,
      storePhoneNum: storePhoneNum,
      storeAdress: storeAddress,
      storeHours: storeHours,
      companyName: companyName,
      fein: fein,
      userType: userType,
      profileimage: profileimage
    });
    const { userInfo } = this.props
    var updateUserInfo_row
    await Firebase.database()
      .ref('user/' + this.state.userId)
      .once("value")
      .then(snapshot => {
        console.log("====++=======================================");
        console.log(snapshot)
        updateUserInfo_row = {
          fristName: snapshot.fristName,
          lastName: snapshot.lastName,
          email: snapshot.email,
          phoneNum: snapshot.phoneNum,
          password: snapshot.password,
          storeName: snapshot.storeName,
          storePhoneNum: snapshot.storePhoneNum,
          storeAdress: snapshot.storeAddress,
          storeHours: snapshot.storeHours,
          companyName: snapshot.companyName,
          fein: snapshot.fein,
          userType: snapshot.userType,
          profileimage: snapshot.profileimage,
        }
        console.log("___________+++++++++++++++++++++++++______________")
        console.log(updateUserInfo_row)
        userInfo(updateUserInfo_row)
      });
  }

  checkfun = async () => {
    await this.setState({ ischecked: !this.state.ischecked });
  }

  render() {
    const { profileimage } = this.state
    return (
      <View style={styles.container}>
        {this.state.usertype == "consumer" ?
          <ScrollView style={{ width: '100%' }}>
            <View style={styles.container}>
              <View style={{ width: '100%', alignItems: 'center', marginTop: Platform.OS == 'ios' ? 40 : 20 }}>
                <View style={styles.personUploadgImage}>
                  <View style={styles.personImageArea}>
                    <View style={styles.personImageArea1}>
                      <Image source={this.state.avatarSource} resizeMode='cover' style={styles.personImage} />
                    </View>
                  </View>
                  <TouchableOpacity style={{ ...styles.addBtn, bottom: 50 }} onPress={() => { this.chooseImage() }}>
                    <Image source={require('../../assets/iamges/addImage.png')} resizeMode='stretch' style={styles.addImage} />
                  </TouchableOpacity>
                  <Text style={{ ...styles.inputTxt, color: '#121214', alignSelf: 'center', marginTop: 20 }}>John H, 25</Text>
                </View>
              </View>
              <View style={styles.inputArea}>
                <TouchableOpacity style={styles.inputItem} onPress={() => { this.props.navigation.navigate("ProfileInfoScreen") }}>
                  <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                  <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Profile Information</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputItem} onPress={() => { this.props.navigation.navigate("OrderHistoryScreen") }}>
                  <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                  <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Order History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputItem} onPress={() => this.refs.modal6.open()}>
                  <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                  <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Contact Support</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...styles.inputItem, borderColor: 'red', borderWidth: 0.5 }} onPress={() => { this.props.navigation.navigate('LoginScreen') }}>
                  <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                  <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 150 }}></View>
          </ScrollView> :
          this.state.usertype == "dispensaries" ?
            <ScrollView style={{ width: '100%' }}>
              <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', marginTop: Platform.OS == 'ios' ? 40 : 20 }}>
                  <Text style={{ ...styles.DetailTitle, marginTop: 7, position: 'absolute' }}>Profile</Text>
                  <View style={styles.switchShadow}>
                    <Switch
                      value={this.state.Checked}
                      onValueChange={() => this._onChangeSwitch()}
                      disabled={false}
                      barHeight={30}
                      switchWidthMultiplier={2.5}
                      // outerCircleStyle={{ width: 30 }}
                      circleBorderWidth={0}
                      activeTextStyle={{ alignItems: "flex-end", color: "#878787", fontSize: 10, fontFamily: 'Poppins-Regular' }}
                      inactiveTextStyle={{ alignItems: "flex-start", color: "#878787", fontSize: 10, fontFamily: 'Poppins-Regular', marginLeft: 0, paddingLeft: 0 }}
                      activeText={'Offline'}
                      inActiveText={'Online'}
                      backgroundActive={'#FFF'}
                      backgroundInactive={'#FFF'}
                      changeValueImmediately={false}
                      renderInsideCircle={() => <View resizeMode='stretch' style={this.state.Checked ? styles.uncheck : styles.checkImage} />}
                      circleActiveColor={'#FFF'}
                      circleInActiveColor={'#FFF'}
                      switchLeftPx={5}
                      switchRightPx={5}
                    />
                  </View>
                  <View style={{ ...styles.storeUploadgImage, marginTop: 10, borderRadius: 10 }}>
                    <Image source={{ uri: profileimage }} resizeMode='cover' style={{ ...styles.storeImage1, borderRadius: 10 }} />
                    <TouchableOpacity style={styles.addStoreBtn} onPress={() => { this.chooseImage() }}>
                      <Image source={require('../../assets/iamges/cameraImage.png')} resizeMode='stretch' style={styles.addImage} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputArea}>
                  <Text style={{ ...styles.SignInfoTxt, textAlign: 'center', marginTop: 20, fontSize: 40, }}>$1,325.70</Text>
                  <Text style={{ ...styles.SignInfoTxt, textAlign: 'center', color: '#7a7a7b', marginBottom: 20 }}>Available Balance</Text>
                  <TouchableOpacity style={styles.inputItem} onPress={() => { this.props.navigation.navigate("DispensaryUpdateScreen") }}>
                    <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                    <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Dispensary Information</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inputItem} onPress={() => this.refs.modal6.open()}>
                    <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                    <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Contact Support</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ ...styles.inputItem, borderColor: 'red', borderWidth: 0.5 }} onPress={() => { this.props.navigation.navigate("LoginScreen") }}>
                    <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                    <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Log out</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 150 }}></View>
            </ScrollView> :
            <ScrollView style={{ width: '100%' }}>
              <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', marginTop: Platform.OS == 'ios' ? 40 : 20 }}>
                  <View style={styles.switchShadow}>
                    <Switch
                      value={this.state.Checked}
                      onValueChange={() => this._onChangeSwitch()}
                      disabled={false}
                      barHeight={30}
                      switchWidthMultiplier={2.5}
                      // outerCircleStyle={{ width: 30 }}
                      circleBorderWidth={0}
                      activeTextStyle={{ alignItems: "flex-end", color: "#878787", fontSize: 10, fontFamily: 'Poppins-Regular' }}
                      inactiveTextStyle={{ alignItems: "flex-start", color: "#878787", fontSize: 10, fontFamily: 'Poppins-Regular', marginLeft: 0, paddingLeft: 0 }}
                      activeText={'Offline'}
                      inActiveText={'Online'}
                      backgroundActive={'#FFF'}
                      backgroundInactive={'#FFF'}
                      changeValueImmediately={false}
                      renderInsideCircle={() => <View resizeMode='stretch' style={this.state.Checked ? styles.uncheck : styles.checkImage} />}
                      circleActiveColor={'#FFF'}
                      circleInActiveColor={'#FFF'}
                      switchLeftPx={5}
                      switchRightPx={5}
                    />
                  </View>
                  <View style={styles.personUploadgImage}>
                    <View style={styles.personImageArea}>
                      <View style={styles.personImageArea1}>
                        <Image source={this.state.avatarSource} resizeMode='cover' style={styles.personImage} />
                      </View>
                    </View>
                    <TouchableOpacity style={{ ...styles.addBtn, bottom: 50 }} onPress={() => { this.chooseImage() }}>
                      <Image source={require('../../assets/iamges/addImage.png')} resizeMode='stretch' style={styles.addImage} />
                    </TouchableOpacity>
                    <Text style={{ ...styles.inputTxt, color: '#121214', alignSelf: 'center', marginTop: 20 }}>John H, 25</Text>
                  </View>
                </View>
                <View style={styles.inputArea}>
                  <Text style={{ ...styles.SignInfoTxt, textAlign: 'center', marginTop: 0, fontSize: 40, }}>$275.70</Text>
                  <Text style={{ ...styles.SignInfoTxt, textAlign: 'center', color: '#7a7a7b', marginBottom: 20 }}>Available Balance</Text>
                  <TouchableOpacity style={styles.inputItem} onPress={() => { this.props.navigation.navigate("DriverInformationScreen") }}>
                    <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                    <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Driver Information</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inputItem} onPress={() => this.refs.modal6.open()}>
                    <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                    <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Contact Support</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ ...styles.inputItem, borderColor: 'red', borderWidth: 0.5 }} onPress={() => { this.props.navigation.navigate('LoginScreen') }}>
                    <Image source={require('../../assets/iamges/user.png')} resizeMode='stretch' style={styles.InputImage2} />
                    <Text style={{ ...styles.inputTxt, color: '#7a7a7b' }}>Log Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 150 }}></View>
            </ScrollView>
        }
        <Modal style={styles.modal1} position={"bottom"} ref={"modal6"} swipeArea={20}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => { this.closeModal() }}>
            <Image source={require('../../assets/iamges/close.png')} resizeMode='stretch' style={styles.closeImage} />
          </TouchableOpacity>
          <Text style={styles.MessageTxt}>Message</Text>
          <TextInput style={styles.contactlInput} multiline={true} placeholderTextColor="#BCBCBC" placeholder={'Account ID 17YGBEYG57272\nType here...'} />
          <View style={styles.ModalBtnArea}>
            <TouchableOpacity style={styles.modalBackBtn} onPress={() => { this.closeModal() }}>
              <View style={styles.backArea}>
                <Text style={styles.modalBackTxt}>Back</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn} onPress={() => { this.closeModal() }}>
              <Text style={styles.sendTxt}>Send</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }
}

ProfileScreen.propTypes = {
  load: func,
  real_data: array,
};

const mapDispatchToProps = dispatch => ({
  load: (data) => dispatch(load(data)),
  userInfo: (updateUserInfo_row) => dispatch(userInfo(updateUserInfo_row)),
});

const mapStateToProps = ({ user }) => ({
  real_data: user.real_data,
  user_real_info: user.user_real_info
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfileScreen);
