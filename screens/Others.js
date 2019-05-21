import React from 'react';
import { Text, View, Linking, FlatList, } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';

class Others extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: null,
      tableHead: ['0ヶ月', '3ヶ月', '6ヶ月', '1歳', '2歳', '3歳', '4歳', '5歳', '6歳'],
      tableData: [
        ['3kg', '6kg', '8kg', '10kg', '12kg', '14kg', '16kg', '18kg', '20kg'],
      ],
    };
  }

    //return fetch('https://facebook.github.io/react-native/movies.json')
  componentDidMount() {
    return fetch('https://facebook.github.io/react-native/movies.json')
    //return fetch('/Users/otanitakashi/Desktop/jpCalc2/powders_list.json')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ dataSource: responseJson.movies });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  openLink(url) {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  }
  render() {
    return (
      <View style={{ flex: 1, paddingTop: 50 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 5 }}>・小児体重参考値</Text>
        <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
          <Row data={this.state.tableHead} style={{ height: 40, backgroundColor: '#f1f8ff'}} textStyle={{ margin: 5 }} />
          <Rows data={this.state.tableData} textStyle={{ margin: 2 }} />
        </Table>
      </View>
    );
  }
}

export default Others;
