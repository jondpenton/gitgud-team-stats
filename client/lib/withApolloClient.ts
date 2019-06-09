import withApollo from 'next-with-apollo';
import { InMemoryCache } from 'apollo-boost';
import ApolloClient from 'apollo-boost/lib/index';

export default (isProd: () => boolean) =>
  withApollo(
    ({ ctx, headers, initialState }) =>
      new ApolloClient({
        uri: isProd()
          ? 'https://gitgud-api.penton.site'
          : 'http://localhost:8000',
        cache: new InMemoryCache().restore(initialState || {}),
      }),
  );
