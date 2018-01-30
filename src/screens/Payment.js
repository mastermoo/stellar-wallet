import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking
} from "react-native";
import moment from "moment";
import { observer } from "mobx-react";
import { Cell, Loader, Table, Typo } from "../components";
import store from "../store";

@observer
export default class extends React.Component {
  static navigationOptions = {
    title: "Payment Details"
  };

  state = {
    loading: true,
    transaction: null
  };

  componentDidMount() {
    const { payment } = this.props.navigation.state.params;
    this.setState({ loading: true });

    store.fetchPayment(payment.transaction_hash).then(result => {
      const tx = JSON.parse(JSON.stringify(result));
      // console.log("Transaction fetched!", tx);
      this.setState({
        loading: false,
        transaction: tx
      });
    });
  }

  render() {
    if (this.state.loading) return <Loader />;

    const { transaction } = this.state;
    const { payment } = this.props.navigation.state.params;
    const received = payment.to === store.activeAccountId;

    return (
      <Table.TableView>
        <Table.Section>
          <Cell
            title="Message"
            detail={
              <Typo.Detail>{transaction.memo || "No Message"}</Typo.Detail>
            }
          />
          {received ? (
            <Cell title="From" detail={payment.from} detailCopiable />
          ) : (
            <Cell title="To" detail={payment.to} detailCopiable />
          )}
          <Cell
            title="Transaction Hash"
            detail={payment.transaction_hash}
            detailCopiable
          />
          {payment.asset_issuer && (
            <Cell
              title="Asset issuer"
              detail={payment.asset_issuer}
              detailCopiable
            />
          )}
          <Cell title="Fee" detail={`${transaction.fee_paid} Stroops`} />
          <Cell
            title="Date"
            detail={moment(transaction.created_at).format("lll")}
          />
        </Table.Section>
        <Table.Section>
          <Cell
            title="More infos at StellarChain"
            onPress={() => {
              Linking.openURL(
                `http://testnet.stellarchain.io/tx/${transaction.id}`
              );
            }}
          />
        </Table.Section>
      </Table.TableView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  rowInfo: {
    marginBottom: 15
  }
});
