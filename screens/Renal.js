import React from 'react';
import { StyleSheet, Switch, Text, TextInput, Alert, View, Modal, Linking, TouchableHighlight, Button, ScrollView, } from 'react-native';
import { renalList } from '../drugs_data/renal_list.js';

class Renal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      strPickerSearch: null,          // 医薬品検索文字列
      drugPickerSelection: '未選択',   // 選択された医薬品名
      doseRange: [],                  // 投与量範囲
      drugPickerDisplayed: false,     // 医薬品選択画面の表示のon/off
      maxDose: null,                  // 最大投与量
      minDose: null,                  // 最小投与量
      html: null,                     // 医薬品添付文書のURL
      sex: false,                     // 性別 男性：false, 女性:true
      ages: null,                     // 年齢
      bodyHeight: null,               // 身長
      bodyWeight: null,               // 体重
      bodySurface: 0,                 // 体表面積
      renalIndex: false,              // Ccr=false or eGFR=true
      sCr: null,                      // 血清クレアチニン値
      renalCapacity: 0,               // 腎機能：eGFR(mL/min/1.73m^2) or クレアチニンクリアランス(mL/min)
      dailyDose: null,                // 1日成分量(mg)
      overDoseFlag: false,            // 過量投与のフラグ
      underDoseFlag: false,           // 過少投与のフラグ
      doseAlert: null,                // 過量、過少投与アラート表示
    };
  }

  //
  // 医薬品選択画面の表示切り替え
  //
  toggleDrugPicker() {
    this.setState({
      drugPickerDisplayed: !this.state.drugPickerDisplayed
    });
  }

  //
  // 選択した医薬品のデータを保存する
  //
  setDrugPickerValue(newValue) {
    const doseRange = newValue.doseRange;
    const renalIndex = (newValue.renalIndex === 'GFR') ? true : false;

    this.setState({
      drugPickerSelection: newValue.title,
      renalIndex: renalIndex,
      doseRange: doseRange,
      html: newValue.html,
    });
    this.setDoseRange(this.state.sex, this.state.ages, this.state.bodyWeight, this.state.sCr, doseRange, renalIndex);
    this.toggleDrugPicker();
  }
  //
  // 腎機能の指標を設定する
  //
  setRenalIndex(value) {
    // true: eGFR, false: CCr
    this.setState({
      renalIndex: value,
    });
    this.setDoseRange(this.state.sex, this.state.ages, this.state.bodyWeight, this.state.sCr, this.state.doseRange, value);
  }
  //
  // 性別を設定する
  //
  setSex(value) {

    let sexStr = (value) ? '女性' : '男性';

    this.setState({
      sex: value,
    });
    this.setDoseRange(value, this.state.ages, this.state.bodyWeight, this.state.sCr, this.state.doseRange, this.state.renalIndex);
  }
  //
  // 年齢を設定する
  //
  setAges(ages) {
    this.setState({
      ages: ages,
    });
    this.setDoseRange(this.state.sex, ages, this.state.bodyWeight, this.state.sCr, this.state.doseRange, this.state.renalIndex);
  }
  //
  // 身長を設定する
  //
  setBodyHeight(bodyHeight) {
    this.setState({
      bodyHeight: bodyHeight,
    });
  }
  //
  // 体重を設定する
  //
  setBodyWeight(bodyWeight) {
    this.setState({
      bodyWeight: bodyWeight,
    });
    this.setDoseRange(this.state.sex, this.state.ages, bodyWeight, this.state.sCr, this.state.doseRange, this.state.renalIndex);
  }
  //
  // 血清クレアチニン値を設定する
  //
  setSCr(sCr) {
    this.setState({
      sCr: sCr,
    });
    this.setDoseRange(this.state.sex, this.state.ages, this.state.bodyWeight, sCr, this.state.doseRange, this.state.renalIndex);
  }

  //
  // GFR, CCrを計算する
  // 投与量の上限、下限を設定する
  //
  setDoseRange(sex, ages, bodyWeight, scr, doseRange, renalIndex) {
    let minmax;

    // 性別補正値の設定
    const sexValue = (sex === false) ? 1.0 : (renalIndex === true) ? 0.739 : 0.85;

    // 体表面積を計算する(DuBois式)
    const bs = Math.pow(this.state.bodyHeight, 0.725) * Math.pow(bodyWeight, 0.425) * 0.007184;
    console.log('body surface: ', bs);

    // eGFR(mL/min/1.73m^2)の計算
    const eGFR = 194 * Math.pow(scr, -1.094) * Math.pow(ages, -0.287) * sexValue;
    console.log('eGFR: ', eGFR, scr, ages);

    //Cockcroft-GaultのCcr計算
    const CG = (((140 - ages) * bodyWeight) / (72 * scr)) * sexValue;
    console.log('CG:', CG, sexValue, ages, bodyWeight, scr);

    // 腎機能
    const renal = (renalIndex) ? eGFR : CG;

    this.setState({
      bodySurface: bs,
      renalCapacity: (isNaN(renal)) ? 0 : ((isFinite(renal)) ? renal : 0),
    });

    // 年齢で投与量が決まる
    doseRange.forEach((value, index) => {
      const elm = value.split(/:/);

      if (Number(elm[0]) <= renal) {
        minmax = elm[1].split(/[-]/);
        this.setState({
          minDose: Number(minmax[0]),
          maxDose: Number(minmax[1]),
        });
      }
    });
    console.log('log1:', CG, minmax);
  }

  //
  // 投与量の適否を判定する
  //
  judgeDose(value) {
    if (this.state.minDose !== null) {
      if (value < this.state.minDose) {
        this.setState({
          underDoseFlag: true,
          doseAlert: 'UNDER!!!(>_<)',
        });
        console.log('UNDER', value, this.state.minDose);
      } else if (value > this.state.maxDose) {
        this.setState({
          overDoseFlag: true,
          doseAlert: 'OVER!!! (>_<)',
        });
        console.log('OVER', value, this.state.maxDose);
      } else {
        this.setState({
          doseAlert: 'OK!!! (^_^)',
        });
      }
    }

    this.setState({
      dailyDose: value,
    });
  }

  //
  // ブラウザで添付文書を開く
  //
  openLink(url) {
    if (url === null) {
      Alert.alert('医薬品を選択してください');
    } else {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
  }

  //
  // 画面表示
  //
  render() {
    console.log('log0: ', this.state.sex, this.state.minDose, this.state.maxDose);

    return (
      <View style={styles.container}>
        {/* 医薬品選択ボタン */}
        <Button onPress={() => this.toggleDrugPicker()} title='医薬品を選択' />
        <View style={{ width: 300, height: 30, backgroundColor: '#d12879',
          alignItems: 'center',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
        }}
        >
          <Text style={{ color: '#fff', fontSize: 15, paddingTop: 8 }}>
            { this.state.drugPickerSelection }
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 10 }}>
          投与量： { this.state.doseRange }
        </Text>

        {/* スイッチ：性別、腎機能指標 */}
        <View style={{ flex: 0.3, flexDirection: 'row', marginTop: 8, alignItems: 'center'}}>
          <Switch
            onValueChange={(value) => this.setSex(value)}
            value={this.state.sex}
          />
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>  {(this.state.sex) ? '女性' : '男性'}</Text>
          <Text>        </Text>
          <Switch
            onValueChange={(value) => this.setRenalIndex(value)}
            value={this.state.renalIndex}
          />
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>  {(this.state.renalIndex) ? 'GFR' : 'CCr'}</Text>
        </View>

        {/* Modal画面 */}
        <Modal
          visible={this.state.drugPickerDisplayed}
          transparent={false}
          animationType={'slide'}
          presentationStyle={'fullScreen'}
          onRequestClose={() => console.log('Close was requested')}
        >
          <View
            style={{
              backgroundColor: '#fff',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {/* Closeボタン */}
            <View style={{ backgroundColor: '#fff', marginTop: 50, marginLeft: 20, marginBottom: 10, }} >
              <Text onPress={() => this.toggleDrugPicker()}
                 style={{ fontWeight: '300', fontSize: 15 }}
              >X Close</Text>
            </View>
            {/* 医薬品名検索入力 */}
            <View style={{ backgroundColor: '#e85e7e', padding: 10, alignItems: 'center', margin: 10}}>
              <Text style={{ color: '#fff', fontWeight: 'bold', }}>
                Please select Drug
              </Text>
              <TextInput
                style={{
                  height: 30,
                  width: 300,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  textAlign: 'center',
                  marginTop: 5,
                }}
                onChangeText={(value) => this.setState({ strPickerSearch: value })}
                value={this.state.strPickerSearch}
                placeholder='Search'
                placeholderTextColor='#9da1a6'
              />
            </View>

            {/* 医薬品候補の表示 */}
            <View style={{ backgroundColor: '#fff', alignItems: 'center' }}>
              <ScrollView>
                { renalList.list.map((value, index) => {
                  let pattern;
                  if (this.state.strPickerSearch === null) {
                    pattern = '.*';
                  } else {
                    pattern = '^' + this.state.strPickerSearch;
                  }
                  const reg = new RegExp(pattern + '.*');
                  const result = value.search.match(reg);

                  if (result) {
                    return <TouchableHighlight
                      key={index}
                      onPress={() => this.setDrugPickerValue(value)}
                      style={{ paddingTop: 8, paddingBottom: 8, alignItems: 'center' }}
                      >
                      <Text style={{ color:'#1c3ed0', fontSize: 17 }}>
                        { value.title }
                      </Text>
                    </TouchableHighlight>
                  }
                 })
               }
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 年齢入力
            体重入力
            成分量入力
        */}
        <View style={{ margin: 10 }}>

          {/* Age Input */}
          <Text style={{ alignContent: 'center', fontSize: 15, marginTop: 10 }}>年齢</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setAges(value)}
            value={this.state.ages}
          />

          {/* Body Height Input */}
          <Text style={{ alignContent: 'center', fontSize: 15, marginTop: 10 }}>身長(cm)</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setBodyHeight(value)}
            value={this.state.bodyHeight}
          />

          {/* Body Weight Input */}
          <Text style={{ alignContent: 'center', fontSize: 15, marginTop: 10 }}>体重(kg)</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setBodyWeight(value)}
            value={this.state.bodyWeight}
          />

          {/* sCr Input */}
          <Text style={{ alignContent: 'center', fontSize: 15, marginTop: 10 }}>血清クレアチニン値(mg/dL)</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setSCr(value)}
            value={this.state.sCr}
          />

          {/* 腎機能(eGFR or クレアチニンクリアランス(Cockcroft-Gault) */}
          <Text style={{ fontSize: 15, marginTop: 10 }}>{(this.state.renalIndex) ? 'eGFR(mL/min/1.73m^2)' : 'CCr(mL/min)'}</Text>
          <View style={{
            width: 300,
            height: 25,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: '#fff',
            marginBottom: 10,
          }}
          >
            <Text style={{ color: '#0c3f7c', fontSize: 20, paddingTop: 0 }}>
              { this.state.renalCapacity.toFixed(2) }
            </Text>
          </View>

          {/* 1日成分量入力 */}
          <Text style={{ fontSize: 15, marginTop: 0 }}>成分量(mg/day)</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.judgeDose(value)}
            value={this.state.dailyDose}
          />
          {/* 投与量アラート */}
          <Text style={{ fontSize: 15, marginTop: 5, color: '#7a04cc' }}>{ this.state.doseAlert }</Text>
        </View>
        {/* 添付文書ボタン */}
        <Button onPress={() => this.openLink(this.state.html)} title='添付文書表示' />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e49123',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
});

export default Renal;
