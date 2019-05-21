import React from 'react';
import { Text, View, Linking, FlatList, TextInput, StyleSheet } from 'react-native';
import { Table, Row, Rows, } from 'react-native-table-component';

class Others extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: null,
      tableHead: ['0ヶ月', '3ヶ月', '6ヶ月', '1歳', '2歳', '3歳', '4歳', '5歳', '6歳'],
      tableData: [
        ['3kg', '6kg', '8kg', '10kg', '12kg', '14kg', '16kg', '18kg', '20kg'],
      ],
      ages: null,
      adultDose: null,
      bodyHeight: null,
      bodyWeight: null,
    };

  }

  //
  // 年齢を設定する
  //
  setAges(ages) {
    this.setState({
      ages: ages,
    });
  }
  //
  // 成人量を設定する
  //
  setAdultDose(value) {
    this.setState({
      adultDose: value,
    });
  }
  //
  // 身長を設定する
  //
  setHeight(value) {
    this.setState({
      bodyHeight: value,
    });
  }
  //
  // 体重を設定する
  //
  setWeight(value) {
    this.setState({
      bodyWeight: value,
    });
  }

  render() {

    // Augsberger式で小児量を計算する
    const child = (this.state.ages*4 + 20) / 100 * this.state.adultDose;

    // 体表面積を計算する(DuBois式)
    const bsa = Math.pow(this.state.bodyHeight, 0.725) * Math.pow(this.state.bodyWeight, 0.425) * 0.007184;
    console.log('body surface: ', bsa);

    return (
      <View style={styles.container} >
        {/* 区切り線を引く */}
        <View style={{
            height: 10,
            borderBottomWidth: 5,
            borderBottomColor: '#3b8ae7',
            marginTop: 10,
            marginBottom: 5,
          }}
        >
        </View>

        {/* 小児体重表 */}
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 5 }}>・小児体重参考値</Text>
          <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
            <Row data={this.state.tableHead} style={{ width: 373, height: 40, backgroundColor: '#f1f8ff'}} textStyle={{ margin: 0 }} />
            <Rows data={this.state.tableData} textStyle={{ margin: 2 }} />
          </Table>
        </View>

        {/* 区切り線を引く */}
        <View style={{
            height: 10,
            alignItems: 'center',
            borderBottomWidth: 5,
            borderBottomColor: '#3b8ae7',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
        </View>

        {/* Augsberger式計算 */}
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 10 }}>・Augsberger式</Text>
          <Text style={{ alignSelf: 'center', backgroundColor: '#b9eba8', fontWeight: 'normal', fontSize: 15, marginTop: 5,  marginBottom: 5, width: 280, paddingTop: 5 }}>
            小児量 = ( 年齢 * 4 + 20 ) / 100 *︎ 成人量
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          {/* Age Input */}
          <Text style={{ alignSelf: 'center', fontSize: 18 }}>年齢：</Text>
          <TextInput
            style={{
              height: 30,
              width: 50,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setAges(value)}
            value={this.state.ages}
          />

        <Text style={{ alignSelf: 'center', fontSize: 18, marginLeft: 30 }}>成人量：</Text>
          <TextInput
            style={{
              height: 30,
              width: 50,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setAdultDose(value)}
            value={this.state.adultDose}
          />
        </View>

        <View>
          {/* 製剤量出力 */}
          <Text style={{ textAlign: 'center', fontSize: 15, marginTop: 10 }}>小児量</Text>
          <View style={{
            width: 100,
            height: 30,
            alignSelf: 'center',
            borderBottomWidth: 2,
            borderBottomColor: '#fff',
            marginBottom: 20,
          }}
          >
            <Text style={{ textAlign: 'center', color: '#0c3f7c', fontSize: 20, paddingTop: 5 }}>{ child.toFixed(2) }</Text>
          </View>
        </View>

        {/* 区切り線を引く */}
        <View style={{
            height: 10,
            borderBottomWidth: 5,
            borderBottomColor: '#3b8ae7',
            marginTop: 10,
            marginBottom: 5,
          }}
        >
        </View>

        {/* BSA計算 */}
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 10 }}>・BSA計算(DuBois式)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          {/* Height Input */}
          <Text style={{ alignSelf: 'center', fontSize: 18 }}>身長：</Text>
          <TextInput
            style={{
              height: 30,
              width: 50,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setHeight(value)}
            value={this.state.bodyHeight}
          />

        <Text style={{ alignSelf: 'center', fontSize: 18, marginLeft: 30 }}>体重：</Text>
          <TextInput
            style={{
              height: 30,
              width: 50,
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'center',
            }}
            onChangeText={(value) => this.setWeight(value)}
            value={this.state.bodyWeight}
          />
        </View>

        <View>
          {/* BSA出力 */}
          <Text style={{ textAlign: 'center', fontSize: 15, marginTop: 10 }}>BSA(m^2)</Text>
          <View style={{
            width: 100,
            height: 30,
            alignSelf: 'center',
            borderBottomWidth: 2,
            borderBottomColor: '#fff',
            marginBottom: 20,
          }}
          >
            <Text style={{ textAlign: 'center', color: '#0c3f7c', fontSize: 20, paddingTop: 5 }}>{ bsa.toFixed(2) }</Text>
          </View>
        </View>

        {/* 区切り線を引く */}
        <View style={{
            height: 10,
            borderBottomWidth: 5,
            borderBottomColor: '#3b8ae7',
            marginTop: 10,
            marginBottom: 5,
          }}
        >
        </View>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeed5e',
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
});

export default Others;
