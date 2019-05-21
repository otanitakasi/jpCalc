import React from 'react';
import { StyleSheet, Text, TextInput, Alert, View, Modal, Linking, TouchableHighlight, Button, ScrollView, } from 'react-native';
import { watersList } from '../drugs_data/waters_list.js';

class Water extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      strPickerSearch: null,          // 医薬品検索文字列
      drugPickerSelection: '未選択',   // 選択された医薬品名
      doseDepend: null,               // 用量は何で決まるか：体重、年齢
      doseRange: [],                  // 投与量範囲
      drugPickerDisplayed: false,     // 医薬品選択画面の表示のon/off
      maxDose: null,                  // 最大投与量
      minDose: null,                  // 最小投与量
      html: null,                     // 医薬品添付文書のURL
      ages: null,                     // 年齢
      bodyWeight: null,               // 体重
      content: null,                  // 含量
      dailyDose: null,                // 1日成分量(mg)
      days: null,                     // 投与日数
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
    const doseDepend = newValue.doseDepend;
    const doseRange = newValue.doseRange;

    this.setState({
      drugPickerSelection: newValue.title,
      doseDepend: doseDepend,
      doseRange: doseRange,
      content: newValue.content,
      html: newValue.html,
    });
    this.setDoseRange(this.state.bodyWeight, this.state.ages, doseDepend, doseRange);
    this.toggleDrugPicker();
  }

  //
  // 体重を設定する
  //
  setBodyWeight(bodyWeight) {
    this.setState({
      bodyWeight: bodyWeight,
    });
    this.setDoseRange(bodyWeight, this.state.ages, this.state.doseDepend, this.state.doseRange);
  }

  //
  // 連嶺を設定する
  //
  setAges(ages) {
    this.setState({
      ages: ages,
    });
    this.setDoseRange(this.state.bodyWeight, ages, this.state.doseDepend, this.state.doseRange);
  }

  //
  // 投与量の上限、下限を設定する
  //
  setDoseRange(bodyWeight, ages, doseDepend, doseRange) {
    let minmax;

    // 体重で投与量が決まる
    if (doseDepend === 'Weight') {
      minmax = doseRange.replace(/mg\/kg/, '').split(/[-]/);

      this.setState({
        minDose: Number(minmax[0]) * bodyWeight,
        maxDose: Number(minmax[1]) * bodyWeight,
      });
    // 年齢で投与量が決まる
    } else if (doseDepend === 'Age') {
      doseRange.map((value, index) => {
        const str = value.split(/:/);
        if (Number(str[0]) <= ages) {
          minmax = str[1].split(/[-]/);

          this.setState({
            minDose: Number(minmax[0]),
            maxDose: Number(minmax[1]),
          });
          console.log('log1:', ages, minmax);
        }
      });
    }
    //console.log(bodyWeight, minDosePerKg, maxDosePerKg);
  }

  //
  // 投与量の適否を判定する
  //
  judgeDose(value) {
    if (this.state.minDose !== null) {
      if (value < this.state.minDose) {
        this.setState({
          underDoseFlag: true,
          doseAlert: 'UNDER!!!',
        });
        console.log('UNDER', value, this.state.minDose);
      } else if (value > this.state.maxDose) {
        this.setState({
          overDoseFlag: true,
          doseAlert: 'OVER!!!',
        });
        console.log('OVER', value, this.state.maxDose);
      } else {
        this.setState({
          doseAlert: null,
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
  //
  //
  //
  // 画面表示
  //
  render() {
    console.log('log0: ', this.state.bodyWeight, this.state.minDose, this.state.maxDose);
    console.log('log3: ', this.state.strPickerSearch);

    // 製剤量計算
    let mass = (this.state.dailyDose / (this.state.content*10)) * this.state.days;

    return (
      <View style={styles.container}>
        {/* 医薬品選択ボタン */}
        <Button onPress={() => this.toggleDrugPicker()} title='医薬品を選択' />
        <View style={{ width: 300, height: 30, backgroundColor: '#26af62',
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
        <Text style={{ color: '#d12bcf', fontSize: 10 }}>
          投与量： { this.state.doseRange }
        </Text>

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
                { watersList.list.map((value, index) => {
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
            含量入力
            成分量入力
            製剤量出力
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

          {/* 含量入力 */}
          <Text style={{ alignContent: 'center', fontSize: 15, marginTop: 10 }}>含量(%)</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setState({ content: value })}
            value={this.state.content}
          />

          {/* 1日成分量入力 */}
          <Text style={{ fontSize: 15, marginTop: 10 }}>成分量(mg/day)</Text>
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
          <Text style={{ fontSize: 15, marginTop: 5, color: 'red' }}>{ this.state.doseAlert }</Text>

          {/* 投与日数 */}
          <Text style={{ fontSize: 15, marginTop: 10 }}>投与日数(日)</Text>
          <TextInput
            style={{
              height: 30,
              width: 300,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setState({ days: value })}
            value={this.state.days}
          />

          {/* 製剤量出力 */}
          <Text style={{ fontSize: 15, marginTop: 10 }}>全製剤量(g)</Text>
          <View style={{
            width: 300,
            height: 30,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: '#fff',
            marginBottom: 20,
          }}
          >
            <Text style={{ color: '#0c3f7c', fontSize: 20, paddingTop: 5 }}>{ mass.toFixed(2) }</Text>
          </View>
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
    backgroundColor: '#8cc3f1',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
});

export default Water;
