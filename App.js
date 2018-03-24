import React, { Component } from 'react';
import { Text, View, Button } from 'react-native';
import {graphql, ApolloProvider} from 'react-apollo';
import gql from 'graphql-tag';
import { defaultDataIdFromObject, InMemoryCache } from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import { from } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { onError } from 'apollo-link-error';

const inMemoryCache = new InMemoryCache({
  dataIdFromObject: object => {
    switch (object.__typename) {
      case 'Channel':
      case 'OndemandCollection':
      case 'Brand':
        return `${object.__typename}${object.code}`;
      default:
        return defaultDataIdFromObject(object); // fall back to default handling
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation, response }) => {
  console.log('graphQLErrors', graphQLErrors);
  console.log('networkError', networkError);
  console.log('response', response);

  // Trying to catch the error in there...
  networkError = null;
  if(response)
    response.errors = null;
});

const httpLink = new HttpLink({uri: 'https://w5xlvm3vzz.lp.gql.zone/graphql/UNKOWN'});

const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: inMemoryCache
});

const query = gql`
  {
    rates(currency: "USD") {
      currency
    }
  }
`;

/*
*  Child 1
* */
const _Child1 = ({data: {error = ''} = {}}) => (
  <View>
    <Text>Child 1 {error.toString()}</Text>
  </View>
);

const Child1 = graphql(query)(_Child1);


/*
* Child 2
* */
const Child2 = () => (
  <View>
    <Text>Child 2</Text>
  </View>
);

class App extends Component {
  state = { show: true };

  componentDidCatch() {
    console.log('componentDidCatch');
  }

  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <View style={{margin: 100}}>
          {this.state.show ? <Child1/> : <Child2/>}
          <Button
            title="Toggle show"
            onPress={() => this.setState(({show}) => ({show: !show}))}
          />
        </View>
      </ApolloProvider>
    );
  }
}

export default App;
